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
        panelMetric: "8 models",
        panelText: "Wired, wireless, DPM, long-range, wearable, and industrial cradle options.",
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
                name: "GY-S300 DPM",
                type: "DPM code scanner",
                summary: "Scanner tuned for etched, dot-peen, low-contrast, and curved-surface industrial codes.",
                kind: "scanner",
                image: "product-images/gy-s300-dpm.png",
                specs: { Scan: "DPM / 1D / 2D", Lighting: "White + polarizer", Codes: "Metal, plastic, labels", Rugged: "IP65 / 1.8 m drop" },
                tags: ["DPM", "AI decode", "Manufacturing"]
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
        eyebrow: "Industrial Sensors",
        title: "Industrial Sensors",
        navLabel: "Industrial Sensors",
        heroImage: "product-hero-industrial-sensors-matrix.png",
        intro: "Reliable sensing hardware for presence detection, positioning, pressure monitoring, environmental checks, and machine data capture.",
        panelMetric: "9 models",
        panelText: "Photoelectric, inductive, laser, pressure, environmental, and network-ready sensing options.",
        sectionIntro: "GYUTRON sensor models are structured around common factory automation applications: object detection, precise positioning, process monitoring, and device connectivity.",
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
        eyebrow: "Industrial Smart Cameras",
        title: "Smart Cameras",
        navLabel: "Smart Cameras",
        heroImage: "product-hero-smart-cameras-matrix.png",
        intro: "Embedded machine vision cameras for inspection, guidance, code reading, AI classification, and traceability workflows.",
        panelMetric: "7 models",
        panelText: "2D, AI, line-scan, 3D, code reading, color, and vision-control options.",
        sectionIntro: "GYUTRON smart camera models follow common machine vision deployment patterns: embedded inspection, distributed line-side checks, 3D profiling, and fixed code reading.",
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
        eyebrow: "Inspection Instruments",
        title: "Inspection Instruments",
        navLabel: "Inspection Instruments",
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
GYUTRON_PRODUCTS["smart-cameras"].navGroup = "cameras";
GYUTRON_PRODUCTS["inspection-instruments"].navGroup = "instruments";

Object.assign(GYUTRON_PRODUCTS, {
    "proximity-sensors": {
        eyebrow: "Industrial Sensors",
        title: "Proximity Sensors",
        navLabel: "Proximity Sensors",
        navGroup: "sensors",
        heroImage: "product-hero-industrial-sensors-matrix.png",
        intro: "Presence and object-detection sensors for fixtures, conveyors, machine doors, part handling, and safety-adjacent automation.",
        panelMetric: "5 models",
        panelText: "Inductive, photoelectric, ultrasonic, safety, and networked proximity detection options.",
        sectionIntro: "Proximity sensing is organized around practical factory detection tasks: metal target checks, part presence, transparent-object handling, and distributed IO diagnostics.",
        products: getProductsByName(["GY-PR12", "GY-PX18", "GY-UL80", "GY-SAFE24", "GY-NET8"])
    },
    "laser-measurement": {
        eyebrow: "Industrial Sensors",
        title: "Laser Measurement",
        navLabel: "Laser Measurement",
        navGroup: "sensors",
        heroImage: "product-hero-industrial-sensors-matrix.png",
        intro: "Non-contact measurement hardware for distance, height, gap, position, and repeatable process checks.",
        panelMetric: "4 models",
        panelText: "Laser displacement, ultrasonic distance, fiber sensing, and IO-Link data collection options.",
        sectionIntro: "Laser and non-contact measurement devices support dimensional checks, line-side positioning, fixture confirmation, and process monitoring.",
        products: getProductsByName(["GY-LD40", "GY-UL80", "GY-FB200", "GY-NET8"])
    },
    "environmental-sensing": {
        eyebrow: "Industrial Sensors",
        title: "Environmental Sensing",
        navLabel: "Environmental Sensing",
        navGroup: "sensors",
        heroImage: "product-hero-industrial-sensors-matrix.png",
        intro: "Condition monitoring products for cabinets, pneumatic systems, humidity, temperature, vibration, and operating environment visibility.",
        panelMetric: "4 models",
        panelText: "Environmental, pressure, ultrasonic, and network-hub monitoring products.",
        sectionIntro: "Environmental sensing pages focus on the operating conditions that influence uptime, quality stability, and maintenance decisions.",
        products: getProductsByName(["GY-ENV32", "GY-PS60", "GY-UL80", "GY-NET8"])
    },
    "area-scan-cameras": {
        eyebrow: "Industrial Smart Cameras",
        title: "Area Scan Cameras",
        navLabel: "Area Scan Cameras",
        navGroup: "cameras",
        heroImage: "product-hero-smart-cameras-matrix.png",
        intro: "2D area-scan smart cameras for presence checks, assembly verification, metrology, guidance, and label inspection.",
        panelMetric: "4 models",
        panelText: "Compact, high-speed, AI-assisted, and controller-supported area-scan options.",
        sectionIntro: "Area-scan camera pages focus on 2D inspection tasks where a full frame image is needed for repeatable quality checks.",
        products: getProductsByName(["GY-V120", "GY-V380 Pro", "GY-V280 AI", "GY-VC8"])
    },
    "smart-vision-sensors": {
        eyebrow: "Industrial Smart Cameras",
        title: "Smart Vision Sensors",
        navLabel: "Smart Vision Sensors",
        navGroup: "cameras",
        heroImage: "product-hero-smart-cameras-matrix.png",
        intro: "Compact embedded vision sensors for line-side pass / fail inspection, AI classification, OCR, and guided setup.",
        panelMetric: "4 models",
        panelText: "AI vision, compact smart-camera, code-reading, and controller-supported options.",
        sectionIntro: "Smart vision sensors are structured for practical automation teams that need embedded tools without a heavy PC vision stack.",
        products: getProductsByName(["GY-V280 AI", "GY-V120", "GY-CR390", "GY-VC8"])
    },
    "code-reading-cameras": {
        eyebrow: "Industrial Smart Cameras",
        title: "Code Reading Cameras",
        navLabel: "Code Reading Cameras",
        navGroup: "cameras",
        heroImage: "product-hero-smart-cameras-matrix.png",
        intro: "Fixed and handheld image-based readers for barcode, QR, Data Matrix, DPM, and regulated traceability workflows.",
        panelMetric: "4 models",
        panelText: "Fixed code reader, compact camera, DPM scanner, and verification instrument options.",
        sectionIntro: "Code reading products are grouped around read-rate performance, DPM capability, print quality, and traceability record keeping.",
        products: getProductsByName(["GY-CR390", "GY-V120", "GY-S300 DPM", "GY-CV100"])
    },
    "vision-lighting": {
        eyebrow: "Industrial Smart Cameras",
        title: "Vision Lighting",
        navLabel: "Vision Lighting",
        navGroup: "cameras",
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
        eyebrow: "Inspection Instruments",
        title: "Dimensional Gauges",
        navLabel: "Dimensional Gauges",
        navGroup: "instruments",
        heroImage: "product-hero-inspection-instruments-matrix.png",
        intro: "Measurement tools for geometry, alignment, height, gap, profile, and production tolerance checks.",
        panelMetric: "4 models",
        panelText: "Contact gauge, optical measurement, laser displacement, and 3D profile options.",
        sectionIntro: "Dimensional gauges combine contact and non-contact measurement tools for production engineers and quality teams.",
        products: getProductsByName(["GY-MG50", "GY-VM200", "GY-LD40", "GY-V3D90"])
    },
    "surface-inspection": {
        eyebrow: "Inspection Instruments",
        title: "Surface Inspection",
        navLabel: "Surface Inspection",
        navGroup: "instruments",
        heroImage: "product-hero-inspection-instruments-matrix.png",
        intro: "Inspection devices for roughness, scratches, finish defects, web surfaces, and variable visual conditions.",
        panelMetric: "4 models",
        panelText: "Portable roughness, AI camera, 3D profile, and line-scan inspection options.",
        sectionIntro: "Surface inspection pages group tools that help teams evaluate finish quality, texture, geometry, and continuous materials.",
        products: getProductsByName(["GY-SF30", "GY-V280 AI", "GY-V3D90", "GY-VL2048"])
    },
    "portable-testers": {
        eyebrow: "Inspection Instruments",
        title: "Portable Testers",
        navLabel: "Portable Testers",
        navGroup: "instruments",
        heroImage: "product-hero-inspection-instruments-matrix.png",
        intro: "Handheld and bench-ready testers for maintenance, measurement, barcode verification, and condition checks.",
        panelMetric: "4 models",
        panelText: "Electrical, surface, code-verification, and environmental test options.",
        sectionIntro: "Portable testers are selected for maintenance teams and quality engineers who need quick checks away from fixed stations.",
        products: getProductsByName(["GY-ET75", "GY-SF30", "GY-CV100", "GY-ENV32"])
    },
    "calibration-tools": {
        eyebrow: "Inspection Instruments",
        title: "Calibration Tools",
        navLabel: "Calibration Tools",
        navGroup: "instruments",
        heroImage: "product-hero-inspection-instruments-matrix.png",
        intro: "Calibration and verification accessories for machine vision, metrology, code quality, and measurement lifecycle documentation.",
        panelMetric: "4 models",
        panelText: "Grid target, gauge block, light reference, and barcode verification tools.",
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
            },
            { ...getProductsByName(["GY-CV100"])[0], type: "Code grading verifier" }
        ]
    }
});

const CATEGORY_GROUPS = {
    "rugged-pda": ["android-pda", "rfid-handhelds", "barcode-scanners", "request-specification"],
    "sensors": ["industrial-sensors", "proximity-sensors", "laser-measurement", "environmental-sensing"],
    "cameras": ["smart-cameras", "area-scan-cameras", "smart-vision-sensors", "code-reading-cameras", "vision-lighting"],
    "instruments": ["inspection-instruments", "dimensional-gauges", "surface-inspection", "portable-testers", "calibration-tools"]
};
let activePage = 1;
const PRODUCTS_PER_PAGE = 6;

function createProductArt(product) {
    if (product.image) {
        return `<img src="${product.image}" alt="${product.name} product image" loading="lazy">`;
    }

    const safeId = product.name.replace(/[^a-z0-9_-]/gi, "-");
    const color = product.kind === "rfid" || product.kind === "sled" ? "#4b2e83" : product.kind === "scanner" ? "#5d36a1" : product.kind === "config" ? "#6f2dbd" : "#4b2e83";
    const isScanner = product.kind === "scanner";
    const isRfid = product.kind === "rfid" || product.kind === "sled";
    const isKeypad = product.kind === "keypad";
    const isConfig = product.kind === "config";

    if (isScanner) {
        return `
            <svg viewBox="0 0 360 230" role="img" aria-label="${product.name} product image">
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
            <svg viewBox="0 0 360 230" role="img" aria-label="${product.name} product image">
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

    return `
        <svg viewBox="0 0 360 230" role="img" aria-label="${product.name} product image">
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
    const totalPages = Math.ceil(category.products.length / PRODUCTS_PER_PAGE);
    activePage = Math.min(activePage, totalPages);
    const pageStart = (activePage - 1) * PRODUCTS_PER_PAGE;
    const visibleProducts = category.products.slice(pageStart, pageStart + PRODUCTS_PER_PAGE);

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
            <span>Portfolio</span>
            <strong>${category.panelMetric}</strong>
            <p>${category.panelText}</p>
        </aside>
    `;

    document.querySelector("[data-section-title]").textContent = category.sectionTitle || `${category.title} products`;
    document.querySelector("[data-section-intro]").textContent = category.sectionIntro || "Model names, options, and specifications are structured for GYUTRON's portfolio and use common industrial device classes as benchmarks.";

    const groupKey = category.navGroup || "rugged-pda";
    const categoryOrder = CATEGORY_GROUPS[groupKey] || CATEGORY_GROUPS["rugged-pda"];
    document.querySelector("[data-category-nav]").innerHTML = categoryOrder.map((key) => {
        const item = GYUTRON_PRODUCTS[key];
        return `<a class="${key === categoryKey ? "is-active" : ""}" href="${key}.html">${item.navLabel}</a>`;
    }).join("");

    document.querySelector("[data-product-grid]").innerHTML = visibleProducts.map((product) => `
        <article class="product-card">
            <div class="product-art">${createProductArt(product)}</div>
            <div class="product-body">
                <div class="product-kicker">${product.type}</div>
                <h3>${product.name}</h3>
                <p>${product.summary}</p>
                <dl class="spec-list">
                    ${Object.entries(product.specs).map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("")}
                </dl>
                <div class="product-tags">${product.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
                <div class="product-actions">
                    <a href="contact-sales.html">Request quote</a>
                    <a href="request-specification.html">Compare spec</a>
                </div>
            </div>
        </article>
    `).join("");

    const pagination = document.querySelector("[data-pagination]");
    if (totalPages > 1) {
        pagination.innerHTML = `
            <span>Page ${activePage} of ${totalPages}</span>
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
        <thead><tr><th>Model</th><th>Type</th><th>Core capability</th><th>Rugged rating</th></tr></thead>
        <tbody>
            ${category.products.map((product) => {
                const capability = product.specs.Scan || product.specs.RFID || product.specs.Device || product.specs.Codes || product.specs.Detection || product.specs.Measurement || product.specs.Sensor || product.specs.Range || product.specs.Parameter || "Industrial data capture";
                const rugged = product.specs.Rugged || product.specs.Temp || product.specs.Lead || product.specs.Housing || product.specs.Rating || product.specs.Output || product.specs.Data || "Project-based";
                return `<tr><td>${product.name}</td><td>${product.type}</td><td>${capability}</td><td>${rugged}</td></tr>`;
            }).join("")}
        </tbody>
    `;
}

function setupNavigation() {
    const navItems = Array.from(document.querySelectorAll(".nav-item"));
    const closeDelay = 520;

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
            group.addEventListener("pointerenter", () => {
                openItem(item, groups);
                setActiveGroup(groups, group);
            });
            group.addEventListener("focusin", () => {
                openItem(item, groups);
                setActiveGroup(groups, group);
            });
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    renderCategoryPage(document.body.dataset.category);
    setupNavigation();
});
