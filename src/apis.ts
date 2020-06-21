/** Load the runtime configs from firebase and turn them into
 * api service objects, one for test orders and one for non-test (prod) orders
 */

/* eslint-disable @typescript-eslint/no-var-requires */
import functions = require("firebase-functions");
import Stripe from "stripe";
const Lob = require("lob");

interface ApiConfig {
  apiKey: string;
}

interface EnvConfig {
  stripe: ApiConfig & {
    priceId: string;
  };
  google: ApiConfig;
  lob: ApiConfig;
}

interface Config {
  prod: EnvConfig;
  test: EnvConfig;
  sendgrid: ApiConfig & {
    from: string;
  };
}

export interface Apis {
  stripe: Stripe;
  lob: typeof Lob;
  stripePriceId: string;
}

const config = functions.config() as Config;

/** get api objects from envconfig
 * @param {EnvConfig} config envconfig
 * @return {Apis} api bundle
 */
function makeApiBundle(config: EnvConfig): Apis {
  return {
    stripe: new Stripe(config.stripe.apiKey, {
      apiVersion: "2020-03-02",
    }),
    stripePriceId: config.stripe.priceId,
    // eslint-disable-next-line new-cap
    lob: Lob(config.lob.apiKey),
  };
}

const testApis = makeApiBundle(config.test);
const prodApis = makeApiBundle(config.prod);

/** Get apis based on if we're a test order or not
 * @parmas {boolean} isTest test or not
 * @return {Apis} api bundle
 */
export function getApis({ isTest }: { isTest: boolean }): Apis {
  if (isTest) {
    return testApis;
  } else {
    return prodApis;
  }
}

// We don't have prod/test sendgrid for two reasons
// 1) the sendgrid node library doesn't support multiple instancs
// 2) in both cases, we want to really send an email, so having two
//    accounts doesn't super help us
export const sendgrid = require("@sendgrid/mail");
sendgrid.setApiKey(config.sendgrid.apiKey);
export const sendgridFrom = config.sendgrid.from;
