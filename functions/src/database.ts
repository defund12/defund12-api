import admin = require("firebase-admin");
admin.initializeApp();

/** The database collection where we save orders. We save before starting the checkout
 * flow, and then read it back when checkout flow successfully completes.
 */
export const orderCollection = admin.firestore().collection("orders")