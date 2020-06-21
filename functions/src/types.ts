import Joi = require("@hapi/joi");

export const addressSchema = Joi.object({
  name: Joi.string().required(),
  address_line1: Joi.string().required(),
  address_line2: Joi.string().optional(),
  address_city: Joi.string().required(),
  address_state: Joi.string().required(),
  address_zip: Joi.string().required(),
  address_country: Joi.string().default("US"),
  email: Joi.string().email(),
});

export const startPaymentRequestSchema = Joi.object({
  fromAddress: addressSchema.required(),
  toAddresses: Joi.array().items(addressSchema).min(1),
  body: Joi.string().required(),
  email: Joi.string().email().required(),
  test: Joi.bool().default(false),
});

export type Address = {
  name: string;
  address_line1: string;
  address_line2?: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  address_country?: string;
  email?: string;
};

export type StartPaymentRequestType = {
  fromAddress: Address,
  toAddresses: Address[],
  body: string,
  email: string,
  test: boolean,
};

// An order in our database is the incoming order + the fields we need
// to keep track of fulfillment
export type Order = StartPaymentRequestType & {
  orderId: string;
  paid?: boolean;
  fulfilled?: boolean;
}