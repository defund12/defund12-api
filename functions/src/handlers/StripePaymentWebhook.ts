import { Request, Response } from 'express';
import { orderCollection } from '../database';
const asyncHandler = require('express-async-handler');

const markOrderPaid = async (orderId: string) => {
  const docs = await orderCollection.where("orderId", "==", orderId).get();
  if (docs.empty) {
    throw new Error("no order with id " + orderId);
  }

  const order = docs.docs[0];
  const orderPromise = order.ref.update({ paid: true });
  return orderPromise;
};

// When a stripe payment comes in, we mark the order as paid in our database
// and then return. the OrderUpdateTrigger then picks this up and actually executes the
// order by calling lob. We do this so we don't make stripe wait forever for us to finish.
const StripPaymentWebhook = asyncHandler(async (req: Request, res: Response) => {
  const event = req.body as any;

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      await markOrderPaid(event.data.object.client_reference_id);
      return res.json({ received: true });
    default:
      // Unexpected event type
      return res.status(400).end();
  }
});

export default StripPaymentWebhook;
