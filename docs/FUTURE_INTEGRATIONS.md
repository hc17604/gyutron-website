# Future Integrations — gyutron.com

This site is a **static brand website**. Everything below is **scaffolding**: typed interfaces and
**mock/placeholder** implementations so that, when a real backend/CRM/CMS/Agent is needed later, it
plugs in behind a stable interface — without rewriting pages. **Nothing here calls a real service, uses
a secret, or touches a database.** Current status of every module: **mock / disabled / planned**.

## Layout

```
src/config/integrations.ts   reads providers from env (all default to mock/local/none)
src/lib/api/                  client.ts, endpoints in index.ts, types.ts
src/lib/forms/                contact.ts, inquiry.ts, validation.ts  (business-level form fns)
src/lib/crm/                  index.ts, mock-crm.ts, types.ts        (lead storage adapter)
src/lib/cms/                  index.ts, mock-cms.ts, types.ts        (content source adapter)
src/lib/agent/                index.ts, mock-agent.ts, types.ts      (AI tasks adapter)
src/lib/logger/               index.ts                               (structured console logger)
```

## Adoption pattern (the rule)

- **Pages never call a third-party service directly.** A page calls a business function
  (`submitContactForm`, `getProducts`, `getFAQItems`, …); the function calls an adapter; the adapter
  is selected by `config/integrations.ts`. To go live, implement a real adapter behind the same
  interface and flip the provider env var — pages don't change.

## Reserved business functions

```
Forms:   submitContactForm()  submitProductInquiry()  submitSupportRequest()
CMS:     getPageContent()  getProducts()  getProductBySlug()  getSolutions()
         getSolutionBySlug()  getFAQItems()
CRM:     createInquiry()  listInquiries()  getInquiryById()
Agent:   classifyInquiry()  suggestProduct()  generateFAQAnswer()
         runWebsiteAudit()  checkTranslationQuality()
Logger:  logInfo()  logWarning()  logError()
```

## The one real path today

`src/lib/forms/contact.ts → submitContactForm()` wraps the **existing** `POST /api/contact`
(handled by the Cloudflare worker `contact-handler.mjs` → Resend). The contact page can adopt it so the
`fetch` call isn't inlined. If `RESEND_API_KEY` is unset the worker returns a graceful fallback.

## Environment

See `astro/.env.example`. Variables are provider switches + public site constants:
`PUBLIC_SITE_URL`, `PUBLIC_SITE_NAME`, `CRM_PROVIDER`, `CMS_PROVIDER`, `ANALYTICS_PROVIDER`,
`AGENT_PROVIDER` (+ matching keys, left blank). Real keys go in Cloudflare env / a local `.env` (never
committed).

## Explicitly NOT built (out of scope — belongs to shop.gyutron.com)

Auth / roles / permissions, orders / checkout / cart, payments (Stripe / PayPal / Airwallex),
inventory, logistics. No types, adapters, or env vars for these exist here by design. Do not add them
to the brand site.
