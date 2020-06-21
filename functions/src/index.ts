import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import LobWebhookHandler from "./handlers/LobWebhook";
import StripPaymentWebhookHandler from "./handlers/StripePaymentWebhook";
import StartPaymentHandler from "./handlers/LobWebhook";

import OrderUpdateTrigger from "./triggers/OrderUpdate";

/** wraps an express requst handler in an express app
 * we do this to add cors and json body parsing
 * it mounts it at "/" and then we export it at a named location for firebase to mount there
 * If we made one big express app, firebase wouldn't understand it as multiple api endpoints
 * 
 * @param {express.RequestHandler} handler the handler to wrap
 * @return {string} the handler wrapped as an express app on /
 */
function wrapPostExpressHandler(handler: express.RequestHandler) {
  const app = express();

  // allow json requests from anywhere for ease of use
  // these are hosted on cloudfunctions.net but our frontend is on defund12.org
  app.use(cors({ origin: true }));

  // automatically parse json POST bodies
  app.use(bodyParser.json());

  app.post("/", handler);

  return app;
}

/* The actual endpoints */

// Called from the frontend to start the stripe->webhook->lob flow
// Saves the order in the database and redirect
exports.startPayment = wrapPostExpressHandler(StartPaymentHandler);

// Callback from stripe when a payment is successful
// This kicks off actually sending the order to lob
exports.paymentWebhook = wrapPostExpressHandler(StripPaymentWebhookHandler);

// called by Lob.com on various events in the lifecycle of sending
// a letter. On our plan, we only get one event, so we use the
// "almost delivered" event.
exports.lobWebhook = wrapPostExpressHandler(LobWebhookHandler);

exports.orderUpdate = OrderUpdateTrigger;
