# Storefront order-intent API

`POST https://shop.gyutron.com/api/order-intents` records a procurement request
for staff review. It does **not** create an order, reserve stock, calculate a
price, or charge the buyer. The route returns `503` until the D1 binding exists
and `migrations/0002_order_intents.sql` has been applied.

## Request

Send `Content-Type: application/json` with a body no larger than 64 KiB:

```json
{
  "contact": {
    "name": "Jane Buyer",
    "company": "ACME Automation",
    "email": "jane@example.com",
    "phone": "+65 6123 4567",
    "department": "Procurement"
  },
  "shipping": {
    "recipient": "Receiving Team",
    "company": "ACME Automation",
    "phone": "+65 6123 4567",
    "address1": "10 Industrial Avenue",
    "address2": "Dock 3",
    "city": "Singapore",
    "region": "Singapore",
    "postalCode": "408600",
    "country": "SG"
  },
  "billing": {
    "sameAsShipping": true
  },
  "procurement": {
    "projectName": "Line 4 inspection",
    "purchaseOrder": "PO-DRAFT-42",
    "taxId": "SG-TAX-42",
    "invoiceInfo": "Address the pro forma invoice to Accounts Payable.",
    "notes": "Please confirm lead time and configuration."
  },
  "requestType": "proforma_invoice",
  "items": [
    {
      "sku": "GY-CV220-INLINE",
      "quantity": 2,
      "configuration": { "interface": "GigE" }
    }
  ],
  "locale": "en",
  "sourcePage": "/checkout",
  "idempotencyKey": "018fcff1-7eb1-7fc9-8e22-aaaaaaaaaaaa",
  "website": ""
}
```

- `requestType` is `order_request` or `proforma_invoice`.
- `contact.name`, `contact.company`, `contact.email`, the four shipping basics
  (`address1`, `city`, `postalCode`, `country`), and 1–25 items are required.
- Item quantity is an integer from 1 to 999. SKU must be one of the 16 SKUs in
  the storefront catalog; the server allow-list is `ORDER_INTENT_SKUS` in
  `src/platform/schemas.mjs`.
- Billing defaults to shipping when omitted or when `sameAsShipping` is `true`.
  Otherwise the four billing basics are required.
- `idempotencyKey` is optional but strongly recommended. Generate one UUID per
  user submission and reuse it for retries. The server stores only its SHA-256
  hash. Reusing a key with the same normalized request returns the original ID;
  reusing it with different data returns `409`.
- `website` is a honeypot and must remain empty in the real form.

Do not send price, subtotal, total, tax/shipping amount, currency, payment-card,
CVC/CVV, bank-account, routing, IBAN, or similar fields. The validator rejects
them recursively, including when nested in item configuration. There are no
corresponding columns in D1.

## Responses

Accepted requests and same-payload idempotent retries return HTTP `202`:

```json
{
  "ok": true,
  "id": "OI-20260803-7K3QF2",
  "status": "pending_review",
  "message": "Request received; no charge has been made."
}
```

Errors use `{ "ok": false, "message": "...", "errors": { ... } }` when field
details are useful: `400` validation, `403` disallowed Origin, `409` idempotency
conflict, `413` oversized body, `415` non-JSON, `429` rate limit, and `503` when
the request cannot be durably stored. A success response is never returned for a
real submission unless the intent, all item rows, and `order_intent.created`
event succeed in one D1 batch.

Browser CORS is limited to `https://shop.gyutron.com`; it is never `*`. For local
Worker testing only, set non-secret `ORDER_INTENT_ALLOW_LOCAL_ORIGIN=true` to
allow an Origin on `localhost`, `127.0.0.1`, or `[::1]`.

## Staff review

Authenticated staff can use `/admin/order-intents` to list requests, view the
address/procurement data and item rows, add an internal note, and move the record
through review statuses. `ready_for_quote` means staff may continue the quote
workflow outside this endpoint; it does not mean an order or payment exists.
