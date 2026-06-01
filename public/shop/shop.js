const SHOP_PRODUCTS = [
    {
        sku: "GY-CV220-INLINE",
        name: "GY-CV220 Inline Vision Camera",
        category: "Industrial Cameras",
        price: 489,
        leadTime: "Ships in 5-8 days",
        image: "/product-images/gy-cv220-inline.png",
        summary: "Compact smart camera for inline inspection, code verification, and presence checks.",
        tags: ["2D inspection", "Industrial I/O", "GigE"],
        specs: { Sensor: "2.3 MP CMOS", Interface: "GigE + trigger I/O", Lens: "C-mount", Use: "Inline quality checks" }
    },
    {
        sku: "GY-LB220",
        name: "GY-LB220 Machine Vision Bar Light",
        category: "Vision Lighting",
        price: 129,
        leadTime: "Ships in 3-6 days",
        image: "/product-images/gy-lb220.png",
        summary: "White-light industrial bar light for stable image capture on inspection stations.",
        tags: ["White LED", "24 VDC", "Strobe ready"],
        specs: { Length: "220 mm", Color: "White", Power: "24 VDC", Mount: "T-slot bracket" }
    },
    {
        sku: "GY-PR12",
        name: "GY-PR12 Inductive Proximity Sensor",
        category: "Sensors",
        price: 42,
        leadTime: "In stock",
        image: "/product-images/gy-pr12.png",
        summary: "M12 inductive sensor for metal detection, fixture presence, and machine interlock tasks.",
        tags: ["M12", "PNP/NPN", "IP67"],
        specs: { Body: "M12 stainless", Range: "4 mm", Output: "PNP or NPN", Rating: "IP67" }
    },
    {
        sku: "GY-S240W",
        name: "GY-S240W Wireless Barcode Scanner",
        category: "Barcode Scanners",
        price: 168,
        leadTime: "Ships in 3-6 days",
        image: "/product-images/gy-s240w.png",
        summary: "Cordless 1D/2D scanner with cradle for warehouse, shipping, and production benches.",
        tags: ["1D/2D", "Bluetooth", "Cradle"],
        specs: { Scan: "1D/2D area imager", Link: "2.4G / Bluetooth", Range: "Up to 80 m", Rugged: "IP54 / 1.5 m" }
    },
    {
        sku: "GY-A55-PRO",
        name: "GY-A55 Pro Rugged PDA",
        category: "Rugged PDA",
        price: 429,
        leadTime: "Ships in 7-10 days",
        image: "/product-images/gy-a55-pro.png",
        summary: "Android handheld computer for barcode, NFC, inventory, and field data capture.",
        tags: ["Android 14", "NFC", "Wi-Fi 6"],
        specs: { OS: "Android 14", Display: "5.5 in HD+", Scan: "Near/far 2D", Rugged: "IP67 / 1.8 m" }
    },
    {
        sku: "GY-R70-LONGRANGE",
        name: "GY-R70 LongRange RFID Handheld",
        category: "Rugged PDA",
        price: 899,
        leadTime: "Quote lead time",
        image: "/product-images/gy-r70-longrange.png",
        summary: "High-power UHF RFID handheld for warehouse aisles, assets, pallets, and WIP tracking.",
        tags: ["UHF RFID", "Android", "Long range"],
        specs: { OS: "Android 14", RFID: "UHF up to 12 m", Scan: "2D + DPM option", Rugged: "IP67 / 1.8 m" }
    },
    {
        sku: "GY-OPT25",
        name: "GY-OPT25 C-Mount Lens",
        category: "Lenses",
        price: 96,
        leadTime: "In stock",
        image: "/product-images/gy-opt25.png",
        summary: "Low-distortion C-mount lens for machine vision cameras and inspection fixtures.",
        tags: ["25 mm", "C-mount", "Low distortion"],
        specs: { Focal: "25 mm", Mount: "C-mount", Format: "2/3 in", Iris: "Manual" }
    },
    {
        sku: "GY-FB200",
        name: "GY-FB200 Frame Grabber",
        category: "Acquisition Cards",
        price: 359,
        leadTime: "Ships in 5-8 days",
        image: "/product-images/gy-fb200.png",
        summary: "PCIe acquisition card for multi-camera image capture and synchronized inspection setups.",
        tags: ["PCIe", "Trigger sync", "Vision systems"],
        specs: { Bus: "PCIe", Channels: "2 camera inputs", Trigger: "Hardware sync", Use: "Inspection PCs" }
    },
    {
        sku: "GY-MG50",
        name: "GY-MG50 Robot Gripper Kit",
        category: "Robot Accessories",
        price: 245,
        leadTime: "Ships in 7-12 days",
        image: "/product-images/gy-mg50.png",
        summary: "Compact gripper kit for small robot cells, pick-and-place, and inspection handling.",
        tags: ["Robot EOAT", "24 VDC", "Fixture ready"],
        specs: { Stroke: "50 mm", Payload: "Light parts", Control: "24 VDC I/O", Mount: "Adapter plate" }
    },
    {
        sku: "GY-CAL-GRID",
        name: "GY-CAL Grid Calibration Plate",
        category: "Test Equipment",
        price: 78,
        leadTime: "In stock",
        image: "/product-images/gy-cal-grid.png",
        summary: "Calibration target for vision setup, measurement checks, and camera alignment routines.",
        tags: ["Calibration", "Vision setup", "Glass plate"],
        specs: { Pattern: "Grid", Size: "120 x 120 mm", Material: "Glass", Use: "Camera calibration" }
    },
    {
        sku: "GY-V240-COLOR",
        name: "GY-V240 Color Area Scan Camera",
        category: "Industrial Cameras",
        price: 536,
        leadTime: "Quote lead time",
        image: "/product-images/gy-v240-color.png",
        summary: "Color area-scan camera for inspection cells, robot guidance, and measurement stations.",
        tags: ["Color CMOS", "GigE", "Trigger I/O"],
        specs: { Sensor: "2.4 MP color", Interface: "GigE Vision", Shutter: "Global shutter", Use: "Inspection cells" }
    },
    {
        sku: "GY-V3D150",
        name: "GY-V3D150 3D Profiling Camera",
        category: "Industrial Cameras",
        price: 1280,
        leadTime: "Quote lead time",
        image: "/product-images/gy-v3d150.png",
        summary: "3D profiling camera for height checks, surface inspection, and dimensional verification.",
        tags: ["3D profile", "Laser line", "Inspection"],
        specs: { Scan: "3D profile", Range: "150 mm class", Output: "GigE", Use: "Height and surface checks" }
    },
    {
        sku: "GY-LDOME120",
        name: "GY-LDOME120 Dome Light",
        category: "Vision Lighting",
        price: 188,
        leadTime: "Ships in 5-8 days",
        image: "/product-images/gy-ldome120.png",
        summary: "Diffuse white dome light for reflective parts, curved surfaces, and label inspection.",
        tags: ["Diffuse", "White LED", "24 VDC"],
        specs: { Type: "Dome", Diameter: "120 mm", Color: "White", Use: "Reflective surfaces" }
    },
    {
        sku: "GY-PS60",
        name: "GY-PS60 Photoelectric Sensor",
        category: "Sensors",
        price: 58,
        leadTime: "In stock",
        image: "/product-images/gy-ps60.png",
        summary: "Photoelectric sensor for cartons, trays, fixtures, and product presence detection.",
        tags: ["Photoelectric", "IP67", "Fast response"],
        specs: { Type: "Diffuse / retroreflective", Range: "60 cm class", Output: "PNP/NPN", Rating: "IP67" }
    },
    {
        sku: "GY-S300-DPM",
        name: "GY-S300 DPM Barcode Scanner",
        category: "Barcode Scanners",
        price: 328,
        leadTime: "Ships in 5-8 days",
        image: "/product-images/gy-s300-dpm.png",
        summary: "DPM-ready scanner for etched, printed, and low-contrast production codes.",
        tags: ["DPM", "1D/2D", "Factory floor"],
        specs: { Scan: "1D/2D + DPM", Lighting: "Integrated", Interface: "USB / RS232", Use: "Traceability" }
    },
    {
        sku: "GY-A80-ULTRA",
        name: "GY-A80 Ultra Rugged PDA",
        category: "Rugged PDA",
        price: 612,
        leadTime: "Quote lead time",
        image: "/product-images/gy-a80-ultra.png",
        summary: "High-performance Android PDA for scan-intensive warehouse and field operations.",
        tags: ["Android", "5G option", "Rugged"],
        specs: { OS: "Android", Display: "Large HD", Scan: "Long-range 2D option", Rugged: "Industrial handheld" }
    }
];

const CATEGORY_META = [
    { name: "Industrial Cameras", image: "/product-hero-area-scan-cameras-matrix.png", text: "Smart and area-scan cameras for inspection, guidance, and code verification." },
    { name: "Vision Lighting", image: "/product-hero-vision-lighting-matrix.png", text: "White-light bar, ring, dome, and back lights for stable image capture." },
    { name: "Sensors", image: "/product-hero-industrial-sensors-matrix.png", text: "Presence, distance, environmental, and process sensing for factory equipment." },
    { name: "Barcode Scanners", image: "/product-hero-barcode-scanners-matrix.png", text: "Handheld and fixed barcode reading for warehouse and production traceability." },
    { name: "Rugged PDA", image: "/product-hero-android-pda-matrix.png", text: "Android PDA and RFID handhelds for industrial mobile data capture." },
    { name: "Lenses", image: "/product-images/gy-opt25.png", text: "C-mount optics and inspection accessories for machine vision systems." },
    { name: "Acquisition Cards", image: "/product-images/gy-fb200.png", text: "Frame grabbers and synchronized capture hardware for inspection PCs." },
    { name: "Robot Accessories", image: "/product-images/gy-mg50.png", text: "Grippers, mounts, and cell accessories for industrial automation projects." }
];

const CART_KEY = "gyutronShopCart";

// Locale-aware product/category copy. GYUTRON_SHOP_LOCALE is set to "de"/"ja"
// by the build (replacing __SHOP_LOCALE__); on the English source it stays "en"
// and no translation is applied. Translations come from shop-i18n.js and are
// applied to whole fields (name/summary/category/leadTime/category text), so
// product copy is never partially replaced.
const SHOP_LOCALE = (typeof window !== "undefined" && window.GYUTRON_SHOP_LOCALE) || "en";

(function localizeCatalog() {
    const data = (typeof window !== "undefined" && window.GYUTRON_SHOP_I18N) || {};
    const L = data[SHOP_LOCALE];
    if (!L) return; // English source, or data not loaded
    SHOP_PRODUCTS.forEach((p) => {
        const t = L.products && L.products[p.sku];
        if (t) {
            if (t.name) p.name = t.name;
            if (t.summary) p.summary = t.summary;
        }
        if (L.category && L.category[p.category]) p.categoryLabel = L.category[p.category];
        if (L.leadTime && L.leadTime[p.leadTime]) p.leadTime = L.leadTime[p.leadTime];
        // Spec table: translate descriptive keys (Body->本体) and descriptive
        // values (M12 stainless->M12 ステンレス). Locked terms (IP67, M12,
        // PNP/NPN, GigE, ...) are simply absent from the tables, so they pass
        // through verbatim. Rebuild specs preserving key order.
        if (p.specs && (L.specKey || L.specVal)) {
            const out = {};
            for (const [k, v] of Object.entries(p.specs)) {
                const nk = (L.specKey && L.specKey[k]) || k;
                const nv = (L.specVal && L.specVal[v]) || v;
                out[nk] = nv;
            }
            p.specs = out;
        }
    });
    CATEGORY_META.forEach((c) => {
        if (L.category && L.category[c.name]) c.label = L.category[c.name];
        if (L.categoryText && L.categoryText[c.name]) c.text = L.categoryText[c.name];
    });
})();

// Display label for a category (translated if available, else canonical name).
// The canonical English name is kept as the filter/category key so product
// filtering and ?category= URLs keep working across locales.
function catLabel(name) {
    const data = (typeof window !== "undefined" && window.GYUTRON_SHOP_I18N) || {};
    const L = data[SHOP_LOCALE];
    return (L && L.category && L.category[name]) || name;
}

// UI string lookup: returns the locale value for an English UI string, or the
// English itself on the source locale / when no translation exists.
function t(s) {
    const data = (typeof window !== "undefined" && window.GYUTRON_SHOP_I18N) || {};
    const L = data[SHOP_LOCALE];
    return (L && L.ui && L.ui[s]) || s;
}

function money(value) {
    return `$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
}

function getCartItems() {
    return getCart()
        .map((item) => ({ ...item, product: SHOP_PRODUCTS.find((product) => product.sku === item.sku) }))
        .filter((item) => item.product);
}

function addToCart(sku, qty = 1) {
    const product = SHOP_PRODUCTS.find((item) => item.sku === sku);
    if (!product) return;
    const cart = getCart();
    const existing = cart.find((item) => item.sku === sku);
    if (existing) {
        existing.qty += qty;
    } else {
        cart.push({ sku, qty });
    }
    saveCart(cart);
    showToast(`${product.name} ${t("added to cart")}`);
}

function updateCartCount() {
    const count = getCart().reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll("[data-cart-count]").forEach((node) => {
        node.textContent = count;
    });
}

function showToast(message) {
    let toast = document.querySelector(".toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.className = "toast";
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function productCard(product) {
    return `
        <article class="product-card">
            <a class="product-media" href="/shop/product.html?sku=${product.sku}" aria-label="${product.name}">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </a>
            <div class="product-body">
                <div>
                    <h3>${product.name}</h3>
                    <p>${product.summary}</p>
                </div>
                <div class="tag-row">${product.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
                <div class="price-row">
                    <span class="price">${money(product.price)}</span>
                    <span class="lead-time">${product.leadTime}</span>
                </div>
                <div class="card-actions">
                    <button class="button button-primary" data-add-cart="${product.sku}">${t("Buy Now")}</button>
                    <a class="button button-outline" href="/shop/request-quote.html?sku=${product.sku}">${t("Quote")}</a>
                    <a class="button button-soft" href="/shop/contact-engineer.html?sku=${product.sku}">${t("Contact Engineer")}</a>
                </div>
            </div>
        </article>
    `;
}

function spotlightCard(product) {
    return `
        <article class="spotlight-card">
            <a class="spotlight-media" href="/shop/product.html?sku=${product.sku}" aria-label="${product.name}">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </a>
            <div class="spotlight-body">
                <span class="spotlight-category">${catLabel(product.category)}</span>
                <h3>${product.name}</h3>
                <div class="spotlight-actions">
                    <a href="/shop/product.html?sku=${product.sku}">${t("View")}</a>
                    <a href="/shop/request-quote.html?sku=${product.sku}">${t("Quote")}</a>
                </div>
            </div>
        </article>
    `;
}

function renderSpotlight() {
    const target = document.querySelector("[data-spotlight]");
    if (!target) return;
    target.innerHTML = SHOP_PRODUCTS.slice(0, 16).map(spotlightCard).join("");
}

function renderCategories() {
    const target = document.querySelector("[data-categories]");
    if (!target) return;
    target.innerHTML = CATEGORY_META.map((category) => `
        <a class="category-card" href="/shop/products.html?category=${encodeURIComponent(category.name)}">
            <img src="${category.image}" alt="${catLabel(category.name)}" loading="lazy">
            <div>
                <h3>${catLabel(category.name)}</h3>
                <p>${category.text}</p>
            </div>
        </a>
    `).join("");
}

function renderProducts() {
    const grid = document.querySelector("[data-products]");
    const filters = document.querySelector("[data-filters]");
    if (!grid || !filters) return;

    const params = new URLSearchParams(location.search);
    let active = params.get("category") || "All Products";
    const query = (params.get("q") || "").trim().toLowerCase();
    const categories = ["All Products", ...CATEGORY_META.map((item) => item.name), "Test Equipment"];

    const draw = () => {
        filters.innerHTML = categories.map((category) => `
            <button class="filter-button ${category === active ? "is-active" : ""}" data-category="${category}">${catLabel(category) !== category ? catLabel(category) : t(category)}</button>
        `).join("");
        const visible = (active === "All Products" ? SHOP_PRODUCTS : SHOP_PRODUCTS.filter((product) => product.category === active))
            .filter((product) => {
                if (!query) return true;
                return [product.sku, product.name, product.category, product.summary, ...product.tags]
                    .join(" ")
                    .toLowerCase()
                    .includes(query);
            });
        grid.innerHTML = visible.length
            ? visible.map(productCard).join("")
            : `<div class="empty-state">${t("No products matched this search. Try another keyword or request a quote.")}</div>`;
    };

    filters.addEventListener("click", (event) => {
        const button = event.target.closest("[data-category]");
        if (!button) return;
        active = button.dataset.category;
        history.replaceState(null, "", active === "All Products" ? "/shop/products.html" : `/shop/products.html?category=${encodeURIComponent(active)}`);
        draw();
    });

    draw();
}

function hydrateSearch() {
    const query = new URLSearchParams(location.search).get("q") || "";
    document.querySelectorAll(".store-search input[name='q']").forEach((input) => {
        input.value = query;
    });
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#039;"
    })[char]);
}

function getSearchMatches(query) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return SHOP_PRODUCTS
        .map((product) => {
            const haystack = [product.sku, product.name, product.category, product.summary, ...product.tags]
                .join(" ")
                .toLowerCase();
            const score = product.name.toLowerCase().includes(normalized) ? 3
                : product.sku.toLowerCase().includes(normalized) ? 2
                    : haystack.includes(normalized) ? 1
                        : 0;
            return { product, score };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))
        .slice(0, 6)
        .map((item) => item.product);
}

function getSearchPath(product) {
    return [product.category, ...product.tags.slice(0, 2)].filter(Boolean).join(" / ");
}

function initSearchSuggestions() {
    document.querySelectorAll(".store-search").forEach((form) => {
        const input = form.querySelector("input[name='q']");
        if (!input || form.querySelector(".search-suggestions")) return;

        const panel = document.createElement("div");
        panel.className = "search-suggestions";
        panel.setAttribute("role", "listbox");
        panel.hidden = true;
        form.appendChild(panel);

        const openSearch = () => {
            form.classList.add("is-search-open");
        };

        const closeSearch = () => {
            if (input.value.trim() || document.activeElement === input) return;
            form.classList.remove("is-search-open");
        };

        const close = () => {
            panel.hidden = true;
            panel.innerHTML = "";
            form.classList.remove("has-suggestions");
        };

        const render = () => {
            const query = input.value.trim();
            const matches = getSearchMatches(query);
            if (!query || !matches.length) {
                close();
                return;
            }
            panel.innerHTML = `
                <div class="search-suggestion-title">${t("Suggested products")}</div>
                ${matches.map((product) => `
                    <a class="search-suggestion" role="option" href="/shop/product.html?sku=${encodeURIComponent(product.sku)}">
                        <img src="${product.image}" alt="${escapeHtml(product.name)}" loading="lazy">
                        <span>
                            <strong>${escapeHtml(product.name)}</strong>
                            <em>${escapeHtml(getSearchPath(product) || t("Industrial products"))}</em>
                            <small>${escapeHtml(product.sku)}</small>
                        </span>
                    </a>
                `).join("")}
                <a class="search-suggestion-all" href="/shop/products.html?q=${encodeURIComponent(query)}">${t("searchAll").replace("%s", escapeHtml(query))}</a>
            `;
            panel.hidden = false;
            form.classList.add("has-suggestions");
        };

        form.addEventListener("pointerenter", openSearch);
        form.addEventListener("pointerleave", closeSearch);
        form.addEventListener("click", () => {
            openSearch();
            input.focus();
        });
        form.addEventListener("focusin", openSearch);
        form.addEventListener("focusout", () => {
            window.setTimeout(closeSearch, 120);
        });
        input.addEventListener("input", () => {
            openSearch();
            render();
        });
        input.addEventListener("focus", () => {
            openSearch();
            render();
        });
        input.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                close();
                input.blur();
                closeSearch();
            }
        });
        document.addEventListener("click", (event) => {
            if (!form.contains(event.target)) close();
        });
        form.addEventListener("submit", () => close());
    });
}

function initStoreMobileMenu() {
    const toggle = document.querySelector(".store-menu-toggle");
    if (!toggle || document.querySelector(".store-mobile-panel")) return;

    const panel = document.createElement("aside");
    panel.className = "store-mobile-panel";
    panel.setAttribute("aria-label", "Store menu");
    panel.innerHTML = `
        <div class="store-mobile-section">Store</div>
        <a href="/shop/products.html">Products <i class="fa-solid fa-chevron-right"></i></a>
        <a href="/shop/request-quote.html">Request Quote <i class="fa-solid fa-chevron-right"></i></a>
        <a href="/shop/contact-engineer.html">Contact Engineer <i class="fa-solid fa-chevron-right"></i></a>
        <a href="/shop/account.html">Account Registration <i class="fa-solid fa-chevron-right"></i></a>
        <a href="/shop/cart.html">Cart <i class="fa-solid fa-chevron-right"></i></a>
        <div class="store-mobile-section">Product Categories</div>
        ${CATEGORY_META.map((category) => `<a href="/shop/products.html?category=${encodeURIComponent(category.name)}">${category.name} <i class="fa-solid fa-chevron-right"></i></a>`).join("")}
        <div class="store-mobile-section">Company & Policies</div>
        <a href="https://www.gyutron.com/">Brand Site <i class="fa-solid fa-chevron-right"></i></a>
        <a href="/shop/about-us.html">About Us <i class="fa-solid fa-chevron-right"></i></a>
        <a href="/shop/contact-us.html">Contact Us <i class="fa-solid fa-chevron-right"></i></a>
        <a href="/shop/shipping-policy.html">Shipping Policy <i class="fa-solid fa-chevron-right"></i></a>
        <a href="/shop/warranty-policy.html">Warranty Policy <i class="fa-solid fa-chevron-right"></i></a>
    `;
    document.body.appendChild(panel);

    const closeMenu = () => {
        document.body.classList.remove("store-mobile-menu-open");
        toggle.setAttribute("aria-expanded", "false");
    };
    const openMenu = () => {
        document.body.classList.add("store-mobile-menu-open");
        toggle.setAttribute("aria-expanded", "true");
    };

    toggle.addEventListener("click", () => {
        if (document.body.classList.contains("store-mobile-menu-open")) {
            closeMenu();
        } else {
            openMenu();
        }
    });
    panel.addEventListener("click", (event) => {
        if (event.target.closest("a")) closeMenu();
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMenu();
    });
}

function renderProductDetail() {
    const target = document.querySelector("[data-product-detail]");
    if (!target) return;
    const sku = new URLSearchParams(location.search).get("sku") || SHOP_PRODUCTS[0].sku;
    const product = SHOP_PRODUCTS.find((item) => item.sku === sku) || SHOP_PRODUCTS[0];
    document.title = `${product.name} | ${t("GYUTRON Official Store")}`;
    target.innerHTML = `
        <div class="breadcrumb"><a href="/shop/index.html">${t("Store")}</a><span>/</span><a href="/shop/products.html?category=${encodeURIComponent(product.category)}">${catLabel(product.category)}</a><span>/</span><span>${product.name}</span></div>
        <div class="product-detail">
            <div class="detail-media"><img src="${product.image}" alt="${product.name}"></div>
            <div class="detail-info">
                <span class="eyebrow">${catLabel(product.category)}</span>
                <h1>${product.name}</h1>
                <p>${product.summary}</p>
                <div class="tag-row">${product.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
                <div class="price-row"><span class="price">${money(product.price)}</span><span class="lead-time">${product.leadTime}</span></div>
                <div class="spec-table">
                    ${Object.entries(product.specs).map(([key, value]) => `<div class="spec-row"><span>${key}</span><span>${value}</span></div>`).join("")}
                </div>
                <div class="qty-row">
                    <label for="qty">${t("Quantity")}</label>
                    <input id="qty" type="number" min="1" value="1">
                </div>
                <div class="detail-actions">
                    <button class="button button-primary" data-detail-add="${product.sku}">${t("Buy Now")}</button>
                    <a class="button button-outline" href="/shop/request-quote.html?sku=${product.sku}">${t("Request a Quote")}</a>
                    <a class="button button-soft" href="/shop/contact-engineer.html?sku=${product.sku}">${t("Contact Engineer")}</a>
                </div>
                <p class="notice" style="margin-top:18px;">${t("detail.notice")}</p>
            </div>
        </div>
    `;
}

function renderCart() {
    const list = document.querySelector("[data-cart-list]");
    const summary = document.querySelector("[data-cart-summary]");
    if (!list || !summary) return;
    const items = getCartItems();
    if (!items.length) {
        list.innerHTML = `<div class="empty-state">${t("Your cart is empty. Add sample items or accessories from the official store.")}</div>`;
    } else {
        list.innerHTML = items.map(({ product, qty }) => `
            <div class="cart-item" data-cart-row="${product.sku}">
                <img src="${product.image}" alt="${product.name}">
                <div><h3>${product.name}</h3><p>${product.sku}</p></div>
                <input type="number" min="1" value="${qty}" data-cart-qty="${product.sku}" aria-label="Quantity for ${product.name}">
                <strong class="line-total">${money(product.price * qty)}</strong>
                <button class="icon-button" data-remove="${product.sku}" aria-label="Remove ${product.name}"><i class="fa-solid fa-xmark"></i></button>
            </div>
        `).join("");
    }
    renderSummary(summary);
}

function renderSummary(target) {
    const items = getCartItems();
    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.qty, 0);
    target.innerHTML = `
        <h3>${t("Order Summary")}</h3>
        <div class="summary-line"><span>${t("Items")}</span><strong>${items.reduce((sum, item) => sum + item.qty, 0)}</strong></div>
        <div class="summary-line"><span>${t("Estimated subtotal")}</span><strong>${money(subtotal)}</strong></div>
        <div class="summary-line"><span>${t("Shipping")}</span><strong>${t("Quoted")}</strong></div>
        <div class="summary-total"><span>${t("Total before shipping")}</span><br>${money(subtotal)}</div>
        <p class="notice">${t("summary.notice")}</p>
        <a class="button button-primary" style="width:100%;" href="/shop/checkout.html">${t("Proceed to Checkout")}</a>
        <a class="button button-outline" style="width:100%; margin-top:10px;" href="/shop/request-quote.html">${t("Request a Quote")}</a>
    `;
}

function renderCheckoutSummary() {
    const target = document.querySelector("[data-checkout-summary]");
    if (target) renderSummary(target);
}

function handleCartEvents() {
    document.addEventListener("click", (event) => {
        const add = event.target.closest("[data-add-cart]");
        if (add) {
            addToCart(add.dataset.addCart, 1);
        }

        const detailAdd = event.target.closest("[data-detail-add]");
        if (detailAdd) {
            const qty = Math.max(1, Number(document.querySelector("#qty")?.value || 1));
            addToCart(detailAdd.dataset.detailAdd, qty);
        }

        const remove = event.target.closest("[data-remove]");
        if (remove) {
            saveCart(getCart().filter((item) => item.sku !== remove.dataset.remove));
            renderCart();
        }
    });

    document.addEventListener("change", (event) => {
        const qty = event.target.closest("[data-cart-qty]");
        if (!qty) return;
        const cart = getCart();
        const row = cart.find((item) => item.sku === qty.dataset.cartQty);
        if (row) row.qty = Math.max(1, Number(qty.value || 1));
        saveCart(cart);
        renderCart();
    });
}

function prefillSku() {
    const sku = new URLSearchParams(location.search).get("sku");
    if (!sku) return;
    document.querySelectorAll("[data-prefill-sku]").forEach((node) => {
        node.value = sku;
    });
}

function handleForms() {
    document.querySelectorAll("[data-demo-form]").forEach((form) => {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const message = form.classList.contains("account-card")
                ? "Account request saved locally. Connect account registration to the commerce platform before launch."
                : "Request saved locally. Connect this form to the commerce platform or CRM before launch.";
            showToast(message);
            form.reset();
            prefillSku();
        });
    });
}

renderSpotlight();
renderCategories();
renderProducts();
renderProductDetail();
renderCart();
renderCheckoutSummary();
hydrateSearch();
initSearchSuggestions();
initStoreMobileMenu();
handleCartEvents();
handleForms();
prefillSku();
updateCartCount();
