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
    showToast(`${product.name} added to cart`);
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
            <a class="product-media" href="/product.html?sku=${product.sku}" aria-label="${product.name}">
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
                    <button class="button button-primary" data-add-cart="${product.sku}">Buy Now</button>
                    <a class="button button-outline" href="/request-quote.html?sku=${product.sku}">Request a Quote</a>
                    <a class="button button-soft" href="/contact-engineer.html?sku=${product.sku}">Contact Engineer</a>
                </div>
            </div>
        </article>
    `;
}

function renderSpotlight() {
    const target = document.querySelector("[data-spotlight]");
    if (!target) return;
    target.innerHTML = SHOP_PRODUCTS.slice(0, 3).map(productCard).join("");
}

function renderCategories() {
    const target = document.querySelector("[data-categories]");
    if (!target) return;
    target.innerHTML = CATEGORY_META.map((category) => `
        <a class="category-card" href="/products.html?category=${encodeURIComponent(category.name)}">
            <img src="${category.image}" alt="${category.name}" loading="lazy">
            <div>
                <h3>${category.name}</h3>
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
    const categories = ["All Products", ...CATEGORY_META.map((item) => item.name), "Test Equipment"];

    const draw = () => {
        filters.innerHTML = categories.map((category) => `
            <button class="filter-button ${category === active ? "is-active" : ""}" data-category="${category}">${category}</button>
        `).join("");
        const visible = active === "All Products" ? SHOP_PRODUCTS : SHOP_PRODUCTS.filter((product) => product.category === active);
        grid.innerHTML = visible.map(productCard).join("");
    };

    filters.addEventListener("click", (event) => {
        const button = event.target.closest("[data-category]");
        if (!button) return;
        active = button.dataset.category;
        history.replaceState(null, "", active === "All Products" ? "/products.html" : `/products.html?category=${encodeURIComponent(active)}`);
        draw();
    });

    draw();
}

function renderProductDetail() {
    const target = document.querySelector("[data-product-detail]");
    if (!target) return;
    const sku = new URLSearchParams(location.search).get("sku") || SHOP_PRODUCTS[0].sku;
    const product = SHOP_PRODUCTS.find((item) => item.sku === sku) || SHOP_PRODUCTS[0];
    document.title = `${product.name} | GYUTRON Official Store`;
    target.innerHTML = `
        <div class="breadcrumb"><a href="/">Store</a><span>/</span><a href="/products.html?category=${encodeURIComponent(product.category)}">${product.category}</a><span>/</span><span>${product.name}</span></div>
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
                    <label for="qty">Quantity</label>
                    <input id="qty" type="number" min="1" value="1">
                </div>
                <div class="detail-actions">
                    <button class="button button-primary" data-detail-add="${product.sku}">Buy Now</button>
                    <a class="button button-outline" href="/request-quote.html?sku=${product.sku}">Request a Quote</a>
                    <a class="button button-soft" href="/contact-engineer.html?sku=${product.sku}">Contact Engineer</a>
                </div>
                <p class="notice" style="margin-top:18px;">Industrial orders may require parameter confirmation, certification checks, stock validation, or lead-time review before shipment.</p>
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
        list.innerHTML = '<div class="empty-state">Your cart is empty. Add sample items or accessories from the official store.</div>';
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
        <h3>Order Summary</h3>
        <div class="summary-line"><span>Items</span><strong>${items.reduce((sum, item) => sum + item.qty, 0)}</strong></div>
        <div class="summary-line"><span>Estimated subtotal</span><strong>${money(subtotal)}</strong></div>
        <div class="summary-line"><span>Shipping</span><strong>Quoted</strong></div>
        <div class="summary-total"><span>Total before shipping</span><br>${money(subtotal)}</div>
        <p class="notice">Final shipping, duties, lead time, and certification documents are confirmed before payment capture.</p>
        <a class="button button-primary" style="width:100%;" href="/checkout.html">Proceed to Checkout</a>
        <a class="button button-outline" style="width:100%; margin-top:10px;" href="/request-quote.html">Request a Quote</a>
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
            showToast("Request saved locally. Connect this form to the commerce platform or CRM before launch.");
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
handleCartEvents();
handleForms();
prefillSku();
updateCartCount();
