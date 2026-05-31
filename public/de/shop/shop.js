const SHOP_PRODUCTS = [
    {
        sku: "GY-CV220-INLINE",
        name: "GY-CV220 Inline Vision Camera",
        category: "Industriekameras",
        price: 489,
        leadTime: "Ships in 5-8 days",
        image: "/product-images/gy-cv220-inline.png",
        summary: "Compact smart camera for inline inspection, code verification, and presence checks.",
        tags: ["2D inspection", "Industrial I/O", "GigE"],
        specs: { Sensor: "2.3 MP CMOS", Interface: "GigE + trigger I/O", Lens: "C-mount", Use: "Inline quality checks" }
    },
    {
        sku: "GY-LB220",
        name: "GY-LB220 Bildverarbeitung Bar Light",
        category: "Vision-Beleuchtung",
        price: 129,
        leadTime: "Ships in 3-6 days",
        image: "/product-images/gy-lb220.png",
        summary: "White-light industrial bar light for stable image capture on inspection stations.",
        tags: ["Weiße LED", "24 VDC", "Strobe ready"],
        specs: { Length: "220 mm", Color: "White", Power: "24 VDC", Mount: "T-slot bracket" }
    },
    {
        sku: "GY-PR12",
        name: "GY-PR12 Inductive Proximity Sensor",
        category: "Sensoren",
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
        category: "Barcode-Scanner",
        price: 168,
        leadTime: "Ships in 3-6 days",
        image: "/product-images/gy-s240w.png",
        summary: "Cordless 1D/2D scanner with cradle for warehouse, shipping, and production benches.",
        tags: ["1D/2D", "Bluetooth", "Ladestation"],
        specs: { Scan: "1D/2D area imager", Link: "2.4G / Bluetooth", Range: "Up to 80 m", Rugged: "IP54 / 1.5 m" }
    },
    {
        sku: "GY-A55-PRO",
        name: "GY-A55 Pro Robuste PDA",
        category: "Robuste PDA",
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
        category: "Robuste PDA",
        price: 899,
        leadTime: "Quote lead time",
        image: "/product-images/gy-r70-longrange.png",
        summary: "High-power UHF RFID handheld for warehouse aisles, assets, pallets, and WIP tracking.",
        tags: ["UHF RFID", "Android", "Große Reichweite"],
        specs: { OS: "Android 14", RFID: "UHF up to 12 m", Scan: "2D + DPM option", Rugged: "IP67 / 1.8 m" }
    },
    {
        sku: "GY-OPT25",
        name: "GY-OPT25 C-Mount Lens",
        category: "Objektive",
        price: 96,
        leadTime: "In stock",
        image: "/product-images/gy-opt25.png",
        summary: "Low-distortion C-mount lens for machine vision cameras and inspection fixtures.",
        tags: ["25 mm", "C-mount", "Geringe Verzeichnung"],
        specs: { Focal: "25 mm", Mount: "C-mount", Format: "2/3 in", Iris: "Manual" }
    },
    {
        sku: "GY-FB200",
        name: "GY-FB200 Frame Grabber",
        category: "Acquisition-Karten",
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
        category: "Roboterzubehör",
        price: 245,
        leadTime: "Ships in 7-12 days",
        image: "/product-images/gy-mg50.png",
        summary: "Compact gripper kit for small robot cells, pick-and-place, and inspection handling.",
        tags: ["Robot EOAT", "24 VDC", "Vorrichtungsbereit"],
        specs: { Stroke: "50 mm", Payload: "Light parts", Control: "24 VDC I/O", Mount: "Adapter plate" }
    },
    {
        sku: "GY-CAL-GRID",
        name: "GY-CAL Grid Calibration Plate",
        category: "Prüfausrüstung",
        price: 78,
        leadTime: "In stock",
        image: "/product-images/gy-cal-grid.png",
        summary: "Calibration target for vision setup, measurement checks, and camera alignment routines.",
        tags: ["Calibration", "Vision-Setup", "Glass plate"],
        specs: { Pattern: "Grid", Size: "120 x 120 mm", Material: "Glass", Use: "Camera calibration" }
    },
    {
        sku: "GY-V240-COLOR",
        name: "GY-V240 Color Area Scan Camera",
        category: "Industriekameras",
        price: 536,
        leadTime: "Quote lead time",
        image: "/product-images/gy-v240-color.png",
        summary: "Color area-scan camera for inspection cells, robot guidance, and measurement stations.",
        tags: ["Color CMOS", "GigE", "Trigger I/O"],
        specs: { Sensor: "2.4 MP color", Interface: "GigE Vision", Shutter: "Global Shutter", Use: "Inspection cells" }
    },
    {
        sku: "GY-V3D150",
        name: "GY-V3D150 3D Profiling Camera",
        category: "Industriekameras",
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
        category: "Vision-Beleuchtung",
        price: 188,
        leadTime: "Ships in 5-8 days",
        image: "/product-images/gy-ldome120.png",
        summary: "Diffuse white dome light for reflective parts, curved surfaces, and label inspection.",
        tags: ["Diffuse", "Weiße LED", "24 VDC"],
        specs: { Typ: "Dome", Diameter: "120 mm", Color: "White", Use: "Reflective surfaces" }
    },
    {
        sku: "GY-PS60",
        name: "GY-PS60 Photoelectric Sensor",
        category: "Sensoren",
        price: 58,
        leadTime: "In stock",
        image: "/product-images/gy-ps60.png",
        summary: "Lichttaster for cartons, trays, fixtures, and product presence detection.",
        tags: ["Photoelectric", "IP67", "Fast response"],
        specs: { Typ: "Diffuse / retroreflective", Range: "60 cm class", Output: "PNP/NPN", Rating: "IP67" }
    },
    {
        sku: "GY-S300-DPM",
        name: "GY-S300 DPM Barcode Scanner",
        category: "Barcode-Scanner",
        price: 328,
        leadTime: "Ships in 5-8 days",
        image: "/product-images/gy-s300-dpm.png",
        summary: "DPM-ready scanner for etched, printed, and low-contrast production codes.",
        tags: ["DPM", "1D/2D", "Factory floor"],
        specs: { Scan: "1D/2D + DPM", Lighting: "Integrated", Interface: "USB / RS232", Use: "Rückverfolgbarkeit" }
    },
    {
        sku: "GY-A80-ULTRA",
        name: "GY-A80 Ultra Robuste PDA",
        category: "Robuste PDA",
        price: 612,
        leadTime: "Quote lead time",
        image: "/product-images/gy-a80-ultra.png",
        summary: "High-performance Android-PDA for scan-intensive warehouse and field operations.",
        tags: ["Android", "5G option", "Rugged"],
        specs: { OS: "Android", Display: "Large HD", Scan: "Long-range 2D option", Rugged: "Industrial handheld" }
    }
];

const CATEGORY_META = [
    { name: "Industriekameras", image: "/product-hero-area-scan-cameras-matrix.png", text: "Smart- und Flächenkameras für Prüfung, Führung und Codeverifikation." },
    { name: "Vision-Beleuchtung", image: "/product-hero-vision-lighting-matrix.png", text: "Weißlicht-Balken-, Ring-, Dome- und Durchlichtbeleuchtung für stabile Bildaufnahme." },
    { name: "Sensoren", image: "/product-hero-industrial-sensors-matrix.png", text: "Anwesenheits-, Abstands-, Umwelt- und Prozesssensorik für Fabrikausrüstung." },
    { name: "Barcode-Scanner", image: "/product-hero-barcode-scanners-matrix.png", text: "Mobile und stationäre Barcode-Lesung für Lager- und Produktionsrückverfolgbarkeit." },
    { name: "Robuste PDA", image: "/product-hero-android-pda-matrix.png", text: "Android-PDA und RFID-Handhelds für die industrielle mobile Datenerfassung." },
    { name: "Objektive", image: "/product-images/gy-opt25.png", text: "C-Mount-Optik und Prüfzubehör für Machine-Vision-Systeme." },
    { name: "Acquisition-Karten", image: "/product-images/gy-fb200.png", text: "Frame-Grabber und synchronisierte Erfassungshardware für Prüf-PCs." },
    { name: "Roboterzubehör", image: "/product-images/gy-mg50.png", text: "Greifer, Halterungen und Zellenzubehör für Industrieautomatisierungsprojekte." }
];

const CART_KEY = "gyutronShopWarenkorb";

function money(value) {
    return `$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getWarenkorb() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
        return [];
    }
}

function saveWarenkorb(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateWarenkorbCount();
}

function getWarenkorbArtikel() {
    return getWarenkorb()
        .map((item) => ({ ...item, product: SHOP_PRODUCTS.find((product) => product.sku === item.sku) }))
        .filter((item) => item.product);
}

function addToWarenkorb(sku, qty = 1) {
    const product = SHOP_PRODUCTS.find((item) => item.sku === sku);
    if (!product) return;
    const cart = getWarenkorb();
    const existing = cart.find((item) => item.sku === sku);
    if (existing) {
        existing.qty += qty;
    } else {
        cart.push({ sku, qty });
    }
    saveWarenkorb(cart);
    showToast(`${product.name} added to cart`);
}

function updateWarenkorbCount() {
    const count = getWarenkorb().reduce((sum, item) => sum + item.qty, 0);
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
            <a class="product-media" href="/de/shop/product.html?sku=${product.sku}" aria-label="${product.name}">
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
                    <button class="button button-primary" data-add-cart="${product.sku}">Jetzt kaufen</button>
                    <a class="button button-outline" href="/de/shop/request-quote.html?sku=${product.sku}">Angebot</a>
                    <a class="button button-soft" href="/de/shop/contact-engineer.html?sku=${product.sku}">Ingenieur kontaktieren</a>
                </div>
            </div>
        </article>
    `;
}

function spotlightCard(product) {
    return `
        <article class="spotlight-card">
            <a class="spotlight-media" href="/de/shop/product.html?sku=${product.sku}" aria-label="${product.name}">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </a>
            <div class="spotlight-body">
                <span class="spotlight-category">${product.category}</span>
                <h3>${product.name}</h3>
                <div class="spotlight-actions">
                    <a href="/de/shop/product.html?sku=${product.sku}">Ansehen</a>
                    <a href="/de/shop/request-quote.html?sku=${product.sku}">Angebot</a>
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

function renderKategorien() {
    const target = document.querySelector("[data-categories]");
    if (!target) return;
    target.innerHTML = CATEGORY_META.map((category) => `
        <a class="category-card" href="/de/shop/products.html?category=${encodeURIComponent(category.name)}">
            <img src="${category.image}" alt="${category.name}" loading="lazy">
            <div>
                <h3>${category.name}</h3>
                <p>${category.text}</p>
            </div>
        </a>
    `).join("");
}

function renderProdukte() {
    const grid = document.querySelector("[data-products]");
    const filters = document.querySelector("[data-filters]");
    if (!grid || !filters) return;

    const params = new URLSearchParams(location.search);
    let active = params.get("category") || "Alle Produkte";
    const query = (params.get("q") || "").trim().toLowerCase();
    const categories = ["Alle Produkte", ...CATEGORY_META.map((item) => item.name), "Prüfausrüstung"];

    const draw = () => {
        filters.innerHTML = categories.map((category) => `
            <button class="filter-button ${category === active ? "is-active" : ""}" data-category="${category}">${category}</button>
        `).join("");
        const visible = (active === "Alle Produkte" ? SHOP_PRODUCTS : SHOP_PRODUCTS.filter((product) => product.category === active))
            .filter((product) => {
                if (!query) return true;
                return [product.sku, product.name, product.category, product.summary, ...product.tags]
                    .join(" ")
                    .toLowerCase()
                    .includes(query);
            });
        grid.innerHTML = visible.length
            ? visible.map(productCard).join("")
            : '<div class="empty-state">Keine Produkte für diese Suche gefunden. Versuchen Sie ein anderes Stichwort oder fordern Sie ein Angebot an.</div>';
    };

    filters.addEventListener("click", (event) => {
        const button = event.target.closest("[data-category]");
        if (!button) return;
        active = button.dataset.category;
        history.replaceState(null, "", active === "Alle Produkte" ? "/de/shop/products.html" : `/de/shop/products.html?category=${encodeURIComponent(active)}`);
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
                <div class="search-suggestion-title">Vorgeschlagene Produkte</div>
                ${matches.map((product) => `
                    <a class="search-suggestion" role="option" href="/de/shop/product.html?sku=${encodeURIComponent(product.sku)}">
                        <img src="${product.image}" alt="${escapeHtml(product.name)}" loading="lazy">
                        <span>
                            <strong>${escapeHtml(product.name)}</strong>
                            <em>${escapeHtml(getSearchPath(product) || "Industrieprodukte")}</em>
                            <small>${escapeHtml(product.sku)}</small>
                        </span>
                    </a>
                `).join("")}
                <a class="search-suggestion-all" href="/de/shop/products.html?q=${encodeURIComponent(query)}">Search all results for "${escapeHtml(query)}"</a>
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

function initStoreMobileMenü() {
    const toggle = document.querySelector(".store-menu-toggle");
    if (!toggle || document.querySelector(".store-mobile-panel")) return;

    const panel = document.createElement("aside");
    panel.className = "store-mobile-panel";
    panel.setAttribute("aria-label", "Store-Menü");
    panel.innerHTML = `
        <div class="store-mobile-section">Store</div>
        <a href="/de/shop/products.html">Produkte <i class="fa-solid fa-chevron-right"></i></a>
        <a href="/de/shop/request-quote.html">Angebot anfordern <i class="fa-solid fa-chevron-right"></i></a>
        <a href="/de/shop/contact-engineer.html">Ingenieur kontaktieren <i class="fa-solid fa-chevron-right"></i></a>
        <a href="/de/shop/account.html">Kontoregistrierung <i class="fa-solid fa-chevron-right"></i></a>
        <a href="/de/shop/cart.html">Warenkorb <i class="fa-solid fa-chevron-right"></i></a>
        <div class="store-mobile-section">Produktkategorien</div>
        ${CATEGORY_META.map((category) => `<a href="/de/shop/products.html?category=${encodeURIComponent(category.name)}">${category.name} <i class="fa-solid fa-chevron-right"></i></a>`).join("")}
        <div class="store-mobile-section">Unternehmen & Richtlinien</div>
        <a href="https://www.gyutron.com/">Markenwebsite <i class="fa-solid fa-chevron-right"></i></a>
        <a href="/de/shop/about-us.html">Über uns <i class="fa-solid fa-chevron-right"></i></a>
        <a href="/de/shop/contact-us.html">Kontakt <i class="fa-solid fa-chevron-right"></i></a>
        <a href="/de/shop/shipping-policy.html">Versandrichtlinie <i class="fa-solid fa-chevron-right"></i></a>
        <a href="/de/shop/warranty-policy.html">Garantierichtlinie <i class="fa-solid fa-chevron-right"></i></a>
    `;
    document.body.appendChild(panel);

    const closeMenü = () => {
        document.body.classList.remove("store-mobile-menu-open");
        toggle.setAttribute("aria-expanded", "false");
    };
    const openMenü = () => {
        document.body.classList.add("store-mobile-menu-open");
        toggle.setAttribute("aria-expanded", "true");
    };

    toggle.addEventListener("click", () => {
        if (document.body.classList.contains("store-mobile-menu-open")) {
            closeMenü();
        } else {
            openMenü();
        }
    });
    panel.addEventListener("click", (event) => {
        if (event.target.closest("a")) closeMenü();
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMenü();
    });
}

function renderProductDetail() {
    const target = document.querySelector("[data-product-detail]");
    if (!target) return;
    const sku = new URLSearchParams(location.search).get("sku") || SHOP_PRODUCTS[0].sku;
    const product = SHOP_PRODUCTS.find((item) => item.sku === sku) || SHOP_PRODUCTS[0];
    document.title = `${product.name} | Offizieller GYUTRON Store`;
    target.innerHTML = `
        <div class="breadcrumb"><a href="/de/shop/index.html">Store</a><span>/</span><a href="/de/shop/products.html?category=${encodeURIComponent(product.category)}">${product.category}</a><span>/</span><span>${product.name}</span></div>
        <div class="product-detail">
            <div class="detail-media"><img src="${product.image}" alt="${product.name}"></div>
            <div class="detail-info">
                <span class="eyebrow">${product.category}</span>
                <h1>${product.name}</h1>
                <p>${product.summary}</p>
                <div class="tag-row">${product.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
                <div class="price-row"><span class="price">${money(product.price)}</span><span class="lead-time">${product.leadTime}</span></div>
                <div class="spec-table">
                    ${Object.entries(product.specs).map(([key, value]) => `<div class="spec-row"><span>${key}</span><span>${value}</span></div>`).join("")}
                </div>
                <div class="qty-row">
                    <label for="qty">Menge</label>
                    <input id="qty" type="number" min="1" value="1">
                </div>
                <div class="detail-actions">
                    <button class="button button-primary" data-detail-add="${product.sku}">Jetzt kaufen</button>
                    <a class="button button-outline" href="/de/shop/request-quote.html?sku=${product.sku}">Angebot anfordern</a>
                    <a class="button button-soft" href="/de/shop/contact-engineer.html?sku=${product.sku}">Ingenieur kontaktieren</a>
                </div>
                <p class="notice" style="margin-top:18px;">Industriebestellungen können vor dem Versand eine Parameterbestätigung, Zertifizierungsprüfung, Bestandsvalidierung oder Lieferzeitprüfung erfordern.</p>
            </div>
        </div>
    `;
}

function renderWarenkorb() {
    const list = document.querySelector("[data-cart-list]");
    const summary = document.querySelector("[data-cart-summary]");
    if (!list || !summary) return;
    const items = getWarenkorbArtikel();
    if (!items.length) {
        list.innerHTML = '<div class="empty-state">Ihr Warenkorb ist leer. Fügen Sie Musterartikel oder Zubehör aus dem offiziellen Store hinzu.</div>';
    } else {
        list.innerHTML = items.map(({ product, qty }) => `
            <div class="cart-item" data-cart-row="${product.sku}">
                <img src="${product.image}" alt="${product.name}">
                <div><h3>${product.name}</h3><p>${product.sku}</p></div>
                <input type="number" min="1" value="${qty}" data-cart-qty="${product.sku}" aria-label="Menge for ${product.name}">
                <strong class="line-total">${money(product.price * qty)}</strong>
                <button class="icon-button" data-remove="${product.sku}" aria-label="Remove ${product.name}"><i class="fa-solid fa-xmark"></i></button>
            </div>
        `).join("");
    }
    renderSummary(summary);
}

function renderSummary(target) {
    const items = getWarenkorbArtikel();
    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.qty, 0);
    target.innerHTML = `
        <h3>Bestellübersicht</h3>
        <div class="summary-line"><span>Artikel</span><strong>${items.reduce((sum, item) => sum + item.qty, 0)}</strong></div>
        <div class="summary-line"><span>Geschätzte Zwischensumme</span><strong>${money(subtotal)}</strong></div>
        <div class="summary-line"><span>Versand</span><strong>Auf Anfrage</strong></div>
        <div class="summary-total"><span>Summe vor Versand</span><br>${money(subtotal)}</div>
        <p class="notice">Endgültiger Versand, Zölle, Lieferzeit und Zertifizierungsdokumente werden vor der Zahlungsabwicklung bestätigt.</p>
        <a class="button button-primary" style="width:100%;" href="/de/shop/checkout.html">Weiter zur Kasse</a>
        <a class="button button-outline" style="width:100%; margin-top:10px;" href="/de/shop/request-quote.html">Angebot anfordern</a>
    `;
}

function renderZur KasseSummary() {
    const target = document.querySelector("[data-checkout-summary]");
    if (target) renderSummary(target);
}

function handleWarenkorbEvents() {
    document.addEventListener("click", (event) => {
        const add = event.target.closest("[data-add-cart]");
        if (add) {
            addToWarenkorb(add.dataset.addWarenkorb, 1);
        }

        const detailAdd = event.target.closest("[data-detail-add]");
        if (detailAdd) {
            const qty = Math.max(1, Number(document.querySelector("#qty")?.value || 1));
            addToWarenkorb(detailAdd.dataset.detailAdd, qty);
        }

        const remove = event.target.closest("[data-remove]");
        if (remove) {
            saveWarenkorb(getWarenkorb().filter((item) => item.sku !== remove.dataset.remove));
            renderWarenkorb();
        }
    });

    document.addEventListener("change", (event) => {
        const qty = event.target.closest("[data-cart-qty]");
        if (!qty) return;
        const cart = getWarenkorb();
        const row = cart.find((item) => item.sku === qty.dataset.cartQty);
        if (row) row.qty = Math.max(1, Number(qty.value || 1));
        saveWarenkorb(cart);
        renderWarenkorb();
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
                ? "Kontoanfrage lokal gespeichert. Verbinden Sie die Kontoregistrierung vor dem Start mit der Commerce-Plattform."
                : "Anfrage lokal gespeichert. Verbinden Sie dieses Formular vor dem Start mit der Commerce-Plattform oder dem CRM.";
            showToast(message);
            form.reset();
            prefillSku();
        });
    });
}

renderSpotlight();
renderKategorien();
renderProdukte();
renderProductDetail();
renderWarenkorb();
renderZur KasseSummary();
hydrateSearch();
initSearchSuggestions();
initStoreMobileMenü();
handleWarenkorbEvents();
handleForms();
prefillSku();
updateWarenkorbCount();
