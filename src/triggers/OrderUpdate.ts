import { Order } from "../types";

import * as functions from "firebase-functions";
import { orderCollection } from "../database";
import { getApis } from "../apis";
import { Address, CreateResponse } from "../lob";
import { notifyUserOnLetterCreate } from "../emails";
import { makeLetterHtmlBody } from "../letters";

type SendLetterParams = {
  /** the order */
  orderData: Order;
  /** the address to send to */
  toAddress: Address;
};

/**
 * Send one letter from an order
 * @param {SendLetterParams} the params
 * @return {Promise<CreateResponse>} the response from lob
 */
async function sendLetter({
  orderData,
  toAddress,
}: SendLetterParams): Promise<CreateResponse> {
  const apis = getApis({ isTest: orderData.test });

  return new Promise((resolve, reject) => {
    const letterHtml = makeLetterHtmlBody({
      toAddress,
      fromAddress: orderData.fromAddress,
      body: orderData.body,
      isTest: orderData.test,
    });

    apis.lob.letters.create(
      {
        description: `Letter to ${toAddress.name}`,
        to: toAddress,
        from: orderData.fromAddress,
        file: letterHtml,
        color: false,
      },
      (err: Error, body: CreateResponse) => {
        if (err) {
          reject(err);
        } else {
          resolve(body);
        }
      }
    );
  });
}

/** Execute (send letters) from an order
 * @param {Order} orderData the order to execute
 * @return {Promise<CreateResponse[]>} the lob responses
 */
async function executeOrder(orderData: Order): Promise<CreateResponse[]> {
  if (!orderData || !orderData.toAddresses || !orderData.body) {
    throw new Error("invalid orderData" + JSON.stringify(orderData));
  }

  const lobPromises = orderData.toAddresses.map((toAddress: Address) => {
    return sendLetter({ orderData, toAddress });
  });

  await orderCollection.doc(orderData.orderId).update({ fulfilled: true });
  const lobResponses = (await Promise.all([
    ...lobPromises,
  ])) as CreateResponse[];
  await notifyUserOnLetterCreate({ to: orderData.email, lobResponses });
  return lobResponses;
}

const orderUpdateTrigger = functions.firestore
  .document("orders/{orderId}")
  .onUpdate((change) => {
    // Get an object representing the document
    // e.g. {'name': 'Marie', 'age': 66}
    const newValue = change.after.data();

    // ...or the previous value before this update
    const previousValue = change.before.data();

    // if the user hasn't paid yet, don't fulfill this
    // if we already fulfilled this, don't re-execute it
    if (!newValue.paid || newValue.fulfilled || previousValue.fulfilled) {
      return true;
    }

    return executeOrder(newValue as Order);
  });

export default orderUpdateTrigger;
