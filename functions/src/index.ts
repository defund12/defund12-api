import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import LobWebhookHandler from "./handlers/LobWebhook";
import StripePaymentWebhookHandler from "./handlers/StripePaymentWebhook";
import StartPaymentHandler from "./handlers/LobWebhook";

import OrderUpdateTrigger from "./triggers/OrderUpdate";

/** build all our api handlers
 *
 * we do this to get nice routing and to add cors and json body parsing
 *
 * @return {express.Application} the handler wrapped as an express app on /
 */
function buildExpressApiApp() {
  const app = express();

  // allow json requests from defund12.org or localhost:8000
  // these are hosted on cloudfunctions.net but our frontend is on defund12.org
  app.use(cors({ origin: [/\.defund12\.corg$/, /localhost:8000/] }));

  // automatically parse json POST bodies
  app.use(bodyParser.json());

  // Called from the frontend to start the stripe->webhook->lob flow
  // Saves the order in the database and redirect
  app.post("/letter/startPayment", StartPaymentHandler);

  // Callback from stripe when a payment is successful
  // This kicks off actually sending the order to lob
  app.post("/letter/webhooks/stripePayment", StripePaymentWebhookHandler);

  // called by Lob.com on various events in the lifecycle of sending
  // a letter. On our plan, we only get one event, so we use the
  // "almost delivered" event.
  app.post("/letter/webhooks/lob", LobWebhookHandler);

  return app;
}

/* The actual endpoints */

/* Firebase only lets us mount handlers at the root of http service,
 * to get nice paths like /api/xxx/yyy we build an express app with
 * handlers at /xxx/yyy and mount it at /api in firebase */
exports.api = buildExpressApiApp();

exports.orderUpdate = OrderUpdateTrigger;
