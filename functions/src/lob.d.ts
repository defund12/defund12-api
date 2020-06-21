export = Lob;

/*~ This example shows how to have multiple overloads for your function */
declare function Lob(
  apiKey: string,
  options?: {
    apiVersion?: string;
  }
): Lob;

declare namespace Lob {
  interface Address {
    name: string;
    address_line1: string;
    address_line2?: string;
    address_city: string;
    address_state: string;
    address_zip: string;
    email?: string;
  }

  interface ResponseAddress extends Address {
    id: string;
    description?: string;
    company?: string;
    phone?: string;
    metadata: Record<string, string>;
    date_created: string;
    date_modified: string;
    deleted: true;
    object: string;
  }

  interface CreateParams {
    description?: string;
    to: Address | string;
    from: Address | string;
    file?: string;
    merge_variables?: Record<string, string>;
    color?: boolean;
  }

  interface CreateResponse {
    id: string;
    description: string;
    metadata: Record<string, string>;
    to: ResponseAddress;
    from: ResponseAddress;
    color: boolean;
    double_sided: boolean;
    address_placement: string;
    return_envelope: boolean;
    perforated_page: null;
    custom_envelope: null;
    extra_service: null;
    mail_type: string;
    url: string;
    template_id?: string;
    carrier: string;
    tracking_number: null;
    tracking_events: string[];
    thumbnails: Array<{
      small: string;
      medium: string;
      large: string;
    }>;
    merge_variables: {
      name: string;
    };
    expected_delivery_date: string;
    date_created: string;
    date_modified: string;
    send_date: string;
    object: string;
  }

  interface WebhookPayload {
    body: CreateResponse;
    event_type: {
      id:
        | "postcard.created"
        | "postcard.rendered_pdf"
        | "postcard.rendered_thumbnails"
        | "postcard.deleted"
        | "postcard.mailed"
        | "postcard.in_transit"
        | "postcard.in_local_area"
        | "postcard.processed_for_delivery"
        | "postcard.re-routed"
        | "postcard.returned_to_sender"
        | "letter.created"
        | "letter.rendered_pdf"
        | "letter.rendered_thumbnails"
        | "letter.deleted"
        | "letter.mailed"
        | "letter.in_transit"
        | "letter.in_local_area"
        | "letter.processed_for_delivery"
        | "letter.re-routed"
        | "letter.returned_to_sender"
        | "check.created"
        | "check.rendered_pdf"
        | "check.rendered_thumbnails"
        | "check.deleted"
        | "check.mailed"
        | "check.in_transit"
        | "check.in_local_area"
        | "check.processed_for_delivery"
        | "check.re-routed"
        | "check.returned_to_sender"
        | "address.created"
        | "address.deleted"
        | "bank_account.created"
        | "bank_account.deleted"
        | "bank_account.verified";
    };
  }
}

interface LettersApi {
  create(params: Lob.CreateParams, cb: (err: Error, res: Lob.CreateResponse) => void): any;
}

interface Lob {
  letters: LettersApi;
}
