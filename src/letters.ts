import { Address } from "./lob";

type MakeLetterHtmlBodyParams = {
  /** address letter is sent to */
  toAddress: Address;
  /** address letter is sent from */
  fromAddress: Address;
  /** text body of letter, will be wrapped in salutation & sign off */
  body: string;
  /** if true, will call lob in test env, where letter won't actually be sent or charged */
  isTest: boolean;
};

/** Generate the html that lob will render into our printed letter
 * @param {MakeLetterHtmlBodyParams} params input params
 * @return {string} html body of the letter
 */
export function makeLetterHtmlBody({
  toAddress,
  fromAddress,
  body,
  isTest,
}: MakeLetterHtmlBodyParams): string {
  const formattedBody = body.replace(/\n/g, "<br/>");

  const options1 = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const date1 = new Date();

  const dateTimeFormat3 = new Intl.DateTimeFormat("en-US", options1);
  const formattedDate = dateTimeFormat3.format(date1);

  return `t
<html>
<head>
<meta charset="UTF-8">
<link href='https://fonts.googleapis.com/css?family=Open+Sans:400' rel='stylesheet' type='text/css'>
<title>Lob.com Outstanding Balance Letter Template</title>
<style>
  @font-face {
    font-family: 'Loved by the King';
    font-style: normal;
    font-weight: 400;
    src: url('https://s3-us-west-2.amazonaws.com/public.lob.com/fonts/lovedByTheKing/LovedbytheKing.ttf') format('truetype');
  }

  *, *:before, *:after {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }

  body {
    width: 8.5in;
    height: 11in;
    margin: 0;
    padding: 0;
    font-family: 'Open Sans';
  }

  .page {
    page-break-after: always;
  }

  .page-content {
    position: relative;
    width: 7in;
    height: 10.625in;
    left: 0.75in;
    top: 0.1875in;
  }

  #logo {
    position: absolute;
    right: 0;
  }

  .wrapper {
    position: absolute;
    top: 2.75in;
  }

  .signature {
    font-family: 'Loved by the King';
    font-size: 45px;
  }
</style>
</head>
<body>
  <div class="page">
    <div class="page-content">
      <!-- Your logo here! -->

      <div class='wrapper'>
        ${isTest ? "<h1>TEST TEST TEST TEST TEST</h1>" : ""}
        <p>${formattedDate}</p>

        <p>Dear ${toAddress.name},</p>

        ${formattedBody.replace(/\n\n/g, "<br/>").replace(/\n/g, "<br/>")}

        <p>Thank you,<br/>
        <span class="signature">${fromAddress.name}</span></p>
nvm 
        <p>
          ${fromAddress.name}<br/>
          <!--${fromAddress.address_line1}, ${fromAddress.address_city}, ${
    fromAddress.address_state
  } ${fromAddress.address_zip}<br/>-->
          ${fromAddress.email}
      </div>
    </div>
  </div>
</body>
</html>
`;
}
