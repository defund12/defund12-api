/* eslint-disable @typescript-eslint/no-var-requires */
import functions = require('firebase-functions');
import Stripe from 'stripe';
const Lob = require("lob")

interface ApiConfig {
  api_key: string
}

interface EnvConfig {
  sendgrid: ApiConfig,
  stripe: ApiConfig & {
    price_id: string
  }
  google: ApiConfig,
  lob: ApiConfig
}

interface Config {
  prod: EnvConfig,
  test: EnvConfig,
}

export interface Apis {
  stripe: Stripe,
  lob: typeof Lob,
  stripePriceId: string 
}

const config = functions.config() as Config;

function makeApiBundle(config: EnvConfig) {
  return {
    stripe: new Stripe(config.stripe.api_key, {
      apiVersion: '2020-03-02',
    }),
    stripePriceId: config.stripe.price_id,
    lob: Lob(config.lob.api_key)
  }
}

const testApis = makeApiBundle(config.test);
const prodApis = makeApiBundle(config.prod);

export function getApis({isTest}: {isTest: boolean}): Apis {
  if (isTest) {
    return testApis;
  } else {
    return prodApis;
  }
}

export const sendgrid = require('@sendgrid/mail');
sendgrid.setApiKey(config.prod.sendgrid.api_key);
