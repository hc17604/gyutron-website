/**
 * FAQ content model. Reference EN content mirrored from `src/pages/**​/support/faq.astro`
 * so the FAQ can become data-driven (one page rendering all locales) instead of triplicated
 * markup. de/ja translations + page wiring are TODO — until a page renders from this file,
 * the three `support/faq.astro` files remain the source of truth; keep them in sync.
 */
import type { FaqItem, FaqCategory } from '../types/support';

export const FAQ_CATEGORIES: FaqCategory[] = [
  { id: 'products', title: 'Products & Compatibility' },
  { id: 'samples', title: 'Samples & Quotation' },
  { id: 'shipping', title: 'Shipping & Lead Time' },
  { id: 'warranty', title: 'Warranty & After-sales' },
  { id: 'docs', title: 'Documentation & Integration' },
];

export const FAQ_ITEMS: FaqItem[] = [
  // Products & Compatibility
  {
    id: 'products-offered',
    category: 'products',
    question: 'What products does GYUTRON provide?',
    answer:
      'GYUTRON supplies industrial intelligent hardware: machine-vision and code-reading cameras, smart vision sensors, proximity and environmental sensors, rugged Android PDAs and RFID handhelds, barcode scanners, dimensional gauges and measurement instruments, plus related automation components — for manufacturers and system integrators worldwide.',
  },
  {
    id: 'match-application',
    category: 'products',
    question: 'Can GYUTRON help match products to my application?',
    answer:
      'Yes. Share your application, operating environment, target throughput and interface requirements with our sales-engineering team and we will recommend a suitable configuration rather than just a part number.',
  },
  {
    id: 'oem-odm',
    category: 'products',
    question: 'Do you support OEM or ODM projects?',
    answer:
      'Yes. For qualified volume programs we support custom configurations, firmware, housings, connectors and private labeling. Share your specification and target quantity to scope a solution.',
  },
  {
    id: 'industrial-suitable',
    category: 'products',
    question: 'Are your products suitable for industrial environments?',
    answer:
      'Our hardware is designed for industrial use, with IP-rated housings on applicable models and ratings stated per product. Confirm the specific environmental and ingress rating for your conditions on the product datasheet or with our team.',
  },
  // Samples & Quotation
  {
    id: 'samples',
    category: 'samples',
    question: 'Can I request samples or evaluation units?',
    answer:
      'Evaluation units are available for qualified projects. Tell us about your application, interface and expected volume through Contact Sales and we will advise on availability.',
  },
  {
    id: 'request-quote',
    category: 'samples',
    question: 'How do I request a quotation?',
    answer:
      'Send the product model(s), quantity and target date through Contact Sales and our team will prepare a quotation.',
  },
  {
    id: 'quote-info',
    category: 'samples',
    question: 'What information should I provide for a quote?',
    answer:
      'Product model or application description, quantity, required interface/configuration, target delivery date and destination country/region. The more detail you provide, the more accurate the quotation.',
  },
  {
    id: 'moq',
    category: 'samples',
    question: 'Is there a minimum order quantity?',
    answer:
      'Minimums depend on the product line and configuration and are confirmed in the applicable quotation. We work with both pilot/evaluation volumes and series production.',
  },
  // Shipping & Lead Time
  {
    id: 'ship-international',
    category: 'shipping',
    question: 'Do you ship internationally?',
    answer:
      'Yes — we ship worldwide. Shipments are arranged from Hong Kong, Shenzhen or supplier warehouses depending on product availability and project requirements. See Shipping & Delivery.',
  },
  {
    id: 'lead-time',
    category: 'shipping',
    question: 'What is the typical lead time?',
    answer:
      'In-stock items are dispatched promptly; configured or made-to-order items depend on options and quantity. Confirmed lead times are provided with each quotation.',
  },
  {
    id: 'incoterms',
    category: 'shipping',
    question: 'Which Incoterms do you support?',
    answer:
      'International shipments are arranged under agreed Incoterms such as EXW, FOB or DAP, confirmed on the order. For larger orders we can coordinate with your nominated freight forwarder.',
  },
  {
    id: 'partial-shipments',
    category: 'shipping',
    question: 'Can you arrange partial shipments?',
    answer:
      'Yes. For multi-line orders we can ship available items first rather than holding the entire order for one line, as agreed on the order.',
  },
  // Warranty & After-sales
  {
    id: 'warranty-provided',
    category: 'warranty',
    question: 'What warranty does GYUTRON provide?',
    answer:
      "GYUTRON hardware carries a limited warranty against defects in materials and workmanship. Coverage may vary by product category and project agreement; the applicable terms are confirmed in your quotation, order confirmation or written agreement. See the Warranty page.",
  },
  {
    id: 'warranty-exclusions',
    category: 'warranty',
    question: 'What is not covered under warranty?',
    answer:
      'Typical exclusions include misuse, improper installation, operation outside published specifications, unauthorized modification or repair, accidental or liquid damage beyond the rated protection, and consumable or wear parts. See the Warranty page for details.',
  },
  {
    id: 'after-sales',
    category: 'warranty',
    question: 'How do I request after-sales support?',
    answer:
      'Start by contacting support with the product model, serial number and a description of the issue. Eligible cases are handled through our RMA process.',
  },
  {
    id: 'repair-replacement',
    category: 'warranty',
    question: 'Do you provide repair or replacement service?',
    answer:
      "Yes. In-warranty defects are repaired or replaced at GYUTRON's discretion; paid repair and service are available for out-of-warranty units.",
  },
  // Documentation & Integration
  {
    id: 'datasheets',
    category: 'docs',
    question: 'Can you provide datasheets and technical documents?',
    answer:
      'Yes. Datasheets, manuals and technical documentation are available from your sales engineer or info@gyutron.com. A self-service Downloads area is being expanded.',
  },
  {
    id: 'sdk-integration',
    category: 'docs',
    question: 'Do your products support SDKs or integration guides?',
    answer:
      'Yes. We provide the SDKs, drivers and integration guidance required to bring a device into your platform, line or host application.',
  },
  {
    id: 'support-integrators',
    category: 'docs',
    question: 'Can GYUTRON support system integrators?',
    answer:
      'Yes. We work with system integrators and machine builders and can support specification, sample evaluation and integration for project-based deployments.',
  },
  {
    id: 'evaluate-project',
    category: 'docs',
    question: 'Can you help evaluate a machine-vision or automation project?',
    answer:
      'Yes. Our application engineers can help assess feasibility, recommend hardware and define an integration approach for vision-inspection, identification and automation projects.',
  },
];

/** Items belonging to a category, in declaration order. */
export function faqByCategory(categoryId: string): FaqItem[] {
  return FAQ_ITEMS.filter((item) => item.category === categoryId);
}
