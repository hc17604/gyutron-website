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
src/lib/cms/                  index.ts, local-cms.ts, types.ts       (content source adapter; local impl)
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

## CMS facade — implemented (provider `local`)

`src/lib/cms/` is a **working facade over the in-repo data layer**, not a stub. The default
adapter `local-cms.ts` (selected when `CMS_PROVIDER=local`, the default) delegates:

```
getProducts(locale)          → src/data/products.ts  getCatalog(locale)      (ProductCatalog)
getProductBySlug(slug,loc)   → src/data/products.ts  getCategory(loc,slug)   (ProductCategory | null)
getSolutions(locale)         → src/data/solutions.ts SOLUTIONS               (Solution[])
getSolutionBySlug(slug,loc)  → src/data/solutions.ts getSolution(slug)       (Solution | null)
getFAQItems(locale)          → src/data/faq.ts       FAQ_ITEMS               (FaqItem[])
getPageContent(slug,locale)  → support/solution registry → { title (i18n), body:'' }
```

Return types are the in-repo data-model types (`CmsAdapter` in `cms/types.ts`), so callers stay
type-safe. Page **bodies** are component-rendered (not in the data layer), so `getPageContent`
returns the localized title with an empty `body`. Pages may still import `src/data` directly today;
the facade exists so they *can* migrate without lock-in.

**To swap in a real headless CMS (Sanity / Strapi / Directus / Payload):**
1. Add `src/lib/cms/<vendor>-cms.ts` implementing the `CmsAdapter` interface (`cms/types.ts`).
2. Add a `case '<vendor>': return <vendor>Cms;` in `getAdapter()` (`cms/index.ts`).
3. Set `CMS_PROVIDER=<vendor>` (+ any vendor keys) in Cloudflare env / local `.env`.
   Pages and the facade signatures do not change.

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
