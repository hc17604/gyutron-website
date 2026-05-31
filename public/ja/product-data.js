const GYUTRON_PRODUCTS = {
    "android-pda": {
        eyebrow: "堅牢PDA端末",
        title: "Android PDA",
        navLabel: "Android PDA",
        heroImage: "product-hero-android-pda-matrix.png",
        intro: "倉庫、製造、フィールドサービス、ラインサイドのデータ収集に対応する堅牢なAndroidハンドヘルド。",
        panelMetric: "6モデル",
        panelText: "タッチ、キーパッド、スキャングリップ、コールドチェーン、長時間バッテリーの選択肢。",
        products: [
            {
                name: "GY-A50",
                type: "コンパクトAndroid PDA",
                summary: "入荷、ピッキング、棚卸、ラインサイド照合に適した携帯しやすい5インチ端末。",
                kind: "pda",
                image: "product-images/gy-a50.png",
                specs: { OS: "Android 14", Display: "5.0 in HD", Scan: "1D/2D imager", Rugged: "IP67 / 1.6 m drop" },
                tags: ["Wi-Fi 6", "NFC", "4500 mAh"]
            },
            {
                name: "GY-A55 Pro",
                type: "汎用PDA",
                summary: "スキャン、カメラ記録、高速ローミングを必要とする物流チーム向けのバランス型ハンドヘルド。",
                kind: "pda",
                image: "product-images/gy-a55-pro.png",
                specs: { OS: "Android 14", Display: "5.5 in HD+", Scan: "Near/far 2D", Rugged: "IP67 / 1.8 m drop" },
                tags: ["4G LTE", "13 MP camera", "5000 mAh"]
            },
            {
                name: "GY-A60 Max",
                type: "大画面PDA",
                summary: "帳票、WMS画面、作業指示を扱うモバイル業務に適した6インチ堅牢端末。",
                kind: "pda",
                image: "product-images/gy-a60-max.png",
                specs: { OS: "Android 14", Display: "6.0 in FHD", Scan: "High-speed 2D", Rugged: "IP68 / 1.8 m drop" },
                tags: ["6 GB RAM", "Wi-Fi 6E", "5800 mAh"]
            },
            {
                name: "GY-A62K",
                type: "キーパッドPDA",
                summary: "手袋操作、反復スキャン、高処理量の倉庫業務に適した物理キー搭載モデル。",
                kind: "keypad",
                image: "product-images/gy-a62k.png",
                specs: { OS: "Android 13", Display: "4.0 in touch", Scan: "1D/2D angled", Rugged: "IP65 / 1.8 m drop" },
                tags: ["29 keys", "Scan handle", "5200 mAh"]
            },
            {
                name: "GY-A70 Cold",
                type: "コールドチェーンPDA",
                summary: "冷凍倉庫、食品物流、医薬品保管、冬季屋外作業に対応する堅牢ハンドヘルド。",
                kind: "pda",
                image: "product-images/gy-a70-cold.png",
                specs: { OS: "Android 14", Display: "5.7 in glove touch", Scan: "Condensation-ready 2D", Rugged: "IP67 / -25 C" },
                tags: ["Heated window", "Hot swap", "6500 mAh"]
            },
            {
                name: "GY-A80 Ultra",
                type: "超堅牢PDA",
                summary: "インフラ、ヤード、保全チーム、長時間の産業現場運用に向けた上位フィールドコンピュータ。",
                kind: "pda",
                image: "product-images/gy-a80-ultra.png",
                specs: { OS: "Android 14", Display: "6.2 in FHD", Scan: "Extended range 2D", Rugged: "IP68 / 2.0 m drop" },
                tags: ["5G option", "GNSS", "7200 mAh"]
            }
        ]
    },
    "rfid-handhelds": {
        eyebrow: "堅牢PDA端末",
        title: "RFIDハンドヘルド",
        navLabel: "RFIDハンドヘルド",
        heroImage: "product-hero-rfid-handhelds-matrix.png",
        intro: "在庫管理、資産追跡、入荷物流、ストックルーム、製造トレーサビリティ向けのAndroid UHF RFID端末。",
        panelMetric: "4モデル",
        panelText: "内蔵型、長距離、5G、エルゴノミックRFIDの選択肢。",
        products: [
            {
                name: "GY-R52 Compact",
                type: "UHF内蔵PDA",
                summary: "店舗棚卸、軽量倉庫業務、資産確認に適したコンパクトRFID端末。",
                kind: "rfid",
                image: "product-images/gy-r52-compact.png",
                specs: { OS: "Android 14", RFID: "UHF up to 4 m", Scan: "1D/2D optional", Rugged: "IP65 / 1.5 m drop" },
                tags: ["内蔵アンテナ", "NFC", "4500 mAh"]
            },
            {
                name: "GY-R60 Grip",
                type: "エルゴノミックRFIDリーダー",
                summary: "日次棚卸、パレット確認、返品処理に適したバランス型ピストルグリップRFIDリーダー。",
                kind: "rfid",
                image: "product-images/gy-r60-grip.png",
                specs: { OS: "Android 13", RFID: "UHF up to 8 m", Scan: "2D imager", Rugged: "IP65 / 1.6 m drop" },
                tags: ["円偏波アンテナ", "Wi-Fi 6", "6000 mAh"]
            },
            {
                name: "GY-R70 LongRange",
                type: "長距離RFIDリーダー",
                summary: "倉庫通路、ドックドア、一括タグ収集に対応する高出力UHFハンドヘルド。",
                kind: "rfid",
                image: "product-images/gy-r70-longrange.png",
                specs: { OS: "Android 14", RFID: "UHF up to 12 m", Scan: "2D + DPM option", Rugged: "IP67 / 1.8 m drop" },
                tags: ["33 dBm output", "5.5 in display", "7800 mAh"]
            },
            {
                name: "GY-R86 5G",
                type: "5G RFID端末",
                summary: "広域データ同期と安全なAndroidアプリ運用を必要とする現場資産管理チーム向けRFIDコンピュータ。",
                kind: "rfid",
                image: "product-images/gy-r86-5g.png",
                specs: { OS: "Android 14", RFID: "UHF up to 10 m", Scan: "Near/far 2D", Rugged: "IP67 / 1.8 m drop" },
                tags: ["5G", "Dual-band GNSS", "7000 mAh"]
            }
        ]
    },
    "barcode-scanners": {
        eyebrow: "堅牢PDA端末",
        title: "バーコードスキャナー",
        navLabel: "バーコードスキャナー",
        heroImage: "product-hero-barcode-scanners-matrix.png",
        intro: "1D、2D、DPM、長距離、ワイヤレスのスキャン業務に対応する産業用ハンドヘルドバーコードスキャナー。",
        panelMetric: "7モデル",
        panelText: "有線、無線、コールドチェーン、長距離、ウェアラブル、プレゼンテーション、ドックドア向けスキャンの選択肢。",
        products: [
            {
                name: "GY-S210",
                type: "汎用有線スキャナー",
                summary: "Durable area-imaging scanner for receiving desks, production benches, and packaging stations.",
                kind: "scanner",
                image: "product-images/gy-s210.png",
                specs: { Scan: "1D/2D area imager", Link: "USB-C / RS232", Motion: "Up to 4 m/s", Rugged: "IP54 / 1.5 m drop" },
                tags: ["プレゼンテーションモード", "白色LED", "高速デコード"]
            },
            {
                name: "GY-S240W",
                type: "産業用ワイヤレススキャナー",
                summary: "Cordless scanner with base station for pick-pack, shipping, and flexible workcells.",
                kind: "scanner",
                image: "product-images/gy-s240w.png",
                specs: { Scan: "1D/2D area imager", Link: "2.4G / Bluetooth", Range: "Up to 80 m open field", Rugged: "IP54 / 1.5 m drop" },
                tags: ["バッチメモリ", "充電クレードル", "2200 mAh"]
            },
            {
                name: "GY-S330 Cold",
                type: "コールドチェーンスキャナー",
                summary: "Wireless scanner for refrigerated warehouses, food processing, and low-temperature receiving.",
                kind: "scanner",
                image: "product-images/gy-s330-cold.png",
                specs: { Scan: "1D/2D", Link: "Bluetooth 5.2", Temp: "-30 C to 50 C", Rugged: "IP65 / 1.8 m drop" },
                tags: ["結露対策", "手袋対応グリップ", "3200 mAh"]
            },
            {
                name: "GY-S360 XR",
                type: "長距離対応スキャナー",
                summary: "Long-range model for rack labels, dock doors, pallet positions, and forklift-adjacent scan tasks.",
                kind: "scanner",
                image: "product-images/gy-s360-xr.png",
                specs: { Scan: "Near/far 1D/2D", Range: "10 cm to 15 m", Link: "Bluetooth / USB", Rugged: "IP65 / 2.0 m drop" },
                tags: ["長距離", "レーザー照準", "倉庫"]
            },
            {
                name: "GY-S410 Base",
                type: "ハンズフリースキャンステーション",
                summary: "Desktop scan module for benchtop verification, kitting, and small-parts traceability stations.",
                kind: "scanner",
                image: "product-images/gy-s410-base.png",
                specs: { Scan: "2D presentation", Mount: "Desktop / fixture", Link: "USB / Ethernet option", Rugged: "Sealed front window" },
                tags: ["自動トリガー", "治具組込対応", "白色光"]
            },
            {
                name: "GY-S520 Wear",
                type: "ウェアラブルリングスキャナー",
                summary: "Lightweight wearable scanner for hands-free picking, sorting, and replenishment tasks.",
                kind: "scanner",
                image: "product-images/gy-s520-wear.png",
                specs: { Scan: "1D/2D short range", Link: "Bluetooth 5.2", Battery: "Hot-swap 900 mAh", Rugged: "IP54 / 1.5 m drop" },
                tags: ["ウェアラブル", "ハンズフリー", "倉庫"]
            },
            {
                name: "GY-S680 Dock",
                type: "産業用ドックドアスキャナー",
                summary: "Fixed-position scanner for dock verification, pallet pass-through checks, and automated conveyor reads.",
                kind: "scanner",
                image: "product-images/gy-s680-dock.png",
                specs: { Scan: "Wide-angle 2D", Link: "Ethernet / USB", Trigger: "Photoeye input", Rugged: "IP65 metal housing" },
                tags: ["ドックドア", "コンベヤ", "Ethernet"]
            }
        ]
    },
    "request-specification": {
        eyebrow: "堅牢PDA端末",
        title: "仕様相談",
        sectionTitle: "仕様相談 packs",
        navLabel: "仕様相談",
        heroImage: "product-hero-request-specification-matrix.png",
        intro: "PDA、スキャナー、RFID、アクセサリ、ソフトウェア要件をGYUTRONとすり合わせたい購買担当者向けの構成パス。",
        panelMetric: "3 packs",
        panelText: "見積、サンプル、OEM / ODM相談の出発点として利用できます。",
        products: [
            {
                name: "GY-CONF-Scan",
                type: "Scan-only PDA package",
                summary: "Recommended baseline for warehouse teams that need Android PDA, 2D scan engine, dock, spare battery, and MDM profile.",
                kind: "config",
                image: "product-images/gy-conf-scan.png",
                specs: { Device: "A50 / A55 class", Scan: "Standard 2D", アクセサリ: "Dock + boot", Lead: "Sample in 7-10 days" },
                tags: ["倉庫", "棚卸", "スターターキット"]
            },
            {
                name: "GY-CONF-RFID",
                type: "RFID inventory package",
                summary: "UHF reader bundle for bulk stock count, asset tagging, retail stock rooms, and warehouse receiving.",
                kind: "config",
                image: "product-images/gy-conf-rfid.png",
                specs: { Device: "R60 / R70 class", RFID: "8-12 m option", アクセサリ: "Grip + charger", Lead: "Sample in 10-14 days" },
                tags: ["UHF", "資産追跡", "一括読取"]
            },
            {
                name: "GY-CONF-DPM",
                type: "Manufacturing DPM package",
                summary: "DPM scanner and PDA option for etched metal codes, traceability stations, and production verification.",
                kind: "config",
                image: "product-images/gy-conf-dpm.png",
                specs: { Device: "S300 / A60 class", Codes: "DPM + QR + DataMatrix", Lighting: "白色光", Lead: "Pilot in 2-3 weeks" },
                tags: ["DPM", "トレーサビリティ", "品質"]
            }
        ]
    },
    "industrial-sensors": {
        eyebrow: "Sensing & I/O",
        title: "Sensing & I/O",
        navLabel: "Sensing & I/O",
        heroImage: "product-hero-industrial-sensors-matrix.png",
        intro: "機械メーカーと工場自動化チーム向けの産業用センシング、計測、安全、I/Oハードウェア。",
        panelMetric: "9 models",
        panelText: "有無検知、距離測定、プロセス監視、安全、IO-Link接続。",
        sectionIntro: "GYUTRON sensing products are grouped by real factory jobs: detecting objects, measuring position, monitoring process conditions, protecting access points, and connecting distributed devices.",
        products: [
            {
                name: "GY-PX18",
                type: "光電センサー",
                summary: "Compact photoelectric sensor for conveyor detection, part presence, and general machine automation checks.",
                kind: "sensor",
                image: "product-images/gy-px18.png",
                specs: { Detection: "Diffuse / retroreflective", Range: "20 mm to 2.5 m", Output: "PNP / NPN", Housing: "IP67 compact" },
                tags: ["白色光", "M12 cable", "かんたん設定"]
            },
            {
                name: "GY-PR12",
                type: "誘導形近接センサー",
                summary: "Metal target detection for fixtures, index tables, cylinders, tooling, and harsh machine positions.",
                kind: "sensor",
                image: "product-images/gy-pr12.png",
                specs: { Detection: "Ferrous / non-ferrous", Range: "2 to 8 mm", Output: "PNP / NPN", Housing: "M12 stainless IP67" },
                tags: ["埋込取付", "高い繰返し精度", "工作機械"]
            },
            {
                name: "GY-LD40",
                type: "レーザー変位センサー",
                summary: "Non-contact distance and height measurement for position checks, gap inspection, and presence verification.",
                kind: "sensor",
                image: "product-images/gy-ld40.png",
                specs: { Measurement: "40 mm class", Resolution: "10 um", Output: "IO-Link / analog", Housing: "IP67 metal" },
                tags: ["レーザー位置決め", "アナログ出力", "ギャップ確認"]
            },
            {
                name: "GY-FB200",
                type: "Fiber amplifier sensor",
                summary: "Flexible fiber sensing for tight spaces, transparent targets, small parts, and difficult mounting conditions.",
                kind: "sensor",
                image: "product-images/gy-fb200.png",
                specs: { Channels: "Single / dual", Response: "80 us", Output: "PNP / NPN", Display: "Dual digital" },
                tags: ["Fiber head", "微小ワーク", "ティーチボタン"]
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
                tags: ["制御盤状態", "状態データ", "Modbus"]
            },
            {
                name: "GY-UL80",
                type: "Ultrasonic distance sensor",
                summary: "Non-contact sensing for level, loop control, and irregular targets where optical sensors struggle.",
                kind: "sensor",
                image: "product-images/gy-ul80.png",
                specs: { Range: "80 to 1200 mm", Output: "Analog + switch", Beam: "Narrow cone", Housing: "IP67" },
                tags: ["レベル", "透明体", "粉じん耐性"]
            },
            {
                name: "GY-SAFE24",
                type: "Safety light curtain",
                summary: "Protective sensing for machine openings, robotic stations, and operator access points.",
                kind: "sensor",
                image: "product-images/gy-safe24.png",
                specs: { Resolution: "24 mm", Height: "300 to 1200 mm", Safety: "タイプ 4 / PL e", Housing: "IP65 aluminum" },
                tags: ["機械安全", "Muting option", "位置合わせ支援"]
            },
            {
                name: "GY-NET8",
                type: "Sensor network hub",
                summary: "Connects distributed sensors to industrial networks while simplifying diagnostics and wiring.",
                kind: "sensor",
                image: "product-images/gy-net8.png",
                specs: { Ports: "8 x M12 IO-Link", Network: "EtherNet/IP / PROFINET", Power: "24 VDC", Housing: "IP67" },
                tags: ["IO-Link", "診断", "IP67 hub"]
            }
        ]
    },
    "smart-cameras": {
        eyebrow: "マシンビジョンシステム",
        title: "マシンビジョンシステム",
        navLabel: "マシンビジョンシステム",
        heroImage: "product-hero-smart-cameras-matrix.png",
        intro: "組込みスマートカメラ、固定式コードリーダー、ラインスキャン、3Dビジョン、コントローラー、照明アクセサリ。",
        panelMetric: "7モデル",
        panelText: "2D検査、AIツール、ラインスキャン、3Dプロファイル、コード読み取り、ビジョン制御の選択肢。",
        sectionIntro: "GYUTRON machine vision products follow common deployment patterns: embedded inspection, traceability reading, continuous web inspection, 3D profiling, and controlled white-light illumination.",
        products: [
            {
                name: "GY-V120",
                type: "Compact smart camera",
                summary: "Entry smart camera for presence checks, label verification, orientation, and basic pass / fail inspection.",
                kind: "camera",
                image: "product-images/gy-v120.png",
                specs: { Sensor: "1.6 MP CMOS", Lens: "C-mount / fixed", Interface: "Ethernet + I/O", Rating: "IP67 housing" },
                tags: ["2D inspection", "ティーチ設定", "白色光"]
            },
            {
                name: "GY-V160 Compact",
                type: "Compact area scan camera",
                summary: "Small-format industrial camera for tight machine spaces, fixture checks, part presence, and label verification.",
                kind: "camera",
                image: "product-images/gy-v160-compact.png",
                specs: { Sensor: "1.6 MP global shutter", Lens: "C-mount", Interface: "GigE + trigger I/O", Rating: "IP65 metal" },
                tags: ["コンパクト筐体", "グローバルシャッター", "治具組込対応"]
            },
            {
                name: "GY-V240 Color",
                type: "色検査 camera",
                summary: "Color area camera for packaging, label print, assembly color checks, and mixed-product verification.",
                kind: "camera",
                image: "product-images/gy-v240-color.png",
                specs: { Sensor: "2.4 MP color CMOS", Lens: "C-mount / liquid lens option", Interface: "GigE Vision", Rating: "IP65" },
                tags: ["色検査", "白色光", "ラベル検査"]
            },
            {
                name: "GY-V280 AI",
                type: "AI vision sensor",
                summary: "Embedded AI inspection camera for defect detection, classification, OCR, and variable part appearance.",
                kind: "camera",
                image: "product-images/gy-v280-ai.png",
                specs: { Sensor: "2.8 MP global shutter", AI: "On-device inference", Interface: "GigE / discrete I/O", Rating: "IP67" },
                tags: ["AI tools", "OCR", "欠陥"]
            },
            {
                name: "GY-V320 Mono",
                type: "Monochrome area scan camera",
                summary: "High-contrast monochrome camera for metrology, edge detection, alignment, and feature inspection.",
                kind: "camera",
                image: "product-images/gy-v320-mono.png",
                specs: { Sensor: "3.2 MP mono global shutter", Pixel: "3.45 um", Interface: "GigE / strobe I/O", Rating: "IP65" },
                tags: ["モノクロセンサー", "エッジコントラスト", "Measurement"]
            },
            {
                name: "GY-V380 Pro",
                type: "High-speed smart camera",
                summary: "Fast embedded vision system for assembly verification, metrology, guidance, and line-side quality control.",
                kind: "camera",
                image: "product-images/gy-v380-pro.png",
                specs: { Sensor: "5 MP global shutter", Speed: "Up to 90 fps", Interface: "GigE / PROFINET", Rating: "IP67" },
                tags: ["High speed", "PLC接続対応", "Metrology"]
            },
            {
                name: "GY-V500 HR",
                type: "High-resolution area camera",
                summary: "High-resolution inspection camera for small defects, fine print, dense labels, and precision assembly checks.",
                kind: "camera",
                image: "product-images/gy-v500-hr.png",
                specs: { Sensor: "5.0 MP global shutter", Speed: "Up to 72 fps", Interface: "GigE Vision / USB3 option", Rating: "IP65" },
                tags: ["高解像度", "微細ディテール", "印字品質"]
            },
            {
                name: "GY-V640 HS",
                type: "High-speed area scan camera",
                summary: "Fast area-scan model for moving parts, conveyor inspection, pick verification, and motion-sensitive capture.",
                kind: "camera",
                image: "product-images/gy-v640-hs.png",
                specs: { Sensor: "6.4 MP global shutter", Speed: "Up to 118 fps", Interface: "2.5GigE + encoder", Rating: "IP65" },
                tags: ["High speed", "コンベヤ", "Encoder sync"]
            },
            {
                name: "GY-V3D90",
                type: "3D profile camera",
                summary: "3D laser profile camera for height, volume, gap, bead, and surface feature measurement.",
                kind: "camera",
                image: "product-images/gy-v3d90.png",
                specs: { Profile: "3D laser triangulation", Range: "90 mm class", Interface: "GigE Vision", Rating: "IP65" },
                tags: ["3D profile", "高さ確認", "Robot guidance"]
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
                tags: ["DPM", "トレーサビリティ", "高読取率"]
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
                tags: ["3D profile", "広範囲", "ロボットセル"]
            },
            {
                name: "GY-VX12",
                type: "AI vision processor",
                summary: "Rack-style processing unit for multi-camera AI inspection, image archiving, and high-throughput production lines.",
                kind: "camera",
                image: "product-images/gy-vx12.png",
                specs: { Cameras: "Up to 12 streams", AI: "Industrial inference engine", Network: "2.5GigE / PROFINET", Storage: "2 TB option" },
                tags: ["AI processor", "ラックマウント", "Multi-camera"]
            },
            {
                name: "GY-VIO16",
                type: "Vision I/O expansion module",
                summary: "Field I/O module for lighting triggers, encoder signals, reject gates, and inspection-cell synchronization.",
                kind: "camera",
                image: "product-images/gy-vio16.png",
                specs: { "I/O": "16 digital inputs / outputs", Timing: "10 us trigger path", Network: "EtherCAT / Ethernet", Rating: "IP67" },
                tags: ["Trigger I/O", "Encoder sync", "セル配線"]
            },
            {
                name: "GY-VFG4",
                type: "Industrial frame grabber",
                summary: "Frame-grabber module for high-bandwidth line-scan and specialty camera acquisition in inspection PCs.",
                kind: "camera",
                image: "product-images/gy-vfg4.png",
                specs: { Channels: "4 camera inputs", Bus: "PCIe x8", Throughput: "Up to 6.4 GB/s", SDK: "C / Python / .NET" },
                tags: ["Frame grabber", "Line scan", "高帯域"]
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
                specs: { Codes: "1D / 2D", Sensor: "1.2 MP global shutter", Illumination: "白色LED", Rating: "IP65" },
                tags: ["Compact reader", "トレーサビリティ", "白色LED"]
            },
            {
                name: "GY-CR520 DPM",
                type: "DPM fixed code reader",
                summary: "High-contrast reader for etched, laser-marked, dot-peen, and low-contrast codes on metal or plastic parts.",
                kind: "camera",
                image: "product-images/gy-cr520-dpm.png",
                specs: { Codes: "DPM / QR / Data Matrix", Lighting: "White + polarizer", Lens: "Autofocus option", Rating: "IP67" },
                tags: ["DPM", "低コントラスト", "Manufacturing"]
            },
            {
                name: "GY-CR720 コンベヤ",
                type: "High-speed code reader",
                summary: "Reader module for conveyor, sortation, package verification, and fast moving traceability lines.",
                kind: "camera",
                image: "product-images/gy-cr720-conveyor.png",
                specs: { Codes: "1D / 2D", Speed: "Up to 5 m/s", Field: "Wide-angle optics", Network: "Ethernet / RS-232" },
                tags: ["コンベヤ", "High speed", "広視野"]
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
                tags: ["コードグレーディング", "インライン品質保証", "監査証跡"]
            },
            {
                name: "GY-RT800",
                type: "Multi-camera reader module",
                summary: "Tunnel-style reader module for multi-side package, tote, and tray code capture in logistics lines.",
                kind: "camera",
                image: "product-images/gy-rt800.png",
                specs: { Readers: "4 synchronized imagers", Field: "Multi-side capture", Trigger: "Photoeye / encoder", Network: "Ethernet / API" },
                tags: ["トンネル読取", "Logistics", "Multi-side"]
            },
            {
                name: "GY-LR70",
                type: "White ring light",
                summary: "Compact ring light for lens-centered inspection, label checks, feature contrast, and small-part stations.",
                kind: "camera",
                image: "product-images/gy-lr70.png",
                specs: { Lighting: "白色LED", Diameter: "70 mm", Control: "Strobe / constant", Mount: "C-mount adapter" },
                tags: ["リング照明", "白色LED", "レンズマウント"]
            },
            {
                name: "GY-LB220",
                type: "White bar light",
                summary: "Linear bar light for edge definition, conveyor inspection, packaging checks, and controlled side illumination.",
                kind: "camera",
                image: "product-images/gy-lb220.png",
                specs: { Lighting: "白色LED", Length: "220 mm", Control: "PWM / strobe", Housing: "Finned aluminum" },
                tags: ["バー照明", "サイド照明", "治具組込対応"]
            },
            {
                name: "GY-LDome120",
                type: "Dome light",
                summary: "Diffuse white dome light for reflective parts, curved surfaces, and low-glare vision inspection.",
                kind: "camera",
                image: "product-images/gy-ldome120.png",
                specs: { Lighting: "Diffuse white", Diameter: "120 mm", Opening: "Camera center port", Housing: "Aluminum dome" },
                tags: ["Dome", "低グレア", "Reflective parts"]
            },
            {
                name: "GY-LBL150",
                type: "White backlight panel",
                summary: "Diffuse framed backlight for silhouette inspection, hole detection, outline measurement, and transparent-part checks.",
                kind: "camera",
                image: "product-images/gy-lbl150.png",
                specs: { Lighting: "Diffuse white", Area: "150 x 120 mm", Control: "Constant / strobe", Housing: "Finned aluminum frame" },
                tags: ["バックライト", "シルエット", "Measurement"]
            },
            {
                name: "GY-LCX60",
                type: "Coaxial light module",
                summary: "Coaxial illumination for flat reflective surfaces, print inspection, alignment marks, and low-shadow imaging.",
                kind: "camera",
                image: "product-images/gy-lcx60.png",
                specs: { Lighting: "White coaxial", Aperture: "60 mm class", Control: "Strobe-ready", Mount: "C-mount path" },
                tags: ["Coaxial", "Reflective parts", "印字検査"]
            },
            {
                name: "GY-LL300",
                type: "High-output line light",
                summary: "Long linear light for line-scan inspection, web materials, labels, film, and conveyor edge definition.",
                kind: "camera",
                image: "product-images/gy-ll300.png",
                specs: { Lighting: "白色LED line", Length: "300 mm", Control: "High-current strobe", Cooling: "Finned housing" },
                tags: ["Line scan", "高出力", "Web inspection"]
            },
            {
                name: "GY-LC4",
                type: "Four-channel strobe controller",
                summary: "Lighting controller for synchronized strobes, intensity recipes, encoder timing, and multi-light stations.",
                kind: "camera",
                image: "product-images/gy-lc4.png",
                specs: { Channels: "4 independent outputs", Timing: "1 us trigger resolution", Power: "24 VDC", Interface: "Ethernet / RS-485" },
                tags: ["ストロボ制御", "Recipes", "複数照明"]
            },
            {
                name: "GY-OPT25",
                type: "Telecentric optics module",
                summary: "Telecentric lens module for dimensional inspection, low-distortion imaging, and repeatable measurement setups.",
                kind: "camera",
                image: "product-images/gy-opt25.png",
                specs: { Optics: "25 mm class telecentric", Sensor: "Up to 2/3 inch", Distortion: "<0.08%", Mount: "C-mount" },
                tags: ["Telecentric", "Metrology", "低歪み"]
            }
        ]
    },
    "inspection-instruments": {
        eyebrow: "品質 & Test Instruments",
        title: "品質 & Test Instruments",
        navLabel: "品質 & Test Instruments",
        heroImage: "product-hero-inspection-instruments-matrix.png",
        intro: "寸法確認、表面評価、コードグレーディング、品質記録に対応するポータブルおよびインライン計測機器。",
        panelMetric: "5モデル",
        panelText: "寸法、光学、表面、コード検証、ハンドヘルド電気試験機器。",
        sectionIntro: "GYUTRON inspection instruments are designed as practical quality-control tools for production engineers, lab teams, maintenance groups, and integrators.",
        products: [
            {
                name: "GY-MG50",
                type: "Digital measurement gauge",
                summary: "Bench and fixture gauge for repeatable dimensional checks, go / no-go inspection, and SPC data capture.",
                kind: "instrument",
                image: "product-images/gy-mg50.png",
                specs: { Range: "50 mm stroke", Resolution: "1 um", Output: "USB / RS-485", Fixture: "Bench / inline" },
                tags: ["寸法測定", "SPC", "治具対応"]
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
                tags: ["粗さ", "Portable", "加工"]
            },
            {
                name: "GY-CV100",
                type: "Barcode verifier",
                summary: "Verification instrument for barcode quality grading, print validation, and regulated traceability workflows.",
                kind: "instrument",
                image: "product-images/gy-cv100.png",
                specs: { Standards: "ISO / IEC grading", Codes: "1D / 2D / DPM", Light: "White calibrated", Report: "PDF / CSV" },
                tags: ["コード品質", "トレーサビリティ", "レポート"]
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

function get製品Byお名前(names) {
    const all製品 = Object.values(GYUTRON_PRODUCTS).flatMap((category) => category.products || []);
    return names.map((name) => {
        const product = all製品.find((item) => item.name === name);
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
        intro: "部品有無、治具、コンベア、安全エリア向けの光電、近接、ファイバー、超音波、安全センサー。",
        panelMetric: "4モデル",
        panelText: "Photoelectric, inductive, fiber, and safety sensing for clear detection jobs.",
        sectionIntro: "This page keeps detection products together instead of mixing them with measurement or condition-monitoring devices.",
        products: get製品Byお名前(["GY-PX18", "GY-PR12", "GY-FB200", "GY-SAFE24"])
    },
    "laser-measurement": {
        eyebrow: "Sensing & I/O",
        title: "Distance & Position センサー",
        navLabel: "Distance & Position",
        navGroup: "sensors",
        heroImage: "product-hero-laser-measurement-matrix.png",
        intro: "位置確認、ギャップ確認、レベル検知、機械フィードバック向けの非接触レーザー・超音波距離製品。",
        panelMetric: "2 models",
        panelText: "Laser displacement and ultrasonic distance sensing, without unrelated IO or fiber-amplifier products.",
        sectionIntro: "This category now uses a broader distance-and-position framing and only includes products that genuinely measure position or distance.",
        products: get製品Byお名前(["GY-LD40", "GY-UL80"])
    },
    "environmental-sensing": {
        eyebrow: "Sensing & I/O",
        title: "Process & Condition Monitoring",
        navLabel: "Process & Condition",
        navGroup: "sensors",
        heroImage: "product-hero-environmental-sensing-matrix.png",
        intro: "稼働状況の可視化とプロセス安定化に向けた圧力、温度、湿度、振動、センサーネットワーク製品。",
        panelMetric: "3モデル",
        panelText: "Environmental monitoring, pneumatic pressure checks, and distributed IO diagnostics.",
        sectionIntro: "Process and condition products belong together because buyers use them to monitor machine health, cabinet conditions, pneumatic performance, and connected sensor status.",
        products: get製品Byお名前(["GY-PS60", "GY-ENV32", "GY-NET8"])
    },
    "area-scan-cameras": {
        eyebrow: "マシンビジョンシステム",
        title: "スマート・エリアスキャンカメラ",
        navLabel: "スマート・エリアスキャンカメラ",
        navGroup: "vision",
        heroImage: "product-hero-area-scan-cameras-matrix.png",
        intro: "フルフレーム検査、組立確認、計測、ガイダンス、AI支援検査に対応する2Dスマートカメラ。",
        panelMetric: "9 models",
        panelText: "Compact, color, mono, AI, high-resolution, high-speed, and telecentric imaging options.",
        sectionIntro: "Area-scan products capture a full image frame, with supporting optics kept in the same imaging chain. This lineup separates sensor class, speed, resolution, AI capability, and inspection role so buyers can shortlist models more realistically.",
        products: get製品Byお名前(["GY-V120", "GY-V160 Compact", "GY-V240 Color", "GY-V280 AI", "GY-V320 Mono", "GY-V380 Pro", "GY-V500 HR", "GY-V640 HS", "GY-OPT25"])
    },
    "smart-vision-sensors": {
        eyebrow: "マシンビジョンシステム",
        title: "Vision Controllers & 3D Systems",
        navLabel: "コントローラ・3Dビジョン",
        navGroup: "vision",
        heroImage: "product-hero-smart-vision-sensors-matrix.png",
        intro: "大型検査セルや複雑な用途向けのビジョンコントローラー、3Dプロファイルカメラ、ラインスキャンシステム。",
        panelMetric: "9 models",
        panelText: "Vision controllers, 3D sensors, line-scan acquisition, timing I/O, frame-grabber, strobe control, and robot guidance modules.",
        sectionIntro: "This lineup supports more complete machine vision cells: acquisition, processing, 3D profiling, timing I/O, illumination triggering, frame capture, and robot-guidance integration.",
        products: get製品Byお名前(["GY-VC8", "GY-V3D90", "GY-V3D150", "GY-VL2048", "GY-VX12", "GY-VIO16", "GY-LC4", "GY-VFG4", "GY-VRG200"])
    },
    "code-reading-cameras": {
        eyebrow: "マシンビジョンシステム",
        title: "Code Reading & Verification",
        navLabel: "Code Reading & Verification",
        navGroup: "vision",
        heroImage: "product-hero-code-reading-cameras-matrix.png",
        intro: "バーコード、QR、Data Matrix、DPM、規制対応トレーサビリティ向けの固定式・ハンドヘルド画像リーダー。",
        panelMetric: "8 models",
        panelText: "Compact readers, DPM readers, high-speed conveyor readers, handheld DPM, inline verification, and tunnel capture.",
        sectionIntro: "トレーサビリティ buyers think in terms of read rate, DPM capability, field of view, verification standards, and record output, so this category now covers both fixed readers and grading workflows.",
        products: get製品Byお名前(["GY-CR120", "GY-CR390", "GY-CR520 DPM", "GY-CR720 コンベヤ", "GY-S300 DPM", "GY-CV100", "GY-CV220 Inline", "GY-RT800"])
    },
    "vision-lighting": {
        eyebrow: "マシンビジョンシステム",
        title: "画像処理用照明",
        navLabel: "画像処理用照明",
        navGroup: "vision",
        heroImage: "product-hero-vision-lighting-matrix.png",
        intro: "色ずれや紫色照明感を抑え、安定した画像取得を支える白色マシンビジョン照明アクセサリ。",
        panelMetric: "5モデル",
        panelText: "Ring, bar, dome, backlight, and line-light illumination products.",
        sectionIntro: "Vision lighting products determine image stability, defect contrast, and measurement repeatability. This category now keeps only illumination hardware, while controllers and optics live with the broader vision system categories.",
        products: get製品Byお名前(["GY-LR70", "GY-LB220", "GY-LDome120", "GY-LBL150", "GY-LL300"])
    },
    "dimensional-gauges": {
        eyebrow: "品質 & Test Instruments",
        title: "寸法ゲージ",
        navLabel: "寸法ゲージ",
        navGroup: "quality",
        heroImage: "product-hero-dimensional-gauges-matrix.png",
        intro: "形状、位置合わせ、高さ、ギャップ、プロファイル、生産公差確認のための計測ツール。",
        panelMetric: "2 models",
        panelText: "Contact gauge and optical measurement station options.",
        sectionIntro: "寸法測定 gauges are kept to dedicated metrology instruments, while distance sensors and 3D profile cameras remain in their own automation categories.",
        products: get製品Byお名前(["GY-MG50", "GY-VM200"])
    },
    "surface-inspection": {
        eyebrow: "品質 & Test Instruments",
        title: "表面検査",
        navLabel: "表面検査",
        navGroup: "quality",
        heroImage: "product-hero-surface-inspection-matrix.png",
        intro: "粗さ、光沢、膜厚、外観仕上げ確認に対応する専用の表面品質機器。",
        panelMetric: "3モデル",
        panelText: "粗さ, gloss, and coating-thickness tools without borrowing camera-system products.",
        sectionIntro: "Surface inspection now contains only dedicated surface-quality instruments, so line-scan cameras and AI cameras stay in machine vision.",
        products: [
            ...get製品Byお名前(["GY-SF30"]),
            {
                name: "GY-GL20",
                type: "Industrial gloss meter",
                summary: "Portable gloss meter for coating, molded-part, painted-metal, and finished-surface consistency checks.",
                kind: "instrument",
                image: "product-images/gy-gl20.png",
                specs: { Geometry: "60 degree", Range: "0 to 1000 GU", Repeatability: "+/- 0.2 GU", Data: "USB / Bluetooth" },
                tags: ["Gloss", "コーティング", "外観仕上げ管理"]
            },
            {
                name: "GY-CT45",
                type: "Coating thickness tester",
                summary: "Handheld coating gauge for paint, plating, anodizing, and protective coating inspection on metal parts.",
                kind: "instrument",
                image: "product-images/gy-ct45.png",
                specs: { Range: "0 to 1500 um", Substrate: "Ferrous / non-ferrous", Probe: "Integrated", Data: "CSV export" },
                tags: ["Coating", "塗装", "受入検査"]
            }
        ]
    },
    "portable-testers": {
        eyebrow: "品質 & Test Instruments",
        title: "ポータブルテスター",
        navLabel: "ポータブルテスター",
        navGroup: "quality",
        heroImage: "product-hero-portable-testers-matrix.png",
        intro: "保全チームと現場品質確認向けの電気、熱、信号用ハンドヘルドテスター。",
        panelMetric: "3モデル",
        panelText: "Electrical safety, loop-signal, and thermal diagnostic tools.",
        sectionIntro: "Portable testers are selected for maintenance teams and quality engineers who need quick checks away from fixed stations. Process sensors and environmental monitors stay in Sensing & I/O.",
        products: [
            ...get製品Byお名前(["GY-ET75"]),
            {
                name: "GY-LT40",
                type: "Loop signal tester",
                summary: "Portable loop calibrator for checking 4-20 mA sensor signals, control loops, and cabinet commissioning work.",
                kind: "instrument",
                image: "product-images/gy-lt40.png",
                specs: { Signal: "4-20 mA source / measure", Power: "24 V loop supply", Accuracy: "0.05% class", Display: "Backlit LCD" },
                tags: ["ループチェック", "立ち上げ", "Maintenance"]
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
        eyebrow: "品質 & Test Instruments",
        title: "校正ツール",
        navLabel: "校正ツール",
        navGroup: "quality",
        heroImage: "product-hero-calibration-tools-matrix.png",
        intro: "マシンビジョン、計測、コード品質、測定ライフサイクル記録向けの校正・検証アクセサリ。",
        panelMetric: "3モデル",
        panelText: "グリッドターゲット, gauge block, and light-reference tools.",
        sectionIntro: "Calibration tools make inspection systems more repeatable by supporting setup verification, traceable checks, and documented maintenance routines.",
        products: [
            {
                name: "GY-CAL-Grid",
                type: "Vision calibration target",
                summary: "Precision grid target for camera setup, field calibration, lens distortion checks, and measurement alignment.",
                kind: "instrument",
                image: "product-images/gy-cal-grid.png",
                specs: { Pattern: "Ceramic grid", Size: "120 x 90 mm", Accuracy: "5 um class", Case: "Protective frame" },
                tags: ["画像処理設定", "グリッドターゲット", "Metrology"]
            },
            {
                name: "GY-CAL-Block",
                type: "Gauge block kit",
                summary: "Reference block kit for fixture gauges, probe checks, dimensional setup, and routine verification.",
                kind: "instrument",
                image: "product-images/gy-cal-block.png",
                specs: { Material: "Hardened steel", Grade: "Workshop reference", Range: "1 to 50 mm", Case: "Indexed tray" },
                tags: ["ゲージブロック", "プローブ確認", "治具設定"]
            },
            {
                name: "GY-CAL-Light",
                type: "照明基準 kit",
                summary: "画像処理照明の一貫性、露光設定、検査ステーション確認に使う白色光リファレンスキット。",
                kind: "instrument",
                image: "product-images/gy-cal-light.png",
                specs: { Reference: "White diffuser", Control: "Portable module", Output: "Check record", Use: "Vision stations" },
                tags: ["照明基準", "ホワイトバランス", "画像処理QA"]
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
