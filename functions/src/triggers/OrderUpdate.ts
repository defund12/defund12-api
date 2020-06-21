import { Order } from "../types";

import * as functions from "firebase-functions";
import { orderCollection } from "../database";
import { getApis } from "../apis";
import { Address, CreateResponse } from "../lob";
import { notifyUserOnLetterCreate } from "../emails";
import { makeLetter } from "../letters";

export const markOrderPaid = async (orderId: string) => {
  console.log("marking order paid", orderId);
  const docs = await orderCollection.where("orderId", "==", orderId).get();
  if (docs.empty) {
    throw new Error("no order with id " + orderId);
  }

  const order = docs.docs[0];

  const orderPromise = order.ref.update({ paid: true });
  return orderPromise;
};

export const executeOrderId = async (orderId: string) => {
  console.log("executing order", orderId);

  const docs = await orderCollection.where("orderId", "==", orderId).get();
  if (docs.empty) {
    throw new Error("no order with id " + orderId);
  }

  const order = docs.docs[0];
  const orderData: Order = order.data() as Order;
  return executeOrder(orderData);
};

export const executeOrder = async (orderData: Order): Promise<any> => {
  if (!orderData || !orderData.toAddresses || !orderData.body) {
    throw new Error("no order with id ");
  }

  const apis = getApis({isTest: orderData.test});

  const lobPromises = orderData.toAddresses.map((toAddress: Address) => {
    return new Promise((resolve, reject) => {
      apis.lob.letters.create(
        {
          description: "Demo Letter",
          to: toAddress,
          from: orderData.fromAddress,
          file: makeLetter({
            email: orderData.email,
            toAddress,
            fromAddress: orderData.fromAddress,
            body: orderData.body,
            isTest: orderData.test,
          }),
          color: false,
        },
        (err: any, body: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(body);
          }
        }
      );
    });
  });

  await orderCollection.doc(orderData.orderId).update({ fulfilled: true });
  const lobResponses = await Promise.all([...lobPromises]) as CreateResponse[];
  await notifyUserOnLetterCreate({to: orderData.email, lobResponses});
  // console.log(lobResponses);
  return lobResponses;
};

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
    if (
      !newValue.paid  ||
      newValue.fulfilled || 
      previousValue.fulfilled
    ) {
      return true;
    }

    return executeOrder(newValue as Order);
  });

export default orderUpdateTrigger;
