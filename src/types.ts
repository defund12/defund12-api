import Joi = require("@hapi/joi");
import Lob = require("./lob");

export const addressSchema = Joi.object({
  name: Joi.string().required(),
  address_line1: Joi.string().required(),
  address_line2: Joi.string().optional(),
  address_city: Joi.string().required(),
  address_state: Joi.string().required(),
  address_zip: Joi.string()
    .required()
    .regex(/^[0-9]{5}(?:-[0-9]{4})?$/),
  address_country: Joi.string().default("US"),
  email: Joi.string().email(),
});

export const addressEmailRequiredSchema = Joi.object({
  email: Joi.string().email().required(),
}).concat(addressSchema);

export const startPaymentRequestSchema = Joi.object({
  fromAddress: addressEmailRequiredSchema.required(),
  toAddresses: Joi.array().items(addressSchema).min(1),
  body: Joi.string().required(),
  email: Joi.string().email().required(),
  test: Joi.bool().default(false),
});

export type StartPaymentRequestType = {
  fromAddress: Lob.Address;
  toAddresses: Lob.Address[];
  body: string;
  email: string;
  test: boolean;
};

// An order in our database is the incoming order + the fields we need
// to keep track of fulfillment
export type Order = StartPaymentRequestType & {
  orderId: string;
  paid?: boolean;
  fulfilled?: boolean;
};
