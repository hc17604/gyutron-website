(function () {
    "use strict";

    const root = document.querySelector("[data-checkout-root]");
    if (!root) return;

    const locale = window.GYUTRON_SHOP_LOCALE || "en";
    const dictionaries = window.GYUTRON_CHECKOUT_I18N || {};
    const dictionary = dictionaries[locale] || dictionaries.en || {};
    const english = dictionaries.en || {};
    const copy = (key, vars = {}) => {
        let value = dictionary[key] || english[key] || key;
        for (const [name, replacement] of Object.entries(vars)) {
            value = value.replaceAll(`{${name}}`, String(replacement));
        }
        return value;
    };
    const safe = (value) => typeof escapeHtml === "function"
        ? escapeHtml(value == null ? "" : value)
        : String(value == null ? "" : value).replace(/[&<>"']/g, (character) => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;"
        })[character]);

    const state = {
        step: 1,
        values: { sameBilling: true, requestType: "order_request", website: "" },
        errors: {},
        submitting: false,
        submitError: "",
        result: null,
        idempotencyKey: "",
    };

    const steps = [
        { title: "step1.title", short: "step1.short" },
        { title: "step2.title", short: "step2.short" },
        { title: "step3.title", short: "step3.short" },
        { title: "step4.title", short: "step4.short" },
    ];

    function cartItems() {
        if (typeof getCartItems !== "function") return [];
        return getCartItems();
    }

    function displayMoney(value) {
        return typeof money === "function" ? money(value) : `$${Number(value).toFixed(2)}`;
    }

    function cartCount(items) {
        return items.reduce((total, item) => total + Number(item.qty || 0), 0);
    }

    function cartSubtotal(items) {
        return items.reduce((total, item) => total + Number(item.product.price || 0) * Number(item.qty || 0), 0);
    }

    function fieldValue(name) {
        const value = state.values[name];
        return value == null ? "" : String(value);
    }

    function errorMarkup(name) {
        const message = state.errors[name];
        if (!message) return "";
        return `<span class="checkout-field__error" id="checkout-${safe(name)}-error"><i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>${safe(message)}</span>`;
    }

    function field(name, labelKey, options = {}) {
        const id = `checkout-${name}`;
        const type = options.type || "text";
        const required = options.required ? " required" : "";
        const autocomplete = options.autocomplete ? ` autocomplete="${safe(options.autocomplete)}"` : "";
        const wide = options.wide ? " checkout-field--wide" : "";
        const invalid = state.errors[name] ? ` aria-invalid="true" aria-describedby="${id}-error"` : "";
        const optional = options.required ? "" : ` <span>${safe(copy("field.optional"))}</span>`;
        const label = `<label for="${id}">${safe(copy(labelKey))}${optional}</label>`;
        let control;
        if (options.textarea) {
            control = `<textarea id="${id}" name="${safe(name)}"${required}${autocomplete}${invalid} placeholder="${safe(options.placeholder ? copy(options.placeholder) : "")}">${safe(fieldValue(name))}</textarea>`;
        } else {
            control = `<input id="${id}" name="${safe(name)}" type="${safe(type)}" value="${safe(fieldValue(name))}"${required}${autocomplete}${invalid}${options.inputmode ? ` inputmode="${safe(options.inputmode)}"` : ""}>`;
        }
        return `<div class="checkout-field${wide}">${label}${control}${errorMarkup(name)}</div>`;
    }

    function stepHeader(index) {
        const number = index + 1;
        const active = state.step === number;
        const complete = state.step > number;
        const className = active ? "is-active" : complete ? "is-complete" : "is-upcoming";
        const buttonDisabled = complete ? "" : " disabled";
        const status = active ? copy("step.current") : complete ? copy("step.complete") : copy("step.upcoming");
        return `
            <li class="checkout-step ${className}" data-step-container="${number}">
                <button class="checkout-step__header" type="button" data-checkout-step="${number}"${buttonDisabled} aria-current="${active ? "step" : "false"}">
                    <span class="checkout-step__number">${String(number)}</span>
                    <span class="checkout-step__heading">
                        <strong>${safe(copy(steps[index].title))}</strong>
                        <span>${safe(active ? copy(steps[index].short) : status)}</span>
                    </span>
                    ${complete ? `<span class="checkout-step__edit"><i class="fa-solid fa-pen" aria-hidden="true"></i> ${safe(copy("step.edit"))}</span>` : ""}
                </button>
                ${active ? stepBody(number) : ""}
            </li>`;
    }

    function actions(back = true, submit = false) {
        return `
            <div class="checkout-actions">
                ${back ? `<button class="button button-outline" type="button" data-checkout-back>${safe(copy("action.back"))}</button>` : ""}
                <button class="button button-primary" type="submit"${state.submitting ? " disabled" : ""}>
                    ${safe(state.submitting ? copy("action.submitting") : submit ? copy("action.submit") : copy("action.continue"))}
                </button>
            </div>`;
    }

    function stepOne() {
        return `
            <form class="checkout-step__body" data-checkout-form novalidate>
                <p class="checkout-step__lead">${safe(copy("step1.lead"))}</p>
                <div class="checkout-notice"><strong>${safe(copy("guest.title"))}</strong><br>${safe(copy("guest.text"))}</div>
                <div class="checkout-form-grid">
                    ${field("firstName", "field.firstName", { required: true, autocomplete: "given-name" })}
                    ${field("lastName", "field.lastName", { required: true, autocomplete: "family-name" })}
                    ${field("company", "field.company", { required: true, autocomplete: "organization" })}
                    ${field("email", "field.email", { required: true, type: "email", autocomplete: "email" })}
                    ${field("phone", "field.phone", { required: true, type: "tel", autocomplete: "tel", inputmode: "tel" })}
                    ${field("department", "field.department", { autocomplete: "organization-title" })}
                </div>
                ${actions(false)}
            </form>`;
    }

    function billingFields() {
        if (state.values.sameBilling !== false) return "";
        return `
            <div class="checkout-billing-fields">
                <h3 class="checkout-section-title">${safe(copy("billing.title"))}</h3>
                <div class="checkout-form-grid">
                    ${field("billingRecipient", "field.recipient", { autocomplete: "billing name" })}
                    ${field("billingCompany", "field.company", { autocomplete: "billing organization" })}
                    ${field("billingAddress1", "field.address1", { required: true, wide: true, autocomplete: "billing address-line1" })}
                    ${field("billingAddress2", "field.address2", { wide: true, autocomplete: "billing address-line2" })}
                    ${field("billingCity", "field.city", { required: true, autocomplete: "billing address-level2" })}
                    ${field("billingRegion", "field.region", { autocomplete: "billing address-level1" })}
                    ${field("billingPostalCode", "field.postalCode", { required: true, autocomplete: "billing postal-code" })}
                    ${field("billingCountry", "field.country", { required: true, autocomplete: "billing country-name" })}
                    ${field("billingPhone", "field.phone", { type: "tel", autocomplete: "billing tel", inputmode: "tel" })}
                </div>
            </div>`;
    }

    function stepTwo() {
        const sameBilling = state.values.sameBilling !== false;
        return `
            <form class="checkout-step__body" data-checkout-form novalidate>
                <p class="checkout-step__lead">${safe(copy("step2.lead"))}</p>
                <h3 class="checkout-section-title">${safe(copy("shipping.title"))}</h3>
                <div class="checkout-form-grid">
                    ${field("shippingRecipient", "field.recipient", { required: true, autocomplete: "shipping name" })}
                    ${field("shippingCompany", "field.company", { autocomplete: "shipping organization" })}
                    ${field("shippingAddress1", "field.address1", { required: true, wide: true, autocomplete: "shipping address-line1" })}
                    ${field("shippingAddress2", "field.address2", { wide: true, autocomplete: "shipping address-line2" })}
                    ${field("shippingCity", "field.city", { required: true, autocomplete: "shipping address-level2" })}
                    ${field("shippingRegion", "field.region", { autocomplete: "shipping address-level1" })}
                    ${field("shippingPostalCode", "field.postalCode", { required: true, autocomplete: "shipping postal-code" })}
                    ${field("shippingCountry", "field.country", { required: true, autocomplete: "shipping country-name" })}
                    ${field("shippingPhone", "field.phone", { required: true, type: "tel", autocomplete: "shipping tel", inputmode: "tel" })}
                </div>
                <label class="checkout-checkbox" for="checkout-sameBilling">
                    <input id="checkout-sameBilling" name="sameBilling" type="checkbox" ${sameBilling ? "checked" : ""}>
                    <span>${safe(copy("billing.same"))}</span>
                </label>
                ${billingFields()}
                ${actions(true)}
            </form>`;
    }

    function stepThree() {
        return `
            <form class="checkout-step__body" data-checkout-form novalidate>
                <p class="checkout-step__lead">${safe(copy("step3.lead"))}</p>
                <h3 class="checkout-section-title">${safe(copy("shippingMethod.title"))}</h3>
                <label class="checkout-method">
                    <input type="radio" name="shippingReview" value="sales_confirmed" checked>
                    <span><strong>${safe(copy("shippingMethod.reviewTitle"))}</strong><span>${safe(copy("shippingMethod.reviewText"))}</span></span>
                </label>
                <div class="checkout-notice"><strong>${safe(copy("shippingMethod.costTitle"))}</strong><br>${safe(copy("shippingMethod.costText"))}</div>
                <h3 class="checkout-section-title">${safe(copy("procurement.title"))}</h3>
                <div class="checkout-form-grid">
                    ${field("purchaseOrder", "field.purchaseOrder")}
                    ${field("projectName", "field.projectName")}
                    ${field("taxId", "field.taxId")}
                    ${field("invoiceInfo", "field.invoiceInfo", { wide: true, textarea: true, placeholder: "field.invoiceInfoPlaceholder" })}
                    ${field("notes", "field.notes", { wide: true, textarea: true, placeholder: "field.notesPlaceholder" })}
                </div>
                ${actions(true)}
            </form>`;
    }

    function stepFour() {
        return `
            <form class="checkout-step__body" data-checkout-form novalidate>
                ${state.submitError ? `<div class="checkout-alert" role="alert" tabindex="-1" data-submit-error><i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i><span>${safe(state.submitError)}</span></div>` : ""}
                <p class="checkout-step__lead">${safe(copy("step4.lead"))}</p>
                <h3 class="checkout-section-title">${safe(copy("payment.title"))}</h3>
                <div class="checkout-notice"><strong>${safe(copy("payment.unavailableTitle"))}</strong><br>${safe(copy("payment.unavailableText"))}</div>
                <h3 class="checkout-section-title">${safe(copy("request.title"))}</h3>
                <div class="checkout-request-types">
                    <label class="checkout-request-type">
                        <input type="radio" name="requestType" value="order_request" ${fieldValue("requestType") !== "proforma_invoice" ? "checked" : ""}>
                        <span><strong>${safe(copy("request.orderTitle"))}</strong><span>${safe(copy("request.orderText"))}</span></span>
                    </label>
                    <label class="checkout-request-type">
                        <input type="radio" name="requestType" value="proforma_invoice" ${fieldValue("requestType") === "proforma_invoice" ? "checked" : ""}>
                        <span><strong>${safe(copy("request.proformaTitle"))}</strong><span>${safe(copy("request.proformaText"))}</span></span>
                    </label>
                </div>
                <div class="checkout-field checkout-honeypot" aria-hidden="true">
                    <label for="checkout-website">Website</label>
                    <input id="checkout-website" name="website" type="text" tabindex="-1" autocomplete="off" value="${safe(fieldValue("website"))}">
                </div>
                ${actions(true, true)}
            </form>`;
    }

    function stepBody(number) {
        if (number === 1) return stepOne();
        if (number === 2) return stepTwo();
        if (number === 3) return stepThree();
        return stepFour();
    }

    function summaryMarkup(items) {
        const count = cartCount(items);
        const subtotal = cartSubtotal(items);
        return `
            <div class="checkout-summary__header">
                <h2>${safe(copy("summary.title"))}</h2>
                <a href="${locale === "en" ? "" : `/${locale}`}/shop/cart.html">${safe(copy("summary.editCart"))}</a>
            </div>
            <div class="checkout-summary__items">
                ${items.map(({ product, qty, configuration }) => {
                    const approvedConfiguration = sanitizedConfiguration(configuration);
                    return `
                    <article class="checkout-summary-item">
                        <img src="${safe(product.image)}" alt="${safe(product.name)}">
                        <div>
                            <strong>${safe(product.name)}</strong>
                            <small>SKU: ${safe(product.sku)}</small>
                            ${approvedConfiguration ? `<span>${safe(typeof approvedConfiguration === "string" ? approvedConfiguration : JSON.stringify(approvedConfiguration))}</span>` : ""}
                            <span>${safe(copy("summary.quantity", { quantity: qty }))} · ${safe(displayMoney(product.price))}</span>
                        </div>
                    </article>`;
                }).join("")}
            </div>
            <div class="checkout-summary__rows">
                <div class="checkout-summary__row"><span>${safe(copy("summary.items", { count }))}</span><strong>${safe(displayMoney(subtotal))}</strong></div>
                <div class="checkout-summary__row"><span>${safe(copy("summary.shipping"))}</span><strong>${safe(copy("summary.confirmedLater"))}</strong></div>
                <div class="checkout-summary__row"><span>${safe(copy("summary.tax"))}</span><strong>${safe(copy("summary.confirmedLater"))}</strong></div>
            </div>
            <div class="checkout-summary__total"><span>${safe(copy("summary.estimatedTotal"))}</span><strong>${safe(displayMoney(subtotal))}</strong></div>
            <p class="checkout-summary__note">${safe(copy("summary.notice"))}</p>
            <div class="checkout-trust">
                <div class="checkout-trust__item"><strong>${safe(copy("trust.shippingTitle"))}</strong><span>${safe(copy("trust.shippingText"))}</span></div>
                <div class="checkout-trust__item"><strong>${safe(copy("trust.supportTitle"))}</strong><span>${safe(copy("trust.supportText"))}</span></div>
                <div class="checkout-trust__item"><strong>${safe(copy("trust.warrantyTitle"))}</strong><span>${safe(copy("trust.warrantyText"))}</span></div>
                <div class="checkout-trust__item"><strong>${safe(copy("trust.quoteTitle"))}</strong><span>${safe(copy("trust.quoteText"))}</span></div>
            </div>`;
    }

    function emptyMarkup() {
        const base = locale === "en" ? "" : `/${locale}`;
        return `
            <section class="checkout-empty">
                <h1>${safe(copy("empty.title"))}</h1>
                <p>${safe(copy("empty.text"))}</p>
                <a class="button button-primary" href="${base}/shop/products.html">${safe(copy("empty.products"))}</a>
                <a class="button button-outline" href="${base}/shop/request-quote.html">${safe(copy("empty.quote"))}</a>
            </section>`;
    }

    function successMarkup() {
        const base = locale === "en" ? "" : `/${locale}`;
        return `
            <section class="checkout-success" tabindex="-1" data-checkout-success>
                <span class="eyebrow">${safe(copy("success.eyebrow"))}</span>
                <h1>${safe(copy("success.title"))}</h1>
                <p>${safe(copy("success.text"))}</p>
                <dl>
                    <div><dt>${safe(copy("success.reference"))}</dt><dd>${safe(state.result.id)}</dd></div>
                    <div><dt>${safe(copy("success.status"))}</dt><dd>${safe(copy("success.pending"))}</dd></div>
                </dl>
                <p class="checkout-notice">${safe(copy("success.noCharge"))}</p>
                <a class="button button-primary" href="${base}/shop/index.html">${safe(copy("success.store"))}</a>
                <a class="button button-outline" href="${base}/shop/cart.html">${safe(copy("success.cart"))}</a>
            </section>`;
    }

    function pageMarkup(items) {
        const count = cartCount(items);
        const subtotal = cartSubtotal(items);
        return `
            <header class="checkout-intro">
                <div class="checkout-intro__copy">
                    <span class="eyebrow">${safe(copy("page.eyebrow"))}</span>
                    <h1>${safe(copy("page.title"))}</h1>
                    <p>${safe(copy("page.intro"))}</p>
                </div>
                <div class="checkout-intro__secure"><span>${safe(copy("page.secure"))}</span></div>
            </header>
            <div class="checkout-grid">
                <div class="checkout-main-column">
                    <details class="checkout-summary-mobile">
                        <summary>${safe(copy("summary.mobile", { count, total: displayMoney(subtotal) }))}</summary>
                        <aside class="checkout-summary" aria-label="${safe(copy("summary.title"))}">${summaryMarkup(items)}</aside>
                    </details>
                    <ol class="checkout-steps" aria-label="${safe(copy("steps.label"))}">
                        ${steps.map((_, index) => stepHeader(index)).join("")}
                    </ol>
                </div>
                <aside class="checkout-summary checkout-summary--desktop" aria-label="${safe(copy("summary.title"))}">${summaryMarkup(items)}</aside>
            </div>`;
    }

    function saveControls(form) {
        for (const control of form.elements) {
            if (!control.name) continue;
            if (control.type === "checkbox") state.values[control.name] = control.checked;
            else if (control.type === "radio") {
                if (control.checked) state.values[control.name] = control.value;
            } else state.values[control.name] = control.value;
        }
    }

    function validate(names) {
        state.errors = {};
        for (const name of names) {
            if (!fieldValue(name).trim()) state.errors[name] = copy("error.required");
        }
        if (fieldValue("email") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldValue("email"))) {
            state.errors.email = copy("error.email");
        }
        return Object.keys(state.errors).length === 0;
    }

    function validateStep() {
        if (state.step === 1) return validate(["firstName", "lastName", "company", "email", "phone"]);
        if (state.step === 2) {
            const required = ["shippingRecipient", "shippingAddress1", "shippingCity", "shippingPostalCode", "shippingCountry", "shippingPhone"];
            if (state.values.sameBilling === false) required.push("billingAddress1", "billingCity", "billingPostalCode", "billingCountry");
            return validate(required);
        }
        state.errors = {};
        return true;
    }

    function focusCurrent() {
        requestAnimationFrame(() => {
            const target = root.querySelector(".checkout-step.is-active .checkout-step__heading strong") || root.querySelector("[data-checkout-success]");
            if (target) {
                target.setAttribute("tabindex", "-1");
                target.focus({ preventScroll: true });
                const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
            }
        });
    }

    function render({ focus = false } = {}) {
        const items = cartItems();
        if (!items.length) root.innerHTML = emptyMarkup();
        else if (state.result) root.innerHTML = successMarkup();
        else root.innerHTML = pageMarkup(items);
        bind();
        if (focus) focusCurrent();
    }

    function createIdempotencyKey() {
        if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
        return `oi-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }

    function sanitizedConfiguration(value, depth = 0) {
        if (depth > 4 || value === undefined || value === null || value === "") return null;
        if (["string", "number", "boolean"].includes(typeof value)) return value;
        if (Array.isArray(value)) {
            return value.slice(0, 25).map((entry) => sanitizedConfiguration(entry, depth + 1));
        }
        if (typeof value !== "object") return null;
        return Object.fromEntries(Object.entries(value).slice(0, 50)
            .filter(([key]) => {
                const normalized = String(key).toLowerCase().replace(/[^a-z0-9]/g, "");
                return !/(?:price|total|amount|currency|cost|cents|card|cvc|cvv|bank|iban|swift|routing|payment)/.test(normalized)
                    && !/^(?:tax|shipping|discount).*(?:rate|fee)$/.test(normalized);
            })
            .map(([key, entry]) => [key, sanitizedConfiguration(entry, depth + 1)]));
    }

    function payload(items) {
        const values = state.values;
        const sameBilling = values.sameBilling !== false;
        return {
            contact: {
                name: `${fieldValue("firstName").trim()} ${fieldValue("lastName").trim()}`.trim(),
                company: fieldValue("company").trim(),
                email: fieldValue("email").trim(),
                phone: fieldValue("phone").trim(),
                department: fieldValue("department").trim(),
            },
            shipping: {
                recipient: fieldValue("shippingRecipient").trim(),
                company: fieldValue("shippingCompany").trim(),
                phone: fieldValue("shippingPhone").trim(),
                address1: fieldValue("shippingAddress1").trim(),
                address2: fieldValue("shippingAddress2").trim(),
                city: fieldValue("shippingCity").trim(),
                region: fieldValue("shippingRegion").trim(),
                postalCode: fieldValue("shippingPostalCode").trim(),
                country: fieldValue("shippingCountry").trim(),
            },
            billing: sameBilling ? { sameAsShipping: true } : {
                sameAsShipping: false,
                recipient: fieldValue("billingRecipient").trim(),
                company: fieldValue("billingCompany").trim(),
                phone: fieldValue("billingPhone").trim(),
                address1: fieldValue("billingAddress1").trim(),
                address2: fieldValue("billingAddress2").trim(),
                city: fieldValue("billingCity").trim(),
                region: fieldValue("billingRegion").trim(),
                postalCode: fieldValue("billingPostalCode").trim(),
                country: fieldValue("billingCountry").trim(),
            },
            procurement: {
                projectName: fieldValue("projectName").trim(),
                purchaseOrder: fieldValue("purchaseOrder").trim(),
                taxId: fieldValue("taxId").trim(),
                invoiceInfo: fieldValue("invoiceInfo").trim(),
                notes: fieldValue("notes").trim(),
            },
            requestType: fieldValue("requestType") || "order_request",
            items: items.map((item) => ({
                sku: item.product.sku,
                quantity: Number(item.qty),
                configuration: sanitizedConfiguration(item.configuration),
            })),
            locale,
            sourcePage: location.pathname,
            idempotencyKey: state.idempotencyKey,
            website: fieldValue("website"),
        };
    }

    async function submitOrder(form) {
        const items = cartItems();
        if (!items.length) return render({ focus: true });
        state.submitting = true;
        state.submitError = "";
        if (!state.idempotencyKey) state.idempotencyKey = createIdempotencyKey();
        render();
        try {
            const response = await fetch("/api/order-intents", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(payload(items)),
            });
            const body = await response.json().catch(() => ({}));
            if (!response.ok || !body.ok || !body.id) {
                throw new Error(body.message || copy("error.submit"));
            }
            state.result = { id: body.id, status: body.status || "pending_review" };
            state.submitting = false;
            render({ focus: true });
        } catch (error) {
            state.submitting = false;
            state.submitError = error && error.message ? error.message : copy("error.network");
            render();
            requestAnimationFrame(() => root.querySelector("[data-submit-error]")?.focus());
        }
    }

    function bind() {
        const form = root.querySelector("[data-checkout-form]");
        if (!form) return;

        form.addEventListener("input", (event) => {
            const control = event.target;
            if (!control.name || control.type === "checkbox" || control.type === "radio") return;
            state.values[control.name] = control.value;
            delete state.errors[control.name];
            control.removeAttribute("aria-invalid");
            document.getElementById(`checkout-${control.name}-error`)?.remove();
        });

        form.addEventListener("change", (event) => {
            const control = event.target;
            if (!control.name) return;
            if (control.type === "checkbox") state.values[control.name] = control.checked;
            else if (control.type === "radio" && control.checked) state.values[control.name] = control.value;
            else state.values[control.name] = control.value;
            if (control.name === "sameBilling") render({ focus: false });
        });

        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            saveControls(form);
            if (!validateStep()) {
                render();
                requestAnimationFrame(() => root.querySelector("[aria-invalid='true']")?.focus());
                return;
            }
            if (state.step < 4) {
                if (state.step === 1) {
                    const fullName = `${fieldValue("firstName")} ${fieldValue("lastName")}`.trim();
                    if (!fieldValue("shippingRecipient")) state.values.shippingRecipient = fullName;
                    if (!fieldValue("shippingCompany")) state.values.shippingCompany = fieldValue("company");
                    if (!fieldValue("shippingPhone")) state.values.shippingPhone = fieldValue("phone");
                }
                state.step += 1;
                state.submitError = "";
                render({ focus: true });
                return;
            }
            await submitOrder(form);
        });

        root.querySelector("[data-checkout-back]")?.addEventListener("click", () => {
            saveControls(form);
            state.step = Math.max(1, state.step - 1);
            state.errors = {};
            state.submitError = "";
            render({ focus: true });
        });

        root.querySelectorAll("[data-checkout-step]").forEach((button) => {
            button.addEventListener("click", () => {
                const next = Number(button.dataset.checkoutStep);
                if (next >= state.step) return;
                saveControls(form);
                state.step = next;
                state.errors = {};
                state.submitError = "";
                render({ focus: true });
            });
        });
    }

    render();
})();
