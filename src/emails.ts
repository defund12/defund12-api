import { sendgrid, sendgridFrom } from "./apis";
import Lob, { CreateResponse } from "./lob";

type NotifyOnCreateParams = {
  /** email address to send to */
  to: string;
  /** array of lob responses to notify the user about */
  lobResponses: Lob.CreateResponse[];
};

/** After we have successfully sent a batch of letters, email the user about all of them at once
 * @param {NotifyOnCreateParams} params input params
 * @return {Promise<void>} promise on completion
 */
export function notifyUserOnLetterCreate({
  to,
  lobResponses,
}: NotifyOnCreateParams): Promise<void> {
  const responseSummaries = lobResponses
    .map((lobResponse: CreateResponse) => {
      return `Sent to: ${lobResponse.to.name}
Expected Delivery: ${lobResponse.expected_delivery_date}
Preview: ${lobResponse.url}`;
    })
    .join("\n\n");

  const text = `You sent some letters!\n\n${responseSummaries}`;

  const htmlResponseSummaries = lobResponses
    .map((lobResponse: CreateResponse) => {
      return `<li> ${
        lobResponse.to.name
      } - expected delivery: ${lobResponse.expected_delivery_date.substring(
        0,
        10
      )} <a href="${lobResponse.url}">(preview)</a></li>`;
    })
    .join("\n");

  const html = `Your letters have been sent to the printer!\n\n
  
  <ul>${htmlResponseSummaries}</ul>
  You should get a follow-up email in a few days when the letters are close to being delivered
  `;

  const msg = {
    to,
    from: sendgridFrom,
    subject: "Letters Sent!",
    text,
    html,
  };
  return sendgrid.send(msg).catch((err: Error) => {
    console.dir(err, { depth: 10 });
    throw err;
  });
}

/** email a user after getting a webhook update from lob
 * @param {Lob.WebhookPayload} lobWebhookPayload payload from lob webook
 * @return {Promise<void>} promise on completion of email send
 */
export async function notifyUserOnLobWebhook(
  lobWebhookPayload: Lob.WebhookPayload
): Promise<void> {
  if (lobWebhookPayload.event_type.id !== "letter.processed_for_delivery") {
    return;
  }
  const sendDate = lobWebhookPayload.body.date_created.substring(0, 10);

  const body = `Your defund12 letter has almost arrived.
  
A letter that you sent on ${sendDate} 
is about one day away from arriving at the office of ${lobWebhookPayload.body.to.name} in ${lobWebhookPayload.body.to.address_city}. If you don't remember what your letter looks like, it looks like ${lobWebhookPayload.body.url}


Because it's a first class letter, we don't know exactly when it arrives at their door. For more information about that, see https://support.lob.com/hc/en-us/articles/115000097404-Can-I-track-my-mail-

`;

  const htmlBody = `Your defund12 letter has almost arrived.
<br><br>  
A <a href="${lobWebhookPayload.body.url}">letter</a> that you sent on ${sendDate} 
is about one day away from arriving at the office of ${lobWebhookPayload.body.to.name} in ${lobWebhookPayload.body.to.address_city}.
<br><br>
Because it's a first class letter, we don't know <a href="https://support.lob.com/hc/en-us/articles/115000097404-Can-I-track-my-mail-">exactly</a> when it arrives at their door, but we do know that it's in the area and should be delivered by tomorrow.

`;

  const msg = {
    to: lobWebhookPayload.body.from.email,
    from: sendgridFrom,
    subject: "Letters (almost) delivered!",
    text: body,
    html: htmlBody,
  };
  return sendgrid.send(msg).catch((err: Error) => {
    throw err;
  });
}
