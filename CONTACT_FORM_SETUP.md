# GYUTRON Contact Form Setup

The Contact Sales form submits to `/api/contact`. The backend sends the inquiry email through Resend.

Required production environment variables:

```text
RESEND_API_KEY=your Resend API key
CONTACT_TO_EMAIL=info@gyutron.com
CONTACT_FROM_EMAIL=GYUTRON Website <inquiries@gyutron.com>
```

`CONTACT_FROM_EMAIL` must use a sender domain that is verified in Resend. After these variables are added to the Cloudflare deployment environment, customer submissions will be delivered directly to `CONTACT_TO_EMAIL`.
