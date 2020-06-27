import asyncHandler from "express-async-handler";

import { Request, Response } from "express";

import { orderCollection } from "../database";
import { getApis } from "../apis";
import { startPaymentRequestSchema, StartPaymentRequestType } from "../types";

const StartPayment = asyncHandler(async (req: Request, res: Response) => {
  const validation = startPaymentRequestSchema.validate(req.body);
  if (validation.error) {
    res.status(500).json({ errors: validation.error.details });
    return;
  }

  const body = req.body as StartPaymentRequestType;
  const isTest = body.test;

  const apis = getApis({ isTest });

  const host = req.get("origin");
  const toAddresses = body.toAddresses;

  const orderRef = orderCollection.doc();
  const orderId = orderRef.id;

  // Create a stripe checkout session corresponding to the orderId
  // We send the orderId to stripe so it will come back after checkout,
  // so we can look up the order to execute it
  // We'll send the stripe sessionId down to the frontend to redirect
  // to the stripe hosted checkout flow
  const stripeSession = await apis.stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: apis.stripePriceId,
        quantity: (toAddresses || []).length,
      },
    ],
    customer_email: body.email,
    client_reference_id: orderId,
    mode: "payment",
    success_url: `${host}/letterSuccess?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${host}/cancel`,
  });

  orderRef.set({ ...body, orderId, isTest: isTest || false }).then(() => {
    res.json({ sessionId: stripeSession.id });
  });
});

export default StartPayment;
