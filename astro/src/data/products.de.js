const GYUTRON_PRODUCTS = {
    "android-pda": {
        eyebrow: "Robuste PDA-Terminals",
        title: "Android-PDA",
        navLabel: "Android-PDA",
        heroImage: "product-hero-android-pda-matrix.png",
        intro: "Robuste Android-Handhelds für Lager, Fertigung, Field Service und liniennahe Datenerfassung.",
        panelMetric: "8 Modelle",
        panelText: "Touch-, Tastatur-, Scan-Griff-, Kühlketten- und Langzeitakku-Optionen.",
        products: [
            {
                name: "GY-A50",
                type: "Kompaktes Android-PDA",
                summary: "Handliches 5-Zoll-Terminal für Wareneingang, Kommissionierung, Bestandszählung und Linienfreigabe.",
                kind: "pda",
                image: "product-library/transparent/gy-a50.png",
                specs: { OS: "Android 14", Display: "5.0 in HD", Scan: "1D/2D imager", Rugged: "IP67 / 1.6 m drop" },
                tags: ["Wi-Fi 6", "NFC", "4500 mAh"]
            },
            {
                name: "GY-A55 Pro",
                type: "Universelles PDA",
                summary: "Ausgewogener Handheld-Computer für Logistikteams mit Scan-, Kamera- und Roaming-Anforderungen.",
                kind: "pda",
                image: "product-library/transparent/gy-a55-pro.png",
                specs: { OS: "Android 14", Display: "5.5 in HD+", Scan: "Near/far 2D", Rugged: "IP67 / 1.8 m drop" },
                tags: ["4G LTE", "13 MP camera", "5000 mAh"]
            },
            {
                name: "GY-A60 Max",
                type: "PDA mit großem Display",
                summary: "Robustes 6-Zoll-Terminal für mobile Workflows mit Formularen, WMS-Masken und Arbeitsanweisungen.",
                kind: "pda",
                image: "product-library/transparent/gy-a60-max.png",
                specs: { OS: "Android 14", Display: "6.0 in FHD", Scan: "High-speed 2D", Rugged: "IP68 / 1.8 m drop" },
                tags: ["6 GB RAM", "Wi-Fi 6E", "5800 mAh"]
            },
            {
                name: "GY-A62K",
                type: "PDA mit Tastatur",
                summary: "Modell mit physischer Tastatur für Handschuhbedienung, wiederholte Scanaufgaben und hohe Lagerdurchsätze.",
                kind: "keypad",
                image: "product-library/transparent/gy-a62k.png",
                specs: { OS: "Android 13", Display: "4.0 in touch", Scan: "1D/2D angled", Rugged: "IP65 / 1.8 m drop" },
                tags: ["29 keys", "Scan handle", "5200 mAh"]
            },
            {
                name: "GY-A92K KeyTouch",
                type: "Mobiles Datenterminal mit Tastatur",
                summary: "Robustes Android-PDA mit Touchscreen und physischen Tasten für Handschuhbedienung, Kommissionierung und liniennahe Datenerfassung.",
                kind: "keypad",
                image: "product-library/transparent/gy-a92k-keytouch.png",
                specs: { OS: "Android 14", Display: "4.7 in touch", Scan: "Angled 2D imager", Rugged: "IP67 / 1.8 m drop" },
                tags: ["Numerische Tastatur", "Handschuhe", "5800 mAh"]
            },
            {
                name: "GY-A70 Cold",
                type: "Kühlketten-PDA",
                summary: "Robuster Handheld für Tiefkühlbereiche, Lebensmittellogistik, Pharmalager und Wintereinsätze im Freien.",
                kind: "pda",
                image: "product-library/transparent/gy-a70-cold.png",
                specs: { OS: "Android 14", Display: "5.7 in glove touch", Scan: "Condensation-ready 2D", Rugged: "IP67 / -25 C" },
                tags: ["Heated window", "Hot swap", "6500 mAh"]
            },
            {
                name: "GY-A80 Ultra",
                type: "Ultra-robustes PDA",
                summary: "Hochwertiger Feldcomputer für Versorger, Außenlager, Instandhaltungsteams und lange Industrieschichten.",
                kind: "pda",
                image: "product-library/transparent/gy-a80-ultra.png",
                specs: { OS: "Android 14", Display: "6.2 in FHD", Scan: "Extended range 2D", Rugged: "IP68 / 2.0 m drop" },
                tags: ["5G option", "GNSS", "7200 mAh"]
            }
        ,
            {
                name: "GY-A90 Touch",
                type: "Touchscreen-Datenerfassungsterminal",
                summary: "Robustes Android-PDA ohne Tastatur fuer scanbasierte Datenerfassung in Lager, Fertigung und Field Service.",
                kind: "pda",
                image: "product-library/transparent/gy-a90-touch.png",
                specs: { OS: "Android 14", Display: "6.1 in FHD touch", Scan: "Integrated 2D imager", Rugged: "IP68 / 1.8 m drop" },
                tags: ["Touch only", "Wi-Fi 6E", "6200 mAh"]
            }
        ]
    },
    "rfid-handhelds": {
        eyebrow: "Robuste PDA-Terminals",
        title: "RFID-Handhelds",
        navLabel: "RFID-Handhelds",
        heroImage: "product-hero-rfid-handhelds-matrix.png",
        intro: "Android-UHF-RFID-Terminals für Inventur, Asset Tracking, Inbound-Logistik, Lagerbereiche und Produktionsrückverfolgbarkeit.",
        panelMetric: "5 Modelle",
        panelText: "Integrierte, Long-Range-, 5G- und ergonomische RFID-Optionen.",
        products: [
            {
                name: "GY-R52 Compact",
                type: "PDA mit integriertem UHF",
                summary: "Kompaktes RFID-Terminal für Filialinventuren, leichte Lagerprozesse und Anlagenverifikation.",
                kind: "rfid",
                image: "product-library/transparent/gy-r52-compact.png",
                specs: { OS: "Android 14", RFID: "UHF up to 4 m", Scan: "1D/2D optional", Rugged: "IP65 / 1.5 m drop" },
                tags: ["Interne Antenne", "NFC", "4500 mAh"]
            },
            {
                name: "GY-R60 Grip",
                type: "Ergonomischer RFID-Leser",
                summary: "Ausbalancierter Pistolengriff-Leser für tägliche Bestandszählungen, Palettenprüfungen und Retourenprozesse.",
                kind: "rfid",
                image: "product-library/transparent/gy-r60-grip.png",
                specs: { OS: "Android 13", RFID: "UHF up to 8 m", Scan: "2D imager", Rugged: "IP65 / 1.6 m drop" },
                tags: ["Zirkularantenne", "Wi-Fi 6", "6000 mAh"]
            },
            {
                name: "GY-R70 LongRange",
                type: "RFID-Leser mit großer Reichweite",
                summary: "Leistungsstarker UHF-Handheld für Lagergänge, Verladerampen und Massenerfassung von Tags.",
                kind: "rfid",
                image: "product-library/transparent/gy-r70-longrange.png",
                specs: { OS: "Android 14", RFID: "UHF up to 12 m", Scan: "2D + DPM option", Rugged: "IP67 / 1.8 m drop" },
                tags: ["33 dBm output", "5.5 in display", "7800 mAh"]
            },
            {
                name: "GY-R86 5G",
                type: "5G-RFID-Terminal",
                summary: "Vernetzter RFID-Computer für Asset-Teams im Feld mit standortübergreifender Datensynchronisierung und sicheren Android-Apps.",
                kind: "rfid",
                image: "product-library/transparent/gy-r86-5g.png",
                specs: { OS: "Android 14", RFID: "UHF up to 10 m", Scan: "Near/far 2D", Rugged: "IP67 / 1.8 m drop" },
                tags: ["5G", "Dual-band GNSS", "7000 mAh"]
            }
        ,
            {
                name: "GY-R90 Falcon",
                type: "Long-Range-UHF-RFID-Leser",
                summary: "Leistungsstarkes RFID-Handheld fuer Masseninventur, Dock-Tore, Asset Tracking und Palettenlesung.",
                kind: "rfid",
                image: "product-library/transparent/gy-r90-falcon.png",
                specs: { OS: "Android 14", RFID: "UHF up to 15 m", Scan: "2D + RFID", Rugged: "IP67 / 1.8 m drop" },
                tags: ["33 dBm", "Circular antenna", "8200 mAh"]
            }
        ]
    },
    "barcode-scanners": {
        eyebrow: "Robuste PDA-Terminals",
        title: "Barcodescanner",
        navLabel: "Barcodescanner",
        heroImage: "product-hero-barcode-scanners-matrix.png",
        intro: "Industrielle Handheld-Barcode-Scanner für 1D-, 2D-, DPM-, Long-Range- und Wireless-Scan-Workflows.",
        panelMetric: "8 Modelle",
        panelText: "Kabelgebundene, kabellose, Kühlketten-, Long-Range-, Wearable-, Präsentations- und Tor-Scan-Optionen.",
        products: [
            {
                name: "GY-S210",
                type: "Universeller kabelgebundener Scanner",
                summary: "Robuster Flächenbild-Scanner für Wareneingang, Produktionsplätze und Packstationen.",
                kind: "scanner",
                image: "product-library/transparent/gy-s210.png",
                specs: { Scan: "1D/2D area imager", Link: "USB-C / RS232", Motion: "Up to 4 m/s", Rugged: "IP54 / 1.5 m drop" },
                tags: ["Präsentationsmodus", "Weiße LED", "Schnelles Decoding"]
            },
            {
                name: "GY-S240W",
                type: "Kabelloser Industriescanner",
                summary: "Schnurloser Scanner mit Basisstation für Pick-Pack, Versand und flexible Arbeitszellen.",
                kind: "scanner",
                image: "product-library/transparent/gy-s240w.png",
                specs: { Scan: "1D/2D area imager", Link: "2.4G / Bluetooth", Range: "Up to 80 m open field", Rugged: "IP54 / 1.5 m drop" },
                tags: ["Batch-Speicher", "Ladestation", "2200 mAh"]
            },
            {
                name: "GY-S330 Cold",
                type: "Kühlketten-Scanner",
                summary: "Kabelloser Scanner für Kühllager, Lebensmittelverarbeitung und Warenannahme bei niedrigen Temperaturen.",
                kind: "scanner",
                image: "product-library/transparent/gy-s330-cold.png",
                specs: { Scan: "1D/2D", Link: "Bluetooth 5.2", Temp: "-30 C to 50 C", Rugged: "IP65 / 1.8 m drop" },
                tags: ["Antikondensation", "Handschuhgriff", "3200 mAh"]
            },
            {
                name: "GY-S360 XR",
                type: "Scanner mit erweiterter Reichweite",
                summary: "Langstreckenmodell für Regaletiketten, Verladetore, Palettenpositionen und staplernahe Scanaufgaben.",
                kind: "scanner",
                image: "product-library/transparent/gy-s360-xr.png",
                specs: { Scan: "Near/far 1D/2D", Range: "10 cm to 15 m", Link: "Bluetooth / USB", Rugged: "IP65 / 2.0 m drop" },
                tags: ["Große Reichweite", "Laserzielhilfe", "Lager"]
            },
            {
                name: "GY-S410 Base",
                type: "Freihand-Scanstation",
                summary: "Desktop-Scanmodul für Tisch-Verifizierung, Kitting und Kleinteile-Rückverfolgung.",
                kind: "scanner",
                image: "product-library/transparent/gy-s410-base.png",
                specs: { Scan: "2D presentation", Mount: "Desktop / fixture", Link: "USB / Ethernet option", Rugged: "Sealed front window" },
                tags: ["Auto-Trigger", "Vorrichtungsfähig", "Weißlicht"]
            },
            {
                name: "GY-S520 Wear",
                type: "Tragbarer Ringscanner",
                summary: "Leichter tragbarer Scanner für freihändiges Kommissionieren, Sortieren und Nachschub.",
                kind: "scanner",
                image: "product-library/transparent/gy-s520-wear.png",
                specs: { Scan: "1D/2D short range", Link: "Bluetooth 5.2", Battery: "Hot-swap 900 mAh", Rugged: "IP54 / 1.5 m drop" },
                tags: ["Tragbar", "Freihand", "Lager"]
            },
            {
                name: "GY-S680 Dock",
                type: "Industrieller Rampenscanner",
                summary: "Fest installierter Scanner für Dock-Verifizierung, Palettendurchlaufprüfung und automatische Förderbandlesung.",
                kind: "scanner",
                image: "product-library/transparent/gy-s680-dock.png",
                specs: { Scan: "Wide-angle 2D", Link: "Ethernet / USB", Trigger: "Photoeye input", Rugged: "IP65 metal housing" },
                tags: ["Verladerampe", "Fördertechnik", "Ethernet"]
            }
        ,
            {
                name: "GY-S900 XR",
                type: "Extended-Range-Scanpistole",
                summary: "Industriescanner fuer Regaletiketten, Stapler-nahe Prozesse und weite Lager-Lesedistanzen.",
                kind: "scanner",
                image: "product-library/transparent/gy-s900-xr.png",
                specs: { Scan: "1D/2D near-far", Range: "Up to 18 m", Link: "Bluetooth / USB-C", Rugged: "IP65 / 2.0 m drop" },
                tags: ["Long range", "Laser aimer", "Warehouse"]
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
        panelMetric: "3 Pakete",
        panelText: "Nutzen Sie diese Optionen als Ausgangspunkt für Angebote, Muster oder OEM-/ODM-Abstimmungen.",
        products: [
            {
                name: "GY-CONF-Scan",
                type: "Scan-only-PDA-Paket",
                summary: "Empfohlene Basiskonfiguration für Lagerteams, die Android-PDA, 2D-Scan-Engine, Dock, Ersatzakku und MDM-Profil benötigen.",
                kind: "config",
                image: "product-library/transparent/gy-conf-scan.png",
                specs: { Device: "A50 / A55 class", Scan: "Standard 2D", Accessories: "Dock + boot", Lead: "Sample in 7-10 days" },
                tags: ["Lager", "Inventur", "Starterkit"]
            },
            {
                name: "GY-CONF-RFID",
                type: "RFID-Inventur-Paket",
                summary: "UHF-Leser-Bundle für Pulkerfassung, Asset-Tagging, Lagerräume im Handel und Wareneingang.",
                kind: "config",
                image: "product-library/transparent/gy-conf-rfid.png",
                specs: { Device: "R60 / R70 class", RFID: "8-12 m option", Accessories: "Grip + charger", Lead: "Sample in 10-14 days" },
                tags: ["UHF", "Asset Tracking", "Massenerfassung"]
            },
            {
                name: "GY-CONF-DPM",
                type: "Fertigungs-DPM-Paket",
                summary: "DPM-Scanner- und PDA-Option für geätzte Metallcodes, Rückverfolgungsstationen und Produktionsverifizierung.",
                kind: "config",
                image: "product-library/transparent/gy-conf-dpm.png",
                specs: { Device: "S300 / A60 class", Codes: "DPM + QR + DataMatrix", Lighting: "Weißlicht", Lead: "Pilot in 2-3 weeks" },
                tags: ["DPM", "Rückverfolgbarkeit", "Qualität"]
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
                type: "Lichttaster",
                summary: "Kompakter Lichttaster für Förderbanderkennung, Teilepräsenz und allgemeine Maschinenautomatisierung.",
                kind: "sensor",
                image: "product-library/transparent/gy-px18.png",
                specs: { Detection: "Diffuse / retroreflective", Range: "20 mm to 2.5 m", Output: "PNP / NPN", Housing: "IP67 compact" },
                tags: ["Weißlicht", "M12 cable", "Schnelle Einrichtung"]
            },
            {
                name: "GY-PR12",
                type: "Induktiver Näherungssensor",
                summary: "Metallerkennung für Vorrichtungen, Rundschalttische, Zylinder, Werkzeuge und raue Maschinenpositionen.",
                kind: "sensor",
                image: "product-library/transparent/gy-pr12.png",
                specs: { Detection: "Ferrous / non-ferrous", Range: "2 to 8 mm", Output: "PNP / NPN", Housing: "M12 stainless IP67" },
                tags: ["Bündige Montage", "Hohe Wiederholgenauigkeit", "Werkzeugmaschinen"]
            },
            {
                name: "GY-LD40",
                type: "Laser-Wegsensor",
                summary: "Berührungslose Abstands- und Höhenmessung für Positionsprüfung, Spaltkontrolle und Anwesenheitserkennung.",
                kind: "sensor",
                image: "product-library/transparent/gy-ld40.png",
                specs: { Measurement: "40 mm class", Resolution: "10 um", Output: "IO-Link / analog", Housing: "IP67 metal" },
                tags: ["Laserposition", "Analogausgang", "Spaltprüfung"]
            },
            {
                name: "GY-FB200",
                type: "Faserverstärker-Sensor",
                summary: "Flexible Faser-Sensorik für enge Räume, transparente Objekte, Kleinteile und schwierige Montagebedingungen.",
                kind: "sensor",
                image: "product-library/transparent/gy-fb200.png",
                specs: { Channels: "Single / dual", Response: "80 us", Output: "PNP / NPN", Display: "Dual digital" },
                tags: ["Fiber head", "Kleine Zielobjekte", "Teach-Taste"]
            },
            {
                name: "GY-PS60",
                type: "Digitaler Drucksensor",
                summary: "Kompakte Drucküberwachung für Pneumatikleitungen, Vakuum-Greifsysteme, Lecksuche und Prozessanlagen.",
                kind: "sensor",
                image: "product-library/transparent/gy-ps60.png",
                specs: { Range: "-100 to 1000 kPa", Display: "3-color OLED", Output: "2 x switch + analog", Housing: "IP65" },
                tags: ["Vacuum", "Pneumatics", "Panel mount"]
            },
            {
                name: "GY-ENV32",
                type: "Umgebungssensor",
                summary: "Überwacht Temperatur, Feuchte, Vibration und Schaltschrankbedingungen, die die Anlagenverfügbarkeit beeinflussen.",
                kind: "sensor",
                image: "product-library/transparent/gy-env32.png",
                specs: { Inputs: "Temp / RH / vibration", Network: "RS-485 / IO-Link", Power: "12-24 VDC", Housing: "IP54" },
                tags: ["Schaltschrankzustand", "Zustandsdaten", "Modbus"]
            },
            {
                name: "GY-UL80",
                type: "Ultraschall-Abstandssensor",
                summary: "Berührungslose Erfassung für Füllstand, Regelkreise und unregelmäßige Ziele, an denen optische Sensoren scheitern.",
                kind: "sensor",
                image: "product-library/transparent/gy-ul80.png",
                specs: { Range: "80 to 1200 mm", Output: "Analog + switch", Beam: "Narrow cone", Housing: "IP67" },
                tags: ["Füllstand", "Transparente Objekte", "Staubtolerant"]
            },
            {
                name: "GY-SAFE24",
                type: "Sicherheitslichtvorhang",
                summary: "Schutzsensorik für Maschinenöffnungen, Roboterstationen und Bedienerzugänge.",
                kind: "sensor",
                image: "product-library/transparent/gy-safe24.png",
                specs: { Resolution: "24 mm", Height: "300 to 1200 mm", Safety: "Typ 4 / PL e", Housing: "IP65 aluminum" },
                tags: ["Maschinensicherheit", "Muting option", "Ausrichthilfe"]
            },
            {
                name: "GY-NET8",
                type: "Sensor-Netzwerk-Hub",
                summary: "Verbindet verteilte Sensoren mit Industrienetzwerken und vereinfacht Diagnose und Verdrahtung.",
                kind: "sensor",
                image: "product-library/transparent/gy-net8.png",
                specs: { Ports: "8 x M12 IO-Link", Network: "EtherNet/IP / PROFINET", Power: "24 VDC", Housing: "IP67" },
                tags: ["IO-Link", "Diagnose", "IP67 hub"]
            }
        ,
            {
                name: "GY-PX90",
                type: "Kompakter Lichttaster",
                summary: "Schneller Praesenzsensor fuer Foerderer, Vorrichtungen, Teileerkennung und kompakte Maschinen.",
                kind: "sensor",
                image: "product-library/transparent/gy-px90.png",
                specs: { Detection: "Diffuse / retroreflective", Range: "30 mm to 3 m", Output: "PNP / NPN", Housing: "IP67 compact" },
                tags: ["Presence", "M12", "Fast setup"]
            }
        ,
            {
                name: "GY-LD90",
                type: "Laser-Wegsensor",
                summary: "Beruehrungsloser Positions- und Spaltsensor fuer Inline-Pruefung, Ausrichtung, Niveau und Maschinenfeedback.",
                kind: "sensor",
                image: "product-library/transparent/gy-ld90.png",
                specs: { Measurement: "90 mm class", Resolution: "5 um", Output: "IO-Link / analog", Housing: "IP67 metal" },
                tags: ["Laser", "Position", "IO-Link"]
            }
        ,
            {
                name: "GY-SAFE90",
                type: "Sicherheits-Lichtvorhang-Paar",
                summary: "Schlanker Lichtvorhang fuer Arbeitszellen, Vorrichtungen, Maschinenoeffnungen und Bedienerschutz.",
                kind: "safety",
                image: "product-library/transparent/gy-safe90.png",
                specs: { Resolution: "14 / 30 mm", Height: "300 to 1500 mm", Safety: "Type 4 / PL e", Housing: "IP65 aluminum" },
                tags: ["Machine safety", "Slim body", "Type 4"]
            }
        ,
            {
                name: "GY-NET90",
                type: "IP67-Remote-I/O-Modul",
                summary: "Robuster verteilter I/O-Block fuer Sensoren, Aktoren, Arbeitszellen und schaltschrankarme Verdrahtung.",
                kind: "io",
                image: "product-library/transparent/gy-net90.png",
                specs: { Ports: "8 x M12 IO-Link", Network: "PROFINET / EtherNet/IP", Power: "24 VDC", Housing: "IP67 metal" },
                tags: ["Remote I/O", "IO-Link", "IP67"]
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
                type: "Kompakte Smart-Kamera",
                summary: "Einstiegs-Smart-Kamera für Anwesenheitsprüfung, Etikettenkontrolle, Orientierung und einfache Gut/Schlecht-Prüfung.",
                kind: "camera",
                image: "product-library/transparent/gy-v120.png",
                specs: { Sensor: "1.6 MP CMOS", Lens: "C-mount / fixed", Interface: "Ethernet + I/O", Rating: "IP67 housing" },
                tags: ["2D inspection", "Teach-Einrichtung", "Weißlicht"]
            },
            {
                name: "GY-V160 Compact",
                type: "Kompakte Flächenkamera",
                summary: "Industriekamera im Kleinformat für enge Maschinenräume, Vorrichtungsprüfung, Teilepräsenz und Etikettenkontrolle.",
                kind: "camera",
                image: "product-library/transparent/gy-v160-compact.png",
                specs: { Sensor: "1.6 MP global shutter", Lens: "C-mount", Interface: "GigE + trigger I/O", Rating: "IP65 metal" },
                tags: ["Kompaktes Gehäuse", "Global Shutter", "Vorrichtungsfähig"]
            },
            {
                name: "GY-V240 Color",
                type: "Farbprüfung camera",
                summary: "Farb-Flächenkamera für Verpackung, Etikettendruck, Farbprüfung in der Montage und Verifizierung gemischter Produkte.",
                kind: "camera",
                image: "product-library/transparent/gy-v240-color.png",
                specs: { Sensor: "2.4 MP color CMOS", Lens: "C-mount / liquid lens option", Interface: "GigE Vision", Rating: "IP65" },
                tags: ["Farbprüfung", "Weißlicht", "Etikettenprüfung"]
            },
            {
                name: "GY-V280 AI",
                type: "KI-Vision-Sensor",
                summary: "Eingebettete KI-Prüfkamera für Defekterkennung, Klassifizierung, OCR und variables Teileaussehen.",
                kind: "camera",
                image: "product-library/transparent/gy-v280-ai.png",
                specs: { Sensor: "2.8 MP global shutter", AI: "On-device inference", Interface: "GigE / discrete I/O", Rating: "IP67" },
                tags: ["AI tools", "OCR", "Fehlerbilder"]
            },
            {
                name: "GY-V320 Mono",
                type: "Monochrome Flächenkamera",
                summary: "Kontraststarke Monochromkamera für Messtechnik, Kantenerkennung, Ausrichtung und Merkmalsprüfung.",
                kind: "camera",
                image: "product-library/transparent/gy-v320-mono.png",
                specs: { Sensor: "3.2 MP mono global shutter", Pixel: "3.45 um", Interface: "GigE / strobe I/O", Rating: "IP65" },
                tags: ["Monosensor", "Kantenkontrast", "Measurement"]
            },
            {
                name: "GY-V380 Pro",
                type: "Highspeed-Smart-Kamera",
                summary: "Schnelles eingebettetes Vision-System für Montageprüfung, Messtechnik, Führung und linienseitige Qualitätskontrolle.",
                kind: "camera",
                image: "product-library/transparent/gy-v380-pro.png",
                specs: { Sensor: "5 MP global shutter", Speed: "Up to 90 fps", Interface: "GigE / PROFINET", Rating: "IP67" },
                tags: ["High speed", "SPS-fähig", "Metrology"]
            },
            {
                name: "GY-V500 HR",
                type: "Hochauflösende Flächenkamera",
                summary: "Hochauflösende Prüfkamera für kleine Defekte, feinen Druck, dichte Etiketten und Präzisionsmontageprüfung.",
                kind: "camera",
                image: "product-library/transparent/gy-v500-hr.png",
                specs: { Sensor: "5.0 MP global shutter", Speed: "Up to 72 fps", Interface: "GigE Vision / USB3 option", Rating: "IP65" },
                tags: ["Hohe Auflösung", "Feindetails", "Druckqualität"]
            },
            {
                name: "GY-V640 HS",
                type: "Highspeed-Flächenkamera",
                summary: "Schnelles Flächenkameramodell für bewegte Teile, Förderbandprüfung, Pick-Verifizierung und bewegungskritische Aufnahmen.",
                kind: "camera",
                image: "product-library/transparent/gy-v640-hs.png",
                specs: { Sensor: "6.4 MP global shutter", Speed: "Up to 118 fps", Interface: "2.5GigE + encoder", Rating: "IP65" },
                tags: ["High speed", "Fördertechnik", "Encoder sync"]
            },
            {
                name: "GY-V3D90",
                type: "3D-Profilkamera",
                summary: "3D-Laserprofilkamera für die Messung von Höhe, Volumen, Spalt, Naht und Oberflächenmerkmalen.",
                kind: "camera",
                image: "product-library/transparent/gy-v3d90.png",
                specs: { Profile: "3D laser triangulation", Range: "90 mm class", Interface: "GigE Vision", Rating: "IP65" },
                tags: ["3D profile", "Höhenprüfung", "Robot guidance"]
            },
            {
                name: "GY-VL2048",
                type: "Zeilenscan-Smart-Kamera",
                summary: "Zeilenscan-Prüfkamera für Endlosbahnen, Etiketten, Folien, Verpackung und schnelle Oberflächen.",
                kind: "camera",
                image: "product-library/transparent/gy-vl2048.png",
                specs: { Sensor: "2048 px line", Speed: "45 kHz", Interface: "GigE / encoder", Rating: "Industrial metal" },
                tags: ["Line scan", "Web inspection", "Encoder"]
            },
            {
                name: "GY-CR390",
                type: "Stationäre Codeleser-Kamera",
                summary: "Industrieller bildbasierter Codeleser für DPM, QR, Barcode und Hochdurchsatz-Rückverfolgungsstationen.",
                kind: "camera",
                image: "product-library/transparent/gy-cr390.png",
                specs: { Codes: "1D / 2D / DPM", Lens: "Liquid lens option", Interface: "Ethernet / RS-232", Rating: "IP65" },
                tags: ["DPM", "Rückverfolgbarkeit", "Hohe Leserate"]
            },
            {
                name: "GY-VC8",
                type: "Vision-Controller",
                summary: "Kompakter Controller für Mehrkamera-Prüfzellen, Bildspeicherung, SPS-Austausch und Rezeptverwaltung.",
                kind: "camera",
                image: "product-library/transparent/gy-vc8.png",
                specs: { Cameras: "Up to 8 devices", CPU: "Industrial AI module", Network: "PROFINET / EtherNet/IP", Storage: "512 GB option" },
                tags: ["Multi-camera", "Recipes", "Edge AI"]
            },
            {
                name: "GY-V3D150",
                type: "3D-Profilsensor mit großem Bereich",
                summary: "3D-Sensor mit größerem Sichtfeld für Roboterführung, Nahtprüfung, Tray-Lokalisierung und Höhenkarten-Prüfung.",
                kind: "camera",
                image: "product-library/transparent/gy-v3d150.png",
                specs: { Profile: "Blue laser triangulation", Range: "150 mm class", Points: "2048 profile points", Rating: "IP65" },
                tags: ["3D profile", "Großer Bereich", "Roboterzellen"]
            },
            {
                name: "GY-VX12",
                type: "KI-Vision-Prozessor",
                summary: "Rack-Verarbeitungseinheit für Mehrkamera-KI-Prüfung, Bildarchivierung und Hochdurchsatz-Produktionslinien.",
                kind: "camera",
                image: "product-library/transparent/gy-vx12.png",
                specs: { Cameras: "Up to 12 streams", AI: "Industrial inference engine", Network: "2.5GigE / PROFINET", Storage: "2 TB option" },
                tags: ["AI processor", "Rackmontage", "Multi-camera"]
            },
            {
                name: "GY-VIO16",
                type: "Vision-I/O-Erweiterungsmodul",
                summary: "Feld-I/O-Modul für Beleuchtungstrigger, Encodersignale, Ausschleusungen und Synchronisation von Prüfzellen.",
                kind: "camera",
                image: "product-library/transparent/gy-vio16.png",
                specs: { "I/O": "16 digital inputs / outputs", Timing: "10 us trigger path", Network: "EtherCAT / Ethernet", Rating: "IP67" },
                tags: ["Trigger I/O", "Encoder sync", "Zellenverdrahtung"]
            },
            {
                name: "GY-VFG4",
                type: "Industrieller Framegrabber",
                summary: "Framegrabber-Modul für die Hochbandbreiten-Zeilenscan- und Spezialkamera-Erfassung in Prüf-PCs.",
                kind: "camera",
                image: "product-library/transparent/gy-vfg4.png",
                specs: { Channels: "4 camera inputs", Bus: "PCIe x8", Throughput: "Up to 6.4 GB/s", SDK: "C / Python / .NET" },
                tags: ["Frame grabber", "Line scan", "Hohe Bandbreite"]
            },
            {
                name: "GY-VRG200",
                type: "3D-Roboterführungsmodul",
                summary: "Kompaktes 3D-Kameramodul für Pick-Lokalisierung, Roboterbahnkorrektur, Behälterkantenerkennung und vorrichtungsfreies Beladen.",
                kind: "camera",
                image: "product-library/transparent/gy-vrg200.png",
                specs: { Mode: "3D + 2D acquisition", Range: "200 mm working class", Interface: "GigE Vision + I/O", Rating: "IP65" },
                tags: ["Robot guidance", "3D locate", "Flexible cells"]
            },
            {
                name: "GY-CR120",
                type: "Kompakter stationärer Codeleser",
                summary: "Kleiner stationärer Leser für Etikettenprüfung, Kartonverfolgung, Bauteil-Rückverfolgung und enge Maschinenmontage.",
                kind: "camera",
                image: "product-library/transparent/gy-cr120.png",
                specs: { Codes: "1D / 2D", Sensor: "1.2 MP global shutter", Illumination: "Weiße LED", Rating: "IP65" },
                tags: ["Compact reader", "Rückverfolgbarkeit", "Weiße LED"]
            },
            {
                name: "GY-CR520 DPM",
                type: "DPM-Stationärcodeleser",
                summary: "Kontraststarker Leser für geätzte, lasermarkierte, genadelte und kontrastarme Codes auf Metall- oder Kunststoffteilen.",
                kind: "camera",
                image: "product-library/transparent/gy-cr520-dpm.png",
                specs: { Codes: "DPM / QR / Data Matrix", Lighting: "White + polarizer", Lens: "Autofocus option", Rating: "IP67" },
                tags: ["DPM", "Niedriger Kontrast", "Manufacturing"]
            },
            {
                name: "GY-CR720 Conveyor",
                type: "Highspeed-Codeleser",
                summary: "Lesemodul für Förderbänder, Sortierung, Paketverifizierung und schnelle Rückverfolgungslinien.",
                kind: "camera",
                image: "product-library/transparent/gy-cr720-conveyor.png",
                specs: { Codes: "1D / 2D", Speed: "Up to 5 m/s", Field: "Wide-angle optics", Network: "Ethernet / RS-232" },
                tags: ["Fördertechnik", "High speed", "Großes Sichtfeld"]
            },
            {
                name: "GY-S300 DPM",
                type: "DPM-Code-Scanner",
                summary: "Scanner, optimiert für geätzte, genadelte, kontrastarme und gekrümmte Industriecodes.",
                kind: "scanner",
                image: "product-library/transparent/gy-s300-dpm.png",
                specs: { Scan: "DPM / 1D / 2D", Lighting: "White + polarizer", Codes: "Metal, plastic, labels", Rugged: "IP65 / 1.8 m drop" },
                tags: ["DPM", "AI decode", "Manufacturing"]
            },
            {
                name: "GY-CV220 Inline",
                type: "Inline-Barcode-Verifizierer",
                summary: "Inline-Bewertungsstation für Druckqualität, DPM-Verifizierung, Verpackungskonformität und Audit-Aufzeichnungen.",
                kind: "camera",
                image: "product-library/transparent/gy-cv220-inline.png",
                specs: { Standards: "ISO / IEC grading", Codes: "1D / 2D / DPM", Light: "Calibrated white", Output: "PDF / CSV / API" },
                tags: ["Code-Bewertung", "Inline-QS", "Audit Trail"]
            },
            {
                name: "GY-RT800",
                type: "Mehrkamera-Lesemodul",
                summary: "Tunnelförmiges Lesemodul für die mehrseitige Code-Erfassung von Paketen, Behältern und Trays in Logistiklinien.",
                kind: "camera",
                image: "product-library/transparent/gy-rt800.png",
                specs: { Readers: "4 synchronized imagers", Field: "Multi-side capture", Trigger: "Photoeye / encoder", Network: "Ethernet / API" },
                tags: ["Tunnellesung", "Logistics", "Multi-side"]
            },
            {
                name: "GY-LR70",
                type: "Weiße Ringleuchte",
                summary: "Kompakte Ringleuchte für objektivzentrierte Prüfung, Etikettenkontrolle, Merkmalskontrast und Kleinteilstationen.",
                kind: "camera",
                image: "product-library/transparent/gy-lr70.png",
                specs: { Lighting: "Weiße LED", Diameter: "70 mm", Control: "Strobe / constant", Mount: "C-mount adapter" },
                tags: ["Ringlicht", "Weiße LED", "Objektivaufnahme"]
            },
            {
                name: "GY-LB220",
                type: "Weiße Balkenleuchte",
                summary: "Lineare Balkenleuchte für Kantenbetonung, Förderbandprüfung, Verpackungskontrolle und gezielte Seitenbeleuchtung.",
                kind: "camera",
                image: "product-library/transparent/gy-lb220.png",
                specs: { Lighting: "Weiße LED", Length: "220 mm", Control: "PWM / strobe", Housing: "Finned aluminum" },
                tags: ["Balkenlicht", "Seitenlicht", "Vorrichtungsfähig"]
            },
            {
                name: "GY-LDome120",
                type: "Domleuchte",
                summary: "Diffuse weiße Domleuchte für reflektierende Teile, gekrümmte Oberflächen und blendarme Bildprüfung.",
                kind: "camera",
                image: "product-library/transparent/gy-ldome120.png",
                specs: { Lighting: "Diffuse white", Diameter: "120 mm", Opening: "Camera center port", Housing: "Aluminum dome" },
                tags: ["Dome", "Geringe Blendung", "Reflective parts"]
            },
            {
                name: "GY-LBL150",
                type: "Weißes Durchlichtpanel",
                summary: "Diffuses gerahmtes Durchlicht für Silhouettenprüfung, Locherkennung, Konturmessung und Prüfung transparenter Teile.",
                kind: "camera",
                image: "product-library/transparent/gy-lbl150.png",
                specs: { Lighting: "Diffuse white", Area: "150 x 120 mm", Control: "Constant / strobe", Housing: "Finned aluminum frame" },
                tags: ["Durchlicht", "Silhouette", "Measurement"]
            },
            {
                name: "GY-LCX60",
                type: "Koaxiales Beleuchtungsmodul",
                summary: "Koaxiale Beleuchtung für flache reflektierende Oberflächen, Druckprüfung, Ausrichtmarken und schattenarme Bildgebung.",
                kind: "camera",
                image: "product-images/gy-lcx60.png",
                specs: { Lighting: "White coaxial", Aperture: "60 mm class", Control: "Strobe-ready", Mount: "C-mount path" },
                tags: ["Coaxial", "Reflective parts", "Druckprüfung"]
            },
            {
                name: "GY-LL300",
                type: "Linienleuchte mit hoher Leistung",
                summary: "Lange Linienleuchte für Zeilenscan-Prüfung, Bahnmaterialien, Etiketten, Folien und Förderband-Kantenbetonung.",
                kind: "camera",
                image: "product-library/transparent/gy-ll300.png",
                specs: { Lighting: "Weiße LED line", Length: "300 mm", Control: "High-current strobe", Cooling: "Finned housing" },
                tags: ["Line scan", "Hohe Leistung", "Web inspection"]
            },
            {
                name: "GY-LC4",
                type: "Vierkanal-Blitzcontroller",
                summary: "Beleuchtungscontroller für synchronisierte Blitze, Intensitätsrezepte, Encoder-Timing und Mehrlicht-Stationen.",
                kind: "camera",
                image: "product-library/transparent/gy-lc4.png",
                specs: { Channels: "4 independent outputs", Timing: "1 us trigger resolution", Power: "24 VDC", Interface: "Ethernet / RS-485" },
                tags: ["Stroboskopsteuerung", "Recipes", "Mehrlicht"]
            },
            {
                name: "GY-OPT25",
                type: "Telezentrisches Optikmodul",
                summary: "Telezentrisches Objektivmodul für Maßprüfung, verzeichnungsarme Bildgebung und wiederholbare Messaufbauten.",
                kind: "camera",
                image: "product-library/transparent/gy-opt25.png",
                specs: { Optics: "25 mm class telecentric", Sensor: "Up to 2/3 inch", Distortion: "<0.08%", Mount: "C-mount" },
                tags: ["Telecentric", "Metrology", "Geringe Verzeichnung"]
            }
        ,
            {
                name: "GY-V900 Pro",
                type: "Smarte Area-Scan-Kamera",
                summary: "Robuste Smart-Kamera fuer KI-gestuetzte Inspektion, Montagepruefung, Positionierung und Quality Gates.",
                kind: "vision",
                image: "product-library/transparent/gy-v900-pro.png",
                specs: { Sensor: "9 MP global shutter", AI: "On-device inference", Interface: "GigE + I/O", Rating: "IP67 metal" },
                tags: ["AI vision", "9 MP", "GigE"]
            }
        ,
            {
                name: "GY-V3D900",
                type: "Industrielle 3D-Vision-Kamera",
                summary: "Stereo-Depth-Vision-Modul fuer Roboterfuehrung, Profilpruefung, Bin Handling und Masskontrolle.",
                kind: "vision",
                image: "product-library/transparent/gy-v3d900.png",
                specs: { Profile: "3D stereo / depth", Range: "900 mm class", Interface: "GigE Vision", Rating: "IP65 metal" },
                tags: ["3D vision", "Depth", "Robot cells"]
            }
        ,
            {
                name: "GY-CR900 Matrix",
                type: "Fester industrieller Code-Leser",
                summary: "Bildbasierter Leser fuer schnelle Barcode-, QR-, Data-Matrix- und DPM-Rueckverfolgbarkeit.",
                kind: "reader",
                image: "product-library/transparent/gy-cr900-matrix.png",
                specs: { Codes: "1D / 2D / DPM", Lens: "Autofocus option", Interface: "Ethernet / RS-232", Rating: "IP67 metal" },
                tags: ["DPM", "Traceability", "Ethernet"]
            }
        ]
    },
    "inspection-instruments": {
        eyebrow: "Qualität & Test Instruments",
        title: "Qualität & Test Instruments",
        navLabel: "Qualität & Test Instruments",
        heroImage: "product-hero-inspection-instruments-matrix.png",
        intro: "Portable und inlinefähige Messgeräte für Maßprüfung, Oberflächenbewertung, Code-Grading und Qualitätsdokumentation.",
        panelMetric: "5 Modelle",
        panelText: "Maß-, optische, Oberflächen-, Code-Verifikations- und portable elektrische Prüfgeräte.",
        sectionIntro: "GYUTRON inspection instruments are designed as practical quality-control tools for production engineers, lab teams, maintenance groups, and integrators.",
        products: [
            {
                name: "GY-MG50",
                type: "Digitales Messgerät",
                summary: "Tisch- und Vorrichtungsmessgerät für wiederholbare Maßprüfungen, Gut/Ausschuss-Prüfung und SPC-Datenerfassung.",
                kind: "instrument",
                image: "product-images/gy-mg50.png",
                specs: { Range: "50 mm stroke", Resolution: "1 um", Output: "USB / RS-485", Fixture: "Bench / inline" },
                tags: ["Maßprüfung", "SPC", "Vorrichtungsbereit"]
            },
            {
                name: "GY-VM200",
                type: "Bildmessgerät",
                summary: "Kompakte optische Messstation für Kleinteile, Kanten, Bohrungen, Nuten und Konturverifizierung.",
                kind: "instrument",
                image: "product-images/gy-vm200.png",
                specs: { Stage: "200 x 120 mm", Camera: "5 MP", Lighting: "White coaxial / ring", Output: "CSV / report" },
                tags: ["Optical", "Measurement", "Lab"]
            },
            {
                name: "GY-SF30",
                type: "Oberflächenrauheits-Prüfgerät",
                summary: "Tragbares Oberflächenprüfgerät für Rauheitsprüfungen an bearbeiteten Teilen, Werkzeugen und Wareneingangsmaterial.",
                kind: "instrument",
                image: "product-images/gy-sf30.png",
                specs: { Parameter: "Ra / Rz / Rq", Stroke: "5.6 mm", Display: "Color LCD", Data: "USB export" },
                tags: ["Rauheit", "Portable", "Bearbeitung"]
            },
            {
                name: "GY-CV100",
                type: "Barcode-Verifizierer",
                summary: "Verifizierungsgerät für Barcode-Qualitätsbewertung, Druckvalidierung und regulierte Rückverfolgungsprozesse.",
                kind: "instrument",
                image: "product-library/transparent/gy-cv100.png",
                specs: { Standards: "ISO / IEC grading", Codes: "1D / 2D / DPM", Light: "White calibrated", Report: "PDF / CSV" },
                tags: ["Codequalität", "Rückverfolgbarkeit", "Berichte"]
            },
            {
                name: "GY-ET75",
                type: "Industrielles Elektroprüfgerät",
                summary: "Handgehaltenes Wartungsgerät für Spannungs-, Durchgangs-, Sensorversorgungs- und Schaltschrankprüfungen.",
                kind: "instrument",
                image: "product-images/gy-et75.png",
                specs: { Voltage: "600 V CAT III", Inputs: "V / ohm / mA", Display: "Backlit LCD", Data: "Bluetooth option" },
                tags: ["Maintenance", "Cabinet checks", "Portable"]
            }
        ,
            {
                name: "GY-MG90",
                type: "Digitales Massmessgeraet",
                summary: "Praezisionsgeraet fuer Hoehe, Spalt, Hub und Vorrichtungsmessung in Produktion und QA.",
                kind: "instrument",
                image: "product-cutouts/generated/gy-mg90.png",
                specs: { Range: "90 mm stroke", Resolution: "1 um", Output: "USB / RS-485", Fixture: "Bench / inline" },
                tags: ["Metrology", "Height", "Fixture QA"]
            }
        ,
            {
                name: "GY-VM900",
                type: "Optisches Messsystem",
                summary: "Tischgeraet fuer optische Messung von Bauteilgeometrie, Kantenpruefung und Produktionsberichte.",
                kind: "instrument",
                image: "product-cutouts/generated/gy-vm900.png",
                specs: { Stage: "260 x 160 mm", Camera: "9 MP", Lighting: "Coaxial / ring", Output: "CSV / report" },
                tags: ["Optical metrology", "Benchtop", "QA report"]
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
GYUTRON_PRODUCTS["industrial-sensors"].redirectTo = "proximity-sensors";
GYUTRON_PRODUCTS["smart-cameras"].redirectTo = "area-scan-cameras";
GYUTRON_PRODUCTS["inspection-instruments"].redirectTo = "dimensional-gauges";

Object.assign(GYUTRON_PRODUCTS, {
    "proximity-sensors": {
        eyebrow: "Sensorik & I/O",
        title: "Anwesenheits- & Objekterkennung",
        navLabel: "Anwesenheits-/Objekterkennung",
        navGroup: "sensors",
        heroImage: "product-hero-proximity-sensors-matrix.png",
        intro: "Photoelektrische, induktive, Faser-, Ultraschall- und Sicherheitssensorik für Teileanwesenheit, Vorrichtungen, Fördertechnik und abgesicherte Stationen.",
        panelMetric: "6 Modelle",
        panelText: "Lichttaster, induktive, Faser- und Sicherheitssensorik für klare Detektionsaufgaben.",
        sectionIntro: "Diese Seite fasst Detektionsprodukte zusammen, statt sie mit Mess- oder Zustandsüberwachungsgeräten zu vermischen.",
        products: getProductsByName(["GY-PX18", "GY-PR12", "GY-FB200", "GY-SAFE24", "GY-PX90", "GY-SAFE90"])
    },
    "laser-measurement": {
        eyebrow: "Sensorik & I/O",
        title: "Distance & Position Sensoren",
        navLabel: "Abstand & Position",
        navGroup: "sensors",
        heroImage: "product-hero-laser-measurement-matrix.png",
        intro: "Berührungslose Laser- und Ultraschall-Distanzprodukte für Positionsprüfung, Spaltbestätigung, Füllstandserfassung und Maschinenfeedback.",
        panelMetric: "3 Modelle",
        panelText: "Laser-Wegmessung und Ultraschall-Abstandsmessung, ohne fremde IO- oder Faserverstärker-Produkte.",
        sectionIntro: "Diese Kategorie nutzt nun einen breiteren Rahmen „Abstand & Position“ und enthält nur Produkte, die tatsächlich Position oder Abstand messen.",
        products: getProductsByName(["GY-LD40", "GY-UL80", "GY-LD90"])
    },
    "environmental-sensing": {
        eyebrow: "Sensorik & I/O",
        title: "Prozess- & Zustandsüberwachung",
        navLabel: "Prozess & Zustand",
        navGroup: "sensors",
        heroImage: "product-hero-environmental-sensing-matrix.png",
        intro: "Druck-, Temperatur-, Feuchte-, Vibrations- und Sensornetzwerkprodukte für Uptime-Transparenz und Prozessstabilität.",
        panelMetric: "4 Modelle",
        panelText: "Umgebungsüberwachung, pneumatische Druckprüfung und verteilte IO-Diagnose.",
        sectionIntro: "Prozess- und Zustandsprodukte gehören zusammen, da Anwender sie zur Überwachung von Maschinenzustand, Schaltschrankbedingungen, Pneumatikleistung und Sensorstatus nutzen.",
        products: getProductsByName(["GY-PS60", "GY-ENV32", "GY-NET8", "GY-NET90"])
    },
    "area-scan-cameras": {
        eyebrow: "Machine-Vision-Systeme",
        title: "Smart- & Area-Scan-Kameras",
        navLabel: "Smart- & Area-Scan-Kameras",
        navGroup: "vision",
        heroImage: "product-hero-area-scan-cameras-matrix.png",
        intro: "2D-Smart-Kameras für Vollbildprüfung, Montageverifikation, Messtechnik, Führung und KI-gestützte Kontrollen.",
        panelMetric: "10 Modelle",
        panelText: "Kompakt-, Farb-, Mono-, KI-, Hochauflösungs-, Highspeed- und telezentrische Imaging-Optionen.",
        sectionIntro: "Flächenkameras erfassen ein vollständiges Bildfeld, wobei die zugehörige Optik in derselben Bildkette bleibt. Diese Auswahl trennt Sensorklasse, Geschwindigkeit, Auflösung, KI-Fähigkeit und Prüfaufgabe, damit Anwender Modelle realistischer eingrenzen können.",
        products: getProductsByName(["GY-V120", "GY-V160 Compact", "GY-V240 Color", "GY-V280 AI", "GY-V320 Mono", "GY-V380 Pro", "GY-V500 HR", "GY-V640 HS", "GY-OPT25", "GY-V900 Pro"])
    },
    "smart-vision-sensors": {
        eyebrow: "Machine-Vision-Systeme",
        title: "Vision-Controller & 3D-Systeme",
        navLabel: "Controller & 3D-Vision",
        navGroup: "vision",
        heroImage: "product-hero-smart-vision-sensors-matrix.png",
        intro: "Vision-Controller, 3D-Profilkameras und Line-Scan-Systeme für größere Prüfzellen und komplexere Anwendungen.",
        panelMetric: "10 Modelle",
        panelText: "Vision-Controller, 3D-Sensoren, Zeilenscan-Erfassung, Timing-I/O, Framegrabber, Blitzsteuerung und Roboterführungsmodule.",
        sectionIntro: "Diese Auswahl unterstützt vollständigere Machine-Vision-Zellen: Erfassung, Verarbeitung, 3D-Profilierung, Timing-I/O, Beleuchtungstriggerung, Bildaufnahme und Roboterführungs-Integration.",
        products: getProductsByName(["GY-VC8", "GY-V3D90", "GY-V3D150", "GY-VL2048", "GY-VX12", "GY-VIO16", "GY-LC4", "GY-VFG4", "GY-VRG200", "GY-V3D900"])
    },
    "code-reading-cameras": {
        eyebrow: "Machine-Vision-Systeme",
        title: "Codelesung & Verifizierung",
        navLabel: "Codelesung & Verifizierung",
        navGroup: "vision",
        heroImage: "product-hero-code-reading-cameras-matrix.png",
        intro: "Stationäre und mobile bildbasierte Leser für Barcode, QR, Data Matrix, DPM und regulierte Rückverfolgbarkeits-Workflows.",
        panelMetric: "9 Modelle",
        panelText: "Kompaktleser, DPM-Leser, Highspeed-Förderleser, Handheld-DPM, Inline-Verifizierung und Tunnelerfassung.",
        sectionIntro: "Bei der Rückverfolgbarkeit zählen Leserate, DPM-Fähigkeit, Sichtfeld, Verifizierungsnormen und Datenausgabe — daher umfasst diese Kategorie sowohl stationäre Leser als auch Bewertungs-Workflows.",
        products: getProductsByName(["GY-CR120", "GY-CR390", "GY-CR520 DPM", "GY-CR720 Conveyor", "GY-S300 DPM", "GY-CV100", "GY-CV220 Inline", "GY-RT800", "GY-CR900 Matrix"])
    },
    "vision-lighting": {
        eyebrow: "Machine-Vision-Systeme",
        title: "Vision-Beleuchtung",
        navLabel: "Vision-Beleuchtung",
        navGroup: "vision",
        heroImage: "product-hero-vision-lighting-matrix.png",
        intro: "Weißlicht-Beleuchtungszubehör für stabile Machine-Vision-Bilder ohne Farbverfälschung oder violette Lichteffekte.",
        panelMetric: "5 Modelle",
        panelText: "Ring-, Balken-, Dom-, Durchlicht- und Linienlicht-Beleuchtungsprodukte.",
        sectionIntro: "Vision-Beleuchtung bestimmt Bildstabilität, Defektkontrast und Messwiederholbarkeit. Diese Kategorie enthält nur Beleuchtungshardware; Controller und Optik liegen bei den übergeordneten Vision-System-Kategorien.",
        products: getProductsByName(["GY-LR70", "GY-LB220", "GY-LDome120", "GY-LBL150", "GY-LL300"])
    },
    "dimensional-gauges": {
        eyebrow: "Qualität & Test Instruments",
        title: "Maßprüfgeräte",
        navLabel: "Maßprüfgeräte",
        navGroup: "quality",
        heroImage: "product-hero-dimensional-gauges-matrix.png",
        intro: "Messwerkzeuge für Geometrie, Ausrichtung, Höhe, Spalt, Profil und Produktionstoleranzen.",
        panelMetric: "4 Modelle",
        panelText: "Tastende Messgeräte und optische Messstationen.",
        sectionIntro: "Dimensionsmessgeräte bleiben auf dedizierte Messtechnik beschränkt, während Abstandssensoren und 3D-Profilkameras in ihren eigenen Automatisierungskategorien verbleiben.",
        products: getProductsByName(["GY-MG50", "GY-VM200", "GY-MG90", "GY-VM900"])
    },
    "surface-inspection": {
        eyebrow: "Qualität & Test Instruments",
        title: "Oberflächenprüfung",
        navLabel: "Oberflächenprüfung",
        navGroup: "quality",
        heroImage: "product-hero-surface-inspection-matrix.png",
        intro: "Spezialisierte Oberflächenqualitätsgeräte für Rauheit, Glanz, Schichtdicke und sichtbare Finish-Prüfungen.",
        panelMetric: "3 Modelle",
        panelText: "Werkzeuge für Rauheit, Glanz und Schichtdicke, ohne Produkte aus Kamerasystemen zu entlehnen.",
        sectionIntro: "Die Oberflächeninspektion enthält jetzt nur dedizierte Oberflächenprüfgeräte, sodass Zeilenkameras und KI-Kameras in der Machine Vision bleiben.",
        products: [
            ...getProductsByName(["GY-SF30"]),
            {
                name: "GY-GL20",
                type: "Industrielles Glanzmessgerät",
                summary: "Tragbares Glanzmessgerät für Konsistenzprüfungen an Beschichtungen, Formteilen, lackiertem Metall und fertigen Oberflächen.",
                kind: "instrument",
                image: "product-images/gy-gl20.png",
                specs: { Geometry: "60 degree", Range: "0 to 1000 GU", Repeatability: "+/- 0.2 GU", Data: "USB / Bluetooth" },
                tags: ["Gloss", "Beschichtungen", "Oberflächenkontrolle"]
            },
            {
                name: "GY-CT45",
                type: "Schichtdickenmessgerät",
                summary: "Handgehaltenes Schichtdickenmessgerät für die Prüfung von Lack, Beschichtung, Eloxierung und Schutzschichten auf Metallteilen.",
                kind: "instrument",
                image: "product-images/gy-ct45.png",
                specs: { Range: "0 to 1500 um", Substrate: "Ferrous / non-ferrous", Probe: "Integrated", Data: "CSV export" },
                tags: ["Coating", "Lack", "Wareneingangsprüfung"]
            }
        ]
    },
    "portable-testers": {
        eyebrow: "Qualität & Test Instruments",
        title: "Portable Tester",
        navLabel: "Portable Tester",
        navGroup: "quality",
        heroImage: "product-hero-portable-testers-matrix.png",
        intro: "Handheld-Tester für elektrische, thermische und signalbezogene Prüfungen durch Wartungs- und Qualitätsteams.",
        panelMetric: "3 Modelle",
        panelText: "Werkzeuge für elektrische Sicherheit, Schleifensignale und Thermodiagnose.",
        sectionIntro: "Tragbare Prüfgeräte sind für Instandhaltungsteams und Qualitätsingenieure gedacht, die abseits fester Stationen schnelle Prüfungen benötigen. Prozesssensoren und Umgebungsmonitore bleiben in Sensorik & I/O.",
        products: [
            ...getProductsByName(["GY-ET75"]),
            {
                name: "GY-LT40",
                type: "Schleifensignal-Prüfgerät",
                summary: "Tragbarer Schleifenkalibrator zur Prüfung von 4–20-mA-Sensorsignalen, Regelkreisen und Schaltschrank-Inbetriebnahme.",
                kind: "instrument",
                image: "product-images/gy-lt40.png",
                specs: { Signal: "4-20 mA source / measure", Power: "24 V loop supply", Accuracy: "0.05% class", Display: "Backlit LCD" },
                tags: ["Schleifenprüfung", "Inbetriebnahme", "Maintenance"]
            },
            {
                name: "GY-TH90",
                type: "Thermisches Punktprüfgerät",
                summary: "Berührungsloses Temperaturprüfgerät für Schaltschränke, Motoren, Lager und schnelle Wartungsdiagnose.",
                kind: "instrument",
                image: "product-images/gy-th90.png",
                specs: { Range: "-30 C to 650 C", Optics: "12:1", Emissivity: "Adjustable", Data: "Bluetooth option" },
                tags: ["Thermal", "Maintenance", "Cabinet checks"]
            }
        ]
    },
    "calibration-tools": {
        eyebrow: "Qualität & Test Instruments",
        title: "Kalibrierwerkzeuge",
        navLabel: "Kalibrierwerkzeuge",
        navGroup: "quality",
        heroImage: "product-hero-calibration-tools-matrix.png",
        intro: "Kalibrier- und Verifizierungszubehör für Machine Vision, Messtechnik, Codequalität und dokumentierte Messmittelpflege.",
        panelMetric: "3 Modelle",
        panelText: "Gittertarget, Endmaß und Lichtreferenz-Werkzeuge.",
        sectionIntro: "Kalibrierwerkzeuge erhöhen die Wiederholbarkeit von Prüfsystemen, indem sie Einrichtungsverifizierung, rückführbare Prüfungen und dokumentierte Wartungsroutinen unterstützen.",
        products: [
            {
                name: "GY-CAL-Grid",
                type: "Vision-Kalibriertarget",
                summary: "Präzisions-Gittertarget für Kameraeinrichtung, Feldkalibrierung, Objektivverzeichnungsprüfung und Messausrichtung.",
                kind: "instrument",
                image: "product-images/gy-cal-grid.png",
                specs: { Pattern: "Ceramic grid", Size: "120 x 90 mm", Accuracy: "5 um class", Case: "Protective frame" },
                tags: ["Vision-Setup", "Kalibriergitter", "Metrology"]
            },
            {
                name: "GY-CAL-Block",
                type: "Endmaß-Satz",
                summary: "Referenzblock-Satz für Vorrichtungsmessgeräte, Tasterprüfung, Maßeinrichtung und routinemäßige Verifizierung.",
                kind: "instrument",
                image: "product-images/gy-cal-block.png",
                specs: { Material: "Hardened steel", Grade: "Workshop reference", Range: "1 to 50 mm", Case: "Indexed tray" },
                tags: ["Endmaße", "Tasterprüfung", "Vorrichtungseinrichtung"]
            },
            {
                name: "GY-CAL-Light",
                type: "Lichtreferenz kit",
                summary: "Weißlicht-Referenzkit für konsistente Vision-Beleuchtung, Belichtungseinrichtung und Prüfplatzkontrollen.",
                kind: "instrument",
                image: "product-images/gy-cal-light.png",
                specs: { Reference: "White diffuser", Control: "Portable module", Output: "Check record", Use: "Vision stations" },
                tags: ["Lichtreferenz", "Weißabgleich", "Vision-QS"]
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

export { GYUTRON_PRODUCTS, CATEGORY_GROUPS };
