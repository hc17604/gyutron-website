import { handleContactRequest } from "../../src/contact-handler.mjs";

export async function onRequest(context) {
  return handleContactRequest(context.request, context.env);
}
