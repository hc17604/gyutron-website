# Main Homepage Hero Archive

Archived on 2026-05-30 before rebuilding the main homepage hero again.

Source commit: `65c1fe9`

Use this file if the user asks to restore the original static homepage hero that existed before the animated carousel work.

## Static Hero CSS

```css
.hero {
    background:
        linear-gradient(90deg, rgba(4, 5, 8, 0.96) 0%, rgba(18, 5, 31, 0.84) 38%, rgba(18, 5, 31, 0.24) 100%),
        url("hero-industrial-automation.png") center / cover;
    color: var(--white);
    min-height: calc(100vh - 110px);
    padding: 88px 0 56px;
    position: relative;
}

.hero-grid {
    display: grid;
    gap: 56px;
    grid-template-columns: minmax(0, 1.02fr) minmax(360px, 0.72fr);
    min-height: 560px;
    align-items: center;
}

.hero-grid > * {
    min-width: 0;
}

.hero h1 {
    color: var(--white);
    font-size: clamp(46px, 6vw, 78px);
    font-weight: 900;
    letter-spacing: 0;
    line-height: 0.98;
    margin: 18px 0 24px;
    max-width: 790px;
}

.hero-copy {
    color: rgba(255, 255, 255, 0.82);
    font-size: 19px;
    max-width: 660px;
    overflow-wrap: break-word;
}
```

## Static Hero Markup

```html
<section class="hero">
    <div class="container">
        <div class="hero-grid">
            <div>
                <span class="eyebrow">GYUTRON Industrial Intelligence</span>
                <h1>Industrial intelligence for connected production.</h1>
                <p class="hero-copy">GYUTRON builds rugged intelligent hardware for modern factories and logistics teams: PDA terminals, industrial sensors, smart cameras, inspection instruments, robot workcells, and edge control systems designed to operate as one connected automation layer.</p>
                <div class="hero-actions">
                    <a class="button button-light" href="#products">Explore Products <i class="fa-solid fa-chevron-right"></i></a>
                    <a class="button button-outline" href="#solutions">View Solutions</a>
                </div>
                <div class="ticker">
                    <div class="ticker-label">Engineered for industrial environments</div>
                    <div class="ticker-grid">
                        <div class="ticker-item"><i class="fa-solid fa-check"></i> Manufacturing</div>
                        <div class="ticker-item"><i class="fa-solid fa-check"></i> Logistics</div>
                        <div class="ticker-item"><i class="fa-solid fa-check"></i> Inspection</div>
                        <div class="ticker-item"><i class="fa-solid fa-check"></i> Field Service</div>
                    </div>
                </div>
            </div>
            <aside class="hero-panel" aria-label="GYUTRON performance dashboard">
                <div class="hero-panel-title">Industrial intelligence stack</div>
                <div class="metric-row">
                    <div class="metric">
                        <strong>6</strong>
                        <span>Product families</span>
                    </div>
                    <div class="metric">
                        <strong>10K+</strong>
                        <span>Daily data events</span>
                    </div>
                    <div class="metric">
                        <strong>24/7</strong>
                        <span>Operational readiness</span>
                    </div>
                </div>
            </aside>
        </div>
    </div>
</section>
```
