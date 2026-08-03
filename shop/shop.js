(function initGyutronShopRuntime() {
    "use strict";

    const SHOP_DATA = window.GYUTRON_SHOP_I18N || {};
    const SUPPORTED_LOCALES = ["en", "de", "ja"];
    const requestedLocale = String(window.GYUTRON_SHOP_LOCALE || document.documentElement.lang || "en")
        .toLowerCase()
        .split("-")[0];
    const SHOP_LOCALE = SUPPORTED_LOCALES.includes(requestedLocale) ? requestedLocale : "en";
    const LOCALE_DATA = SHOP_DATA[SHOP_LOCALE] || SHOP_DATA.en || {};
    const EN_DATA = SHOP_DATA.en || LOCALE_DATA;
    const SHOP_BASES = { en: "/shop", de: "/de/shop", ja: "/ja/shop" };
    const SHOP_BASE = SHOP_BASES[SHOP_LOCALE];
    const CART_KEY = "gyutronShopCart";
    const CATEGORY_ORDER = ["vision", "lighting", "sensors", "scanners", "mobile", "optics", "quality"];
    const SHOP_PRODUCTS = Object.values(LOCALE_DATA.products || EN_DATA.products || {});
    const PRODUCT_BY_SKU = new Map(SHOP_PRODUCTS.map((product) => [product.sku, product]));
    const CATEGORY_MEDIA = SHOP_DATA.categoryMedia || {};
    const MAX_QUANTITY = 999;
    const APPLICATION_FILTER_SKUS = {
        inspection: new Set(["GY-CV220-INLINE", "GY-V240-COLOR", "GY-V3D150", "GY-OPT25", "GY-LB220", "GY-LDOME120", "GY-CAL-GRID", "GY-MG50"]),
        robotics: new Set(["GY-V3D150", "GY-PR12", "GY-FB200", "GY-PS60"]),
        traceability: new Set(["GY-CV220-INLINE", "GY-S240W", "GY-R70-LONGRANGE", "GY-S300-DPM", "GY-A80-ULTRA", "GY-A55-PRO"]),
        warehouse: new Set(["GY-S240W", "GY-R70-LONGRANGE", "GY-A80-ULTRA", "GY-A55-PRO"])
    };
    const APPLICATION_QUERY_ALIASES = {
        inspection: "inspection",
        robot: "robotics",
        robotics: "robotics",
        traceability: "traceability",
        warehouse: "warehouse"
    };

    window.GYUTRON_SHOP_BASE = SHOP_BASE;
    window.GYUTRON_SHOP_PRODUCTS = SHOP_PRODUCTS;

    function lookupCopy(key) {
        return LOCALE_DATA.ui?.[key]
            ?? LOCALE_DATA.static?.[key]
            ?? EN_DATA.ui?.[key]
            ?? EN_DATA.static?.[key];
    }

    function t(key, values = {}) {
        const source = lookupCopy(key);
        if (source == null) return "";
        return String(source).replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (match, token) => (
            Object.prototype.hasOwnProperty.call(values, token) ? String(values[token]) : match
        ));
    }

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, (character) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&#039;"
        })[character]);
    }

    function text(key, values) {
        return escapeHtml(t(key, values));
    }

    function clampQuantity(value) {
        const parsed = Number.parseInt(String(value), 10);
        if (!Number.isFinite(parsed)) return 1;
        return Math.min(MAX_QUANTITY, Math.max(1, parsed));
    }

    function cleanConfiguration(value) {
        return String(value || "").trim().slice(0, 600);
    }

    function shopUrl(page = "index.html", params, hash = "") {
        const safePage = String(page || "index.html").replace(/^\/+/, "");
        let url = `${SHOP_BASE}/${safePage}`;
        if (params instanceof URLSearchParams) {
            const query = params.toString();
            if (query) url += `?${query}`;
        } else if (params && typeof params === "object") {
            const query = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && String(value) !== "") query.set(key, String(value));
            });
            if (query.toString()) url += `?${query.toString()}`;
        }
        if (hash) url += String(hash).startsWith("#") ? String(hash) : `#${hash}`;
        return url;
    }

    function currentShopPage() {
        const match = location.pathname.match(/\/(?:de\/|ja\/)?shop\/([^/?#]*)/i);
        return match?.[1] || "index.html";
    }

    function languageUrl(locale) {
        const base = SHOP_BASES[locale] || SHOP_BASES.en;
        return `${base}/${currentShopPage()}${location.search}${location.hash}`;
    }

    function categoryCopy(category) {
        return LOCALE_DATA.categories?.[category] || EN_DATA.categories?.[category] || { name: "", text: "" };
    }

    function money(value) {
        const currency = LOCALE_DATA.currency || EN_DATA.currency || {
            code: "USD", rate: 1, symbol: "$", locale: "en-US", decimals: 2, symbolAfter: false
        };
        const converted = Number(value || 0) * Number(currency.rate || 1);
        const decimals = Number.isInteger(currency.decimals) ? currency.decimals : 2;
        const amount = converted.toLocaleString(currency.locale || "en-US", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
        return currency.symbolAfter ? `${amount}\u00a0${currency.symbol}` : `${currency.symbol}${amount}`;
    }

    function currencyEstimateNote() {
        const currency = LOCALE_DATA.currency || EN_DATA.currency;
        if (!currency || currency.code === "USD") return t("product.currencyBase");
        return t("product.currencyRate", { rate: currency.rate, code: currency.code });
    }

    function applyStaticI18n(root = document) {
        root.querySelectorAll("[data-i18n]").forEach((node) => {
            const value = lookupCopy(node.dataset.i18n);
            if (value != null) node.textContent = String(value);
        });
        root.querySelectorAll("[data-i18n-attr]").forEach((node) => {
            String(node.dataset.i18nAttr || "").split(";").forEach((rule) => {
                const separator = rule.indexOf("=");
                if (separator < 1) return;
                const attribute = rule.slice(0, separator).trim();
                const key = rule.slice(separator + 1).trim();
                const value = lookupCopy(key);
                if (attribute && value != null) node.setAttribute(attribute, String(value));
            });
        });
    }

    function readCart() {
        try {
            const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
            if (!Array.isArray(parsed)) return [];
            return parsed
                .filter((item) => item && PRODUCT_BY_SKU.has(String(item.sku || "")))
                .map((item) => ({
                    sku: String(item.sku),
                    qty: clampQuantity(item.qty ?? item.quantity),
                    configuration: cleanConfiguration(item.configuration)
                }));
        } catch {
            return [];
        }
    }

    function saveCart(cart) {
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(cart.map((item) => ({
                sku: item.sku,
                qty: clampQuantity(item.qty),
                ...(cleanConfiguration(item.configuration) ? { configuration: cleanConfiguration(item.configuration) } : {})
            }))));
        } catch {
            // Storage can be unavailable in restricted browsing modes; the UI remains usable.
        }
        updateCartCount();
    }

    function cartItems() {
        return readCart().map((item, index) => ({
            ...item,
            index,
            product: PRODUCT_BY_SKU.get(item.sku)
        }));
    }

    function addToCart(sku, quantity = 1, configuration = "", goToCheckout = false) {
        const product = PRODUCT_BY_SKU.get(sku);
        if (!product) return;
        const cart = readCart();
        const cleanConfig = cleanConfiguration(configuration);
        const existing = cart.find((item) => item.sku === sku && cleanConfiguration(item.configuration) === cleanConfig);
        if (existing) {
            existing.qty = clampQuantity(existing.qty + clampQuantity(quantity));
        } else {
            cart.push({ sku, qty: clampQuantity(quantity), configuration: cleanConfig });
        }
        saveCart(cart);
        if (goToCheckout) {
            location.assign(shopUrl("checkout.html"));
            return;
        }
        showToast(t("product.added", { name: product.name }));
    }

    function updateCartCount() {
        const count = readCart().reduce((sum, item) => sum + clampQuantity(item.qty), 0);
        document.querySelectorAll("[data-cart-count]").forEach((node) => {
            node.textContent = String(count);
        });
    }

    function showToast(message) {
        let toast = document.querySelector(".toast[data-shop-toast]");
        if (!toast) {
            toast = document.createElement("div");
            toast.className = "toast";
            toast.dataset.shopToast = "";
            toast.setAttribute("role", "status");
            toast.setAttribute("aria-live", "polite");
            toast.setAttribute("aria-atomic", "true");
            document.body.appendChild(toast);
        }
        toast.textContent = String(message);
        toast.classList.add("is-visible");
        window.clearTimeout(showToast.timer);
        showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
    }

    function productCard(product, modifier = "") {
        const category = categoryCopy(product.category);
        const detailHref = shopUrl("product.html", { sku: product.sku });
        const quoteHref = shopUrl("request-quote.html", { sku: product.sku });
        const engineerHref = shopUrl("contact-engineer.html", { sku: product.sku });
        return `
            <article class="product-card ${escapeHtml(modifier)}" data-product-sku="${escapeHtml(product.sku)}">
                <a class="product-media" href="${detailHref}" aria-label="${text("product.viewAria", { name: product.name })}">
                    <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy">
                </a>
                <div class="product-body">
                    <div class="product-meta">
                        <span class="product-sku"><span>${text("product.sku")}</span> ${escapeHtml(product.sku)}</span>
                        <span class="product-category">${escapeHtml(category.name)}</span>
                    </div>
                    <div>
                        <h3><a href="${detailHref}">${escapeHtml(product.name)}</a></h3>
                        <p>${escapeHtml(product.summary)}</p>
                    </div>
                    <div class="product-application">
                        <span class="product-application__label">${text("product.applications")}</span>
                        <div class="tag-row">${product.applications.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>
                    </div>
                    <div class="availability-status" role="status">
                        <strong>${text("product.availability")}</strong>
                        <span>${text("product.availabilityRequired")}</span>
                    </div>
                    <div class="price-row">
                        <span><small>${text("product.estimatedUnitPrice")}</small><strong class="price">${money(product.price)}</strong></span>
                        <span class="estimate-note">${text("product.nonBinding")}</span>
                    </div>
                    <div class="card-actions">
                        <button class="button button-primary" type="button" data-add-cart="${escapeHtml(product.sku)}" aria-label="${text("product.addAria", { name: product.name })}">${text("common.addCart")}</button>
                        <button class="button button-dark" type="button" data-buy-now="${escapeHtml(product.sku)}" aria-label="${text("product.buyAria", { name: product.name })}">${text("common.buyNow")}</button>
                        <a class="button button-outline" href="${quoteHref}">${text("common.requestQuote")}</a>
                        <a class="button button-soft" href="${engineerHref}">${text("common.contactEngineer")}</a>
                    </div>
                </div>
            </article>
        `;
    }

    function renderSpotlight() {
        const target = document.querySelector("[data-spotlight]");
        if (!target) return;
        target.innerHTML = SHOP_PRODUCTS.slice(0, 4).map((product) => productCard(product, "product-card--spotlight")).join("");
    }

    function renderCategories() {
        const target = document.querySelector("[data-categories]");
        if (!target) return;
        target.innerHTML = CATEGORY_ORDER.map((categoryId) => {
            const category = categoryCopy(categoryId);
            return `
                <a class="category-card" href="${shopUrl("products.html", { category: categoryId })}">
                    <img src="${escapeHtml(CATEGORY_MEDIA[categoryId] || "")}" alt="${escapeHtml(category.name)}" loading="lazy">
                    <div><h3>${escapeHtml(category.name)}</h3><p>${escapeHtml(category.text)}</p></div>
                </a>
            `;
        }).join("");
    }

    function normalizeCategory(value) {
        const normalized = String(value || "").trim().toLowerCase();
        if (!normalized || normalized === "all products" || normalized === "all") return "all";
        const direct = CATEGORY_ORDER.find((id) => id.toLowerCase() === normalized);
        if (direct) return direct;
        const localized = CATEGORY_ORDER.find((id) => categoryCopy(id).name.toLowerCase() === normalized);
        if (localized) return localized;
        const legacyProduct = SHOP_PRODUCTS.find((product) => product.legacyCategories.some((name) => name.toLowerCase() === normalized));
        return legacyProduct?.category || "all";
    }

    function productSearchText(product) {
        return [
            product.sku,
            product.name,
            product.type,
            product.summary,
            categoryCopy(product.category).name,
            ...product.applications,
            ...Object.values(product.specLabels || {}),
            ...Object.keys(product.specs),
            ...Object.values(product.specs)
        ].join(" ").toLowerCase();
    }

    function renderProducts() {
        const grid = document.querySelector("[data-shop-grid], [data-products]");
        if (!grid) return;
        const filters = document.querySelector("[data-filters]");
        const params = new URLSearchParams(location.search);
        let active = normalizeCategory(params.get("category"));
        const rawQuery = String(params.get("q") || "").trim().toLowerCase();
        const explicitApplication = APPLICATION_QUERY_ALIASES[String(params.get("application") || "").trim().toLowerCase()] || "";
        const legacyApplication = explicitApplication ? "" : (APPLICATION_QUERY_ALIASES[rawQuery] || "");
        const application = explicitApplication || legacyApplication;
        const query = legacyApplication ? "" : rawQuery;

        const draw = () => {
            if (filters) {
                filters.setAttribute("aria-label", t("catalog.filters"));
                filters.innerHTML = ["all", ...CATEGORY_ORDER].map((categoryId) => {
                    const label = categoryId === "all" ? t("catalog.all") : categoryCopy(categoryId).name;
                    return `<button class="filter-button ${categoryId === active ? "is-active" : ""}" type="button" data-category="${categoryId}" aria-pressed="${categoryId === active}">${escapeHtml(label)}</button>`;
                }).join("");
            }
            const visible = SHOP_PRODUCTS.filter((product) => (
                (active === "all" || product.category === active)
                && (!application || APPLICATION_FILTER_SKUS[application]?.has(product.sku))
                && (!query || productSearchText(product).includes(query))
            ));
            grid.innerHTML = visible.length
                ? visible.map((product) => productCard(product)).join("")
                : `<div class="empty-state" role="status">${text("catalog.empty")}</div>`;
        };

        filters?.addEventListener("click", (event) => {
            const button = event.target.closest("[data-category]");
            if (!button) return;
            active = normalizeCategory(button.dataset.category);
            const nextParams = new URLSearchParams(location.search);
            if (active === "all") nextParams.delete("category");
            else nextParams.set("category", active);
            history.replaceState(null, "", `${shopUrl("products.html", nextParams)}${location.hash}`);
            draw();
        });

        draw();
    }

    function hydrateSearch() {
        const query = new URLSearchParams(location.search).get("q") || "";
        document.querySelectorAll(".store-search").forEach((form) => {
            form.action = shopUrl("products.html");
            const input = form.querySelector("input[name='q']");
            if (input) input.value = query;
        });
    }

    function searchMatches(query) {
        const normalized = String(query || "").trim().toLowerCase();
        if (!normalized) return [];
        return SHOP_PRODUCTS
            .map((product) => {
                const haystack = productSearchText(product);
                const score = product.sku.toLowerCase().includes(normalized) ? 4
                    : product.name.toLowerCase().includes(normalized) ? 3
                        : product.type.toLowerCase().includes(normalized) ? 2
                            : haystack.includes(normalized) ? 1 : 0;
                return { product, score };
            })
            .filter((item) => item.score > 0)
            .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name, SHOP_LOCALE))
            .slice(0, 6)
            .map((item) => item.product);
    }

    function initSearchSuggestions() {
        document.querySelectorAll(".store-search").forEach((form, formIndex) => {
            const input = form.querySelector("input[name='q']");
            if (!input || form.querySelector(".search-suggestions")) return;

            const panel = document.createElement("div");
            const panelId = `shop-search-results-${formIndex + 1}`;
            panel.className = "search-suggestions";
            panel.id = panelId;
            panel.setAttribute("role", "listbox");
            panel.setAttribute("aria-label", t("search.results"));
            panel.hidden = true;
            form.appendChild(panel);

            input.setAttribute("role", "combobox");
            input.setAttribute("aria-autocomplete", "list");
            input.setAttribute("aria-controls", panelId);
            input.setAttribute("aria-expanded", "false");

            let activeIndex = -1;

            const options = () => Array.from(panel.querySelectorAll("[role='option']"));

            const setActive = (index) => {
                const nodes = options();
                if (!nodes.length) {
                    activeIndex = -1;
                    input.removeAttribute("aria-activedescendant");
                    return;
                }
                activeIndex = ((index % nodes.length) + nodes.length) % nodes.length;
                nodes.forEach((node, nodeIndex) => {
                    const active = nodeIndex === activeIndex;
                    node.classList.toggle("is-active", active);
                    node.setAttribute("aria-selected", String(active));
                });
                input.setAttribute("aria-activedescendant", nodes[activeIndex].id);
                nodes[activeIndex].scrollIntoView({ block: "nearest" });
            };

            const close = () => {
                panel.hidden = true;
                panel.innerHTML = "";
                form.classList.remove("has-suggestions");
                input.setAttribute("aria-expanded", "false");
                input.removeAttribute("aria-activedescendant");
                activeIndex = -1;
            };

            const render = () => {
                const query = input.value.trim();
                const matches = searchMatches(query);
                if (!query || !matches.length) {
                    close();
                    return;
                }
                panel.innerHTML = `
                    <div class="search-suggestion-title" aria-hidden="true">${text("search.suggested")}</div>
                    ${matches.map((product, index) => `
                        <a class="search-suggestion" role="option" aria-selected="false" id="${panelId}-option-${index}"
                            href="${shopUrl("product.html", { sku: product.sku })}">
                            <img src="${escapeHtml(product.image)}" alt="" loading="lazy">
                            <span>
                                <strong>${escapeHtml(product.name)}</strong>
                                <em>${escapeHtml(categoryCopy(product.category).name)}</em>
                                <small>${escapeHtml(product.sku)}</small>
                            </span>
                        </a>
                    `).join("")}
                    <a class="search-suggestion-all" role="option" aria-selected="false" id="${panelId}-option-all"
                        href="${shopUrl("products.html", { q: query })}">${text("search.all", { query })}</a>
                `;
                panel.hidden = false;
                form.classList.add("has-suggestions");
                input.setAttribute("aria-expanded", "true");
                activeIndex = -1;
            };

            input.addEventListener("input", render);
            input.addEventListener("focus", render);
            input.addEventListener("keydown", (event) => {
                if (event.key === "ArrowDown") {
                    if (panel.hidden) render();
                    if (!panel.hidden) {
                        event.preventDefault();
                        setActive(activeIndex + 1);
                    }
                } else if (event.key === "ArrowUp") {
                    if (panel.hidden) render();
                    if (!panel.hidden) {
                        event.preventDefault();
                        setActive(activeIndex < 0 ? options().length - 1 : activeIndex - 1);
                    }
                } else if (event.key === "Enter" && activeIndex >= 0) {
                    const target = options()[activeIndex];
                    if (target) {
                        event.preventDefault();
                        location.assign(target.href);
                    }
                } else if (event.key === "Escape") {
                    event.preventDefault();
                    close();
                    input.focus();
                }
            });
            form.addEventListener("submit", () => close());
            form.addEventListener("focusout", () => {
                window.setTimeout(() => {
                    if (!form.contains(document.activeElement)) close();
                }, 0);
            });
            document.addEventListener("pointerdown", (event) => {
                if (!form.contains(event.target)) close();
            });
        });
    }

    function initLanguageMenu() {
        document.querySelectorAll(".store-language-switch").forEach((switcher, switchIndex) => {
            const button = switcher.querySelector(".store-language");
            const menu = switcher.querySelector(".store-language-menu");
            if (!button || !menu) return;
            const menuId = `shop-language-menu-${switchIndex + 1}`;
            const links = Array.from(menu.querySelectorAll("a"));
            menu.id = menuId;
            menu.setAttribute("role", "menu");
            menu.hidden = true;
            button.setAttribute("aria-controls", menuId);
            button.setAttribute("aria-haspopup", "menu");
            button.setAttribute("aria-expanded", "false");
            button.setAttribute("aria-label", t("language.label"));
            menu.setAttribute("aria-label", t("language.options"));

            links.forEach((link, index) => {
                const locale = SUPPORTED_LOCALES[index] || "en";
                link.href = languageUrl(locale);
                link.setAttribute("role", "menuitem");
                if (locale === SHOP_LOCALE) link.setAttribute("aria-current", "page");
                else link.removeAttribute("aria-current");
            });

            const close = (restoreFocus = false) => {
                menu.hidden = true;
                switcher.classList.remove("is-open");
                button.setAttribute("aria-expanded", "false");
                if (restoreFocus) button.focus();
            };
            const open = (focusItem = false) => {
                menu.hidden = false;
                switcher.classList.add("is-open");
                button.setAttribute("aria-expanded", "true");
                if (focusItem) (links.find((link) => link.getAttribute("aria-current") === "page") || links[0])?.focus();
            };

            button.addEventListener("click", () => {
                if (menu.hidden) open(true);
                else close(true);
            });
            button.addEventListener("keydown", (event) => {
                if (event.key === "ArrowDown") {
                    event.preventDefault();
                    open(true);
                } else if (event.key === "Escape") {
                    close(true);
                }
            });
            menu.addEventListener("keydown", (event) => {
                const current = links.indexOf(document.activeElement);
                if (event.key === "Escape") {
                    event.preventDefault();
                    close(true);
                } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                    event.preventDefault();
                    const direction = event.key === "ArrowDown" ? 1 : -1;
                    links[((current + direction) % links.length + links.length) % links.length]?.focus();
                } else if (event.key === "Home" || event.key === "End") {
                    event.preventDefault();
                    links[event.key === "Home" ? 0 : links.length - 1]?.focus();
                }
            });
            switcher.addEventListener("focusout", () => {
                window.setTimeout(() => {
                    if (!switcher.contains(document.activeElement)) close(false);
                }, 0);
            });
            document.addEventListener("pointerdown", (event) => {
                if (!switcher.contains(event.target)) close(false);
            });
        });
    }

    function initStoreMobileMenu() {
        const toggle = document.querySelector(".store-menu-toggle");
        if (!toggle) return;
        let panel = document.querySelector(".store-mobile-panel");
        if (!panel) {
            panel = document.createElement("aside");
            panel.className = "store-mobile-panel";
            document.body.appendChild(panel);
        }
        const panelId = "store-mobile-panel";
        panel.id = panelId;
        panel.hidden = true;
        panel.setAttribute("role", "dialog");
        panel.setAttribute("aria-modal", "true");
        panel.setAttribute("aria-label", t("menu.label"));
        toggle.setAttribute("aria-controls", panelId);
        toggle.setAttribute("aria-expanded", "false");

        const chevron = '<i class="fa-solid fa-chevron-right" aria-hidden="true"></i>';
        panel.innerHTML = `
            <button class="icon-button store-mobile-close" type="button" data-mobile-menu-close aria-label="${text("menu.close")}">
                <i class="fa-solid fa-xmark" aria-hidden="true"></i>
            </button>
            <div class="store-mobile-section">${text("menu.store")}</div>
            <a href="${shopUrl("products.html")}">${text("menu.products")} ${chevron}</a>
            <a href="${shopUrl("request-quote.html")}">${text("menu.quote")} ${chevron}</a>
            <a href="${shopUrl("contact-engineer.html")}">${text("common.contactEngineer")} ${chevron}</a>
            <a href="${shopUrl("account.html")}">${text("menu.account")} ${chevron}</a>
            <a href="${shopUrl("cart.html")}">${text("menu.cart")} ${chevron}</a>
            <div class="store-mobile-section">${text("menu.categories")}</div>
            ${CATEGORY_ORDER.map((categoryId) => `<a href="${shopUrl("products.html", { category: categoryId })}">${escapeHtml(categoryCopy(categoryId).name)} ${chevron}</a>`).join("")}
            <div class="store-mobile-section">${text("menu.company")}</div>
            <a href="https://www.gyutron.com/">${text("menu.brand")} ${chevron}</a>
            <a href="${shopUrl("about-us.html")}">${text("menu.about")} ${chevron}</a>
            <a href="${shopUrl("contact-us.html")}">${text("menu.contact")} ${chevron}</a>
            <a href="${shopUrl("shipping-policy.html")}">${text("menu.shipping")} ${chevron}</a>
            <a href="${shopUrl("warranty-policy.html")}">${text("menu.warranty")} ${chevron}</a>
        `;

        const focusable = () => Array.from(panel.querySelectorAll("button:not([disabled]), a[href]"));
        const close = (restoreFocus = true) => {
            panel.hidden = true;
            document.body.classList.remove("store-mobile-menu-open");
            toggle.setAttribute("aria-expanded", "false");
            if (restoreFocus) toggle.focus();
        };
        const open = () => {
            panel.hidden = false;
            document.body.classList.add("store-mobile-menu-open");
            toggle.setAttribute("aria-expanded", "true");
            focusable()[0]?.focus();
        };

        toggle.addEventListener("click", () => (panel.hidden ? open() : close(true)));
        panel.addEventListener("click", (event) => {
            if (event.target.closest("[data-mobile-menu-close]")) close(true);
            else if (event.target.closest("a")) close(false);
        });
        panel.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                event.preventDefault();
                close(true);
                return;
            }
            if (event.key !== "Tab") return;
            const nodes = focusable();
            if (!nodes.length) return;
            if (event.shiftKey && document.activeElement === nodes[0]) {
                event.preventDefault();
                nodes[nodes.length - 1].focus();
            } else if (!event.shiftKey && document.activeElement === nodes[nodes.length - 1]) {
                event.preventDefault();
                nodes[0].focus();
            }
        });
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && !panel.hidden) close(true);
        });
    }

    function renderProductDetail() {
        const target = document.querySelector("[data-shop-product], [data-product-detail]");
        if (!target) return;
        const sku = new URLSearchParams(location.search).get("sku");
        const product = sku ? PRODUCT_BY_SKU.get(sku) : null;
        if (!product) {
            target.innerHTML = `
                <div class="empty-state" role="status">
                    <p>${text("product.notFound")}</p>
                    <a class="button button-primary" href="${shopUrl("products.html")}">${text("common.browseProducts")}</a>
                </div>
            `;
            return;
        }

        document.title = `${product.name} | ${t("store.name")}`;
        const category = categoryCopy(product.category);
        const quoteParams = { sku: product.sku };
        const images = Array.isArray(product.images) && product.images.length ? product.images : [product.image];
        const specs = Object.entries(product.specs).map(([key, value]) => [product.specLabels?.[key] || key, value]);
        const related = SHOP_PRODUCTS
            .filter((candidate) => candidate.sku !== product.sku && candidate.category === product.category)
            .slice(0, 3);

        target.innerHTML = `
            <nav class="breadcrumb" aria-label="${text("store.home")}">
                <a href="${shopUrl("index.html")}">${text("store.home")}</a><span aria-hidden="true">/</span>
                <a href="${shopUrl("products.html", { category: product.category })}">${escapeHtml(category.name)}</a><span aria-hidden="true">/</span>
                <span aria-current="page">${escapeHtml(product.name)}</span>
            </nav>
            <article class="product-detail product-detail--commerce">
                <section class="detail-info" aria-labelledby="product-detail-title">
                    <div class="product-meta">
                        <span class="product-sku"><span>${text("product.sku")}</span> ${escapeHtml(product.sku)}</span>
                        <span class="product-category">${escapeHtml(category.name)}</span>
                    </div>
                    <h1 id="product-detail-title">${escapeHtml(product.name)}</h1>
                    <p class="detail-series"><strong>${text("product.series")}:</strong> ${escapeHtml(product.series)}</p>
                    <p>${escapeHtml(product.summary)}</p>
                    <div class="product-application">
                        <strong>${text("product.applications")}</strong>
                        <div class="tag-row">${product.applications.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>
                    </div>
                    <div class="availability-status" role="status">
                        <strong>${text("product.availability")}</strong>
                        <span>${text("product.availabilityRequired")}</span>
                    </div>
                    <div class="detail-price">
                        <span>${text("product.estimatedPrice")}</span>
                        <strong class="price">${money(product.price)}</strong>
                        <p class="estimate-note">${text("product.nonBinding")} ${escapeHtml(currencyEstimateNote())}</p>
                    </div>
                    <div class="configuration-confirmation">
                        <strong>${text("product.configuration")}</strong>
                        <p>${text("product.configurationRequired")}</p>
                        <label for="product-configuration" class="sr-only">${text("product.configuration")}</label>
                        <textarea id="product-configuration" rows="3" maxlength="600" placeholder="${text("product.configurationPlaceholder")}"></textarea>
                    </div>
                    <div class="qty-row">
                        <label for="product-quantity">${text("product.quantity")}</label>
                        <input id="product-quantity" type="number" inputmode="numeric" min="1" max="${MAX_QUANTITY}" value="1">
                    </div>
                    <div class="detail-actions">
                        <button class="button button-primary" type="button" data-detail-add="${escapeHtml(product.sku)}">${text("common.addCart")}</button>
                        <button class="button button-dark" type="button" data-detail-buy="${escapeHtml(product.sku)}">${text("common.buyNow")}</button>
                        <a class="button button-outline" href="${shopUrl("request-quote.html", quoteParams)}">${text("common.requestQuote")}</a>
                        <a class="button button-soft" href="${shopUrl("contact-engineer.html", quoteParams)}">${text("common.contactEngineer")}</a>
                    </div>
                </section>
                <section class="detail-media" aria-label="${text("product.viewAria", { name: product.name })}">
                    <div class="product-gallery">
                        <div class="product-gallery-main">
                            <img src="${escapeHtml(images[0])}" alt="${escapeHtml(product.name)}" data-gallery-main>
                        </div>
                        <div class="product-gallery-thumbs">
                            ${images.map((image, index) => `
                                <button class="product-thumb ${index === 0 ? "is-active" : ""}" type="button"
                                    data-gallery-image="${escapeHtml(image)}" aria-pressed="${index === 0}"
                                    aria-label="${text("product.thumbnailAria", { name: product.name })}">
                                    <img src="${escapeHtml(image)}" alt="" loading="lazy">
                                </button>
                            `).join("")}
                        </div>
                    </div>
                </section>
            </article>
            <section class="detail-section detail-specs" aria-labelledby="key-parameters-title">
                <h2 id="key-parameters-title">${text("product.keyParameters")}</h2>
                <dl class="key-parameters">
                    ${specs.slice(0, 4).map(([key, value]) => `<div><dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}
                </dl>
            </section>
            <section class="detail-section detail-specs" aria-labelledby="full-specifications-title">
                <h2 id="full-specifications-title">${text("product.fullSpecifications")}</h2>
                <div class="spec-table">
                    ${specs.map(([key, value]) => `<div class="spec-row"><span>${escapeHtml(key)}</span><strong>${escapeHtml(value)}</strong></div>`).join("")}
                </div>
            </section>
            <section class="detail-section" aria-labelledby="procurement-support-title">
                <h2 id="procurement-support-title">${text("product.procurementSupport")}</h2>
                <div class="support-grid">
                    <a class="support-link" href="${shopUrl("request-quote.html", { sku: product.sku, topic: "documentation" })}">
                        <strong>${text("product.requestDatasheet")}</strong><span>${text("product.requestDatasheetText")}</span>
                    </a>
                    <a class="support-link" href="${shopUrl("warranty-policy.html")}">
                        <strong>${text("product.warranty")}</strong><span>${text("product.warrantyText")}</span>
                    </a>
                    <a class="support-link" href="${shopUrl("shipping-policy.html")}">
                        <strong>${text("product.shipping")}</strong><span>${text("product.shippingText")}</span>
                    </a>
                    <a class="support-link" href="${shopUrl("return-refund-policy.html")}">
                        <strong>${text("product.returns")}</strong><span>${text("product.returnsText")}</span>
                    </a>
                    <a class="support-link" href="${shopUrl("contact-engineer.html", { sku: product.sku })}">
                        <strong>${text("product.technicalSupport")}</strong><span>${text("product.technicalSupportText")}</span>
                    </a>
                </div>
            </section>
            ${related.length ? `
                <section class="detail-section related-products" aria-labelledby="related-products-title">
                    <h2 id="related-products-title">${text("product.related")}</h2>
                    <div class="related-grid">${related.map((item) => productCard(item, "product-card--related")).join("")}</div>
                </section>
            ` : ""}
        `;

        target.querySelectorAll("[data-gallery-image]").forEach((button) => {
            button.addEventListener("click", () => {
                const main = target.querySelector("[data-gallery-main]");
                if (main) main.src = button.dataset.galleryImage;
                target.querySelectorAll("[data-gallery-image]").forEach((candidate) => {
                    const active = candidate === button;
                    candidate.classList.toggle("is-active", active);
                    candidate.setAttribute("aria-pressed", String(active));
                });
            });
        });
    }

    function cartEstimate(items = cartItems()) {
        return items.reduce((sum, item) => sum + (item.product.price * item.qty), 0);
    }

    function orderSummaryMarkup(items = cartItems(), includeActions = false) {
        const count = items.reduce((sum, item) => sum + item.qty, 0);
        const estimate = cartEstimate(items);
        return `
            <div class="checkout-summary__header">
                <h2>${text("cart.summary")}</h2>
                <a href="${shopUrl("cart.html")}">${text("checkout.editCart")}</a>
            </div>
            <div class="checkout-summary__items">
                ${items.map(({ product, qty, configuration }) => `
                    <article class="checkout-summary-item">
                        <img src="${escapeHtml(product.image)}" alt="" loading="lazy">
                        <div>
                            <strong>${escapeHtml(product.name)}</strong>
                            <span>${text("product.sku")}: ${escapeHtml(product.sku)}</span>
                            <span>${text("product.configuration")}: ${escapeHtml(configuration || t("cart.configurationPending"))}</span>
                            <span>${text("product.quantity")}: ${qty}</span>
                            <span>${text("cart.unitEstimate")}: ${money(product.price)}</span>
                            <span>${text("cart.lineEstimate")}: ${money(product.price * qty)}</span>
                        </div>
                    </article>
                `).join("")}
            </div>
            <div class="checkout-summary__rows">
                <div class="summary-line"><span>${text("cart.items")}</span><strong>${count}</strong></div>
                <div class="summary-line"><span>${text("cart.estimatedSubtotal")}</span><strong>${money(estimate)}</strong></div>
                <div class="summary-line"><span>${text("cart.shipping")}</span><strong>${text("common.toConfirm")}</strong></div>
                <div class="summary-line"><span>${text("cart.taxes")}</span><strong>${text("common.toConfirm")}</strong></div>
                <div class="summary-total"><span>${text("cart.estimatedTotal")}</span><strong>${money(estimate)}</strong></div>
            </div>
            <p class="estimate-note">${text("product.nonBinding")} ${escapeHtml(currencyEstimateNote())}</p>
            <p class="notice">${text("cart.summaryNotice")}</p>
            <div class="checkout-trust">
                <a href="${shopUrl("shipping-policy.html")}"><strong>${text("trust.shipping")}</strong><span>${text("trust.shippingBody")}</span></a>
                <a href="${shopUrl("contact-engineer.html")}"><strong>${text("trust.configuration")}</strong><span>${text("trust.configurationBody")}</span></a>
                <a href="${shopUrl("warranty-policy.html")}"><strong>${text("trust.warranty")}</strong><span>${text("trust.warrantyBody")}</span></a>
                <a href="${shopUrl("return-refund-policy.html")}"><strong>${text("trust.returns")}</strong><span>${text("trust.returnsBody")}</span></a>
                <a href="${shopUrl("payment-methods.html")}"><strong>${text("trust.payment")}</strong><span>${text("trust.paymentBody")}</span></a>
                <a href="${shopUrl("request-quote.html")}"><strong>${text("trust.quotation")}</strong><span>${text("trust.quotationBody")}</span></a>
            </div>
            ${includeActions ? `
                <div class="summary-actions">
                    <a class="button button-primary" href="${shopUrl("checkout.html")}">${text("cart.checkout")}</a>
                    <a class="button button-outline" href="${shopUrl("request-quote.html")}">${text("common.requestQuote")}</a>
                </div>
            ` : ""}
        `;
    }

    function renderCart() {
        const list = document.querySelector("[data-cart-list]");
        const summary = document.querySelector("[data-cart-summary]");
        if (!list || !summary) return;
        const items = cartItems();
        if (!items.length) {
            list.innerHTML = `
                <div class="empty-state" role="status">
                    <p>${text("cart.empty")}</p>
                    <a class="button button-primary" href="${shopUrl("products.html")}">${text("common.browseProducts")}</a>
                </div>
            `;
        } else {
            list.innerHTML = items.map(({ product, qty, configuration, index }) => `
                <article class="cart-item" data-cart-row="${index}">
                    <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}">
                    <div class="cart-item__info">
                        <h2>${escapeHtml(product.name)}</h2>
                        <p>${text("product.sku")}: ${escapeHtml(product.sku)}</p>
                        <p>${text("product.configuration")}: ${escapeHtml(configuration || t("cart.configurationPending"))}</p>
                        <p class="availability-status">${text("product.availabilityRequired")}</p>
                    </div>
                    <label class="cart-item__quantity">
                        <span>${text("product.quantity")}</span>
                        <input type="number" inputmode="numeric" min="1" max="${MAX_QUANTITY}" value="${qty}"
                            data-cart-qty="${index}" aria-label="${text("cart.quantity", { name: product.name })}">
                    </label>
                    <div class="cart-item__estimate">
                        <span>${text("cart.unitEstimate")}: ${money(product.price)}</span>
                        <strong>${text("cart.lineEstimate")}: ${money(product.price * qty)}</strong>
                    </div>
                    <button class="icon-button" type="button" data-remove-cart="${index}" aria-label="${text("cart.remove", { name: product.name })}">
                        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                    </button>
                </article>
            `).join("");
        }
        summary.innerHTML = orderSummaryMarkup(items, Boolean(items.length));
    }

    function renderAccount() {
        const target = document.querySelector("[data-account-root]") || document.querySelector(".account-layout");
        if (!target) return;
        target.innerHTML = `
            <section class="account-unavailable" aria-labelledby="account-unavailable-title">
                <div class="account-copy">
                    <span class="eyebrow">${text("account.eyebrow")}</span>
                    <h1 id="account-unavailable-title">${text("account.title")}</h1>
                    <p>${text("account.body")}</p>
                    <p class="account-status" role="status"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> ${text("account.status")}</p>
                </div>
                <div class="account-paths">
                    <a class="account-path" href="${shopUrl("checkout.html")}">
                        <strong>${text("account.guestTitle")}</strong><span>${text("account.guestBody")}</span>
                    </a>
                    <a class="account-path" href="${shopUrl("request-quote.html")}">
                        <strong>${text("account.quoteTitle")}</strong><span>${text("account.quoteBody")}</span>
                    </a>
                    <a class="account-path" href="${shopUrl("contact-engineer.html")}">
                        <strong>${text("account.engineerTitle")}</strong><span>${text("account.engineerBody")}</span>
                    </a>
                </div>
            </section>
        `;
    }

    function handleCommerceActions() {
        document.addEventListener("click", (event) => {
            const add = event.target.closest("[data-add-cart]");
            if (add) addToCart(add.dataset.addCart, 1);

            const buy = event.target.closest("[data-buy-now]");
            if (buy) addToCart(buy.dataset.buyNow, 1, "", true);

            const detailAdd = event.target.closest("[data-detail-add]");
            if (detailAdd) {
                addToCart(
                    detailAdd.dataset.detailAdd,
                    clampQuantity(document.querySelector("#product-quantity")?.value),
                    document.querySelector("#product-configuration")?.value || ""
                );
            }

            const detailBuy = event.target.closest("[data-detail-buy]");
            if (detailBuy) {
                addToCart(
                    detailBuy.dataset.detailBuy,
                    clampQuantity(document.querySelector("#product-quantity")?.value),
                    document.querySelector("#product-configuration")?.value || "",
                    true
                );
            }

            const remove = event.target.closest("[data-remove-cart]");
            if (remove) {
                const cart = readCart();
                cart.splice(Number(remove.dataset.removeCart), 1);
                saveCart(cart);
                renderCart();
            }
        });

        document.addEventListener("change", (event) => {
            const quantity = event.target.closest("[data-cart-qty]");
            if (!quantity) return;
            const cart = readCart();
            const index = Number(quantity.dataset.cartQty);
            if (cart[index]) cart[index].qty = clampQuantity(quantity.value);
            saveCart(cart);
            renderCart();
        });
    }

    const checkoutState = {
        step: 1,
        values: { sameBilling: true },
        submitting: false,
        error: "",
        result: null,
        idempotencyKey: "",
        requestType: ""
    };

    function fieldValue(name) {
        return checkoutState.values[name] == null ? "" : String(checkoutState.values[name]);
    }

    function fieldMarkup(name, labelKey, options = {}) {
        const id = `checkout-${name}`;
        const required = Boolean(options.required);
        const optional = !required && options.optional !== false;
        const describedBy = options.hintKey ? `${id}-hint` : "";
        const classes = ["field", options.wide ? "field-wide" : "", options.className || ""].filter(Boolean).join(" ");
        const labelMeta = required
            ? `<span class="field-required" aria-hidden="true">*</span><span class="sr-only">${text("common.required")}</span>`
            : optional ? `<span class="field-optional">${text("common.optional")}</span>` : "";
        const commonAttributes = [
            `id="${id}"`,
            `name="${escapeHtml(name)}"`,
            options.autocomplete ? `autocomplete="${escapeHtml(options.autocomplete)}"` : "",
            required ? "required" : "",
            options.disabled ? "disabled" : "",
            options.maxlength ? `maxlength="${Number(options.maxlength)}"` : "",
            describedBy ? `aria-describedby="${describedBy}" data-base-describedby="${describedBy}"` : "",
            options.billingRequired ? "data-billing-required" : ""
        ].filter(Boolean).join(" ");
        const control = options.textarea
            ? `<textarea ${commonAttributes} rows="${options.rows || 4}">${escapeHtml(fieldValue(name))}</textarea>`
            : `<input ${commonAttributes} type="${escapeHtml(options.type || "text")}" value="${escapeHtml(fieldValue(name))}">`;
        return `
            <div class="${classes}">
                <label for="${id}">${text(labelKey)} ${labelMeta}</label>
                ${control}
                ${options.hintKey ? `<div class="field-hint" id="${id}-hint">${text(options.hintKey)}</div>` : ""}
            </div>
        `;
    }

    function checkoutStepHeader(step, titleKey) {
        return `
            <header class="checkout-step__header">
                <span class="eyebrow">${text("checkout.stepCount", { current: step, total: 4 })}</span>
                <h1 id="checkout-step-title" tabindex="-1">${text(titleKey)}</h1>
            </header>
        `;
    }

    function checkoutActions(step, next = true) {
        return `
            <div class="checkout-actions">
                ${step > 1 ? `<button class="button button-outline" type="button" data-checkout-back>${text("common.back")}</button>` : ""}
                ${next ? `<button class="button button-primary" type="submit">${text("common.next")}</button>` : ""}
            </div>
        `;
    }

    function checkoutStepOne() {
        return `
            <section class="checkout-step" data-checkout-step-panel="1">
                ${checkoutStepHeader(1, "checkout.step1")}
                <div class="notice checkout-guest-notice">
                    <strong>${text("checkout.guest")}</strong>
                    <span>${text("checkout.signInUnavailable")}</span>
                </div>
                <p>${text("checkout.customerIntro")}</p>
                <div class="form-grid">
                    ${fieldMarkup("firstName", "field.firstName", { required: true, autocomplete: "given-name" })}
                    ${fieldMarkup("lastName", "field.lastName", { required: true, autocomplete: "family-name" })}
                    ${fieldMarkup("company", "field.company", { required: true, autocomplete: "organization" })}
                    ${fieldMarkup("email", "field.email", { required: true, type: "email", autocomplete: "email" })}
                    ${fieldMarkup("phone", "field.phone", { required: true, autocomplete: "tel" })}
                    ${fieldMarkup("department", "field.department", { autocomplete: "organization-title" })}
                    ${fieldMarkup("taxId", "field.taxId", { autocomplete: "off" })}
                </div>
                ${checkoutActions(1)}
            </section>
        `;
    }

    function checkoutStepTwo() {
        const sameBilling = checkoutState.values.sameBilling !== false;
        return `
            <section class="checkout-step" data-checkout-step-panel="2">
                ${checkoutStepHeader(2, "checkout.step2")}
                <h2>${text("checkout.shippingTitle")}</h2>
                <div class="form-grid">
                    ${fieldMarkup("shippingRecipient", "field.recipient", { required: true, autocomplete: "shipping name" })}
                    ${fieldMarkup("shippingCompany", "field.shippingCompany", { required: true, autocomplete: "shipping organization" })}
                    ${fieldMarkup("shippingPhone", "field.shippingPhone", { required: true, autocomplete: "shipping tel" })}
                    ${fieldMarkup("shippingAddress1", "field.address1", { required: true, autocomplete: "shipping address-line1", wide: true })}
                    ${fieldMarkup("shippingAddress2", "field.address2", { autocomplete: "shipping address-line2", wide: true })}
                    ${fieldMarkup("shippingCity", "field.city", { required: true, autocomplete: "shipping address-level2" })}
                    ${fieldMarkup("shippingRegion", "field.region", { autocomplete: "shipping address-level1" })}
                    ${fieldMarkup("shippingPostal", "field.postal", { required: true, autocomplete: "shipping postal-code" })}
                    ${fieldMarkup("shippingCountry", "field.country", { required: true, autocomplete: "shipping country-name" })}
                </div>
                <section class="billing-section" aria-labelledby="billing-section-title">
                    <h2 id="billing-section-title">${text("checkout.billingTitle")}</h2>
                    <label class="checkbox-field" for="checkout-sameBilling">
                        <input id="checkout-sameBilling" type="checkbox" name="sameBilling" ${sameBilling ? "checked" : ""}>
                        <span>${text("field.sameBilling")}</span>
                    </label>
                    <div class="form-grid billing-fields" data-billing-fields ${sameBilling ? "hidden" : ""}>
                        ${fieldMarkup("billingRecipient", "field.recipient", { required: !sameBilling, billingRequired: true, autocomplete: "billing name", disabled: sameBilling })}
                        ${fieldMarkup("billingCompany", "field.company", { required: !sameBilling, billingRequired: true, autocomplete: "billing organization", disabled: sameBilling })}
                        ${fieldMarkup("billingPhone", "field.phone", { required: !sameBilling, billingRequired: true, autocomplete: "billing tel", disabled: sameBilling })}
                        ${fieldMarkup("billingAddress1", "field.address1", { required: !sameBilling, billingRequired: true, autocomplete: "billing address-line1", wide: true, disabled: sameBilling })}
                        ${fieldMarkup("billingAddress2", "field.address2", { autocomplete: "billing address-line2", wide: true, disabled: sameBilling })}
                        ${fieldMarkup("billingCity", "field.city", { required: !sameBilling, billingRequired: true, autocomplete: "billing address-level2", disabled: sameBilling })}
                        ${fieldMarkup("billingRegion", "field.region", { autocomplete: "billing address-level1", disabled: sameBilling })}
                        ${fieldMarkup("billingPostal", "field.postal", { required: !sameBilling, billingRequired: true, autocomplete: "billing postal-code", disabled: sameBilling })}
                        ${fieldMarkup("billingCountry", "field.country", { required: !sameBilling, billingRequired: true, autocomplete: "billing country-name", disabled: sameBilling })}
                    </div>
                    <div class="form-grid">
                        ${fieldMarkup("invoiceInfo", "field.invoiceInfo", { textarea: true, rows: 3, maxlength: 1000, wide: true, hintKey: "field.invoiceInfoHint" })}
                    </div>
                </section>
                ${checkoutActions(2)}
            </section>
        `;
    }

    function checkoutStepThree() {
        return `
            <section class="checkout-step" data-checkout-step-panel="3">
                ${checkoutStepHeader(3, "checkout.step3")}
                <section class="shipping-method-review" aria-labelledby="shipping-method-title">
                    <h2 id="shipping-method-title">${text("checkout.shippingMethodTitle")}</h2>
                    <p>${text("checkout.shippingMethodIntro")}</p>
                    <p class="notice">${text("checkout.importCosts")}</p>
                    <div class="shipping-methods">
                        <article><strong>${text("checkout.courierTitle")}</strong><span>${text("checkout.courierText")}</span></article>
                        <article><strong>${text("checkout.freightTitle")}</strong><span>${text("checkout.freightText")}</span></article>
                        <article><strong>${text("checkout.etaTitle")}</strong><span>${text("checkout.etaText")}</span></article>
                    </div>
                </section>
                <section aria-labelledby="procurement-context-title">
                    <h2 id="procurement-context-title">${text("checkout.procurementTitle")}</h2>
                    <div class="form-grid">
                        ${fieldMarkup("projectName", "field.projectName", { autocomplete: "off" })}
                        ${fieldMarkup("purchaseOrder", "field.purchaseOrder", { autocomplete: "off" })}
                        ${fieldMarkup("notes", "field.notes", { textarea: true, rows: 5, maxlength: 2000, wide: true, hintKey: "field.notesHint" })}
                    </div>
                </section>
                ${checkoutActions(3)}
            </section>
        `;
    }

    function checkoutStepFour() {
        return `
            <section class="checkout-step" data-checkout-step-panel="4">
                ${checkoutStepHeader(4, "checkout.step4")}
                <h2>${text("checkout.confirmTitle")}</h2>
                <div class="notice checkout-no-charge"><strong>${text("checkout.noCharge")}</strong></div>
                <p>${text("checkout.noPayment")}</p>
                <p>${text("checkout.reviewText")}</p>
                <div hidden aria-hidden="true">
                    <label for="checkout-website">${text("field.website")}</label>
                    <input id="checkout-website" name="website" type="text" tabindex="-1" autocomplete="off" value="${escapeHtml(fieldValue("website"))}">
                </div>
                <div class="checkout-actions checkout-actions--confirmation">
                    <button class="button button-outline" type="button" data-checkout-back>${text("common.back")}</button>
                    <button class="button button-primary" type="submit" data-request-type="order_request">${text("checkout.submitOrder")}</button>
                    <button class="button button-dark" type="submit" data-request-type="proforma_invoice">${text("checkout.requestProforma")}</button>
                </div>
            </section>
        `;
    }

    function checkoutStepMarkup() {
        if (checkoutState.step === 1) return checkoutStepOne();
        if (checkoutState.step === 2) return checkoutStepTwo();
        if (checkoutState.step === 3) return checkoutStepThree();
        return checkoutStepFour();
    }

    function checkoutProgressMarkup() {
        const steps = ["checkout.step1", "checkout.step2", "checkout.step3", "checkout.step4"];
        return `
            <nav class="checkout-progress" aria-label="${text("checkout.progress")}">
                <ol>
                    ${steps.map((key, index) => {
                        const step = index + 1;
                        const current = step === checkoutState.step;
                        const previous = step < checkoutState.step;
                        return `
                            <li class="checkout-progress__item ${current ? "is-current" : previous ? "is-previous" : "is-upcoming"}">
                                <button type="button" data-checkout-step="${step}" ${previous ? "" : "disabled"}
                                    ${current ? "aria-current=\"step\"" : ""}>
                                    <span>${String(step).padStart(2, "0")}</span><strong>${text(key)}</strong>
                                </button>
                            </li>
                        `;
                    }).join("")}
                </ol>
            </nav>
        `;
    }

    function checkoutPendingMarkup(items) {
        return `
            <div class="checkout-shell">
                <section class="checkout-main" aria-labelledby="intent-pending-title">
                    <section class="intent-status intent-status--pending" role="status" aria-live="polite" aria-labelledby="intent-pending-title">
                        <span class="eyebrow">${text("checkout.pendingReview")}</span>
                        <h1 id="intent-pending-title" tabindex="-1">${text("checkout.pendingTitle")}</h1>
                        <p>${text("checkout.pendingText")}</p>
                        <dl>
                            <div><dt>${text("checkout.intentId")}</dt><dd>${escapeHtml(checkoutState.result.id)}</dd></div>
                            <div><dt>${text("checkout.status")}</dt><dd>${text("checkout.pendingReview")}</dd></div>
                        </dl>
                        <p class="notice">${text("checkout.cartPreserved")}</p>
                        <div class="checkout-actions">
                            <a class="button button-outline" href="${shopUrl("cart.html")}">${text("checkout.returnCart")}</a>
                            <a class="button button-soft" href="${shopUrl("contact-engineer.html")}">${text("common.contactEngineer")}</a>
                        </div>
                    </section>
                </section>
                <aside class="checkout-summary checkout-summary--desktop" aria-label="${text("cart.summary")}">
                    ${orderSummaryMarkup(items, false)}
                </aside>
            </div>
        `;
    }

    function renderCheckout(focusHeading = false) {
        const root = document.querySelector("[data-checkout-root]") || document.querySelector(".checkout-layout");
        if (!root) return;
        const items = cartItems();
        if (!items.length) {
            root.innerHTML = `
                <div class="empty-state" role="status">
                    <p>${text("checkout.empty")}</p>
                    <a class="button button-primary" href="${shopUrl("products.html")}">${text("common.browseProducts")}</a>
                    <a class="button button-outline" href="${shopUrl("request-quote.html")}">${text("common.requestQuote")}</a>
                </div>
            `;
            return;
        }
        if (checkoutState.result) {
            root.innerHTML = checkoutPendingMarkup(items);
            if (focusHeading) root.querySelector("#intent-pending-title")?.focus();
            return;
        }

        const count = items.reduce((sum, item) => sum + item.qty, 0);
        root.innerHTML = `
            <div class="checkout-shell">
                <section class="checkout-main" aria-label="${text("checkout.progress")}">
                    <details class="checkout-summary-mobile">
                        <summary>${text("checkout.summaryMobile", { count, total: money(cartEstimate(items)) })}</summary>
                        <div class="checkout-summary">${orderSummaryMarkup(items, false)}</div>
                    </details>
                    ${checkoutProgressMarkup()}
                    <form class="form checkout-form" data-checkout-form novalidate aria-labelledby="checkout-step-title">
                        <div class="form-error-summary" data-form-errors role="alert" hidden></div>
                        ${checkoutState.error ? `
                            <div class="form-status intent-status intent-status--error" role="alert" tabindex="-1" data-checkout-submit-error>
                                <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
                                <span>${escapeHtml(checkoutState.error)}</span>
                            </div>
                        ` : ""}
                        ${checkoutStepMarkup()}
                    </form>
                    <div class="form-status" aria-live="polite" aria-atomic="true" data-checkout-live></div>
                </section>
                <aside class="checkout-summary checkout-summary--desktop" aria-label="${text("cart.summary")}">
                    ${orderSummaryMarkup(items, false)}
                </aside>
            </div>
        `;

        const form = root.querySelector("[data-checkout-form]");
        attachCheckoutEvents(root, form);
        if (focusHeading) {
            const focusTarget = checkoutState.error
                ? root.querySelector("[data-checkout-submit-error]")
                : root.querySelector("#checkout-step-title");
            focusTarget?.focus();
        }
    }

    function collectCheckoutValues(form) {
        form.querySelectorAll("input[name], textarea[name], select[name]").forEach((control) => {
            if (control.name === "sameBilling") {
                checkoutState.values.sameBilling = control.checked;
            } else if (control.type !== "submit" && control.type !== "button" && !control.disabled) {
                checkoutState.values[control.name] = control.value;
            }
        });
    }

    function clearFieldError(control) {
        const field = control.closest(".field");
        field?.querySelector(".field-error")?.remove();
        control.removeAttribute("aria-invalid");
        const base = control.dataset.baseDescribedby || "";
        if (base) control.setAttribute("aria-describedby", base);
        else control.removeAttribute("aria-describedby");
    }

    function markFieldError(control, message) {
        clearFieldError(control);
        const field = control.closest(".field");
        if (!field) return;
        const errorId = `${control.id}-error`;
        const error = document.createElement("div");
        error.className = "field-error";
        error.id = errorId;
        error.setAttribute("role", "alert");
        error.innerHTML = `<i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i><span>${escapeHtml(message)}</span>`;
        field.appendChild(error);
        control.setAttribute("aria-invalid", "true");
        const described = [control.dataset.baseDescribedby, errorId].filter(Boolean).join(" ");
        control.setAttribute("aria-describedby", described);
    }

    function validateCheckoutForm(form) {
        const invalid = [];
        form.querySelectorAll("input, textarea, select").forEach((control) => clearFieldError(control));
        form.querySelectorAll("[required]:not([disabled])").forEach((control) => {
            if (!String(control.value || "").trim()) {
                markFieldError(control, t("checkout.required"));
                invalid.push(control);
            }
        });
        form.querySelectorAll("input[type='email']:not([disabled])").forEach((control) => {
            const value = String(control.value || "").trim();
            if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                markFieldError(control, t("checkout.emailInvalid"));
                if (!invalid.includes(control)) invalid.push(control);
            }
        });
        const summary = form.querySelector("[data-form-errors]");
        if (invalid.length) {
            if (summary) {
                summary.hidden = false;
                summary.innerHTML = `<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i><span>${text("checkout.fixErrors")}</span>`;
            }
            invalid[0].focus();
            return false;
        }
        if (summary) {
            summary.hidden = true;
            summary.innerHTML = "";
        }
        return true;
    }

    function attachCheckoutEvents(root, form) {
        if (!form) return;
        form.querySelectorAll("input, textarea, select").forEach((control) => {
            control.addEventListener("input", () => clearFieldError(control));
        });

        form.querySelector("#checkout-sameBilling")?.addEventListener("change", (event) => {
            collectCheckoutValues(form);
            checkoutState.values.sameBilling = event.target.checked;
            checkoutState.error = "";
            checkoutState.idempotencyKey = "";
            renderCheckout(false);
            document.querySelector("#checkout-sameBilling")?.focus();
        });

        form.querySelectorAll("[data-checkout-back]").forEach((button) => {
            button.addEventListener("click", () => {
                collectCheckoutValues(form);
                checkoutState.step = Math.max(1, checkoutState.step - 1);
                checkoutState.error = "";
                checkoutState.idempotencyKey = "";
                checkoutState.requestType = "";
                renderCheckout(true);
            });
        });

        root.querySelectorAll("[data-checkout-step]").forEach((button) => {
            button.addEventListener("click", () => {
                const step = Number(button.dataset.checkoutStep);
                if (step >= checkoutState.step) return;
                collectCheckoutValues(form);
                checkoutState.step = Math.max(1, step);
                checkoutState.error = "";
                checkoutState.idempotencyKey = "";
                checkoutState.requestType = "";
                renderCheckout(true);
            });
        });

        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            collectCheckoutValues(form);
            if (checkoutState.step < 4) {
                if (!validateCheckoutForm(form)) return;
                if (checkoutState.step === 1) {
                    const fullName = `${fieldValue("firstName")} ${fieldValue("lastName")}`.trim();
                    if (!fieldValue("shippingRecipient")) checkoutState.values.shippingRecipient = fullName;
                    if (!fieldValue("shippingCompany")) checkoutState.values.shippingCompany = fieldValue("company");
                    if (!fieldValue("shippingPhone")) checkoutState.values.shippingPhone = fieldValue("phone");
                }
                checkoutState.step += 1;
                checkoutState.error = "";
                renderCheckout(true);
                return;
            }
            const requestType = event.submitter?.dataset.requestType;
            if (requestType === "order_request" || requestType === "proforma_invoice") {
                await submitOrderIntent(requestType, root, form);
            }
        });
    }

    function optionalFields(entries) {
        return Object.fromEntries(entries.filter(([, value]) => String(value || "").trim()).map(([key, value]) => [key, String(value).trim()]));
    }

    function newIdempotencyKey() {
        if (window.crypto?.randomUUID) return window.crypto.randomUUID();
        const bytes = new Uint8Array(16);
        window.crypto?.getRandomValues?.(bytes);
        if (!bytes.some(Boolean)) {
            for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
        }
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, "0"));
        return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
    }

    function orderIntentPayload(requestType) {
        const values = checkoutState.values;
        const sameBilling = values.sameBilling !== false;
        const contact = {
            name: `${fieldValue("firstName")} ${fieldValue("lastName")}`.trim(),
            company: fieldValue("company").trim(),
            email: fieldValue("email").trim(),
            ...optionalFields([
                ["phone", fieldValue("phone")],
                ["department", fieldValue("department")]
            ])
        };
        const shipping = {
            address1: fieldValue("shippingAddress1").trim(),
            city: fieldValue("shippingCity").trim(),
            postalCode: fieldValue("shippingPostal").trim(),
            country: fieldValue("shippingCountry").trim(),
            ...optionalFields([
                ["recipient", fieldValue("shippingRecipient")],
                ["company", fieldValue("shippingCompany")],
                ["phone", fieldValue("shippingPhone")],
                ["address2", fieldValue("shippingAddress2")],
                ["region", fieldValue("shippingRegion")]
            ])
        };
        const billing = sameBilling ? { sameAsShipping: true } : {
            sameAsShipping: false,
            address1: fieldValue("billingAddress1").trim(),
            city: fieldValue("billingCity").trim(),
            postalCode: fieldValue("billingPostal").trim(),
            country: fieldValue("billingCountry").trim(),
            ...optionalFields([
                ["recipient", fieldValue("billingRecipient")],
                ["company", fieldValue("billingCompany")],
                ["phone", fieldValue("billingPhone")],
                ["address2", fieldValue("billingAddress2")],
                ["region", fieldValue("billingRegion")]
            ])
        };
        const procurement = optionalFields([
            ["projectName", fieldValue("projectName")],
            ["purchaseOrder", fieldValue("purchaseOrder")],
            ["taxId", fieldValue("taxId")],
            ["invoiceInfo", fieldValue("invoiceInfo")],
            ["notes", fieldValue("notes")]
        ]);
        return {
            contact,
            shipping,
            billing,
            ...(Object.keys(procurement).length ? { procurement } : {}),
            requestType,
            items: cartItems().map(({ product, qty, configuration }) => ({
                sku: product.sku,
                quantity: qty,
                ...(configuration ? { configuration } : {})
            })),
            locale: SHOP_LOCALE,
            sourcePage: `${location.pathname}${location.search}`,
            idempotencyKey: checkoutState.idempotencyKey,
            website: fieldValue("website")
        };
    }

    function setCheckoutBusy(root, busy) {
        checkoutState.submitting = busy;
        root.setAttribute("aria-busy", String(busy));
        root.querySelectorAll("[data-request-type], [data-checkout-back]").forEach((button) => {
            button.disabled = busy;
            if (busy && button.matches("[data-request-type]")) button.textContent = t("checkout.submitting");
        });
        const live = root.querySelector("[data-checkout-live]");
        if (live) live.textContent = busy ? t("checkout.submitting") : "";
    }

    async function submitOrderIntent(requestType, root, form) {
        collectCheckoutValues(form);
        if (checkoutState.requestType && checkoutState.requestType !== requestType) checkoutState.idempotencyKey = "";
        checkoutState.requestType = requestType;
        if (!checkoutState.idempotencyKey) checkoutState.idempotencyKey = newIdempotencyKey();
        const payload = orderIntentPayload(requestType);
        setCheckoutBusy(root, true);
        checkoutState.error = "";

        try {
            const response = await fetch("/api/order-intents", {
                method: "POST",
                headers: { "Accept": "application/json", "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            let responseData = {};
            try {
                responseData = await response.json();
            } catch {
                responseData = {};
            }
            if (response.status === 202 && responseData.ok === true && responseData.status === "pending_review" && responseData.id) {
                checkoutState.result = { id: String(responseData.id), status: "pending_review" };
                checkoutState.error = "";
                setCheckoutBusy(root, false);
                renderCheckout(true);
                return;
            }
            checkoutState.error = t("checkout.submitError", { status: response.status });
        } catch {
            checkoutState.error = t("checkout.networkError");
        }
        setCheckoutBusy(root, false);
        renderCheckout(true);
    }

    function prefillSku() {
        const sku = new URLSearchParams(location.search).get("sku");
        if (!sku) return;
        document.querySelectorAll("[data-prefill-sku]").forEach((node) => {
            node.value = sku;
        });
    }

    applyStaticI18n();
    renderSpotlight();
    renderCategories();
    renderProducts();
    renderProductDetail();
    renderCart();
    renderAccount();
    renderCheckout();
    hydrateSearch();
    initSearchSuggestions();
    initLanguageMenu();
    initStoreMobileMenu();
    handleCommerceActions();
    prefillSku();
    updateCartCount();
})();
