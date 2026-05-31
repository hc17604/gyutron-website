const GYUTRON_PRODUCTS = {
    "android-pda": {
        eyebrow: "Robuste PDA-Terminals",
        title: "Android-PDA",
        navLabel: "Android-PDA",
        heroImage: "product-hero-android-pda-matrix.png",
        intro: "Robuste Android-Handhelds für Lager, Fertigung, Field Service und liniennahe Datenerfassung.",
        panelMetric: "6 Modelle",
        panelText: "Touch-, Tastatur-, Scan-Griff-, Kühlketten- und Langzeitakku-Optionen.",
        products: [
            {
                name: "GY-A50",
                type: "Compact Android-PDA",
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
        eyebrow: "Robuste PDA-Terminals",
        title: "RFID-Handhelds",
        navLabel: "RFID-Handhelds",
        heroImage: "product-hero-rfid-handhelds-matrix.png",
        intro: "Android-UHF-RFID-Terminals für Inventur, Asset Tracking, Inbound-Logistik, Lagerbereiche und Produktionsrückverfolgbarkeit.",
        panelMetric: "4 Modelle",
        panelText: "Integrierte, Long-Range-, 5G- und ergonomische RFID-Optionen.",
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
        eyebrow: "Robuste PDA-Terminals",
        title: "Barcode-Scanner",
        navLabel: "Barcode-Scanner",
        heroImage: "product-hero-barcode-scanners-matrix.png",
        intro: "Industrielle Handheld-Barcode-Scanner für 1D-, 2D-, DPM-, Long-Range- und Wireless-Scan-Workflows.",
        panelMetric: "7 Modelle",
        panelText: "Kabelgebundene, kabellose, Kühlketten-, Long-Range-, Wearable-, Präsentations- und Tor-Scan-Optionen.",
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
        eyebrow: "Robuste PDA-Terminals",
        title: "Spezifikation anfordern",
        sectionTitle: "Spezifikation anfordern packs",
        navLabel: "Spezifikation anfordern",
        heroImage: "product-hero-request-specification-matrix.png",
        intro: "Vordefinierte Konfigurationspfade für Käufer, die PDA, Scanner, RFID, Zubehör und Softwareanforderungen abstimmen möchten.",
        panelMetric: "3 packs",
        panelText: "Nutzen Sie diese Optionen als Ausgangspunkt für Angebote, Muster oder OEM-/ODM-Abstimmungen.",
        products: [
            {
                name: "GY-CONF-Scan",
                type: "Scan-only PDA package",
                summary: "Recommended baseline for warehouse teams that need Android-PDA, 2D scan engine, dock, spare battery, and MDM profile.",
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
        intro: "Industrielle Sensorik-, Mess-, Sicherheits- und I/O-Hardware für Maschinenbauer und Fabrikautomationsteams.",
        panelMetric: "9 models",
        panelText: "Anwesenheitserkennung, Distanzmessung, Prozessüberwachung, Sicherheit und IO-Link-Konnektivität.",
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
                specs: { Resolution: "24 mm", Height: "300 to 1200 mm", Safety: "Typ 4 / PL e", Housing: "IP65 aluminum" },
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
        eyebrow: "Machine-Vision-Systeme",
        title: "Machine-Vision-Systeme",
        navLabel: "Machine-Vision-Systeme",
        heroImage: "product-hero-smart-cameras-matrix.png",
        intro: "Embedded Smart-Kameras, feste Codeleser, Line-Scan-Systeme, 3D-Vision, Controller und Beleuchtungszubehör.",
        panelMetric: "7 Modelle",
        panelText: "2D-Prüfung, KI-Tools, Line-Scan, 3D-Profiling, Codelesen und Vision-Control-Optionen.",
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
                name: "GY-V160 Compact",
                type: "Compact area scan camera",
                summary: "Small-format industrial camera for tight machine spaces, fixture checks, part presence, and label verification.",
                kind: "camera",
                image: "product-images/gy-v160-compact.png",
                specs: { Sensor: "1.6 MP global shutter", Lens: "C-mount", Interface: "GigE + trigger I/O", Rating: "IP65 metal" },
                tags: ["Compact body", "Global shutter", "Fixture-ready"]
            },
            {
                name: "GY-V240 Color",
                type: "Color inspection camera",
                summary: "Color area camera for packaging, label print, assembly color checks, and mixed-product verification.",
                kind: "camera",
                image: "product-images/gy-v240-color.png",
                specs: { Sensor: "2.4 MP color CMOS", Lens: "C-mount / liquid lens option", Interface: "GigE Vision", Rating: "IP65" },
                tags: ["Color inspection", "White light", "Label checks"]
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
                name: "GY-V320 Mono",
                type: "Monochrome area scan camera",
                summary: "High-contrast monochrome camera for metrology, edge detection, alignment, and feature inspection.",
                kind: "camera",
                image: "product-images/gy-v320-mono.png",
                specs: { Sensor: "3.2 MP mono global shutter", Pixel: "3.45 um", Interface: "GigE / strobe I/O", Rating: "IP65" },
                tags: ["Mono sensor", "Edge contrast", "Measurement"]
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
                name: "GY-V500 HR",
                type: "High-resolution area camera",
                summary: "High-resolution inspection camera for small defects, fine print, dense labels, and precision assembly checks.",
                kind: "camera",
                image: "product-images/gy-v500-hr.png",
                specs: { Sensor: "5.0 MP global shutter", Speed: "Up to 72 fps", Interface: "GigE Vision / USB3 option", Rating: "IP65" },
                tags: ["High resolution", "Fine detail", "Print quality"]
            },
            {
                name: "GY-V640 HS",
                type: "High-speed area scan camera",
                summary: "Fast area-scan model for moving parts, conveyor inspection, pick verification, and motion-sensitive capture.",
                kind: "camera",
                image: "product-images/gy-v640-hs.png",
                specs: { Sensor: "6.4 MP global shutter", Speed: "Up to 118 fps", Interface: "2.5GigE + encoder", Rating: "IP65" },
                tags: ["High speed", "Conveyor", "Encoder sync"]
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
            },
            {
                name: "GY-V3D150",
                type: "Wide-range 3D profile sensor",
                summary: "Wider field 3D sensor for robot guidance, bead inspection, tray localization, and height-map inspection.",
                kind: "camera",
                image: "product-images/gy-v3d150.png",
                specs: { Profile: "Blue laser triangulation", Range: "150 mm class", Points: "2048 profile points", Rating: "IP65" },
                tags: ["3D profile", "Wide range", "Robot cells"]
            },
            {
                name: "GY-VX12",
                type: "AI vision processor",
                summary: "Rack-style processing unit for multi-camera AI inspection, image archiving, and high-throughput production lines.",
                kind: "camera",
                image: "product-images/gy-vx12.png",
                specs: { Cameras: "Up to 12 streams", AI: "Industrial inference engine", Network: "2.5GigE / PROFINET", Storage: "2 TB option" },
                tags: ["AI processor", "Rack mount", "Multi-camera"]
            },
            {
                name: "GY-VIO16",
                type: "Vision I/O expansion module",
                summary: "Field I/O module for lighting triggers, encoder signals, reject gates, and inspection-cell synchronization.",
                kind: "camera",
                image: "product-images/gy-vio16.png",
                specs: { "I/O": "16 digital inputs / outputs", Timing: "10 us trigger path", Network: "EtherCAT / Ethernet", Rating: "IP67" },
                tags: ["Trigger I/O", "Encoder sync", "Cell wiring"]
            },
            {
                name: "GY-VFG4",
                type: "Industrial frame grabber",
                summary: "Frame-grabber module for high-bandwidth line-scan and specialty camera acquisition in inspection PCs.",
                kind: "camera",
                image: "product-images/gy-vfg4.png",
                specs: { Channels: "4 camera inputs", Bus: "PCIe x8", Throughput: "Up to 6.4 GB/s", SDK: "C / Python / .NET" },
                tags: ["Frame grabber", "Line scan", "High bandwidth"]
            },
            {
                name: "GY-VRG200",
                type: "Robot guidance 3D module",
                summary: "Compact 3D camera module for pick localization, robot path correction, bin edge finding, and fixture-free loading.",
                kind: "camera",
                image: "product-images/gy-vrg200.png",
                specs: { Mode: "3D + 2D acquisition", Range: "200 mm working class", Interface: "GigE Vision + I/O", Rating: "IP65" },
                tags: ["Robot guidance", "3D locate", "Flexible cells"]
            },
            {
                name: "GY-CR120",
                type: "Compact fixed code reader",
                summary: "Small fixed reader for label checks, carton tracking, component traceability, and tight machine mounting.",
                kind: "camera",
                image: "product-images/gy-cr120.png",
                specs: { Codes: "1D / 2D", Sensor: "1.2 MP global shutter", Illumination: "White LED", Rating: "IP65" },
                tags: ["Compact reader", "Traceability", "White LED"]
            },
            {
                name: "GY-CR520 DPM",
                type: "DPM fixed code reader",
                summary: "High-contrast reader for etched, laser-marked, dot-peen, and low-contrast codes on metal or plastic parts.",
                kind: "camera",
                image: "product-images/gy-cr520-dpm.png",
                specs: { Codes: "DPM / QR / Data Matrix", Lighting: "White + polarizer", Lens: "Autofocus option", Rating: "IP67" },
                tags: ["DPM", "Low contrast", "Manufacturing"]
            },
            {
                name: "GY-CR720 Conveyor",
                type: "High-speed code reader",
                summary: "Reader module for conveyor, sortation, package verification, and fast moving traceability lines.",
                kind: "camera",
                image: "product-images/gy-cr720-conveyor.png",
                specs: { Codes: "1D / 2D", Speed: "Up to 5 m/s", Field: "Wide-angle optics", Network: "Ethernet / RS-232" },
                tags: ["Conveyor", "High speed", "Wide field"]
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
                name: "GY-CV220 Inline",
                type: "Inline barcode verifier",
                summary: "Inline grading station for print quality, DPM verification, packaging compliance, and audit records.",
                kind: "camera",
                image: "product-images/gy-cv220-inline.png",
                specs: { Standards: "ISO / IEC grading", Codes: "1D / 2D / DPM", Light: "Calibrated white", Output: "PDF / CSV / API" },
                tags: ["Code grading", "Inline QA", "Audit trail"]
            },
            {
                name: "GY-RT800",
                type: "Multi-camera reader module",
                summary: "Tunnel-style reader module for multi-side package, tote, and tray code capture in logistics lines.",
                kind: "camera",
                image: "product-images/gy-rt800.png",
                specs: { Readers: "4 synchronized imagers", Field: "Multi-side capture", Trigger: "Photoeye / encoder", Network: "Ethernet / API" },
                tags: ["Tunnel read", "Logistics", "Multi-side"]
            },
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
            },
            {
                name: "GY-LBL150",
                type: "White backlight panel",
                summary: "Diffuse framed backlight for silhouette inspection, hole detection, outline measurement, and transparent-part checks.",
                kind: "camera",
                image: "product-images/gy-lbl150.png",
                specs: { Lighting: "Diffuse white", Area: "150 x 120 mm", Control: "Constant / strobe", Housing: "Finned aluminum frame" },
                tags: ["Backlight", "Silhouette", "Measurement"]
            },
            {
                name: "GY-LCX60",
                type: "Coaxial light module",
                summary: "Coaxial illumination for flat reflective surfaces, print inspection, alignment marks, and low-shadow imaging.",
                kind: "camera",
                image: "product-images/gy-lcx60.png",
                specs: { Lighting: "White coaxial", Aperture: "60 mm class", Control: "Strobe-ready", Mount: "C-mount path" },
                tags: ["Coaxial", "Reflective parts", "Print check"]
            },
            {
                name: "GY-LL300",
                type: "High-output line light",
                summary: "Long linear light for line-scan inspection, web materials, labels, film, and conveyor edge definition.",
                kind: "camera",
                image: "product-images/gy-ll300.png",
                specs: { Lighting: "White LED line", Length: "300 mm", Control: "High-current strobe", Cooling: "Finned housing" },
                tags: ["Line scan", "High output", "Web inspection"]
            },
            {
                name: "GY-LC4",
                type: "Four-channel strobe controller",
                summary: "Lighting controller for synchronized strobes, intensity recipes, encoder timing, and multi-light stations.",
                kind: "camera",
                image: "product-images/gy-lc4.png",
                specs: { Channels: "4 independent outputs", Timing: "1 us trigger resolution", Power: "24 VDC", Interface: "Ethernet / RS-485" },
                tags: ["Strobe control", "Recipes", "Multi-light"]
            },
            {
                name: "GY-OPT25",
                type: "Telecentric optics module",
                summary: "Telecentric lens module for dimensional inspection, low-distortion imaging, and repeatable measurement setups.",
                kind: "camera",
                image: "product-images/gy-opt25.png",
                specs: { Optics: "25 mm class telecentric", Sensor: "Up to 2/3 inch", Distortion: "<0.08%", Mount: "C-mount" },
                tags: ["Telecentric", "Metrology", "Low distortion"]
            }
        ]
    },
    "inspection-instruments": {
        eyebrow: "Quality & Test Instruments",
        title: "Quality & Test Instruments",
        navLabel: "Quality & Test Instruments",
        heroImage: "product-hero-inspection-instruments-matrix.png",
        intro: "Portable und inlinefähige Messgeräte für Maßprüfung, Oberflächenbewertung, Code-Grading und Qualitätsdokumentation.",
        panelMetric: "5 Modelle",
        panelText: "Maß-, optische, Oberflächen-, Code-Verifikations- und portable elektrische Prüfgeräte.",
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

function getProdukteByName(names) {
    const allProdukte = Object.values(GYUTRON_PRODUCTS).flatMap((category) => category.products || []);
    return names.map((name) => {
        const product = allProdukte.find((item) => item.name === name);
        if (!product) {
            throw new Error(`Missing product: ${name}`);
        }
        return { ...product };
    });
}

GYUTRON_PRODUCTS["industrial-sensors"].navGroup = "sensors";
GYUTRON_PRODUCTS["smart-cameras"].navGroup = "vision";
GYUTRON_PRODUCTS["inspection-instruments"].navGroup = "quality";
GYUTRON_PRODUCTS["industrial-sensors"].redirectTo = "proximity-sensors";
GYUTRON_PRODUCTS["smart-cameras"].redirectTo = "area-scan-cameras";
GYUTRON_PRODUCTS["inspection-instruments"].redirectTo = "dimensional-gauges";

Object.assign(GYUTRON_PRODUCTS, {
    "proximity-sensors": {
        eyebrow: "Sensing & I/O",
        title: "Presence & Object Detection",
        navLabel: "Presence & Object Detection",
        navGroup: "sensors",
        heroImage: "product-hero-proximity-sensors-matrix.png",
        intro: "Photoelektrische, induktive, Faser-, Ultraschall- und Sicherheitssensorik für Teileanwesenheit, Vorrichtungen, Fördertechnik und abgesicherte Stationen.",
        panelMetric: "4 Modelle",
        panelText: "Photoelectric, inductive, fiber, and safety sensing for clear detection jobs.",
        sectionIntro: "This page keeps detection products together instead of mixing them with measurement or condition-monitoring devices.",
        products: getProdukteByName(["GY-PX18", "GY-PR12", "GY-FB200", "GY-SAFE24"])
    },
    "laser-measurement": {
        eyebrow: "Sensing & I/O",
        title: "Distance & Position Sensors",
        navLabel: "Distance & Position",
        navGroup: "sensors",
        heroImage: "product-hero-laser-measurement-matrix.png",
        intro: "Berührungslose Laser- und Ultraschall-Distanzprodukte für Positionsprüfung, Spaltbestätigung, Füllstandserfassung und Maschinenfeedback.",
        panelMetric: "2 models",
        panelText: "Laser displacement and ultrasonic distance sensing, without unrelated IO or fiber-amplifier products.",
        sectionIntro: "This category now uses a broader distance-and-position framing and only includes products that genuinely measure position or distance.",
        products: getProdukteByName(["GY-LD40", "GY-UL80"])
    },
    "environmental-sensing": {
        eyebrow: "Sensing & I/O",
        title: "Process & Condition Monitoring",
        navLabel: "Process & Condition",
        navGroup: "sensors",
        heroImage: "product-hero-environmental-sensing-matrix.png",
        intro: "Druck-, Temperatur-, Feuchte-, Vibrations- und Sensornetzwerkprodukte für Uptime-Transparenz und Prozessstabilität.",
        panelMetric: "3 Modelle",
        panelText: "Environmental monitoring, pneumatic pressure checks, and distributed IO diagnostics.",
        sectionIntro: "Process and condition products belong together because buyers use them to monitor machine health, cabinet conditions, pneumatic performance, and connected sensor status.",
        products: getProdukteByName(["GY-PS60", "GY-ENV32", "GY-NET8"])
    },
    "area-scan-cameras": {
        eyebrow: "Machine-Vision-Systeme",
        title: "Smart & Area Scan Cameras",
        navLabel: "Smart & Area Scan Cameras",
        navGroup: "vision",
        heroImage: "product-hero-area-scan-cameras-matrix.png",
        intro: "2D-Smart-Kameras für Vollbildprüfung, Montageverifikation, Messtechnik, Führung und KI-gestützte Kontrollen.",
        panelMetric: "9 models",
        panelText: "Compact, color, mono, AI, high-resolution, high-speed, and telecentric imaging options.",
        sectionIntro: "Area-scan products capture a full image frame, with supporting optics kept in the same imaging chain. This lineup separates sensor class, speed, resolution, AI capability, and inspection role so buyers can shortlist models more realistically.",
        products: getProdukteByName(["GY-V120", "GY-V160 Compact", "GY-V240 Color", "GY-V280 AI", "GY-V320 Mono", "GY-V380 Pro", "GY-V500 HR", "GY-V640 HS", "GY-OPT25"])
    },
    "smart-vision-sensors": {
        eyebrow: "Machine-Vision-Systeme",
        title: "Vision Controllers & 3D Systems",
        navLabel: "Controllers & 3D Vision",
        navGroup: "vision",
        heroImage: "product-hero-smart-vision-sensors-matrix.png",
        intro: "Vision-Controller, 3D-Profilkameras und Line-Scan-Systeme für größere Prüfzellen und komplexere Anwendungen.",
        panelMetric: "9 models",
        panelText: "Vision controllers, 3D sensors, line-scan acquisition, timing I/O, frame-grabber, strobe control, and robot guidance modules.",
        sectionIntro: "This lineup supports more complete machine vision cells: acquisition, processing, 3D profiling, timing I/O, illumination triggering, frame capture, and robot-guidance integration.",
        products: getProdukteByName(["GY-VC8", "GY-V3D90", "GY-V3D150", "GY-VL2048", "GY-VX12", "GY-VIO16", "GY-LC4", "GY-VFG4", "GY-VRG200"])
    },
    "code-reading-cameras": {
        eyebrow: "Machine-Vision-Systeme",
        title: "Code Reading & Verification",
        navLabel: "Code Reading & Verification",
        navGroup: "vision",
        heroImage: "product-hero-code-reading-cameras-matrix.png",
        intro: "Stationäre und mobile bildbasierte Leser für Barcode, QR, Data Matrix, DPM und regulierte Rückverfolgbarkeits-Workflows.",
        panelMetric: "8 models",
        panelText: "Compact readers, DPM readers, high-speed conveyor readers, handheld DPM, inline verification, and tunnel capture.",
        sectionIntro: "Traceability buyers think in terms of read rate, DPM capability, field of view, verification standards, and record output, so this category now covers both fixed readers and grading workflows.",
        products: getProdukteByName(["GY-CR120", "GY-CR390", "GY-CR520 DPM", "GY-CR720 Conveyor", "GY-S300 DPM", "GY-CV100", "GY-CV220 Inline", "GY-RT800"])
    },
    "vision-lighting": {
        eyebrow: "Machine-Vision-Systeme",
        title: "Vision Lighting",
        navLabel: "Vision Lighting",
        navGroup: "vision",
        heroImage: "product-hero-vision-lighting-matrix.png",
        intro: "Weißlicht-Beleuchtungszubehör für stabile Machine-Vision-Bilder ohne Farbverfälschung oder violette Lichteffekte.",
        panelMetric: "5 Modelle",
        panelText: "Ring, bar, dome, backlight, and line-light illumination products.",
        sectionIntro: "Vision lighting products determine image stability, defect contrast, and measurement repeatability. This category now keeps only illumination hardware, while controllers and optics live with the broader vision system categories.",
        products: getProdukteByName(["GY-LR70", "GY-LB220", "GY-LDome120", "GY-LBL150", "GY-LL300"])
    },
    "dimensional-gauges": {
        eyebrow: "Quality & Test Instruments",
        title: "Dimensional Gauges",
        navLabel: "Dimensional Gauges",
        navGroup: "quality",
        heroImage: "product-hero-dimensional-gauges-matrix.png",
        intro: "Messwerkzeuge für Geometrie, Ausrichtung, Höhe, Spalt, Profil und Produktionstoleranzen.",
        panelMetric: "2 models",
        panelText: "Contact gauge and optical measurement station options.",
        sectionIntro: "Dimensional gauges are kept to dedicated metrology instruments, while distance sensors and 3D profile cameras remain in their own automation categories.",
        products: getProdukteByName(["GY-MG50", "GY-VM200"])
    },
    "surface-inspection": {
        eyebrow: "Quality & Test Instruments",
        title: "Surface Inspection",
        navLabel: "Surface Inspection",
        navGroup: "quality",
        heroImage: "product-hero-surface-inspection-matrix.png",
        intro: "Spezialisierte Oberflächenqualitätsgeräte für Rauheit, Glanz, Schichtdicke und sichtbare Finish-Prüfungen.",
        panelMetric: "3 Modelle",
        panelText: "Roughness, gloss, and coating-thickness tools without borrowing camera-system products.",
        sectionIntro: "Surface inspection now contains only dedicated surface-quality instruments, so line-scan cameras and AI cameras stay in machine vision.",
        products: [
            ...getProdukteByName(["GY-SF30"]),
            {
                name: "GY-GL20",
                type: "Industrial gloss meter",
                summary: "Portable gloss meter for coating, molded-part, painted-metal, and finished-surface consistency checks.",
                kind: "instrument",
                image: "product-images/gy-gl20.png",
                specs: { Geometry: "60 degree", Range: "0 to 1000 GU", Repeatability: "+/- 0.2 GU", Data: "USB / Bluetooth" },
                tags: ["Gloss", "Coatings", "Finish control"]
            },
            {
                name: "GY-CT45",
                type: "Coating thickness tester",
                summary: "Handheld coating gauge for paint, plating, anodizing, and protective coating inspection on metal parts.",
                kind: "instrument",
                image: "product-images/gy-ct45.png",
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
        heroImage: "product-hero-portable-testers-matrix.png",
        intro: "Handheld-Tester für elektrische, thermische und signalbezogene Prüfungen durch Wartungs- und Qualitätsteams.",
        panelMetric: "3 Modelle",
        panelText: "Electrical safety, loop-signal, and thermal diagnostic tools.",
        sectionIntro: "Portable testers are selected for maintenance teams and quality engineers who need quick checks away from fixed stations. Process sensors and environmental monitors stay in Sensing & I/O.",
        products: [
            ...getProdukteByName(["GY-ET75"]),
            {
                name: "GY-LT40",
                type: "Loop signal tester",
                summary: "Portable loop calibrator for checking 4-20 mA sensor signals, control loops, and cabinet commissioning work.",
                kind: "instrument",
                image: "product-images/gy-lt40.png",
                specs: { Signal: "4-20 mA source / measure", Power: "24 V loop supply", Accuracy: "0.05% class", Display: "Backlit LCD" },
                tags: ["Loop check", "Commissioning", "Maintenance"]
            },
            {
                name: "GY-TH90",
                type: "Thermal spot tester",
                summary: "Non-contact temperature tester for cabinets, motors, bearings, and quick maintenance diagnostics.",
                kind: "instrument",
                image: "product-images/gy-th90.png",
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
        heroImage: "product-hero-calibration-tools-matrix.png",
        intro: "Kalibrier- und Verifizierungszubehör für Machine Vision, Messtechnik, Codequalität und dokumentierte Messmittelpflege.",
        panelMetric: "3 Modelle",
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
    "sensors": ["proximity-sensors", "laser-measurement", "environmental-sensing"],
    "vision": ["area-scan-cameras", "smart-vision-sensors", "code-reading-cameras", "vision-lighting"],
    "quality": ["dimensional-gauges", "surface-inspection", "portable-testers", "calibration-tools"]
};

["industrial-sensors", "smart-cameras", "inspection-instruments"].forEach((key) => {
    GYUTRON_PRODUCTS[key].products = [];
    GYUTRON_PRODUCTS[key].panelMetric = "Redirect";
    GYUTRON_PRODUCTS[key].panelText = "This product line is organized into focused tertiary categories.";
});
