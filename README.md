# defund12-api

This is the home of the defund12-api code which powers the letter ordering flow. For the next few days, the backend is being powered by https://github.com/blackmad/mail-your-rep while that code is being ported over.

This document seeks to make clear how letter ordering works and what the costs involved are.

### Cost breakdown
- Under Lob's [developer plan](https://lob.com/pricing/print-mail), letters cost $0.67 to mail, with $0.10 surcharge for every additional page printed after the first
- Stripe charges [2.9% + $0.30 per transaction](https://stripe.com/pricing), most of which goes to the credit card processors
- We ask a flat fee of $1 per letter to cover the above costs--any and all leftover funds will be used to cover letters sent at a deficit

Math:
- If a user mails one 1-page letter for $1, $0.33 goes to stripe, $0.67 goes to Lob, $0 is left over
- If a user mails one 2-page letter for $1, $0.33 goes to stripe, $0.77 goes to Lob, $0.10 is lost
- If a user mails two 1-page letters for $2, $0.36 goes to stripe, $1.34 goes to Lob, $0.30 is left over

The goal is to keep the cost low and transparent, and the logic relatively simple. It's hard to predict how many pages a letter will print, and it would be annoyingly complicated to pre-render them, all to save pennies. The hope is that surpluses and losses will be a wash. In the common case, $0 is left over or $0.10 is lost. Any and all leftover funds will be used to cover letters sent at a deficit.

## Letter Ordering Flow
- The frontend makes a request to /startPayment which records the body of the letter, the user's address, and the addresses to send letters to in that order. It passes the id of the order to the stripe checkout session creation API.
- The user is redirected to the checkout flow hosted on [stripe.com](https://stripe.com/)
- After a successful checkout, the user is redirected back to a success page on defund12.org, while asynchronously stripe calls a webhook on our API that says the order was paid in full.
- At that point, the order is marked paid, and a firestore database trigger is fired, which calls the [lob.com](https://lob.com) API to print and mail the letters.
- Lob.com sends the letters via first class mail, which are [tracked up until they are sorted at the local post office of delivery](https://support.lob.com/hc/en-us/articles/115000097404-Can-I-track-my-mail-)

<strong>NOTE:</strong>
- If an order comes in with test=true (which the frontend generates for localhost urls), we call stripe with test keys (that puts the user into a checkout flow that only accepts fake credit card numbers), and call lob with test keys (that generate letter previews but nothing else) but still call sendgrid with prod keys because we still want to send the user an email to test the whole flow

### APIs used
- lob.com to send letters
- stripe.com to process payments
- sendgrid.com to send emails
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

### Initial set up
Firebase functions requires node 10. `nvm install 10` and `nvm use 10` are your friends here.

To pull down the config variables required to run the functions locally: `cd functions && firebase functions:config:get > .runtimeconfig.json`

### Running locally
`cd functions && yarn serve`

- Endpoints will be callable at http://localhost:5001/api/...

## To deploy
```yarn deploy```
