let activePage = 1;
const PRODUCTS_PER_PAGE = 6;

function localizeProductタイプ(product) {
    return product.type
        .replace("Compact", "コンパクト")
        .replace("All-purpose", "汎用")
        .replace("Large-screen", "大画面")
        .replace("Keypad", "キーパッド")
        .replace("Cold-chain", "コールドチェーン")
        .replace("Ultra-rugged", "超堅牢")
        .replace("Built-in", "内蔵型")
        .replace("Ergonomic", "エルゴノミック")
        .replace("Long-range", "長距離")
        .replace("Universal", "汎用")
        .replace("Wireless", "ワイヤレス")
        .replace("Wired", "有線")
        .replace("Industrial", "産業用")
        .replace("scanner", "スキャナー")
        .replace("reader", "リーダー")
        .replace("terminal", "端末")
        .replace("sensor", "センサー")
        .replace("camera", "カメラ")
        .replace("instrument", "機器")
        .replace("tester", "テスター")
        .replace("gauge", "ゲージ");
}

function localizeProductSummary(product, category) {
    const tags = product.tags && product.tags.length ? ` 主なオプション: ${product.tags.join("、")}。` : "";
    return `${category.title}向けの業務用モデルです。産業用途での調達、評価、システム統合を前提に構成されています。${tags}`;
}


function createProductArt(product) {
    if (product.image) {
        return `<img src="${product.image}" alt="${product.name} 製品画像" loading="lazy">`;
    }

    const safeId = product.name.replace(/[^a-z0-9_-]/gi, "-");
    const color = product.kind === "rfid" || product.kind === "sled" ? "#4b2e83" : product.kind === "scanner" ? "#5d36a1" : product.kind === "config" ? "#6f2dbd" : "#4b2e83";
    const isScanner = product.kind === "scanner";
    const isRfid = product.kind === "rfid" || product.kind === "sled";
    const isKeypad = product.kind === "keypad";
    const isConfig = product.kind === "config";
    const isInstrument = product.kind === "instrument";

    if (isScanner) {
        return `
            <svg viewBox="0 0 360 230" role="img" aria-label="${product.name} 製品画像">
                <defs>
                    <linearGradient id="body-${safeId}" x1="0" x2="1"><stop stop-color="#101218"/><stop offset="1" stop-color="#292733"/></linearGradient>
                    <filter id="shadow-${safeId}" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="12" stdDeviation="12" flood-color="#12051f" flood-opacity=".22"/></filter>
                </defs>
                <rect x="94" y="62" width="156" height="58" rx="18" fill="url(#body-${safeId})" filter="url(#shadow-${safeId})"/>
                <path d="M238 76h48c18 0 30 13 30 31v19h-52c-15 0-26-10-26-24Z" fill="#151821"/>
                <path d="M112 116h98l22 62H132c-14 0-24-8-28-22Z" fill="#1f222c"/>
                <rect x="120" y="80" width="72" height="24" rx="6" fill="${color}"/>
                <rect x="204" y="82" width="30" height="20" rx="5" fill="#f8f9fb"/>
                <circle cx="283" cy="104" r="13" fill="#f8f9fb"/>
                <circle cx="283" cy="104" r="7" fill="#8ea4a3"/>
                <path d="M137 143h70l8 22h-70Z" fill="${color}" opacity=".82"/>
            </svg>`;
    }

    if (isRfid) {
        return `
            <svg viewBox="0 0 360 230" role="img" aria-label="${product.name} 製品画像">
                <defs>
                    <linearGradient id="rfid-${safeId}" x1="0" x2="1"><stop stop-color="#11131a"/><stop offset="1" stop-color="#2d2b36"/></linearGradient>
                    <filter id="rfid-shadow-${safeId}" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="14" stdDeviation="14" flood-color="#12051f" flood-opacity=".24"/></filter>
                </defs>
                <rect x="88" y="42" width="96" height="154" rx="20" fill="url(#rfid-${safeId})" filter="url(#rfid-shadow-${safeId})"/>
                <rect x="105" y="58" width="62" height="72" rx="8" fill="#202535"/>
                <rect x="115" y="141" width="42" height="38" rx="5" fill="#0f1118"/>
                <circle cx="126" cy="153" r="4" fill="#b7c6c0"/><circle cx="146" cy="153" r="4" fill="#b7c6c0"/>
                <path d="M184 72h84c18 0 32 14 32 32v56c0 16-12 30-28 32l-88 11Z" fill="#181b24" filter="url(#rfid-shadow-${safeId})"/>
                <path d="M205 92h50c16 0 28 12 28 28v20c0 16-12 28-28 28h-50Z" fill="${color}"/>
                <path d="M222 103c24 20 24 43 0 62" fill="none" stroke="#fff" stroke-opacity=".62" stroke-width="5"/>
            </svg>`;
    }

    if (isConfig) {
        return `
            <svg viewBox="0 0 360 230" role="img" aria-label="${product.name} configuration image">
                <rect x="62" y="48" width="236" height="136" rx="18" fill="#151821"/>
                <rect x="82" y="70" width="74" height="92" rx="10" fill="#262b36"/>
                <rect x="95" y="84" width="48" height="52" rx="5" fill="#f6f3fb"/>
                <rect x="176" y="70" width="92" height="18" rx="4" fill="${color}"/>
                <rect x="176" y="106" width="82" height="12" rx="3" fill="#d8d2e4"/>
                <rect x="176" y="130" width="62" height="12" rx="3" fill="#d8d2e4"/>
                <path d="M88 184h184" stroke="#4b2e83" stroke-width="10" stroke-linecap="round"/>
                <circle cx="296" cy="65" r="24" fill="${color}"/>
                <path d="M286 64l8 8 16-18" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`;
    }

    if (isInstrument) {
        return `
            <svg viewBox="0 0 360 230" role="img" aria-label="${product.name} instrument image">
                <defs>
                    <linearGradient id="instrument-${safeId}" x1="0" x2="1"><stop stop-color="#11131a"/><stop offset="1" stop-color="#2d2b36"/></linearGradient>
                    <filter id="instrument-shadow-${safeId}" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="14" stdDeviation="14" flood-color="#12051f" flood-opacity=".24"/></filter>
                </defs>
                <rect x="72" y="54" width="216" height="126" rx="18" fill="url(#instrument-${safeId})" filter="url(#instrument-shadow-${safeId})"/>
                <rect x="94" y="76" width="104" height="58" rx="8" fill="#f6f3fb"/>
                <rect x="108" y="88" width="76" height="34" rx="4" fill="#202535"/>
                <rect x="214" y="78" width="48" height="18" rx="5" fill="${color}"/>
                <circle cx="224" cy="126" r="9" fill="#d8d2e4"/>
                <circle cx="252" cy="126" r="9" fill="#d8d2e4"/>
                <path d="M94 157h168" stroke="${color}" stroke-width="8" stroke-linecap="round"/>
                <path d="M76 70l-24 14v70l24 14Z" fill="${color}" opacity=".82"/>
            </svg>`;
    }

    return `
        <svg viewBox="0 0 360 230" role="img" aria-label="${product.name} 製品画像">
            <defs>
                <linearGradient id="pda-${safeId}" x1="0" x2="1"><stop stop-color="#11131a"/><stop offset="1" stop-color="#2d2b36"/></linearGradient>
                <filter id="pda-shadow-${safeId}" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="14" stdDeviation="14" flood-color="#12051f" flood-opacity=".24"/></filter>
            </defs>
            <rect x="114" y="24" width="132" height="182" rx="22" fill="url(#pda-${safeId})" filter="url(#pda-shadow-${safeId})"/>
            <rect x="132" y="46" width="96" height="${isKeypad ? 74 : 108}" rx="8" fill="#f5f3fa"/>
            <rect x="142" y="58" width="76" height="${isKeypad ? 50 : 84}" rx="4" fill="#232838"/>
            <rect x="127" y="164" width="106" height="26" rx="7" fill="${color}" opacity=".9"/>
            <circle cx="180" cy="178" r="7" fill="#f4f1f7"/>
            ${isKeypad ? Array.from({ length: 12 }, (_, i) => {
                const x = 139 + (i % 3) * 28;
                const y = 130 + Math.floor(i / 3) * 14;
                return `<rect x="${x}" y="${y}" width="18" height="8" rx="3" fill="#d8d2e4"/>`;
            }).join("") : `<rect x="156" y="28" width="48" height="5" rx="3" fill="#3d4150"/>`}
            <path d="M114 70h-14v76h14Z" fill="${color}"/>
            <path d="M246 88h14v42h-14Z" fill="${color}"/>
        </svg>`;
}

function renderCategoryPage(categoryKey) {
    const category = GYUTRON_PRODUCTS[categoryKey] || GYUTRON_PRODUCTS["android-pda"];
    if (category.redirectTo) {
        window.location.replace(`ja/${category.redirectTo}.html`);
        return;
    }

    const totalPages = Math.ceil(category.products.length / PRODUCTS_PER_PAGE);
    activePage = Math.min(activePage, totalPages);
    const pageStart = (activePage - 1) * PRODUCTS_PER_PAGE;
    const visible製品 = category.products.slice(pageStart, pageStart + PRODUCTS_PER_PAGE);

    document.title = `GYUTRON ${category.title} | ${category.eyebrow}`;
    document.documentElement.style.setProperty("--hero-image", `url("${category.heroImage}")`);

    const hero = document.querySelector("[data-product-hero]");
    hero.innerHTML = `
        <div>
            <span class="eyebrow">${category.eyebrow}</span>
            <h1>${category.title}</h1>
            <p>${category.intro}</p>
        </div>
        <aside class="hero-panel">
            <span>ポートフォリオ</span>
            <strong>${category.panelMetric}</strong>
            <p>${category.panelText}</p>
        </aside>
    `;

    document.querySelector("[data-section-title]").textContent = category.sectionTitle || `${category.title} 製品`;
    document.querySelector("[data-section-intro]").textContent = category.sectionIntro || "モデル名、オプション、仕様はGYUTRONのポートフォリオに合わせて整理され、一般的な産業用デバイス分類を基準にしています。";

    const groupKey = category.navGroup || "rugged-pda";
    const categoryOrder = CATEGORY_GROUPS[groupKey] || CATEGORY_GROUPS["rugged-pda"];
    document.querySelector("[data-category-nav]").innerHTML = categoryOrder.map((key) => {
        const item = GYUTRON_PRODUCTS[key];
        return `<a class="${key === categoryKey ? "is-active" : ""}" href="ja/${key}.html">${item.navLabel}</a>`;
    }).join("");

    document.querySelector("[data-product-grid]").innerHTML = visible製品.map((product) => `
        <article class="product-card">
            <div class="product-art">${createProductArt(product)}</div>
            <div class="product-body">
                <div class="product-kicker">${localizeProductタイプ(product)}</div>
                <h3>${product.name}</h3>
                <p>${localizeProductSummary(product, category)}</p>
                <dl class="spec-list">
                    ${Object.entries(product.specs).map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("")}
                </dl>
                <div class="product-tags">${product.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
                <div class="product-actions">
                    <a href="ja/contact-sales.html">見積依頼</a>
                    <a href="ja/request-specification.html">仕様を比較</a>
                </div>
            </div>
        </article>
    `).join("");

    const pagination = document.querySelector("[data-pagination]");
    if (totalPages > 1) {
        pagination.innerHTML = `
            <span>${activePage} / ${totalPages} ページ</span>
            ${Array.from({ length: totalPages }, (_, index) => {
                const page = index + 1;
                return `<button class="${page === activePage ? "is-active" : ""}" type="button" data-page="${page}">${page}</button>`;
            }).join("")}
        `;
        pagination.hidden = false;
        pagination.querySelectorAll("button").forEach((button) => {
            button.addEventListener("click", () => {
                activePage = Number(button.dataset.page);
                renderCategoryPage(categoryKey);
                document.querySelector("[data-product-grid]").scrollIntoView({ behavior: "smooth", block: "start" });
            });
        });
    } else {
        pagination.innerHTML = "";
        pagination.hidden = true;
    }

    document.querySelector("[data-compare-table]").innerHTML = `
        <thead><tr><th>モデル</th><th>タイプ</th><th>主な機能</th><th>堅牢性</th></tr></thead>
        <tbody>
            ${category.products.map((product) => {
                const capability = product.specs.Scan || product.specs.RFID || product.specs.Device || product.specs.Codes || product.specs.Detection || product.specs.Measurement || product.specs.Sensor || product.specs.Range || product.specs.Parameter || "産業用データ収集";
                const rugged = product.specs.Rugged || product.specs.Temp || product.specs.Lead || product.specs.Housing || product.specs.Rating || product.specs.Output || product.specs.Data || "案件別";
                return `<tr><td>${product.name}</td><td>${localizeProductタイプ(product)}</td><td>${capability}</td><td>${rugged}</td></tr>`;
            }).join("")}
        </tbody>
    `;
}

function setupNavigation() {
    const navItems = Array.from(document.querySelectorAll(".nav-item"));
    const closeDelay = 520;
    const isTouchNavigation = () => window.matchMedia("(hover: none)").matches;

    const closeItem = (item) => {
        window.clearTimeout(item.closeTimer);
        item.closeTimer = window.setTimeout(() => {
            item.classList.remove("is-open");
            item.querySelectorAll(".mega-link-group.is-open").forEach((group) => group.classList.remove("is-open"));
        }, closeDelay);
    };

    const setActiveGroup = (groups, activeGroup) => {
        groups.forEach((group) => group.classList.toggle("is-open", group === activeGroup));
    };

    const openItem = (item, groups) => {
        navItems.forEach((otherItem) => {
            if (otherItem !== item) {
                window.clearTimeout(otherItem.closeTimer);
                otherItem.classList.remove("is-open");
                otherItem.querySelectorAll(".mega-link-group.is-open").forEach((group) => group.classList.remove("is-open"));
            }
        });

        window.clearTimeout(item.closeTimer);
        item.classList.add("is-open");

        if (groups.length && !groups.some((group) => group.classList.contains("is-open"))) {
            setActiveGroup(groups, groups[0]);
        }
    };

    navItems.forEach((item) => {
        const menu = item.querySelector(".mega-menu");
        if (!menu) {
            return;
        }

        const groups = Array.from(item.querySelectorAll(".mega-link-group"));
        const trigger = item.querySelector(".nav-trigger");
        trigger?.addEventListener("click", (event) => {
            if (isTouchNavigation() && !item.classList.contains("is-open")) {
                event.preventDefault();
                openItem(item, groups);
            }
        });

        item.addEventListener("pointerenter", () => openItem(item, groups));
        item.addEventListener("pointerleave", () => closeItem(item));
        menu.addEventListener("pointerenter", () => openItem(item, groups));
        menu.addEventListener("pointerleave", () => closeItem(item));
        item.addEventListener("focusin", () => openItem(item, groups));
        item.addEventListener("focusout", (event) => {
            if (!item.contains(event.relatedTarget)) {
                closeItem(item);
            }
        });

        groups.forEach((group) => {
            const groupTrigger = group.querySelector(".mega-link");
            groupTrigger?.addEventListener("click", (event) => {
                if (isTouchNavigation() && !group.classList.contains("is-open")) {
                    event.preventDefault();
                    openItem(item, groups);
                    setActiveGroup(groups, group);
                }
            });

            group.addEventListener("pointerenter", () => {
                openItem(item, groups);
                setActiveGroup(groups, group);
            });
            group.addEventListener("focusin", () => {
                openItem(item, groups);
                setActiveGroup(groups, group);
            });

            group.querySelectorAll(".submenu a").forEach((link) => {
                link.addEventListener("pointerenter", () => {
                    openItem(item, groups);
                    setActiveGroup(groups, group);
                });
                link.addEventListener("focus", () => {
                    openItem(item, groups);
                    setActiveGroup(groups, group);
                });
                link.addEventListener("click", (event) => {
                    event.stopPropagation();
                });
            });
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    renderCategoryPage(document.body.dataset.category);
    setupNavigation();
});
