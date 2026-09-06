# 🛡️ Sentinel.Audit 

<p align="center">
  <img src="assets/logo.jpg" alt="Sentinel.Audit Cyber Shield Logo" width="180" style="border-radius: 24px; box-shadow: 0 0 40px rgba(0, 245, 255, 0.4);">
</p>

<p align="center">
  <strong>"See what's really inside the code before it scans you."</strong>
</p>

<p align="center">
  An enterprise-grade, zero-trust cybersecurity suite engineered to inspect, decode, and analyze QR codes before execution — neutralizing Quishing (QR Phishing), UPI payment tampering, and malware droppers with an instant reporting bridge to Indian Cyber Crime Cells.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/STATUS-OPERATIONAL-00FF88?style=for-the-badge&logo=shield" alt="Status: Operational">
  <img src="https://img.shields.io/badge/EDITION-HACKATHON_2026-00F5FF?style=for-the-badge" alt="Edition: 2026">
  <img src="https://img.shields.io/badge/LANGUAGES-INDIC_&_ENGLISH-FF6B00?style=for-the-badge" alt="Languages: Indic & English">
  <img src="https://img.shields.io/badge/PLATFORM-MOBILE_&_DESKTOP-7B2FFF?style=for-the-badge" alt="Platform: Mobile & Desktop">
  <img src="https://img.shields.io/badge/LICENSE-MIT-E8EAF0?style=for-the-badge" alt="License: MIT">
</p>

---

## 🚨 Problem Statement: The "Quishing" Threat

QR codes have become the default ubiquitous interface for retail payments, restaurant menus, parking meters, transit ticketing, and Wi-Fi sharing. However, **QR codes are visually opaque**. Unlike suspicious URLs or phishing emails where suspicious characters are visible, a human cannot distinguish an authentic merchant QR from a fraudulent one just by looking at it.

This has fostered a rapid rise in **Quishing (QR Phishing)**:
1. **Physical Sticker Overlay Tampering**: Scammers paste fraudulent QR stickers over genuine counter displays or parking meters, altering the payee address or injecting preset deductions (`am=`).
2. **UPI Payee-vs-VPA Spoofing**: The visual Payee Name (`pn=`) displays as a trusted utility or bank (e.g. *"State Bank of India"* or *"BSES Power"*), while the routing address (`pa=`) secretly funnels funds to an unverified personal wallet handle.
3. **Malicious Binary Droppers**: Flyer or SMS QRs redirecting to dynamic tunneling links (`serveo`, `ngrok`) that trigger automated `.apk` or `.exe` spyware downloads disguised as "Urgent KYC Updates".
4. **Obfuscated URL Redirect Chains**: Multi-hop URL shorteners (`bit.ly`, `tinyurl`, `t.co`) hiding credential-harvesting banking clones.
5. **Rogue Wi-Fi & Deep Link Hijacking**: Unencrypted open access points (`WIFI:S:...;T:nopass;;`) or WhatsApp companion device pairing exploits disguised as contest entries.
6. **Absence of a Consumer Defense Layer**: Until now, users had no simple tool to inspect a QR code safely before device execution, and no streamlined mechanism to report physical tampering to cyber authorities.

---

## ⚡ Solution: Sentinel.Audit

Sentinel.Audit provides a real-time forensic inspection sandbox for any QR code, delivering:
- **Instant Pre-Execution Verdict**: ✅ `SAFE`, ⚠️ `SUSPICIOUS`, or ❌ `MALICIOUS` with a granular 0–100 Safety Score.
- **Deep 12-Vector Threat Analysis**: Heuristic auditing of UPI parameters, canonical redirect hops, domain entropy, brand lookalike algorithms, and dangerous MIME types.
- **Multilingual Indic Brand Defense**: Real-time cross-lingual detection across **Hindi, Tamil, Telugu, Bengali, Marathi**, and **English** with Unicode anti-evasion normalization.
- **1-Click Cyber Crime Reporting**: Automated lookup of jurisdictional Indian Cyber Crime Police Stations (IFSO Delhi, BKC Mumbai, CID Bengaluru, TGCSB Hyderabad, etc.), instant compilation of a **stamped FIR-ready Evidence Dossier (PDF)**, and pre-formatted text for `cybercrime.gov.in`.
- **Community Threat Radar**: Tactical geospatial map visualizing physical QR tampering clusters across commercial districts and transit hubs.
- **Curated Demo Attack Matrix**: 15 preloaded real-world attack scenarios for instant hackathon demonstrations without requiring paper printouts.

---

## 🎨 Visual Design & Executive Aesthetic

Engineered as a state-of-the-art **executive cybersecurity suite** adhering to modern enterprise design standards (Linear, Apple Security, Vercel) with physical specular top-bevel highlights:

| Role | Color Name | Hex / Gradient | Purpose |
| :--- | :--- | :--- | :--- |
| **Canvas Substrate** | Deep Obsidian Slate | `#070B14` / `#0B1120` | Zero-glare, high-contrast dark foundation |
| **Card & Panel Surfaces** | Brushed Titanium Navy | `#131B2E` | Physical depth with `inset 0 1px 0 rgba(255,255,255,0.08)` bevel |
| **Inner Well / Payloads** | Recessed Obsidian Void | `#070D1A` | High-contrast monospace code & payload inspection |
| **Primary Accent** | Electric Ice Cyan | `#22D3EE` → `#06B6D4` → `#0284C7` | Multi-stop gradient for CTAs, targeting reticle, and focus rings |
| **Verified Safe** | Emerald Mint | `#34D399` / `#10B981` | Cryptographically verified merchants & passing audits |
| **Warning** | Warm Amber | `#FBBF24` | Unencrypted protocols, atypical fixed transaction amounts |
| **Threat Alert** | Coral Red | `#F87171` | Quishing, tampered UPI handles, and trojan droppers |
| **Typography** | Inter & JetBrains Mono | — | Variable optical weight headings & monospace telemetry |

---

## 🔬 Key Architectural Features

### 1. 3D WebGL Cryptographic Monolith & Spatial Engine (`js/hero3d.js`)
- Real-time Three.js spatial viewport featuring a physically-rendered (`metalness: 0.85`, `roughness: 0.18`) titanium monolith.
- Procedural cryptographic QR substrate with ice cyan finder markers and microscopic blueprint grid.
- Dual concentric counter-rotating gyroscopic defense rings responding dynamically to mouse parallax and orientation.
- Razor-thin holographic scan laser sweeping the monolith with 800-particle ambient starfield.

### 2. Optical Viewfinder with Executive HUD
- Real-time webcam and smartphone camera integration using `jsQR`.
- Native mobile support: Automatically requests `facingMode: "environment"` for phone rear cameras.
- Animated holographic targeting reticle with corner brackets, crosshairs, and a sweeping laser beam.
- Built-in Web Audio API synthesizer producing tactical click, radar chirp, and alarm audio feedback with zero external sound files.

### 3. Digital Dropzone & Clipboard Paste
- Drag-and-drop QR image files directly into the analyzer.
- Native `Ctrl+V` / `Cmd+V` clipboard paste support for instant verification of screenshots from WhatsApp, SMS, or food delivery apps.

### 4. Multi-Vector Forensic Scoring Engine (`js/analyzer.js`)
- **UPI Protocol Parser**: Validates NPCI parameters (`pa`, `pn`, `mc`, `am`, `tn`). Flags payee-name mismatches, merchant code anomalies, and coercive transaction notes ("Immediate Disconnection", "Penalty").
- **Canonical Redirect Tracer**: Follows HTTP 301/302/307 shortener chains to uncover the destination host.
- **Shannon Domain Entropy**: Calculates character entropy to detect algorithmically generated domains (DGA) and typo-squatted phishing hosts (`.top`, `.xyz`, `.cc`).
- **Multilingual Brand Impersonation Detector**: Identifies unauthorized banking, government, and payment portal mimicry across Indic scripts and English.
- **Binary Package Classifier**: Flags automated downloads of `.apk`, `.exe`, `.dmg`, and `.bat` payloads.

### 5. Multilingual Brand Impersonation & Unicode Anti-Evasion Engine (`js/brandKeywords.js` & `brand_keywords.py`)
- **5 Indic Languages & English**: Native brand keyword catalogs covering Hindi (हिंदी), Tamil (தமிழ்), Telugu (తెలుగు), Bengali (বাংলা), Marathi (मराठी), and English (en).
- **18+ Leading Indian Brand Catalogs**: Financial institutions (SBI, HDFC, ICICI, Axis, PNB, BOB, Canara), UPI payment gateways (PhonePe, Paytm, Google Pay/GPay, BHIM), public/government portals (IRCTC, Parivahan, Income Tax Dept, PM-KISAN, LIC), and telecom operators (Jio, Airtel).
- **Unicode Script Classifier & NFC Normalizer**: Detects Devanagari (`U+0900–U+097F`), Tamil (`U+0B80–U+0BFF`), Telugu (`U+0C00–U+0C7F`), Bengali (`U+0980–U+09FF`), and Latin script blocks. Performs NFC normalization and strips zero-width spaces/joiners (`\u200B`, `\u200C`, `\u200D`, `\uFEFF`) to thwart attacker evasion tactics.
- **Deep Target & UPI Forensics**: Scans page titles, meta descriptions, target URLs, and UPI `pn` payee names, adding a **+35 risk point penalty** towards a `MALICIOUS` verdict for unverified hosts while recognizing legitimate regional banking domains.

### 6. Incident Reporting & FIR Dossier Generator (`js/reporting.js`)
- **Jurisdictional Station Locator**: Includes directory data for Delhi (IFSO Dwarka), Mumbai (BKC), Bengaluru (Palace Road CID), Hyderabad (TGCSB), Chennai, Kolkata, Pune, and Gurugram.
- **Cryptographic SHA-256 Hashing**: Calculates a unique fingerprint of the evidence for legal chain-of-custody preservation.
- **Stamped Complaint PDF Dossier**: Uses `jsPDF` to compile a formal, 1-page A4 complaint sheet ready to carry to a police station, citing relevant sections of the **IT Act 2000 (Section 66D, 43)** and **IPC 420**.
- **National Portal Formatter**: Generates ready-to-copy structured complaint drafts for the National Cyber Crime Reporting Portal (`cybercrime.gov.in`).

### 7. Community Threat Radar Map (`js/threat_map.js`)
- Interactive dark tactical map powered by Leaflet and OpenStreetMap.
- Animated pulsing radar rings marking recent tamper reports across metro stations, parking booths, and food courts.
- City quick-zoom filters (Delhi, Mumbai, Bengaluru, Hyderabad, Pune, All India).
- Zero-config free map layer with optional custom Mapbox token support.

---

## 🧪 15 Curated Hackathon Demo Scenarios

The platform includes a built-in test matrix in the scanner HUD:

| Scenario | Attack Category | Verdict | Key Forensic Signal |
| :--- | :--- | :--- | :--- |
| **Fake SBI KYC APK Dropper** | Malware Delivery | ❌ MALICIOUS (4/100) | Injects direct `.apk` trojan download via tunneling host |
| **Parking Meter UPI Sticker** | UPI Tampering | ❌ MALICIOUS (11/100) | Physical overlay with preset ₹499 extortion charge |
| **Bitly Redirect to HDFC NetBanking** | Credential Phishing | ❌ MALICIOUS (9/100) | Shortener masking 2-day-old phishing clone |
| **Spoofed Traffic Police E-Challan** | Brand Impersonation | ❌ MALICIOUS (14/100) | Fake government portal with deceptive `.in.net` TLD |
| **Rogue Airport Open WiFi Hotspot** | Network Exploit | ⚠️ SUSPICIOUS (42/100) | Unencrypted `T:nopass` rogue AP setup |
| **WhatsApp Web Session Hijack** | Session Takeover | ⚠️ SUSPICIOUS (38/100) | Deep link invoking companion device authorization |
| **Binance 500 USDT AirDrop Scam** | Financial Phishing | ❌ MALICIOUS (12/100) | High domain entropy with wallet-draining contract |
| **Malicious Recruiter vCard** | Payload Weaponization| ⚠️ SUSPICIOUS (46/100) | Hidden executable `.exe` URL inside contact card |
| **IT Dept Tax Refund Quishing** | Tax Phishing | ❌ MALICIOUS (7/100) | Non-government `.co` domain harvesting debit card CVV |
| **Official Starbucks India Merchant** | Verified Commerce | ✅ SAFE (98/100) | Registered MCC 5812 with corporate banking pool |
| **Legitimate BharatPe Retailer** | Verified Merchant | ✅ SAFE (95/100) | Authentic merchant gateway & MCC 5411 grocery classification |
| **Five-Star Hotel Digital Menu** | Verified Resource | ✅ SAFE (99/100) | Canonical corporate domain with valid EV SSL certificate |
| **Conference VIP Event Pass** | Cryptographic Token | ✅ SAFE (100/100) | Pure text string without network or execution hooks |
| **Enterprise WPA3 Secure WiFi** | Secure Network | ✅ SAFE (96/100) | Protected wireless handshake with WPA encryption |
| **Electricity Disconnection Scam** | Payment Tampering | ❌ MALICIOUS (10/100) | Injected ₹12,850 charge with coercive urgency note |

---

## 📂 Project Structure

```
Sentinel.Audit/
├── index.html              # Main application & holographic scanner HUD
├── server.py               # Python 3 forensic server & REST API
├── brand_keywords.py       # Python multilingual brand catalog & script detection engine
├── test_brand_keywords.py  # Python unit test suite for Indic brand impersonation
├── test_multilingual.js    # JavaScript test suite for Unicode script & brand detection
├── css/
│   └── style.css           # Cinematic command-center design system & mobile styles
├── js/
│   ├── analyzer.js         # 12-vector heuristic threat analysis engine
│   ├── app.js              # Controller orchestrating camera, dropzone, and UI
│   ├── audio.js            # Web Audio API tactical sound synthesizer
│   ├── brandKeywords.js    # Multilingual brand catalog & Unicode anti-evasion engine (HI, TA, TE, BN, MR, EN)
│   ├── demo_data.js        # 15 curated real-world attack scenarios
│   ├── reporting.js        # Indian Cyber Cell directory & FIR PDF generator
│   └── threat_map.js       # Community Threat Radar Leaflet map integration
├── data/
│   ├── reports.json        # Persisted community tamper incidents
│   └── stats.json          # Scan and threat neutralization metrics
└── assets/
    └── logo.jpg            # Official cyber shield brand emblem & favicon
```

---

## 🚀 Quickstart & Local Setup

Sentinel.Audit runs with **zero npm/node build friction** using Python's built-in standard library:

### 1. Clone Repository
```bash
git clone https://github.com/Amritanshu-nirjhar/Sentinel.Audit.git
cd Sentinel.Audit
```

### 2. Launch Forensic Server
```bash
python3 server.py
```

### 3. Open in Browser
Visit **[http://localhost:8000](http://localhost:8000)** in Chrome, Safari, or Brave.

> **Tip for Mobile Demo**: Ensure your smartphone is connected to the same Wi-Fi network as your computer, and navigate to `http://<your-computer-ip>:8000` on your mobile browser.

### 4. Run Multilingual & Forensics Test Suites
```bash
node test_multilingual.js
python3 test_brand_keywords.py
```

---

## ⚖️ Statutory Legal References

Complaints generated by Sentinel.Audit reference official provisions under the **Information Technology Act, 2000** and the **Indian Penal Code (IPC)**:
- **Section 66D (IT Act 2000)**: Punishment for cheating by personation by using computer resource (up to 3 years imprisonment and fine).
- **Section 43 (IT Act 2000)**: Penalty for damage to computer system, data alteration, or unauthorized digital interface tampering.
- **Section 66E (IT Act 2000)**: Violation of privacy and unauthorized credentials capture.
- **Section 420 (Indian Penal Code)**: Cheating and dishonestly inducing delivery of property.
- **NPCI Circular on Static & Dynamic UPI QR Safety**: Mandatory compliance against unauthorized amount locking and merchant descriptor falsification.

---

## 👥 Contributors

Developed for **Hackathon 2026** by:
- **Amritanshu Nirjhar** ([@Amritanshu-nirjhar](https://github.com/Amritanshu-nirjhar))

---

<p align="center">
  <sub>Sentinel.Audit is built for public cyber resilience, zero-trust payment verification, and citizen-level fraud prevention.</sub>
</p>
