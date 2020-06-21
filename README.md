# defund12-api

This repository hosts the backend code for defund12.org. It is a set of firebase functions & database triggers. Currently it is only used for the letter payment & sending flow.

## Letter Checkout Flow
- In the frontend, a user selects some addresses and fills in the letter body and clicks the checkout button
- An XHR call is made from the frontend to `/startPayment` which saves a record of the user's information, calls the stripe checkout session creation flow (which has to happen server side due to secret keys) and returns the stripe session id
- The frontend forwards the user to a checkout flow hosted on stripe.com with the session id the backend provided
- When checkout is done, stripe.com 1) redirects the user back to a success page on defund12.org 2) generates a webhook event that we process at `/paymentWebhook` - when a payment is successful, we mark the order as paid and return quickly to stripe
- a firestore database trigger watches the orders collection, and notices when a record flips from paid=false to paid=true. When this happens we look up the order in the database, make calls to lob.com to order/print the letters, and email the user that their order was successful with previews of their letters. We are essentially treating firestore like a simple queue
- lob.com also has webhooks. We process those at `/lobWebhook`. We listen on one event from lob, which is the "processed_for_delivery" event that says the letter is about a day away from being delivered.

NOTE:
- if an order comes in with test=true (which the frontend generates for localhost urls), we call stripe with test keys (that puts the user into a checkout flow that only accepts fake credit card numbers), and call lob with test keys (that generate letter previews but nothing else) but still call sendgrid with prod keys because we still want to send the user an email to test the whole flow

### APIs used
- lob.com to send lettres
- stripe.com to process payments
- sendgrid to send emails
- firebase functions to host these "serverless" apis & triggers
- firebase firestore (database / queue)

## To update API keys

```
# set global sendgrid info
firebase functions:config:set \
sendgrid.apiKey="XXXXX" 
sendgrid.from="something@defund12.org"
```

```
firebase functions:config:set \
prod.lob.apiKey="XXXX" \
prod.stripe.apiKey="XXXXX" \
# this one is easy to get confused - it's the PRICE_ID that starts with price_, _not_ the PRODUCT_ID that starts with prod_ which is on the same page
prod.stripe.price_id="XXXXX"
```

```
firebase functions:config:set \
test.lob.apiKey="XXXX" \
test.stripe.apiKey="XXXXX" \
test.stripe.price_id="XXXXX" 
```

## To develop

### initial set up
Firebase functions requires node 10. `nvm install 10` and `nvm use 10` are your friends here.

To pull down the config variables required to run the functions locally: `firebase functions:config:get > .runtimeconfig.json`

## To deploy
```yarn deploy```
