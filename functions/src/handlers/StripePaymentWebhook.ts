import { Request, Response } from 'express';
const asyncHandler = require('express-async-handler');

import { markOrderPaid } from "../orders";

const StripPaymentWebhook = asyncHandler(async (req: Request, res: Response) => {
  const event = req.body as ICard;

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
