const GYUTRON_PRODUCTS = {
    "android-pda": {
        eyebrow: "Rugged PDA Terminals",
        title: "Android PDA",
        navLabel: "Android PDA",
        heroImage: "product-hero-android-pda-matrix.png",
        intro: "Rugged Android handhelds for warehouse, manufacturing, field service, and line-side data capture.",
        panelMetric: "6 models",
        panelText: "Touch, keypad, scan handle, cold chain, and long-life battery options.",
        products: [
            {
                name: "GY-A50",
                type: "Compact Android PDA",
                summary: "Pocketable 5-inch terminal for receiving, picking, stock counts, and line-side verification.",
                kind: "pda",
                image: "product-images/gy-a50.png",
                specs: { OS: "Android 14", Display: "5.0 in HD", Scan: "1D/2D imager", Rugged: "IP67 / 1.6 m drop" },
                tags: ["Wi-Fi 6", "NFC", "4500 mAh"]
            },
            {
                name: "GY-A55 Pro",
                type: "All-purpose PDA",
                summary: "Balanced handheld computer for logistics teams that need scanning, camera capture, and fast roaming.",
                kind: "pda",
                image: "product-images/gy-a55-pro.png",
                specs: { OS: "Android 14", Display: "5.5 in HD+", Scan: "Near/far 2D", Rugged: "IP67 / 1.8 m drop" },
                tags: ["4G LTE", "13 MP camera", "5000 mAh"]
            },
            {
                name: "GY-A60 Max",
                type: "Large-screen PDA",
                summary: "6-inch rugged terminal for mobile workflows with dense forms, WMS screens, and work instructions.",
                kind: "pda",
                image: "product-images/gy-a60-max.png",
                specs: { OS: "Android 14", Display: "6.0 in FHD", Scan: "High-speed 2D", Rugged: "IP68 / 1.8 m drop" },
                tags: ["6 GB RAM", "Wi-Fi 6E", "5800 mAh"]
            },
            {
                name: "GY-A62K",
                type: "Keypad PDA",
                summary: "Physical keypad model for glove use, repetitive scan tasks, and high-throughput warehouse teams.",
                kind: "keypad",
                image: "product-images/gy-a62k.png",
                specs: { OS: "Android 13", Display: "4.0 in touch", Scan: "1D/2D angled", Rugged: "IP65 / 1.8 m drop" },
                tags: ["29 keys", "Scan handle", "5200 mAh"]
            },
            {
                name: "GY-A70 Cold",
                type: "Cold-chain PDA",
                summary: "Rugged handheld for freezer aisles, food logistics, pharmaceutical storage, and outdoor winter work.",
                kind: "pda",
                image: "product-images/gy-a70-cold.png",
                specs: { OS: "Android 14", Display: "5.7 in glove touch", Scan: "Condensation-ready 2D", Rugged: "IP67 / -25 C" },
                tags: ["Heated window", "Hot swap", "6500 mAh"]
            },
            {
                name: "GY-A80 Ultra",
                type: "Ultra-rugged PDA",
                summary: "High-end field computer for utilities, yards, maintenance teams, and long-shift industrial operations.",
                kind: "pda",
                image: "product-images/gy-a80-ultra.png",
                specs: { OS: "Android 14", Display: "6.2 in FHD", Scan: "Extended range 2D", Rugged: "IP68 / 2.0 m drop" },
                tags: ["5G option", "GNSS", "7200 mAh"]
            }
        ]
    },
    "rfid-handhelds": {
        eyebrow: "Rugged PDA Terminals",
        title: "RFID Handhelds",
        navLabel: "RFID Handhelds",
        heroImage: "product-hero-rfid-handhelds-matrix.png",
        intro: "Android UHF RFID terminals for inventory, asset tracking, inbound logistics, retail stock rooms, and production traceability.",
        panelMetric: "4 models",
        panelText: "Built-in, long-range, 5G, and ergonomic RFID options.",
        products: [
            {
                name: "GY-R52 Compact",
                type: "Built-in UHF PDA",
                summary: "Compact RFID terminal for retail cycle counts, light warehouse work, and asset verification.",
                kind: "rfid",
                image: "product-images/gy-r52-compact.png",
                specs: { OS: "Android 14", RFID: "UHF up to 4 m", Scan: "1D/2D optional", Rugged: "IP65 / 1.5 m drop" },
                tags: ["Internal antenna", "NFC", "4500 mAh"]
            },
            {
                name: "GY-R60 Grip",
                type: "Ergonomic RFID reader",
                summary: "Balanced pistol-grip reader for daily stock counts, pallet checks, and returns processing.",
                kind: "rfid",
                image: "product-images/gy-r60-grip.png",
                specs: { OS: "Android 13", RFID: "UHF up to 8 m", Scan: "2D imager", Rugged: "IP65 / 1.6 m drop" },
                tags: ["Circular antenna", "Wi-Fi 6", "6000 mAh"]
            },
            {
                name: "GY-R70 LongRange",
                type: "Long-range RFID reader",
                summary: "High-power UHF handheld for warehouse aisles, dock doors, and bulk tag collection.",
                kind: "rfid",
                image: "product-images/gy-r70-longrange.png",
                specs: { OS: "Android 14", RFID: "UHF up to 12 m", Scan: "2D + DPM option", Rugged: "IP67 / 1.8 m drop" },
                tags: ["33 dBm output", "5.5 in display", "7800 mAh"]
            },
            {
                name: "GY-R86 5G",
                type: "5G RFID terminal",
                summary: "Connected RFID computer for field asset teams that need wide-area data sync and secure Android apps.",
                kind: "rfid",
                image: "product-images/gy-r86-5g.png",
                specs: { OS: "Android 14", RFID: "UHF up to 10 m", Scan: "Near/far 2D", Rugged: "IP67 / 1.8 m drop" },
                tags: ["5G", "Dual-band GNSS", "7000 mAh"]
            }
        ]
    },
    "barcode-scanners": {
        eyebrow: "Rugged PDA Terminals",
        title: "Barcode Scanners",
        navLabel: "Barcode Scanners",
        heroImage: "product-hero-barcode-scanners-matrix.png",
        intro: "Industrial handheld barcode scanners for 1D, 2D, DPM, long-range, and wireless scan workflows.",
        panelMetric: "7 models",
        panelText: "Wired, wireless, cold-chain, long-range, wearable, presentation, and dock-door scan options.",
        products: [
            {
                name: "GY-S210",
                type: "Universal wired scanner",
                summary: "Durable area-imaging scanner for receiving desks, production benches, and packaging stations.",
                kind: "scanner",
                image: "product-images/gy-s210.png",
                specs: { Scan: "1D/2D area imager", Link: "USB-C / RS232", Motion: "Up to 4 m/s", Rugged: "IP54 / 1.5 m drop" },
                tags: ["Presentation mode", "White LED", "Fast decode"]
            },
            {
                name: "GY-S240W",
                type: "Wireless industrial scanner",
                summary: "Cordless scanner with base station for pick-pack, shipping, and flexible workcells.",
                kind: "scanner",
                image: "product-images/gy-s240w.png",
                specs: { Scan: "1D/2D area imager", Link: "2.4G / Bluetooth", Range: "Up to 80 m open field", Rugged: "IP54 / 1.5 m drop" },
                tags: ["Batch memory", "Cradle", "2200 mAh"]
            },
            {
                name: "GY-S330 Cold",
                type: "Cold-chain scanner",
                summary: "Wireless scanner for refrigerated warehouses, food processing, and low-temperature receiving.",
                kind: "scanner",
                image: "product-images/gy-s330-cold.png",
                specs: { Scan: "1D/2D", Link: "Bluetooth 5.2", Temp: "-30 C to 50 C", Rugged: "IP65 / 1.8 m drop" },
                tags: ["Anti-condensation", "Glove grip", "3200 mAh"]
            },
            {
                name: "GY-S360 XR",
                type: "Extended-range scanner",
                summary: "Long-range model for rack labels, dock doors, pallet positions, and forklift-adjacent scan tasks.",
                kind: "scanner",
                image: "product-images/gy-s360-xr.png",
                specs: { Scan: "Near/far 1D/2D", Range: "10 cm to 15 m", Link: "Bluetooth / USB", Rugged: "IP65 / 2.0 m drop" },
                tags: ["Long range", "Laser aimer", "Warehouse"]
            },
            {
                name: "GY-S410 Base",
                type: "Hands-free scan station",
                summary: "Desktop scan module for benchtop verification, kitting, and small-parts traceability stations.",
                kind: "scanner",
                image: "product-images/gy-s410-base.png",
                specs: { Scan: "2D presentation", Mount: "Desktop / fixture", Link: "USB / Ethernet option", Rugged: "Sealed front window" },
                tags: ["Auto trigger", "Fixture-ready", "White light"]
            },
            {
                name: "GY-S520 Wear",
                type: "Wearable ring scanner",
                summary: "Lightweight wearable scanner for hands-free picking, sorting, and replenishment tasks.",
                kind: "scanner",
                image: "product-images/gy-s520-wear.png",
                specs: { Scan: "1D/2D short range", Link: "Bluetooth 5.2", Battery: "Hot-swap 900 mAh", Rugged: "IP54 / 1.5 m drop" },
                tags: ["Wearable", "Hands-free", "Warehouse"]
            },
            {
                name: "GY-S680 Dock",
                type: "Industrial dock-door scanner",
                summary: "Fixed-position scanner for dock verification, pallet pass-through checks, and automated conveyor reads.",
                kind: "scanner",
                image: "product-images/gy-s680-dock.png",
                specs: { Scan: "Wide-angle 2D", Link: "Ethernet / USB", Trigger: "Photoeye input", Rugged: "IP65 metal housing" },
                tags: ["Dock door", "Conveyor", "Ethernet"]
            }
        ]
    },
    "request-specification": {
        eyebrow: "Rugged PDA Terminals",
        title: "Request Specification",
        sectionTitle: "Request Specification packs",
        navLabel: "Request Specification",
        heroImage: "product-hero-request-specification-matrix.png",
        intro: "Predefined configuration paths for buyers who want GYUTRON to match PDA, scanner, RFID, accessories, and software requirements.",
        panelMetric: "3 packs",
        panelText: "Use these as starting points for quotation, samples, or OEM / ODM discussion.",
        products: [
            {
                name: "GY-CONF-Scan",
                type: "Scan-only PDA package",
                summary: "Recommended baseline for warehouse teams that need Android PDA, 2D scan engine, dock, spare battery, and MDM profile.",
                kind: "config",
                image: "product-images/gy-conf-scan.png",
                specs: { Device: "A50 / A55 class", Scan: "Standard 2D", Accessories: "Dock + boot", Lead: "Sample in 7-10 days" },
                tags: ["Warehouse", "Inventory", "Starter kit"]
            },
            {
                name: "GY-CONF-RFID",
                type: "RFID inventory package",
                summary: "UHF reader bundle for bulk stock count, asset tagging, retail stock rooms, and warehouse receiving.",
                kind: "config",
                image: "product-images/gy-conf-rfid.png",
                specs: { Device: "R60 / R70 class", RFID: "8-12 m option", Accessories: "Grip + charger", Lead: "Sample in 10-14 days" },
                tags: ["UHF", "Asset tracking", "Bulk count"]
            },
            {
                name: "GY-CONF-DPM",
                type: "Manufacturing DPM package",
                summary: "DPM scanner and PDA option for etched metal codes, traceability stations, and production verification.",
                kind: "config",
                image: "product-images/gy-conf-dpm.png",
                specs: { Device: "S300 / A60 class", Codes: "DPM + QR + DataMatrix", Lighting: "White light", Lead: "Pilot in 2-3 weeks" },
                tags: ["DPM", "Traceability", "Quality"]
            }
        ]
    },
    "industrial-sensors": {
        eyebrow: "Sensing & I/O",
        title: "Sensing & I/O",
        navLabel: "Sensing & I/O",
        heroImage: "product-hero-industrial-sensors-matrix.png",
        intro: "Industrial sensing, measurement, safety, and IO hardware for machine builders and factory automation teams.",
        panelMetric: "9 models",
        panelText: "Presence detection, distance measurement, process monitoring, safety, and IO-Link connectivity.",
        sectionIntro: "GYUTRON sensing products are grouped by real factory jobs: detecting objects, measuring position, monitoring process conditions, protecting access points, and connecting distributed devices.",
        products: [
            {
                name: "GY-PX18",
                type: "Photoelectric sensor",
                summary: "Compact photoelectric sensor for conveyor detection, part presence, and general machine automation checks.",
                kind: "sensor",
                image: "product-images/gy-px18.png",
                specs: { Detection: "Diffuse / retroreflective", Range: "20 mm to 2.5 m", Output: "PNP / NPN", Housing: "IP67 compact" },
                tags: ["White light", "M12 cable", "Fast setup"]
            },
            {
                name: "GY-PR12",
                type: "Inductive proximity sensor",
                summary: "Metal target detection for fixtures, index tables, cylinders, tooling, and harsh machine positions.",
                kind: "sensor",
                image: "product-images/gy-pr12.png",
                specs: { Detection: "Ferrous / non-ferrous", Range: "2 to 8 mm", Output: "PNP / NPN", Housing: "M12 stainless IP67" },
                tags: ["Flush mount", "High repeatability", "Machine tools"]
            },
            {
                name: "GY-LD40",
                type: "Laser displacement sensor",
                summary: "Non-contact distance and height measurement for position checks, gap inspection, and presence verification.",
                kind: "sensor",
                image: "product-images/gy-ld40.png",
                specs: { Measurement: "40 mm class", Resolution: "10 um", Output: "IO-Link / analog", Housing: "IP67 metal" },
                tags: ["Laser position", "Analog output", "Gap check"]
            },
            {
                name: "GY-FB200",
                type: "Fiber amplifier sensor",
                summary: "Flexible fiber sensing for tight spaces, transparent targets, small parts, and difficult mounting conditions.",
                kind: "sensor",
                image: "product-images/gy-fb200.png",
                specs: { Channels: "Single / dual", Response: "80 us", Output: "PNP / NPN", Display: "Dual digital" },
                tags: ["Fiber head", "Tiny targets", "Teach button"]
            },
            {
                name: "GY-PS60",
                type: "Digital pressure sensor",
                summary: "Compact pressure monitoring for pneumatic lines, vacuum pick systems, leak checks, and process equipment.",
                kind: "sensor",
                image: "product-images/gy-ps60.png",
                specs: { Range: "-100 to 1000 kPa", Display: "3-color OLED", Output: "2 x switch + analog", Housing: "IP65" },
                tags: ["Vacuum", "Pneumatics", "Panel mount"]
            },
            {
                name: "GY-ENV32",
                type: "Environmental sensor",
                summary: "Monitors temperature, humidity, vibration, and cabinet conditions that can affect equipment uptime.",
                kind: "sensor",
                image: "product-images/gy-env32.png",
                specs: { Inputs: "Temp / RH / vibration", Network: "RS-485 / IO-Link", Power: "12-24 VDC", Housing: "IP54" },
                tags: ["Cabinet health", "Condition data", "Modbus"]
            },
            {
                name: "GY-UL80",
                type: "Ultrasonic distance sensor",
                summary: "Non-contact sensing for level, loop control, and irregular targets where optical sensors struggle.",
                kind: "sensor",
                image: "product-images/gy-ul80.png",
                specs: { Range: "80 to 1200 mm", Output: "Analog + switch", Beam: "Narrow cone", Housing: "IP67" },
                tags: ["Level", "Clear objects", "Dust tolerant"]
            },
            {
                name: "GY-SAFE24",
                type: "Safety light curtain",
                summary: "Protective sensing for machine openings, robotic stations, and operator access points.",
                kind: "sensor",
                image: "product-images/gy-safe24.png",
                specs: { Resolution: "24 mm", Height: "300 to 1200 mm", Safety: "Type 4 / PL e", Housing: "IP65 aluminum" },
                tags: ["Machine safety", "Muting option", "Alignment aid"]
            },
            {
                name: "GY-NET8",
                type: "Sensor network hub",
                summary: "Connects distributed sensors to industrial networks while simplifying diagnostics and wiring.",
                kind: "sensor",
                image: "product-images/gy-net8.png",
                specs: { Ports: "8 x M12 IO-Link", Network: "EtherNet/IP / PROFINET", Power: "24 VDC", Housing: "IP67" },
                tags: ["IO-Link", "Diagnostics", "IP67 hub"]
            }
        ]
    },
    "smart-cameras": {
        eyebrow: "Machine Vision Systems",
        title: "Machine Vision Systems",
        navLabel: "Machine Vision Systems",
        heroImage: "product-hero-smart-cameras-matrix.png",
        intro: "Embedded smart cameras, fixed code readers, line-scan systems, 3D vision, controllers, and lighting accessories.",
        panelMetric: "7 models",
        panelText: "2D inspection, AI tools, line-scan, 3D profiling, code reading, and vision-control options.",
        sectionIntro: "GYUTRON machine vision products follow common deployment patterns: embedded inspection, traceability reading, continuous web inspection, 3D profiling, and controlled white-light illumination.",
        products: [
            {
                name: "GY-V120",
                type: "Compact smart camera",
                summary: "Entry smart camera for presence checks, label verification, orientation, and basic pass / fail inspection.",
                kind: "camera",
                image: "product-images/gy-v120.png",
                specs: { Sensor: "1.6 MP CMOS", Lens: "C-mount / fixed", Interface: "Ethernet + I/O", Rating: "IP67 housing" },
                tags: ["2D inspection", "Teach setup", "White light"]
            },
            {
                name: "GY-V280 AI",
                type: "AI vision sensor",
                summary: "Embedded AI inspection camera for defect detection, classification, OCR, and variable part appearance.",
                kind: "camera",
                image: "product-images/gy-v280-ai.png",
                specs: { Sensor: "2.8 MP global shutter", AI: "On-device inference", Interface: "GigE / discrete I/O", Rating: "IP67" },
                tags: ["AI tools", "OCR", "Defects"]
            },
            {
                name: "GY-V380 Pro",
                type: "High-speed smart camera",
                summary: "Fast embedded vision system for assembly verification, metrology, guidance, and line-side quality control.",
                kind: "camera",
                image: "product-images/gy-v380-pro.png",
                specs: { Sensor: "5 MP global shutter", Speed: "Up to 90 fps", Interface: "GigE / PROFINET", Rating: "IP67" },
                tags: ["High speed", "PLC ready", "Metrology"]
            },
            {
                name: "GY-V3D90",
                type: "3D profile camera",
                summary: "3D laser profile camera for height, volume, gap, bead, and surface feature measurement.",
                kind: "camera",
                image: "product-images/gy-v3d90.png",
                specs: { Profile: "3D laser triangulation", Range: "90 mm class", Interface: "GigE Vision", Rating: "IP65" },
                tags: ["3D profile", "Height check", "Robot guidance"]
            },
            {
                name: "GY-VL2048",
                type: "Line scan smart camera",
                summary: "Line scan inspection camera for continuous webs, labels, film, packaging, and high-speed surfaces.",
                kind: "camera",
                image: "product-images/gy-vl2048.png",
                specs: { Sensor: "2048 px line", Speed: "45 kHz", Interface: "GigE / encoder", Rating: "Industrial metal" },
                tags: ["Line scan", "Web inspection", "Encoder"]
            },
            {
                name: "GY-CR390",
                type: "Fixed code reader camera",
                summary: "Industrial image-based code reader for DPM, QR, barcode, and high-throughput traceability stations.",
                kind: "camera",
                image: "product-images/gy-cr390.png",
                specs: { Codes: "1D / 2D / DPM", Lens: "Liquid lens option", Interface: "Ethernet / RS-232", Rating: "IP65" },
                tags: ["DPM", "Traceability", "High read rate"]
            },
            {
                name: "GY-VC8",
                type: "Vision controller",
                summary: "Compact controller for multi-camera inspection cells, image storage, PLC exchange, and recipe management.",
                kind: "camera",
                image: "product-images/gy-vc8.png",
                specs: { Cameras: "Up to 8 devices", CPU: "Industrial AI module", Network: "PROFINET / EtherNet/IP", Storage: "512 GB option" },
                tags: ["Multi-camera", "Recipes", "Edge AI"]
            }
        ]
    },
    "inspection-instruments": {
        eyebrow: "Quality & Test Instruments",
        title: "Quality & Test Instruments",
        navLabel: "Quality & Test Instruments",
        heroImage: "product-hero-inspection-instruments-matrix.png",
        intro: "Portable and inline measurement instruments for dimensional checks, surface review, code grading, and quality documentation.",
        panelMetric: "5 models",
        panelText: "Dimensional, optical, surface, code-verification, and handheld electrical test instruments.",
        sectionIntro: "GYUTRON inspection instruments are designed as practical quality-control tools for production engineers, lab teams, maintenance groups, and integrators.",
        products: [
            {
                name: "GY-MG50",
                type: "Digital measurement gauge",
                summary: "Bench and fixture gauge for repeatable dimensional checks, go / no-go inspection, and SPC data capture.",
                kind: "instrument",
                image: "product-images/gy-mg50.png",
                specs: { Range: "50 mm stroke", Resolution: "1 um", Output: "USB / RS-485", Fixture: "Bench / inline" },
                tags: ["Dimensional", "SPC", "Fixture ready"]
            },
            {
                name: "GY-VM200",
                type: "Vision measuring instrument",
                summary: "Compact optical measurement station for small parts, edges, holes, slots, and profile verification.",
                kind: "instrument",
                image: "product-images/gy-vm200.png",
                specs: { Stage: "200 x 120 mm", Camera: "5 MP", Lighting: "White coaxial / ring", Output: "CSV / report" },
                tags: ["Optical", "Measurement", "Lab"]
            },
            {
                name: "GY-SF30",
                type: "Surface finish tester",
                summary: "Portable surface tester for roughness checks on machined parts, tooling, and incoming materials.",
                kind: "instrument",
                image: "product-images/gy-sf30.png",
                specs: { Parameter: "Ra / Rz / Rq", Stroke: "5.6 mm", Display: "Color LCD", Data: "USB export" },
                tags: ["Roughness", "Portable", "Machining"]
            },
            {
                name: "GY-CV100",
                type: "Barcode verifier",
                summary: "Verification instrument for barcode quality grading, print validation, and regulated traceability workflows.",
                kind: "instrument",
                image: "product-images/gy-cv100.png",
                specs: { Standards: "ISO / IEC grading", Codes: "1D / 2D / DPM", Light: "White calibrated", Report: "PDF / CSV" },
                tags: ["Code quality", "Traceability", "Reports"]
            },
            {
                name: "GY-ET75",
                type: "Industrial electrical tester",
                summary: "Handheld maintenance instrument for voltage, continuity, sensor power, and control-cabinet checks.",
                kind: "instrument",
                image: "product-images/gy-et75.png",
                specs: { Voltage: "600 V CAT III", Inputs: "V / ohm / mA", Display: "Backlit LCD", Data: "Bluetooth option" },
                tags: ["Maintenance", "Cabinet checks", "Portable"]
            }
        ]
    }
};

function getProductsByName(names) {
    const allProducts = Object.values(GYUTRON_PRODUCTS).flatMap((category) => category.products || []);
    return names.map((name) => {
        const product = allProducts.find((item) => item.name === name);
        if (!product) {
            throw new Error(`Missing product: ${name}`);
        }
        return { ...product };
    });
}

GYUTRON_PRODUCTS["industrial-sensors"].navGroup = "sensors";
GYUTRON_PRODUCTS["smart-cameras"].navGroup = "vision";
GYUTRON_PRODUCTS["inspection-instruments"].navGroup = "quality";

Object.assign(GYUTRON_PRODUCTS, {
    "proximity-sensors": {
        eyebrow: "Sensing & I/O",
        title: "Presence & Object Detection",
        navLabel: "Presence & Object Detection",
        navGroup: "sensors",
        heroImage: "product-hero-industrial-sensors-matrix.png",
        intro: "Photoelectric, inductive, fiber, ultrasonic, and safety sensing for part presence, fixtures, conveyors, and guarded stations.",
        panelMetric: "4 models",
        panelText: "Photoelectric, inductive, fiber, and safety sensing for clear detection jobs.",
        sectionIntro: "This page keeps detection products together instead of mixing them with measurement or condition-monitoring devices.",
        products: getProductsByName(["GY-PX18", "GY-PR12", "GY-FB200", "GY-SAFE24"])
    },
    "laser-measurement": {
        eyebrow: "Sensing & I/O",
        title: "Distance & Position Sensors",
        navLabel: "Distance & Position",
        navGroup: "sensors",
        heroImage: "product-hero-industrial-sensors-matrix.png",
        intro: "Non-contact laser and ultrasonic distance products for position checks, gap confirmation, level sensing, and machine feedback.",
        panelMetric: "2 models",
        panelText: "Laser displacement and ultrasonic distance sensing, without unrelated IO or fiber-amplifier products.",
        sectionIntro: "This category now uses a broader distance-and-position framing and only includes products that genuinely measure position or distance.",
        products: getProductsByName(["GY-LD40", "GY-UL80"])
    },
    "environmental-sensing": {
        eyebrow: "Sensing & I/O",
        title: "Process & Condition Monitoring",
        navLabel: "Process & Condition",
        navGroup: "sensors",
        heroImage: "product-hero-industrial-sensors-matrix.png",
        intro: "Pressure, temperature, humidity, vibration, and sensor-network products for uptime visibility and process stability.",
        panelMetric: "3 models",
        panelText: "Environmental monitoring, pneumatic pressure checks, and distributed IO diagnostics.",
        sectionIntro: "Process and condition products belong together because buyers use them to monitor machine health, cabinet conditions, pneumatic performance, and connected sensor status.",
        products: getProductsByName(["GY-PS60", "GY-ENV32", "GY-NET8"])
    },
    "area-scan-cameras": {
        eyebrow: "Machine Vision Systems",
        title: "Smart & Area Scan Cameras",
        navLabel: "Smart & Area Scan Cameras",
        navGroup: "vision",
        heroImage: "product-hero-smart-cameras-matrix.png",
        intro: "2D smart cameras for full-frame inspection, assembly verification, metrology, guidance, and AI-assisted checks.",
        panelMetric: "3 models",
        panelText: "Compact, AI-assisted, and high-speed area-scan options.",
        sectionIntro: "Area-scan products are cameras that capture a full image frame. Controllers and lighting are now kept in their own more relevant pages.",
        products: getProductsByName(["GY-V120", "GY-V280 AI", "GY-V380 Pro"])
    },
    "smart-vision-sensors": {
        eyebrow: "Machine Vision Systems",
        title: "Vision Controllers & 3D Systems",
        navLabel: "Controllers & 3D Vision",
        navGroup: "vision",
        heroImage: "product-hero-smart-cameras-matrix.png",
        intro: "Vision controllers, 3D profile cameras, and line-scan systems for larger inspection cells and higher-complexity applications.",
        panelMetric: "3 models",
        panelText: "Multi-camera control, 3D profiling, and continuous line-scan inspection.",
        sectionIntro: "This page now holds the vision products that are systems or advanced image-acquisition platforms, rather than compact single-purpose smart cameras.",
        products: getProductsByName(["GY-VC8", "GY-V3D90", "GY-VL2048"])
    },
    "code-reading-cameras": {
        eyebrow: "Machine Vision Systems",
        title: "Code Reading & Verification",
        navLabel: "Code Reading & Verification",
        navGroup: "vision",
        heroImage: "product-hero-smart-cameras-matrix.png",
        intro: "Fixed and handheld image-based readers for barcode, QR, Data Matrix, DPM, and regulated traceability workflows.",
        panelMetric: "3 models",
        panelText: "Fixed code reader, industrial DPM scanner, and code-quality verification instrument.",
        sectionIntro: "Traceability buyers think in terms of read rate, DPM capability, print quality, and records, so these products are grouped together even when form factors differ.",
        products: [
            ...getProductsByName(["GY-CR390"]),
            {
                name: "GY-S300 DPM",
                type: "DPM code scanner",
                summary: "Scanner tuned for etched, dot-peen, low-contrast, and curved-surface industrial codes.",
                kind: "scanner",
                image: "product-images/gy-s300-dpm.png",
                specs: { Scan: "DPM / 1D / 2D", Lighting: "White + polarizer", Codes: "Metal, plastic, labels", Rugged: "IP65 / 1.8 m drop" },
                tags: ["DPM", "AI decode", "Manufacturing"]
            },
            ...getProductsByName(["GY-CV100"])
        ]
    },
    "vision-lighting": {
        eyebrow: "Machine Vision Systems",
        title: "Vision Lighting & Optics",
        navLabel: "Vision Lighting & Optics",
        navGroup: "vision",
        heroImage: "product-hero-smart-cameras-matrix.png",
        intro: "White-light machine vision illumination accessories for stable imaging without color distortion or purple lighting effects.",
        panelMetric: "3 models",
        panelText: "Ring, bar, and dome lighting options for common inspection stations.",
        sectionIntro: "Vision lighting is separated because lighting choice often determines image stability, defect contrast, and inspection repeatability.",
        products: [
            {
                name: "GY-LR70",
                type: "White ring light",
                summary: "Compact ring light for lens-centered inspection, label checks, feature contrast, and small-part stations.",
                kind: "camera",
                image: "product-images/gy-lr70.png",
                specs: { Lighting: "White LED", Diameter: "70 mm", Control: "Strobe / constant", Mount: "C-mount adapter" },
                tags: ["Ring light", "White LED", "Lens mount"]
            },
            {
                name: "GY-LB220",
                type: "White bar light",
                summary: "Linear bar light for edge definition, conveyor inspection, packaging checks, and controlled side illumination.",
                kind: "camera",
                image: "product-images/gy-lb220.png",
                specs: { Lighting: "White LED", Length: "220 mm", Control: "PWM / strobe", Housing: "Finned aluminum" },
                tags: ["Bar light", "Side lighting", "Fixture-ready"]
            },
            {
                name: "GY-LDome120",
                type: "Dome light",
                summary: "Diffuse white dome light for reflective parts, curved surfaces, and low-glare vision inspection.",
                kind: "camera",
                image: "product-images/gy-ldome120.png",
                specs: { Lighting: "Diffuse white", Diameter: "120 mm", Opening: "Camera center port", Housing: "Aluminum dome" },
                tags: ["Dome", "Low glare", "Reflective parts"]
            }
        ]
    },
    "dimensional-gauges": {
        eyebrow: "Quality & Test Instruments",
        title: "Dimensional Gauges",
        navLabel: "Dimensional Gauges",
        navGroup: "quality",
        heroImage: "product-hero-inspection-instruments-matrix.png",
        intro: "Measurement tools for geometry, alignment, height, gap, profile, and production tolerance checks.",
        panelMetric: "2 models",
        panelText: "Contact gauge and optical measurement station options.",
        sectionIntro: "Dimensional gauges are kept to dedicated metrology instruments, while distance sensors and 3D profile cameras remain in their own automation categories.",
        products: getProductsByName(["GY-MG50", "GY-VM200"])
    },
    "surface-inspection": {
        eyebrow: "Quality & Test Instruments",
        title: "Surface Inspection",
        navLabel: "Surface Inspection",
        navGroup: "quality",
        heroImage: "product-hero-inspection-instruments-matrix.png",
        intro: "Dedicated surface-quality instruments for roughness, gloss, coating thickness, and visible finish checks.",
        panelMetric: "3 models",
        panelText: "Roughness, gloss, and coating-thickness tools without borrowing camera-system products.",
        sectionIntro: "Surface inspection now contains only dedicated surface-quality instruments, so line-scan cameras and AI cameras stay in machine vision.",
        products: [
            ...getProductsByName(["GY-SF30"]),
            {
                name: "GY-GL20",
                type: "Industrial gloss meter",
                summary: "Portable gloss meter for coating, molded-part, painted-metal, and finished-surface consistency checks.",
                kind: "instrument",
                specs: { Geometry: "60 degree", Range: "0 to 1000 GU", Repeatability: "+/- 0.2 GU", Data: "USB / Bluetooth" },
                tags: ["Gloss", "Coatings", "Finish control"]
            },
            {
                name: "GY-CT45",
                type: "Coating thickness tester",
                summary: "Handheld coating gauge for paint, plating, anodizing, and protective coating inspection on metal parts.",
                kind: "instrument",
                specs: { Range: "0 to 1500 um", Substrate: "Ferrous / non-ferrous", Probe: "Integrated", Data: "CSV export" },
                tags: ["Coating", "Paint", "Incoming QC"]
            }
        ]
    },
    "portable-testers": {
        eyebrow: "Quality & Test Instruments",
        title: "Portable Testers",
        navLabel: "Portable Testers",
        navGroup: "quality",
        heroImage: "product-hero-inspection-instruments-matrix.png",
        intro: "Handheld electrical, thermal, and signal testers for maintenance teams and field quality checks.",
        panelMetric: "3 models",
        panelText: "Electrical safety, loop-signal, and thermal diagnostic tools.",
        sectionIntro: "Portable testers are selected for maintenance teams and quality engineers who need quick checks away from fixed stations. Process sensors and environmental monitors stay in Sensing & I/O.",
        products: [
            ...getProductsByName(["GY-ET75"]),
            {
                name: "GY-LT40",
                type: "Loop signal tester",
                summary: "Portable loop calibrator for checking 4-20 mA sensor signals, control loops, and cabinet commissioning work.",
                kind: "instrument",
                specs: { Signal: "4-20 mA source / measure", Power: "24 V loop supply", Accuracy: "0.05% class", Display: "Backlit LCD" },
                tags: ["Loop check", "Commissioning", "Maintenance"]
            },
            {
                name: "GY-TH90",
                type: "Thermal spot tester",
                summary: "Non-contact temperature tester for cabinets, motors, bearings, and quick maintenance diagnostics.",
                kind: "instrument",
                specs: { Range: "-30 C to 650 C", Optics: "12:1", Emissivity: "Adjustable", Data: "Bluetooth option" },
                tags: ["Thermal", "Maintenance", "Cabinet checks"]
            }
        ]
    },
    "calibration-tools": {
        eyebrow: "Quality & Test Instruments",
        title: "Calibration Tools",
        navLabel: "Calibration Tools",
        navGroup: "quality",
        heroImage: "product-hero-inspection-instruments-matrix.png",
        intro: "Calibration and verification accessories for machine vision, metrology, code quality, and measurement lifecycle documentation.",
        panelMetric: "3 models",
        panelText: "Grid target, gauge block, and light-reference tools.",
        sectionIntro: "Calibration tools make inspection systems more repeatable by supporting setup verification, traceable checks, and documented maintenance routines.",
        products: [
            {
                name: "GY-CAL-Grid",
                type: "Vision calibration target",
                summary: "Precision grid target for camera setup, field calibration, lens distortion checks, and measurement alignment.",
                kind: "instrument",
                image: "product-images/gy-cal-grid.png",
                specs: { Pattern: "Ceramic grid", Size: "120 x 90 mm", Accuracy: "5 um class", Case: "Protective frame" },
                tags: ["Vision setup", "Grid target", "Metrology"]
            },
            {
                name: "GY-CAL-Block",
                type: "Gauge block kit",
                summary: "Reference block kit for fixture gauges, probe checks, dimensional setup, and routine verification.",
                kind: "instrument",
                image: "product-images/gy-cal-block.png",
                specs: { Material: "Hardened steel", Grade: "Workshop reference", Range: "1 to 50 mm", Case: "Indexed tray" },
                tags: ["Gauge blocks", "Probe check", "Fixture setup"]
            },
            {
                name: "GY-CAL-Light",
                type: "Light reference kit",
                summary: "White-light reference kit for vision lighting consistency, exposure setup, and inspection station checks.",
                kind: "instrument",
                image: "product-images/gy-cal-light.png",
                specs: { Reference: "White diffuser", Control: "Portable module", Output: "Check record", Use: "Vision stations" },
                tags: ["Light reference", "White balance", "Vision QA"]
            }
        ]
    }
});

const CATEGORY_GROUPS = {
    "rugged-pda": ["android-pda", "rfid-handhelds", "barcode-scanners", "request-specification"],
    "sensors": ["industrial-sensors", "proximity-sensors", "laser-measurement", "environmental-sensing"],
    "vision": ["smart-cameras", "area-scan-cameras", "smart-vision-sensors", "code-reading-cameras", "vision-lighting"],
    "quality": ["inspection-instruments", "dimensional-gauges", "surface-inspection", "portable-testers", "calibration-tools"]
};
