import { sendgrid } from "./apis";
import Lob from "./lob";

export function notifyUserOnLetterCreate({
  to,
  lobResponses,
}: {
  to: string;
  lobResponses: Lob.CreateResponse[];
}): Promise<void> {
  const responseSummaries = lobResponses
    .map((lobResponse: any) => {
      return `Sent to: ${lobResponse.to.name}
Expected Delivery: ${lobResponse.expected_delivery_date}
Preview: ${lobResponse.url}`;
    })
    .join("\n\n");

  const text = `You sent some letters!\n\n${responseSummaries}`;

  const htmlResponseSummaries = lobResponses
    .map((lobResponse: any) => {
      return `<li> ${
        lobResponse.to.name
      } - expected delivery: ${lobResponse.expected_delivery_date.substring(0, 10)} <a href="${
        lobResponse.url
      }">(preview)</a></li>`;
    })
    .join("\n");

  const html = `Your letters have been sent to the printer!\n\n
  
  <ul>${htmlResponseSummaries}</ul>
  You should get a follow-up email in a few days when the letters are close to being delivered
  `;

  const msg = {
    to,
    from: "defund12@blackmad.com",
    subject: "Letters Sent!",
    text,
    html,
  };
  return sendgrid.send(msg).catch((err: any) => {
    console.dir(err, { depth: 10 });
    throw err;
  });
}

export const notifyUserOnLobWebhook = (lobResponse: Lob.WebhookPayload) => {
  if (lobResponse.event_type.id !== "letter.processed_for_delivery") {
    return;
  }
  const sendDate = lobResponse.body.date_created.substring(0, 10);

  const body = `Your defund12 letter has almost arrived.
  
A letter that you sent on ${sendDate} 
is about one day away from arriving at the office of ${lobResponse.body.to.name} in ${lobResponse.body.to.address_city}. If you don't remember what your letter looks like, it looks like ${lobResponse.body.url}


Because it's a first class letter, we don't know exactly when it arrives at their door. For more information about that, see https://support.lob.com/hc/en-us/articles/115000097404-Can-I-track-my-mail-

`;

  const htmlBody = `Your defund12 letter has almost arrived.
<br><br>  
A <a href="${lobResponse.body.url}">letter</a> that you sent on ${sendDate} 
is about one day away from arriving at the office of ${lobResponse.body.to.name} in ${lobResponse.body.to.address_city}.
<br><br>
Because it's a first class letter, we don't know <a href="https://support.lob.com/hc/en-us/articles/115000097404-Can-I-track-my-mail-">exactly</a> when it arrives at their door, but we do know that it's in the area and should be delivered by tomorrow.

`;

  const msg = {
    to: lobResponse.body.from.email,
    from: "defund12@blackmad.com",
    subject: "Letters (almost) delivered!",
    text: body,
    html: htmlBody,
  };
  return sendgrid.send(msg).catch((err: any) => {
    throw err;
  });
};
