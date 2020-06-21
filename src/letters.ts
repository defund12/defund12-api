import { Address } from "./lob";

export function makeLetter({
  toAddress,
  fromAddress,
  body,
  email,
  isTest,
}: {
  toAddress: Address;
  fromAddress: Address;
  body: string;
  email: string;
  isTest: boolean;
}): string {
  const formattedBody = body.replace(/\n/g, "<br/>");

  const options1 = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
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

        <p>
          ${fromAddress.name}<br/>
          <!--${fromAddress.address_line1}, ${fromAddress.address_city}, ${
    fromAddress.address_state
  } ${fromAddress.address_zip}<br/>-->
          ${email}
      </div>
    </div>
  </div>
</body>
</html>
`;
};