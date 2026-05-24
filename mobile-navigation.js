(function () {
    function cloneWithoutIcons(element) {
        const clone = element.cloneNode(true);
        clone.querySelectorAll("i, svg").forEach((icon) => icon.remove());
        return clone;
    }

    function normalizeText(value) {
        return (value || "").replace(/\s+/g, " ").trim();
    }

    function readAnchor(anchor) {
        const clone = cloneWithoutIcons(anchor);
        const strong = clone.querySelector("strong");
        const nestedSpan = clone.querySelector("span span");
        const label = normalizeText(strong ? strong.textContent : clone.textContent);
        const description = normalizeText(nestedSpan ? nestedSpan.textContent : "");
        return {
            label,
            description,
            href: anchor.getAttribute("href") || "#",
            children: []
        };
    }

    function readTrigger(trigger) {
        const clone = cloneWithoutIcons(trigger);
        return normalizeText(clone.textContent);
    }

    function readMegaMenu(menu) {
        const links = menu?.querySelector(".mega-links");
        if (!links) {
            return [];
        }

        const items = [];
        Array.from(links.children).forEach((child) => {
            if (child.classList.contains("mega-section-label")) {
                items.push({ type: "section", label: normalizeText(child.textContent) });
                return;
            }

            if (child.classList.contains("mega-link-group")) {
                const primary = child.querySelector(":scope > .mega-link");
                if (!primary) {
                    return;
                }
                const item = readAnchor(primary);
                item.children = Array.from(child.querySelectorAll(":scope > .submenu > a")).map(readAnchor);
                items.push(item);
                return;
            }

            if (child.matches("a")) {
                items.push(readAnchor(child));
            }
        });

        return items;
    }

    function readDesktopNavigation() {
        return Array.from(document.querySelectorAll(".nav-item")).map((item) => {
            const trigger = item.querySelector(".nav-trigger");
            const menu = item.querySelector(".mega-menu");
            return {
                label: readTrigger(trigger),
                href: trigger?.getAttribute("href") || "#",
                children: readMegaMenu(menu)
            };
        }).filter((item) => item.label);
    }

    function makeChevronIcon() {
        const icon = document.createElement("i");
        icon.className = "fa-solid fa-chevron-right";
        icon.setAttribute("aria-hidden", "true");
        return icon;
    }

    function makeMenuIcon() {
        const icon = document.createElement("span");
        icon.className = "mobile-menu-icon";
        icon.setAttribute("aria-hidden", "true");
        icon.innerHTML = "<span></span><span></span><span></span>";
        return icon;
    }

    function createTextBlock(item) {
        const wrap = document.createElement("span");
        const label = document.createElement("span");
        label.className = "mobile-nav-label";
        label.textContent = item.label;
        wrap.appendChild(label);

        if (item.description) {
            const desc = document.createElement("span");
            desc.className = "mobile-nav-desc";
            desc.textContent = item.description;
            wrap.appendChild(desc);
        }

        return wrap;
    }

    function initMobileNavigation() {
        const header = document.querySelector(".site-header .container");
        const brand = header?.querySelector(".brand");
        const desktopNav = header?.querySelector(".nav");
        if (!header || !brand || !desktopNav || document.querySelector(".mobile-menu-toggle")) {
            return;
        }

        const contact = header.querySelector(".button-primary");
        const menuData = readDesktopNavigation();
        if (contact) {
            const contactLabel = normalizeText(contact.querySelector(".cta-label-full")?.textContent || contact.textContent);
            menuData.push({
                label: contactLabel,
                description: "Send a sales inquiry to the GYUTRON team.",
                href: contact.getAttribute("href") || "contact-sales.html",
                children: [],
                quick: true
            });
        }

        const toggle = document.createElement("button");
        toggle.className = "mobile-menu-toggle";
        toggle.type = "button";
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-controls", "mobile-navigation-panel");
        toggle.append("Menu", makeMenuIcon());
        brand.insertAdjacentElement("afterend", toggle);

        const panel = document.createElement("aside");
        panel.className = "mobile-nav-panel";
        panel.id = "mobile-navigation-panel";
        panel.setAttribute("aria-label", "Mobile navigation");
        panel.innerHTML = `
            <div class="mobile-nav-inner">
                <div class="mobile-nav-head">
                    <button class="mobile-nav-back" type="button" aria-hidden="true" aria-label="Back">&lt;</button>
                    <div class="mobile-nav-title">Menu</div>
                    <button class="mobile-nav-close" type="button" aria-label="Close menu">X</button>
                </div>
                <ul class="mobile-nav-list"></ul>
            </div>
        `;
        document.body.appendChild(panel);

        const title = panel.querySelector(".mobile-nav-title");
        const back = panel.querySelector(".mobile-nav-back");
        const close = panel.querySelector(".mobile-nav-close");
        const list = panel.querySelector(".mobile-nav-list");
        const stack = [{ title: "Menu", items: menuData }];

        const closeMenu = () => {
            document.body.classList.remove("mobile-nav-open");
            toggle.setAttribute("aria-expanded", "false");
            stack.splice(1);
            render();
        };

        const openMenu = () => {
            document.body.classList.add("mobile-nav-open");
            toggle.setAttribute("aria-expanded", "true");
            render();
        };

        const render = () => {
            const level = stack[stack.length - 1];
            title.textContent = level.title;
            back.setAttribute("aria-hidden", String(stack.length === 1));
            back.disabled = stack.length === 1;
            list.innerHTML = "";

            level.items.forEach((item) => {
                const li = document.createElement("li");

                if (item.type === "section") {
                    li.className = "mobile-nav-section";
                    li.textContent = item.label;
                    list.appendChild(li);
                    return;
                }

                if (item.children?.length) {
                    const button = document.createElement("button");
                    button.className = "mobile-nav-row";
                    button.type = "button";
                    button.append(createTextBlock(item), makeChevronIcon());
                    button.addEventListener("click", () => {
                        stack.push({ title: item.label, items: item.children });
                        render();
                    });
                    li.appendChild(button);
                } else {
                    const link = document.createElement("a");
                    link.className = `mobile-nav-link${item.quick ? " mobile-nav-quick" : ""}`;
                    link.href = item.href || "#";
                    link.append(createTextBlock(item), makeChevronIcon());
                    link.addEventListener("click", closeMenu);
                    li.appendChild(link);
                }

                list.appendChild(li);
            });
        };

        toggle.addEventListener("click", () => {
            if (document.body.classList.contains("mobile-nav-open")) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        close.addEventListener("click", closeMenu);
        back.addEventListener("click", () => {
            if (stack.length > 1) {
                stack.pop();
                render();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && document.body.classList.contains("mobile-nav-open")) {
                closeMenu();
            }
        });

        render();
    }

    document.addEventListener("DOMContentLoaded", initMobileNavigation);
})();
