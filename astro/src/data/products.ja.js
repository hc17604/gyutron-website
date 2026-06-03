const GYUTRON_PRODUCTS = {
    "android-pda": {
        eyebrow: "堅牢PDA端末",
        title: "Android PDA端末",
        navLabel: "Android PDA",
        heroImage: "product-hero-android-pda-matrix.png",
        intro: "倉庫、製造、フィールドサービス、ラインサイドのデータ収集に対応する堅牢なAndroidハンドヘルド。",
        panelMetric: "8モデル",
        panelText: "タッチ、キーパッド、スキャングリップ、コールドチェーン、長時間バッテリーの選択肢。",
        products: [
            {
                name: "GY-A50",
                type: "コンパクトAndroid PDA",
                summary: "入荷、ピッキング、棚卸、ラインサイド照合に適した携帯しやすい5インチ端末。",
                kind: "pda",
                image: "product-library/transparent/gy-a50.png",
                specs: { OS: "Android 14", Display: "5.0 in HD", Scan: "1D/2D imager", Rugged: "IP67 / 1.6 m drop" },
                tags: ["Wi-Fi 6", "NFC", "4500 mAh"]
            },
            {
                name: "GY-A55 Pro",
                type: "汎用PDA",
                summary: "スキャン、カメラ記録、高速ローミングを必要とする物流チーム向けのバランス型ハンドヘルド。",
                kind: "pda",
                image: "product-library/transparent/gy-a55-pro.png",
                specs: { OS: "Android 14", Display: "5.5 in HD+", Scan: "Near/far 2D", Rugged: "IP67 / 1.8 m drop" },
                tags: ["4G LTE", "13 MP camera", "5000 mAh"]
            },
            {
                name: "GY-A60 Max",
                type: "大画面PDA",
                summary: "帳票、WMS画面、作業指示を扱うモバイル業務に適した6インチ堅牢端末。",
                kind: "pda",
                image: "product-library/transparent/gy-a60-max.png",
                specs: { OS: "Android 14", Display: "6.0 in FHD", Scan: "High-speed 2D", Rugged: "IP68 / 1.8 m drop" },
                tags: ["6 GB RAM", "Wi-Fi 6E", "5800 mAh"]
            },
            {
                name: "GY-A62K",
                type: "キーパッドPDA",
                summary: "手袋操作、反復スキャン、高処理量の倉庫業務に適した物理キー搭載モデル。",
                kind: "keypad",
                image: "product-library/transparent/gy-a62k.png",
                specs: { OS: "Android 13", Display: "4.0 in touch", Scan: "1D/2D angled", Rugged: "IP65 / 1.8 m drop" },
                tags: ["29 keys", "Scan handle", "5200 mAh"]
            },
            {
                name: "GY-A92K KeyTouch",
                type: "キーパッド付きモバイルデータ端末",
                summary: "タッチ画面と物理キーを備えた堅牢Android PDA。手袋操作、ピッキング、ラインサイドのデータ収集に適しています。",
                kind: "keypad",
                image: "product-library/transparent/gy-a92k-keytouch.png",
                specs: { OS: "Android 14", Display: "4.7 in touch", Scan: "Angled 2D imager", Rugged: "IP67 / 1.8 m drop" },
                tags: ["数字キーパッド", "手袋操作", "5800 mAh"]
            },
            {
                name: "GY-A70 Cold",
                type: "コールドチェーンPDA",
                summary: "冷凍倉庫、食品物流、医薬品保管、冬季屋外作業に対応する堅牢ハンドヘルド。",
                kind: "pda",
                image: "product-library/transparent/gy-a70-cold.png",
                specs: { OS: "Android 14", Display: "5.7 in glove touch", Scan: "Condensation-ready 2D", Rugged: "IP67 / -25 C" },
                tags: ["Heated window", "Hot swap", "6500 mAh"]
            },
            {
                name: "GY-A80 Ultra",
                type: "超堅牢PDA",
                summary: "インフラ、ヤード、保全チーム、長時間の産業現場運用に向けた上位フィールドコンピュータ。",
                kind: "pda",
                image: "product-library/transparent/gy-a80-ultra.png",
                specs: { OS: "Android 14", Display: "6.2 in FHD", Scan: "Extended range 2D", Rugged: "IP68 / 2.0 m drop" },
                tags: ["5G option", "GNSS", "7200 mAh"]
            }
        ,
            {
                name: "GY-A90 Touch",
                type: "タッチスクリーン式モバイルデータ端末",
                summary: "倉庫・製造・現場でのスキャン中心の業務に最適な、キーパッド非搭載の堅牢Android PDA。",
                kind: "pda",
                image: "product-library/transparent/gy-a90-touch.png",
                specs: { OS: "Android 14", Display: "6.1 in FHD touch", Scan: "Integrated 2D imager", Rugged: "IP68 / 1.8 m drop" },
                tags: ["Touch only", "Wi-Fi 6E", "6200 mAh"]
            }
        ]
    },
    "rfid-handhelds": {
        eyebrow: "堅牢PDA端末",
        title: "RFIDハンドヘルド",
        navLabel: "RFIDハンドヘルド",
        heroImage: "product-hero-rfid-handhelds-matrix.png",
        intro: "在庫管理、資産追跡、入荷物流、ストックルーム、製造トレーサビリティ向けのAndroid UHF RFID端末。",
        panelMetric: "5 モデル",
        panelText: "内蔵型、長距離、5G、エルゴノミックRFIDの選択肢。",
        products: [
            {
                name: "GY-R52 Compact",
                type: "UHF内蔵PDA",
                summary: "店舗棚卸、軽量倉庫業務、資産確認に適したコンパクトRFID端末。",
                kind: "rfid",
                image: "product-library/transparent/gy-r52-compact.png",
                specs: { OS: "Android 14", RFID: "UHF up to 4 m", Scan: "1D/2D optional", Rugged: "IP65 / 1.5 m drop" },
                tags: ["内蔵アンテナ", "NFC", "4500 mAh"]
            },
            {
                name: "GY-R60 Grip",
                type: "エルゴノミックRFIDリーダー",
                summary: "日次棚卸、パレット確認、返品処理に適したバランス型ピストルグリップRFIDリーダー。",
                kind: "rfid",
                image: "product-library/transparent/gy-r60-grip.png",
                specs: { OS: "Android 13", RFID: "UHF up to 8 m", Scan: "2D imager", Rugged: "IP65 / 1.6 m drop" },
                tags: ["円偏波アンテナ", "Wi-Fi 6", "6000 mAh"]
            },
            {
                name: "GY-R70 LongRange",
                type: "長距離RFIDリーダー",
                summary: "倉庫通路、ドックドア、一括タグ収集に対応する高出力UHFハンドヘルド。",
                kind: "rfid",
                image: "product-library/transparent/gy-r70-longrange.png",
                specs: { OS: "Android 14", RFID: "UHF up to 12 m", Scan: "2D + DPM option", Rugged: "IP67 / 1.8 m drop" },
                tags: ["33 dBm output", "5.5 in display", "7800 mAh"]
            },
            {
                name: "GY-R86 5G",
                type: "5G RFID端末",
                summary: "広域データ同期と安全なAndroidアプリ運用を必要とする現場資産管理チーム向けRFIDコンピュータ。",
                kind: "rfid",
                image: "product-library/transparent/gy-r86-5g.png",
                specs: { OS: "Android 14", RFID: "UHF up to 10 m", Scan: "Near/far 2D", Rugged: "IP67 / 1.8 m drop" },
                tags: ["5G", "Dual-band GNSS", "7000 mAh"]
            }
        ,
            {
                name: "GY-R90 Falcon",
                type: "長距離UHF RFIDリーダー",
                summary: "一括棚卸・ドックドア照合・資産追跡・パレット単位読取に対応する高出力UHF RFIDハンドヘルド。",
                kind: "rfid",
                image: "product-library/transparent/gy-r90-falcon.png",
                specs: { OS: "Android 14", RFID: "UHF up to 15 m", Scan: "2D + RFID", Rugged: "IP67 / 1.8 m drop" },
                tags: ["33 dBm", "Circular antenna", "8200 mAh"]
            }
        ]
    },
    "barcode-scanners": {
        eyebrow: "堅牢PDA端末",
        title: "バーコードスキャナー",
        navLabel: "バーコードスキャナー",
        heroImage: "product-hero-barcode-scanners-matrix.png",
        intro: "1D、2D、DPM、長距離、ワイヤレスのスキャン業務に対応する産業用ハンドヘルドバーコードスキャナー。",
        panelMetric: "8 モデル",
        panelText: "有線、無線、コールドチェーン、長距離、ウェアラブル、プレゼンテーション、ドックドア向けスキャンの選択肢。",
        products: [
            {
                name: "GY-S210",
                type: "汎用有線スキャナー",
                summary: "入荷デスク、製造ベンチ、梱包ステーション向けの堅牢なエリアイメージングスキャナー。",
                kind: "scanner",
                image: "product-library/transparent/gy-s210.png",
                specs: { Scan: "1D/2D area imager", Link: "USB-C / RS232", Motion: "Up to 4 m/s", Rugged: "IP54 / 1.5 m drop" },
                tags: ["プレゼンテーションモード", "白色LED", "高速デコード"]
            },
            {
                name: "GY-S240W",
                type: "産業用ワイヤレススキャナー",
                summary: "ピックパック、出荷、柔軟なワークセル向けのベースステーション付きコードレススキャナー。",
                kind: "scanner",
                image: "product-library/transparent/gy-s240w.png",
                specs: { Scan: "1D/2D area imager", Link: "2.4G / Bluetooth", Range: "Up to 80 m open field", Rugged: "IP54 / 1.5 m drop" },
                tags: ["バッチメモリ", "充電クレードル", "2200 mAh"]
            },
            {
                name: "GY-S330 Cold",
                type: "コールドチェーンスキャナー",
                summary: "冷蔵倉庫、食品加工、低温入荷向けのワイヤレススキャナー。",
                kind: "scanner",
                image: "product-library/transparent/gy-s330-cold.png",
                specs: { Scan: "1D/2D", Link: "Bluetooth 5.2", Temp: "-30 C to 50 C", Rugged: "IP65 / 1.8 m drop" },
                tags: ["結露対策", "手袋対応グリップ", "3200 mAh"]
            },
            {
                name: "GY-S360 XR",
                type: "長距離対応スキャナー",
                summary: "棚ラベル、ドックドア、パレット位置、フォークリフト併用のスキャン作業向けの長距離モデル。",
                kind: "scanner",
                image: "product-library/transparent/gy-s360-xr.png",
                specs: { Scan: "Near/far 1D/2D", Range: "10 cm to 15 m", Link: "Bluetooth / USB", Rugged: "IP65 / 2.0 m drop" },
                tags: ["長距離", "レーザー照準", "倉庫"]
            },
            {
                name: "GY-S410 Base",
                type: "ハンズフリースキャンステーション",
                summary: "卓上での照合、キッティング、小物部品トレーサビリティ向けのデスクトップスキャンモジュール。",
                kind: "scanner",
                image: "product-library/transparent/gy-s410-base.png",
                specs: { Scan: "2D presentation", Mount: "Desktop / fixture", Link: "USB / Ethernet option", Rugged: "Sealed front window" },
                tags: ["自動トリガー", "治具組込対応", "白色光"]
            },
            {
                name: "GY-S520 Wear",
                type: "ウェアラブルリングスキャナー",
                summary: "ハンズフリーのピッキング、仕分け、補充作業向けの軽量ウェアラブルスキャナー。",
                kind: "scanner",
                image: "product-library/transparent/gy-s520-wear.png",
                specs: { Scan: "1D/2D short range", Link: "Bluetooth 5.2", Battery: "Hot-swap 900 mAh", Rugged: "IP54 / 1.5 m drop" },
                tags: ["ウェアラブル", "ハンズフリー", "倉庫"]
            },
            {
                name: "GY-S680 Dock",
                type: "産業用ドックドアスキャナー",
                summary: "ドック照合、パレット通過チェック、自動コンベア読取向けの固定式スキャナー。",
                kind: "scanner",
                image: "product-library/transparent/gy-s680-dock.png",
                specs: { Scan: "Wide-angle 2D", Link: "Ethernet / USB", Trigger: "Photoeye input", Rugged: "IP65 metal housing" },
                tags: ["ドックドア", "コンベヤ", "Ethernet"]
            }
        ,
            {
                name: "GY-S900 XR",
                type: "長距離スキャンガン",
                summary: "棚ラベル・フォークリフト併用作業・倉庫の遠距離読取に対応する産業用バーコードスキャナー。",
                kind: "scanner",
                image: "product-library/transparent/gy-s900-xr.png",
                specs: { Scan: "1D/2D near-far", Range: "Up to 18 m", Link: "Bluetooth / USB-C", Rugged: "IP65 / 2.0 m drop" },
                tags: ["Long range", "Laser aimer", "Warehouse"]
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
        panelMetric: "3 パック",
        panelText: "見積、サンプル、OEM / ODM相談の出発点として利用できます。",
        products: [
            {
                name: "GY-CONF-Scan",
                type: "スキャン専用PDAパッケージ",
                summary: "Android PDA、2Dスキャンエンジン、ドック、予備バッテリー、MDMプロファイルを必要とする倉庫チーム向けの推奨基本構成。",
                kind: "config",
                image: "product-library/transparent/gy-conf-scan.png",
                specs: { Device: "A50 / A55 class", Scan: "Standard 2D", Accessories: "Dock + boot", Lead: "Sample in 7-10 days" },
                tags: ["倉庫", "棚卸", "スターターキット"]
            },
            {
                name: "GY-CONF-RFID",
                type: "RFID在庫管理パッケージ",
                summary: "一括棚卸、資産タグ付け、店舗バックヤード、倉庫入荷向けのUHFリーダーバンドル。",
                kind: "config",
                image: "product-library/transparent/gy-conf-rfid.png",
                specs: { Device: "R60 / R70 class", RFID: "8-12 m option", Accessories: "Grip + charger", Lead: "Sample in 10-14 days" },
                tags: ["UHF", "資産追跡", "一括読取"]
            },
            {
                name: "GY-CONF-DPM",
                type: "製造DPMパッケージ",
                summary: "刻印金属コード、トレーサビリティステーション、生産検証向けのDPMスキャナー＋PDA構成。",
                kind: "config",
                image: "product-library/transparent/gy-conf-dpm.png",
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
                summary: "コンベア検出、部品在荷、一般的な機械自動化チェック向けのコンパクト光電センサー。",
                kind: "sensor",
                image: "product-images/gy-px18.png",
                specs: { Detection: "Diffuse / retroreflective", Range: "20 mm to 2.5 m", Output: "PNP / NPN", Housing: "IP67 compact" },
                tags: ["白色光", "M12 cable", "かんたん設定"]
            },
            {
                name: "GY-PR12",
                type: "誘導形近接センサー",
                summary: "治具、インデックステーブル、シリンダー、工具、過酷な機械位置での金属検出。",
                kind: "sensor",
                image: "product-images/gy-pr12.png",
                specs: { Detection: "Ferrous / non-ferrous", Range: "2 to 8 mm", Output: "PNP / NPN", Housing: "M12 stainless IP67" },
                tags: ["埋込取付", "高い繰返し精度", "工作機械"]
            },
            {
                name: "GY-LD40",
                type: "レーザー変位センサー",
                summary: "位置チェック、ギャップ検査、在荷確認向けの非接触距離・高さ測定。",
                kind: "sensor",
                image: "product-images/gy-ld40.png",
                specs: { Measurement: "40 mm class", Resolution: "10 um", Output: "IO-Link / analog", Housing: "IP67 metal" },
                tags: ["レーザー位置決め", "アナログ出力", "ギャップ確認"]
            },
            {
                name: "GY-FB200",
                type: "ファイバアンプセンサー",
                summary: "狭小スペース、透明体、小部品、難しい取付条件に対応する柔軟なファイバセンシング。",
                kind: "sensor",
                image: "product-images/gy-fb200.png",
                specs: { Channels: "Single / dual", Response: "80 us", Output: "PNP / NPN", Display: "Dual digital" },
                tags: ["Fiber head", "微小ワーク", "ティーチボタン"]
            },
            {
                name: "GY-PS60",
                type: "デジタル圧力センサー",
                summary: "空圧ライン、真空吸着システム、リークチェック、プロセス機器向けのコンパクトな圧力監視。",
                kind: "sensor",
                image: "product-images/gy-ps60.png",
                specs: { Range: "-100 to 1000 kPa", Display: "3-color OLED", Output: "2 x switch + analog", Housing: "IP65" },
                tags: ["Vacuum", "Pneumatics", "Panel mount"]
            },
            {
                name: "GY-ENV32",
                type: "環境センサー",
                summary: "設備の稼働率に影響する温度・湿度・振動・盤内環境を監視。",
                kind: "sensor",
                image: "product-images/gy-env32.png",
                specs: { Inputs: "Temp / RH / vibration", Network: "RS-485 / IO-Link", Power: "12-24 VDC", Housing: "IP54" },
                tags: ["制御盤状態", "状態データ", "Modbus"]
            },
            {
                name: "GY-UL80",
                type: "超音波距離センサー",
                summary: "レベル、ループ制御、光学センサーが苦手な不定形ターゲット向けの非接触センシング。",
                kind: "sensor",
                image: "product-images/gy-ul80.png",
                specs: { Range: "80 to 1200 mm", Output: "Analog + switch", Beam: "Narrow cone", Housing: "IP67" },
                tags: ["レベル", "透明体", "粉じん耐性"]
            },
            {
                name: "GY-SAFE24",
                type: "セーフティライトカーテン",
                summary: "機械開口部、ロボットステーション、作業者アクセス箇所の防護センシング。",
                kind: "sensor",
                image: "product-images/gy-safe24.png",
                specs: { Resolution: "24 mm", Height: "300 to 1200 mm", Safety: "タイプ 4 / PL e", Housing: "IP65 aluminum" },
                tags: ["機械安全", "Muting option", "位置合わせ支援"]
            },
            {
                name: "GY-NET8",
                type: "センサーネットワークハブ",
                summary: "分散センサーを産業ネットワークに接続し、診断と配線を簡素化。",
                kind: "sensor",
                image: "product-images/gy-net8.png",
                specs: { Ports: "8 x M12 IO-Link", Network: "EtherNet/IP / PROFINET", Power: "24 VDC", Housing: "IP67" },
                tags: ["IO-Link", "診断", "IP67 hub"]
            }
        ,
            {
                name: "GY-PX90",
                type: "コンパクト光電センサー",
                summary: "コンベア・治具・部品検出やコンパクト機構向けの高速応答型 在荷検出センサー。",
                kind: "sensor",
                image: "product-cutouts/generated/gy-px90.png",
                specs: { Detection: "Diffuse / retroreflective", Range: "30 mm to 3 m", Output: "PNP / NPN", Housing: "IP67 compact" },
                tags: ["Presence", "M12", "Fast setup"]
            }
        ,
            {
                name: "GY-LD90",
                type: "レーザー変位センサー",
                summary: "インライン検査・位置合わせ・レベル・機械フィードバック向けの非接触 位置/ギャップセンサー。",
                kind: "sensor",
                image: "product-cutouts/generated/gy-ld90.png",
                specs: { Measurement: "90 mm class", Resolution: "5 um", Output: "IO-Link / analog", Housing: "IP67 metal" },
                tags: ["Laser", "Position", "IO-Link"]
            }
        ,
            {
                name: "GY-SAFE90",
                type: "セーフティライトカーテン(ペア)",
                summary: "ワークセル・治具・機械開口部・作業者保護向けのスリムな防護用ライトカーテン。",
                kind: "safety",
                image: "product-cutouts/generated/gy-safe90.png",
                specs: { Resolution: "14 / 30 mm", Height: "300 to 1500 mm", Safety: "Type 4 / PL e", Housing: "IP65 aluminum" },
                tags: ["Machine safety", "Slim body", "Type 4"]
            }
        ,
            {
                name: "GY-NET90",
                type: "IP67リモートI/Oモジュール",
                summary: "センサー・アクチュエータ・ワークセル・盤レス配線に対応する堅牢な分散I/Oブロック。",
                kind: "io",
                image: "product-cutouts/generated/gy-net90.png",
                specs: { Ports: "8 x M12 IO-Link", Network: "PROFINET / EtherNet/IP", Power: "24 VDC", Housing: "IP67 metal" },
                tags: ["Remote I/O", "IO-Link", "IP67"]
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
                type: "コンパクトスマートカメラ",
                summary: "在荷チェック、ラベル照合、向き判定、基本的な良否判定向けのエントリースマートカメラ。",
                kind: "camera",
                image: "product-images/gy-v120.png",
                specs: { Sensor: "1.6 MP CMOS", Lens: "C-mount / fixed", Interface: "Ethernet + I/O", Rating: "IP67 housing" },
                tags: ["2D inspection", "ティーチ設定", "白色光"]
            },
            {
                name: "GY-V160 Compact",
                type: "コンパクトエリアスキャンカメラ",
                summary: "狭い機械スペース、治具チェック、部品在荷、ラベル照合向けの小型産業用カメラ。",
                kind: "camera",
                image: "product-images/gy-v160-compact.png",
                specs: { Sensor: "1.6 MP global shutter", Lens: "C-mount", Interface: "GigE + trigger I/O", Rating: "IP65 metal" },
                tags: ["コンパクト筐体", "グローバルシャッター", "治具組込対応"]
            },
            {
                name: "GY-V240 Color",
                type: "色検査 camera",
                summary: "梱包、ラベル印字、組立の色チェック、混在製品の照合向けのカラーエリアカメラ。",
                kind: "camera",
                image: "product-images/gy-v240-color.png",
                specs: { Sensor: "2.4 MP color CMOS", Lens: "C-mount / liquid lens option", Interface: "GigE Vision", Rating: "IP65" },
                tags: ["色検査", "白色光", "ラベル検査"]
            },
            {
                name: "GY-V280 AI",
                type: "AIビジョンセンサー",
                summary: "欠陥検出、分類、OCR、外観のばらつきに対応する組込みAI検査カメラ。",
                kind: "camera",
                image: "product-images/gy-v280-ai.png",
                specs: { Sensor: "2.8 MP global shutter", AI: "On-device inference", Interface: "GigE / discrete I/O", Rating: "IP67" },
                tags: ["AI tools", "OCR", "欠陥"]
            },
            {
                name: "GY-V320 Mono",
                type: "モノクロエリアスキャンカメラ",
                summary: "計測、エッジ検出、位置合わせ、特徴検査向けの高コントラストモノクロカメラ。",
                kind: "camera",
                image: "product-images/gy-v320-mono.png",
                specs: { Sensor: "3.2 MP mono global shutter", Pixel: "3.45 um", Interface: "GigE / strobe I/O", Rating: "IP65" },
                tags: ["モノクロセンサー", "エッジコントラスト", "Measurement"]
            },
            {
                name: "GY-V380 Pro",
                type: "高速スマートカメラ",
                summary: "組立検証、計測、ガイダンス、ライン側品質管理向けの高速組込みビジョンシステム。",
                kind: "camera",
                image: "product-images/gy-v380-pro.png",
                specs: { Sensor: "5 MP global shutter", Speed: "Up to 90 fps", Interface: "GigE / PROFINET", Rating: "IP67" },
                tags: ["High speed", "PLC接続対応", "Metrology"]
            },
            {
                name: "GY-V500 HR",
                type: "高解像度エリアカメラ",
                summary: "微小欠陥、微細印字、高密度ラベル、精密組立チェック向けの高解像度検査カメラ。",
                kind: "camera",
                image: "product-images/gy-v500-hr.png",
                specs: { Sensor: "5.0 MP global shutter", Speed: "Up to 72 fps", Interface: "GigE Vision / USB3 option", Rating: "IP65" },
                tags: ["高解像度", "微細ディテール", "印字品質"]
            },
            {
                name: "GY-V640 HS",
                type: "高速エリアスキャンカメラ",
                summary: "移動部品、コンベア検査、ピック照合、動きに敏感な撮像向けの高速エリアスキャンモデル。",
                kind: "camera",
                image: "product-images/gy-v640-hs.png",
                specs: { Sensor: "6.4 MP global shutter", Speed: "Up to 118 fps", Interface: "2.5GigE + encoder", Rating: "IP65" },
                tags: ["High speed", "コンベヤ", "Encoder sync"]
            },
            {
                name: "GY-V3D90",
                type: "3Dプロファイルカメラ",
                summary: "高さ、体積、ギャップ、ビード、表面形状の測定向けの3Dレーザープロファイルカメラ。",
                kind: "camera",
                image: "product-images/gy-v3d90.png",
                specs: { Profile: "3D laser triangulation", Range: "90 mm class", Interface: "GigE Vision", Rating: "IP65" },
                tags: ["3D profile", "高さ確認", "Robot guidance"]
            },
            {
                name: "GY-VL2048",
                type: "ラインスキャンスマートカメラ",
                summary: "連続ウェブ、ラベル、フィルム、梱包、高速表面向けのラインスキャン検査カメラ。",
                kind: "camera",
                image: "product-images/gy-vl2048.png",
                specs: { Sensor: "2048 px line", Speed: "45 kHz", Interface: "GigE / encoder", Rating: "Industrial metal" },
                tags: ["Line scan", "Web inspection", "Encoder"]
            },
            {
                name: "GY-CR390",
                type: "固定式コードリーダーカメラ",
                summary: "DPM、QR、バーコード、高処理量トレーサビリティステーション向けの産業用画像式コードリーダー。",
                kind: "camera",
                image: "product-images/gy-cr390.png",
                specs: { Codes: "1D / 2D / DPM", Lens: "Liquid lens option", Interface: "Ethernet / RS-232", Rating: "IP65" },
                tags: ["DPM", "トレーサビリティ", "高読取率"]
            },
            {
                name: "GY-VC8",
                type: "ビジョンコントローラ",
                summary: "マルチカメラ検査セル、画像保存、PLC連携、レシピ管理向けのコンパクトコントローラ。",
                kind: "camera",
                image: "product-images/gy-vc8.png",
                specs: { Cameras: "Up to 8 devices", CPU: "Industrial AI module", Network: "PROFINET / EtherNet/IP", Storage: "512 GB option" },
                tags: ["Multi-camera", "Recipes", "Edge AI"]
            },
            {
                name: "GY-V3D150",
                type: "広範囲3Dプロファイルセンサー",
                summary: "ロボットガイダンス、ビード検査、トレイ位置検出、高さマップ検査向けの広視野3Dセンサー。",
                kind: "camera",
                image: "product-images/gy-v3d150.png",
                specs: { Profile: "Blue laser triangulation", Range: "150 mm class", Points: "2048 profile points", Rating: "IP65" },
                tags: ["3D profile", "広範囲", "ロボットセル"]
            },
            {
                name: "GY-VX12",
                type: "AIビジョンプロセッサ",
                summary: "マルチカメラAI検査、画像アーカイブ、高処理量生産ライン向けのラック型処理ユニット。",
                kind: "camera",
                image: "product-images/gy-vx12.png",
                specs: { Cameras: "Up to 12 streams", AI: "Industrial inference engine", Network: "2.5GigE / PROFINET", Storage: "2 TB option" },
                tags: ["AI processor", "ラックマウント", "Multi-camera"]
            },
            {
                name: "GY-VIO16",
                type: "ビジョンI/O拡張モジュール",
                summary: "照明トリガ、エンコーダ信号、排出ゲート、検査セル同期向けのフィールドI/Oモジュール。",
                kind: "camera",
                image: "product-images/gy-vio16.png",
                specs: { "I/O": "16 digital inputs / outputs", Timing: "10 us trigger path", Network: "EtherCAT / Ethernet", Rating: "IP67" },
                tags: ["Trigger I/O", "Encoder sync", "セル配線"]
            },
            {
                name: "GY-VFG4",
                type: "産業用フレームグラバー",
                summary: "検査PCでの高帯域ラインスキャン・特殊カメラ取込向けのフレームグラバーモジュール。",
                kind: "camera",
                image: "product-images/gy-vfg4.png",
                specs: { Channels: "4 camera inputs", Bus: "PCIe x8", Throughput: "Up to 6.4 GB/s", SDK: "C / Python / .NET" },
                tags: ["Frame grabber", "Line scan", "高帯域"]
            },
            {
                name: "GY-VRG200",
                type: "ロボットガイダンス3Dモジュール",
                summary: "ピック位置検出、ロボット経路補正、ビン縁検出、治具レス投入向けのコンパクト3Dカメラモジュール。",
                kind: "camera",
                image: "product-images/gy-vrg200.png",
                specs: { Mode: "3D + 2D acquisition", Range: "200 mm working class", Interface: "GigE Vision + I/O", Rating: "IP65" },
                tags: ["Robot guidance", "3D locate", "Flexible cells"]
            },
            {
                name: "GY-CR120",
                type: "コンパクト固定式コードリーダー",
                summary: "ラベルチェック、カートン追跡、部品トレーサビリティ、狭所取付向けの小型固定リーダー。",
                kind: "camera",
                image: "product-images/gy-cr120.png",
                specs: { Codes: "1D / 2D", Sensor: "1.2 MP global shutter", Illumination: "白色LED", Rating: "IP65" },
                tags: ["Compact reader", "トレーサビリティ", "白色LED"]
            },
            {
                name: "GY-CR520 DPM",
                type: "DPM固定式コードリーダー",
                summary: "金属・樹脂部品の刻印、レーザーマーク、ドットピン、低コントラストコード向けの高コントラストリーダー。",
                kind: "camera",
                image: "product-images/gy-cr520-dpm.png",
                specs: { Codes: "DPM / QR / Data Matrix", Lighting: "White + polarizer", Lens: "Autofocus option", Rating: "IP67" },
                tags: ["DPM", "低コントラスト", "Manufacturing"]
            },
            {
                name: "GY-CR720 Conveyor",
                type: "高速コードリーダー",
                summary: "コンベア、仕分け、荷物照合、高速トレーサビリティライン向けのリーダーモジュール。",
                kind: "camera",
                image: "product-images/gy-cr720-conveyor.png",
                specs: { Codes: "1D / 2D", Speed: "Up to 5 m/s", Field: "Wide-angle optics", Network: "Ethernet / RS-232" },
                tags: ["コンベヤ", "High speed", "広視野"]
            },
            {
                name: "GY-S300 DPM",
                type: "DPMコードスキャナー",
                summary: "刻印、ドットピン、低コントラスト、曲面の産業コードに最適化したスキャナー。",
                kind: "scanner",
                image: "product-images/gy-s300-dpm.png",
                specs: { Scan: "DPM / 1D / 2D", Lighting: "White + polarizer", Codes: "Metal, plastic, labels", Rugged: "IP65 / 1.8 m drop" },
                tags: ["DPM", "AI decode", "Manufacturing"]
            },
            {
                name: "GY-CV220 Inline",
                type: "インラインバーコード検証機",
                summary: "印字品質、DPM検証、梱包コンプライアンス、監査記録向けのインライン等級判定ステーション。",
                kind: "camera",
                image: "product-images/gy-cv220-inline.png",
                specs: { Standards: "ISO / IEC grading", Codes: "1D / 2D / DPM", Light: "Calibrated white", Output: "PDF / CSV / API" },
                tags: ["コードグレーディング", "インライン品質保証", "監査証跡"]
            },
            {
                name: "GY-RT800",
                type: "マルチカメラリーダーモジュール",
                summary: "物流ラインでの多面の荷物・トート・トレイのコード読取向けトンネル型リーダーモジュール。",
                kind: "camera",
                image: "product-images/gy-rt800.png",
                specs: { Readers: "4 synchronized imagers", Field: "Multi-side capture", Trigger: "Photoeye / encoder", Network: "Ethernet / API" },
                tags: ["トンネル読取", "Logistics", "Multi-side"]
            },
            {
                name: "GY-LR70",
                type: "白色リングライト",
                summary: "レンズ同軸の検査、ラベルチェック、特徴コントラスト、小物ステーション向けのコンパクトリングライト。",
                kind: "camera",
                image: "product-images/gy-lr70.png",
                specs: { Lighting: "白色LED", Diameter: "70 mm", Control: "Strobe / constant", Mount: "C-mount adapter" },
                tags: ["リング照明", "白色LED", "レンズマウント"]
            },
            {
                name: "GY-LB220",
                type: "白色バーライト",
                summary: "エッジ強調、コンベア検査、梱包チェック、制御された側射照明向けのリニアバーライト。",
                kind: "camera",
                image: "product-images/gy-lb220.png",
                specs: { Lighting: "白色LED", Length: "220 mm", Control: "PWM / strobe", Housing: "Finned aluminum" },
                tags: ["バー照明", "サイド照明", "治具組込対応"]
            },
            {
                name: "GY-LDome120",
                type: "ドームライト",
                summary: "反射部品、曲面、低グレアのビジョン検査向けの拡散白色ドームライト。",
                kind: "camera",
                image: "product-images/gy-ldome120.png",
                specs: { Lighting: "Diffuse white", Diameter: "120 mm", Opening: "Camera center port", Housing: "Aluminum dome" },
                tags: ["Dome", "低グレア", "Reflective parts"]
            },
            {
                name: "GY-LBL150",
                type: "白色バックライトパネル",
                summary: "シルエット検査、穴検出、輪郭測定、透明部品チェック向けの拡散フレーム付きバックライト。",
                kind: "camera",
                image: "product-images/gy-lbl150.png",
                specs: { Lighting: "Diffuse white", Area: "150 x 120 mm", Control: "Constant / strobe", Housing: "Finned aluminum frame" },
                tags: ["バックライト", "シルエット", "Measurement"]
            },
            {
                name: "GY-LCX60",
                type: "同軸照明モジュール",
                summary: "平坦な反射面、印字検査、位置合わせマーク、低影撮像向けの同軸照明。",
                kind: "camera",
                image: "product-images/gy-lcx60.png",
                specs: { Lighting: "White coaxial", Aperture: "60 mm class", Control: "Strobe-ready", Mount: "C-mount path" },
                tags: ["Coaxial", "Reflective parts", "印字検査"]
            },
            {
                name: "GY-LL300",
                type: "高出力ラインライト",
                summary: "ラインスキャン検査、ウェブ材料、ラベル、フィルム、コンベアのエッジ強調向けの長尺リニアライト。",
                kind: "camera",
                image: "product-images/gy-ll300.png",
                specs: { Lighting: "白色LED line", Length: "300 mm", Control: "High-current strobe", Cooling: "Finned housing" },
                tags: ["Line scan", "高出力", "Web inspection"]
            },
            {
                name: "GY-LC4",
                type: "4チャンネルストロボコントローラ",
                summary: "同期ストロボ、輝度レシピ、エンコーダタイミング、マルチライトステーション向けの照明コントローラ。",
                kind: "camera",
                image: "product-images/gy-lc4.png",
                specs: { Channels: "4 independent outputs", Timing: "1 us trigger resolution", Power: "24 VDC", Interface: "Ethernet / RS-485" },
                tags: ["ストロボ制御", "Recipes", "複数照明"]
            },
            {
                name: "GY-OPT25",
                type: "テレセントリック光学モジュール",
                summary: "寸法検査、低歪み撮像、再現性のある測定セットアップ向けのテレセントリックレンズモジュール。",
                kind: "camera",
                image: "product-images/gy-opt25.png",
                specs: { Optics: "25 mm class telecentric", Sensor: "Up to 2/3 inch", Distortion: "<0.08%", Mount: "C-mount" },
                tags: ["Telecentric", "Metrology", "低歪み"]
            }
        ,
            {
                name: "GY-V900 Pro",
                type: "スマートエリアスキャンカメラ",
                summary: "AI支援検査・組立検証・位置決め・品質ゲート向けの堅牢スマートカメラ。",
                kind: "vision",
                image: "product-cutouts/generated/gy-v900-pro.png",
                specs: { Sensor: "9 MP global shutter", AI: "On-device inference", Interface: "GigE + I/O", Rating: "IP67 metal" },
                tags: ["AI vision", "9 MP", "GigE"]
            }
        ,
            {
                name: "GY-V3D900",
                type: "産業用3Dビジョンカメラ",
                summary: "ロボットガイダンス・プロファイル検査・バラ積み取り出し・寸法検査向けのステレオ深度ビジョンモジュール。",
                kind: "vision",
                image: "product-cutouts/generated/gy-v3d900.png",
                specs: { Profile: "3D stereo / depth", Range: "900 mm class", Interface: "GigE Vision", Rating: "IP65 metal" },
                tags: ["3D vision", "Depth", "Robot cells"]
            }
        ,
            {
                name: "GY-CR900 Matrix",
                type: "固定式産業用コードリーダー",
                summary: "高速バーコード・QR・Data Matrix・DPMのトレーサビリティ工程向け画像式リーダー。",
                kind: "reader",
                image: "product-cutouts/generated/gy-cr900-matrix.png",
                specs: { Codes: "1D / 2D / DPM", Lens: "Autofocus option", Interface: "Ethernet / RS-232", Rating: "IP67 metal" },
                tags: ["DPM", "Traceability", "Ethernet"]
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
                type: "デジタル測定ゲージ",
                summary: "再現性のある寸法チェック、合否(Go/No-Go)検査、SPCデータ取得向けのベンチ・治具ゲージ。",
                kind: "instrument",
                image: "product-images/gy-mg50.png",
                specs: { Range: "50 mm stroke", Resolution: "1 um", Output: "USB / RS-485", Fixture: "Bench / inline" },
                tags: ["寸法測定", "SPC", "治具対応"]
            },
            {
                name: "GY-VM200",
                type: "画像測定機",
                summary: "小部品、エッジ、穴、溝、輪郭の検証向けのコンパクト光学測定ステーション。",
                kind: "instrument",
                image: "product-images/gy-vm200.png",
                specs: { Stage: "200 x 120 mm", Camera: "5 MP", Lighting: "White coaxial / ring", Output: "CSV / report" },
                tags: ["Optical", "Measurement", "Lab"]
            },
            {
                name: "GY-SF30",
                type: "表面粗さ測定器",
                summary: "機械加工部品、工具、受入材料の粗さチェック向けのポータブル表面測定器。",
                kind: "instrument",
                image: "product-images/gy-sf30.png",
                specs: { Parameter: "Ra / Rz / Rq", Stroke: "5.6 mm", Display: "Color LCD", Data: "USB export" },
                tags: ["粗さ", "Portable", "加工"]
            },
            {
                name: "GY-CV100",
                type: "バーコード検証機",
                summary: "バーコード品質等級判定、印字検証、規制対応トレーサビリティ向けの検証機器。",
                kind: "instrument",
                image: "product-images/gy-cv100.png",
                specs: { Standards: "ISO / IEC grading", Codes: "1D / 2D / DPM", Light: "White calibrated", Report: "PDF / CSV" },
                tags: ["コード品質", "トレーサビリティ", "レポート"]
            },
            {
                name: "GY-ET75",
                type: "産業用電気テスター",
                summary: "電圧、導通、センサー電源、制御盤チェック向けのハンディ保全計器。",
                kind: "instrument",
                image: "product-images/gy-et75.png",
                specs: { Voltage: "600 V CAT III", Inputs: "V / ohm / mA", Display: "Backlit LCD", Data: "Bluetooth option" },
                tags: ["Maintenance", "Cabinet checks", "Portable"]
            }
        ,
            {
                name: "GY-MG90",
                type: "デジタル寸法ゲージ",
                summary: "生産・QA工程での高さ・ギャップ・ストローク・治具測定に適した精密ゲージ。",
                kind: "instrument",
                image: "product-cutouts/generated/gy-mg90.png",
                specs: { Range: "90 mm stroke", Resolution: "1 um", Output: "USB / RS-485", Fixture: "Bench / inline" },
                tags: ["Metrology", "Height", "Fixture QA"]
            }
        ,
            {
                name: "GY-VM900",
                type: "画像測定器",
                summary: "部品形状・エッジ検査・生産レポート向けの卓上型 光学測定システム。",
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
        eyebrow: "センシング & I/O",
        title: "在荷・物体検出",
        navLabel: "在荷・物体検出",
        navGroup: "sensors",
        heroImage: "product-hero-proximity-sensors-matrix.png",
        intro: "部品有無、治具、コンベア、安全エリア向けの光電、近接、ファイバー、超音波、安全センサー。",
        panelMetric: "6 モデル",
        panelText: "明確な検出用途に向けた光電・近接(誘導)・ファイバー・安全センシング。",
        sectionIntro: "このページは検出系の製品をまとめ、測定機器や状態監視機器とは分けて掲載しています。",
        products: getProductsByName(["GY-PX18", "GY-PR12", "GY-FB200", "GY-SAFE24", "GY-PX90", "GY-SAFE90"])
    },
    "laser-measurement": {
        eyebrow: "センシング & I/O",
        title: "Distance & Position センサー",
        navLabel: "距離・位置",
        navGroup: "sensors",
        heroImage: "product-hero-laser-measurement-matrix.png",
        intro: "位置確認、ギャップ確認、レベル検知、機械フィードバック向けの非接触レーザー・超音波距離製品。",
        panelMetric: "3 モデル",
        panelText: "レーザー変位・超音波距離センシング(無関係なIOやファイバーアンプ製品は含みません)。",
        sectionIntro: "本カテゴリは「距離・位置」というより広い括りで、実際に位置や距離を測る製品のみを掲載しています。",
        products: getProductsByName(["GY-LD40", "GY-UL80", "GY-LD90"])
    },
    "environmental-sensing": {
        eyebrow: "センシング & I/O",
        title: "プロセス・状態監視",
        navLabel: "プロセス・状態",
        navGroup: "sensors",
        heroImage: "product-hero-environmental-sensing-matrix.png",
        intro: "稼働状況の可視化とプロセス安定化に向けた圧力、温度、湿度、振動、センサーネットワーク製品。",
        panelMetric: "4 モデル",
        panelText: "環境モニタリング、空圧の圧力チェック、分散IO診断。",
        sectionIntro: "プロセス・状態系の製品は、機械の健全性・盤内環境・空圧性能・接続センサーの状態監視に使われるため、まとめて掲載しています。",
        products: getProductsByName(["GY-PS60", "GY-ENV32", "GY-NET8", "GY-NET90"])
    },
    "area-scan-cameras": {
        eyebrow: "マシンビジョンシステム",
        title: "スマート・エリアスキャンカメラ",
        navLabel: "スマート・エリアスキャンカメラ",
        navGroup: "vision",
        heroImage: "product-hero-area-scan-cameras-matrix.png",
        intro: "フルフレーム検査、組立確認、計測、ガイダンス、AI支援検査に対応する2Dスマートカメラ。",
        panelMetric: "10 モデル",
        panelText: "コンパクト・カラー・モノクロ・AI・高解像度・高速・テレセントリックなど多彩なイメージング構成。",
        sectionIntro: "エリアスキャン製品はフルフレーム画像を取得し、対応する光学系も同じ撮像チェーン内にまとめています。本ラインアップはセンサークラス・速度・解像度・AI対応・検査用途を整理し、より現実的に機種を絞り込めるようにしています。",
        products: getProductsByName(["GY-V120", "GY-V160 Compact", "GY-V240 Color", "GY-V280 AI", "GY-V320 Mono", "GY-V380 Pro", "GY-V500 HR", "GY-V640 HS", "GY-OPT25", "GY-V900 Pro"])
    },
    "smart-vision-sensors": {
        eyebrow: "マシンビジョンシステム",
        title: "ビジョンコントローラ・3Dシステム",
        navLabel: "コントローラ・3Dビジョン",
        navGroup: "vision",
        heroImage: "product-hero-smart-vision-sensors-matrix.png",
        intro: "大型検査セルや複雑な用途向けのビジョンコントローラー、3Dプロファイルカメラ、ラインスキャンシステム。",
        panelMetric: "10 モデル",
        panelText: "ビジョンコントローラ、3Dセンサー、ラインスキャン取込、タイミングI/O、フレームグラバー、ストロボ制御、ロボットガイダンスモジュール。",
        sectionIntro: "本ラインアップは、画像取込・処理・3Dプロファイリング・タイミングI/O・照明トリガ・フレーム取込・ロボットガイダンス連携まで、より完成度の高いマシンビジョンセルを支えます。",
        products: getProductsByName(["GY-VC8", "GY-V3D90", "GY-V3D150", "GY-VL2048", "GY-VX12", "GY-VIO16", "GY-LC4", "GY-VFG4", "GY-VRG200", "GY-V3D900"])
    },
    "code-reading-cameras": {
        eyebrow: "マシンビジョンシステム",
        title: "コード読取・検証",
        navLabel: "コード読取・検証",
        navGroup: "vision",
        heroImage: "product-hero-code-reading-cameras-matrix.png",
        intro: "バーコード、QR、Data Matrix、DPM、規制対応トレーサビリティ向けの固定式・ハンドヘルド画像リーダー。",
        panelMetric: "9 モデル",
        panelText: "コンパクトリーダー、DPMリーダー、高速コンベアリーダー、ハンディDPM、インライン検証、トンネル読取。",
        sectionIntro: "トレーサビリティの導入では、読取率・DPM対応・視野・検証規格・記録出力が重視されます。そのため本カテゴリは固定式リーダーと等級判定ワークフローの両方を扱います。",
        products: getProductsByName(["GY-CR120", "GY-CR390", "GY-CR520 DPM", "GY-CR720 Conveyor", "GY-S300 DPM", "GY-CV100", "GY-CV220 Inline", "GY-RT800", "GY-CR900 Matrix"])
    },
    "vision-lighting": {
        eyebrow: "マシンビジョンシステム",
        title: "画像処理用照明",
        navLabel: "画像処理用照明",
        navGroup: "vision",
        heroImage: "product-hero-vision-lighting-matrix.png",
        intro: "色ずれや紫色照明感を抑え、安定した画像取得を支える白色マシンビジョン照明アクセサリ。",
        panelMetric: "5モデル",
        panelText: "リング・バー・ドーム・バックライト・ライン照明などの照明製品。",
        sectionIntro: "ビジョン照明は画像の安定性・欠陥コントラスト・測定再現性を左右します。本カテゴリは照明ハードウェアのみを扱い、コントローラや光学系はより広いビジョンシステム側に分類しています。",
        products: getProductsByName(["GY-LR70", "GY-LB220", "GY-LDome120", "GY-LBL150", "GY-LL300"])
    },
    "dimensional-gauges": {
        eyebrow: "品質 & Test Instruments",
        title: "寸法ゲージ",
        navLabel: "寸法ゲージ",
        navGroup: "quality",
        heroImage: "product-hero-dimensional-gauges-matrix.png",
        intro: "形状、位置合わせ、高さ、ギャップ、プロファイル、生産公差確認のための計測ツール。",
        panelMetric: "4 モデル",
        panelText: "接触式ゲージと光学測定ステーションの構成。",
        sectionIntro: "寸法ゲージは専用の計測機器のみにまとめ、距離センサーや3Dプロファイルカメラはそれぞれの自動化カテゴリに残しています。",
        products: getProductsByName(["GY-MG50", "GY-VM200", "GY-MG90", "GY-VM900"])
    },
    "surface-inspection": {
        eyebrow: "品質 & Test Instruments",
        title: "表面検査",
        navLabel: "表面検査",
        navGroup: "quality",
        heroImage: "product-hero-surface-inspection-matrix.png",
        intro: "粗さ、光沢、膜厚、外観仕上げ確認に対応する専用の表面品質機器。",
        panelMetric: "3モデル",
        panelText: "粗さ・光沢・膜厚の測定ツール(カメラシステム製品を流用しない構成)。",
        sectionIntro: "表面検査には専用の表面品質測定器のみをまとめ、ラインスキャンカメラやAIカメラはマシンビジョン側に残しています。",
        products: [
            ...getProductsByName(["GY-SF30"]),
            {
                name: "GY-GL20",
                type: "産業用光沢計",
                summary: "コーティング、成形部品、塗装金属、仕上げ面の均一性チェック向けのポータブル光沢計。",
                kind: "instrument",
                image: "product-images/gy-gl20.png",
                specs: { Geometry: "60 degree", Range: "0 to 1000 GU", Repeatability: "+/- 0.2 GU", Data: "USB / Bluetooth" },
                tags: ["Gloss", "コーティング", "外観仕上げ管理"]
            },
            {
                name: "GY-CT45",
                type: "膜厚計",
                summary: "金属部品の塗装、めっき、陽極酸化、保護被膜の検査向けのハンディ膜厚計。",
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
        panelText: "電気安全・ループ信号・サーマル診断ツール。",
        sectionIntro: "ポータブルテスターは、固定ステーションを離れて素早く点検したい保全チームや品質エンジニア向けです。プロセスセンサーや環境モニターはセンシング & I/O に残しています。",
        products: [
            ...getProductsByName(["GY-ET75"]),
            {
                name: "GY-LT40",
                type: "ループ信号テスター",
                summary: "4〜20 mAセンサー信号、制御ループ、盤の立上げ作業のチェック向けのポータブルループ校正器。",
                kind: "instrument",
                image: "product-images/gy-lt40.png",
                specs: { Signal: "4-20 mA source / measure", Power: "24 V loop supply", Accuracy: "0.05% class", Display: "Backlit LCD" },
                tags: ["ループチェック", "立ち上げ", "Maintenance"]
            },
            {
                name: "GY-TH90",
                type: "サーマルスポットテスター",
                summary: "盤、モーター、軸受、迅速な保全診断向けの非接触温度テスター。",
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
        sectionIntro: "校正ツールは、設定検証・トレーサブルな点検・文書化された保守手順を支え、検査システムの再現性を高めます。",
        products: [
            {
                name: "GY-CAL-Grid",
                type: "ビジョン校正ターゲット",
                summary: "カメラ設定、現場校正、レンズ歪みチェック、測定位置合わせ向けの精密グリッドターゲット。",
                kind: "instrument",
                image: "product-images/gy-cal-grid.png",
                specs: { Pattern: "Ceramic grid", Size: "120 x 90 mm", Accuracy: "5 um class", Case: "Protective frame" },
                tags: ["画像処理設定", "グリッドターゲット", "Metrology"]
            },
            {
                name: "GY-CAL-Block",
                type: "ブロックゲージキット",
                summary: "治具ゲージ、プローブ点検、寸法セットアップ、定期検証向けの基準ブロックキット。",
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

export { GYUTRON_PRODUCTS, CATEGORY_GROUPS };
