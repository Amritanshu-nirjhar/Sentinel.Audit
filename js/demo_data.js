/**
 * Sentinel.Audit - Curated Demo Attack Matrix
 * 15 Real-World Quishing, Tampered UPI, and Malicious QR Scenarios for instant testing.
 */

const DEMO_SCENARIOS = [
  {
    id: "demo-sbi-apk",
    title: "Fake SBI KYC APK Dropper",
    category: "Malware Delivery",
    verdict: "MALICIOUS",
    score: 4,
    badgeText: "High Risk Quishing",
    icon: "fa-triangle-exclamation",
    payload: "https://sbi-kyc-verify-portal.serveo.net/download/sbi_yono_security_patch.apk",
    description: "Fake SMS/Flyer QR prompting urgent KYC verification that initiates an automated .apk trojan download.",
    threatDetails: [
      "Direct binary download (.apk) detected in URL path.",
      "Unregistered domain with dynamic tunneling host (serveo.net).",
      "Brand impersonation: 'State Bank of India' and 'YONO' mimicry without sbi.co.in authorization."
    ]
  },
  {
    id: "demo-upi-tamper",
    title: "Parking Meter UPI Sticker Overlay",
    category: "UPI Tampering",
    verdict: "MALICIOUS",
    score: 11,
    badgeText: "Payment Tampering",
    icon: "fa-money-bill-transfer",
    payload: "upi://pay?pa=fraudsquad.09@ybl&pn=Smart%20Parking%20DMRC&am=499.00&cu=INR&tn=DMRC%20Parking%20Fee",
    description: "Physical fraudulent sticker overlaid on genuine DMRC parking meter with preset Rs. 499 unauthorized charge.",
    threatDetails: [
      "Preset amount 'am=499.00' injected into static merchant QR.",
      "VPA 'fraudsquad.09@ybl' is an individual account, contrasting with official DMRC merchant entity.",
      "Classic physical overlay tamper vector targeting daily vehicle commuters."
    ]
  },
  {
    id: "demo-hdfc-shortener",
    title: "Bitly Redirect to HDFC Phishing Clone",
    category: "URL Redirection",
    verdict: "MALICIOUS",
    score: 9,
    badgeText: "Credential Phishing",
    icon: "fa-building-columns",
    payload: "https://bit.ly/hdfc-reward-redemption-login",
    finalUrl: "https://hdfc-bank-rewards-claim2026.top/netbanking/login.php",
    description: "Shortened link concealing high-entropy phishing domain cloned to steal netbanking customer ID and OTP.",
    threatDetails: [
      "Multi-hop URL shortener obscuring final destination.",
      "Final host registered 2 days ago with .top TLD.",
      "High brand impersonation confidence score for 'HDFC Bank NetBanking'."
    ]
  },
  {
    id: "demo-fake-challan",
    title: "Spoofed Traffic Police E-Challan",
    category: "Brand Impersonation",
    verdict: "MALICIOUS",
    score: 14,
    badgeText: "Govt Portal Spoof",
    icon: "fa-shield-halved",
    payload: "https://echallan-parivahan-sewa-gov.in.net/pay?vehicle=DL01AB9988",
    description: "Fake traffic ticket placed on car windshield with typo-squatted portal imitating Indian MoRTH Parivahan.",
    threatDetails: [
      "Typosquatted domain mimicking 'echallan.parivahan.gov.in'.",
      "Uses deceptive sub-extension '.in.net' to simulate government portal.",
      "SSL certificate issued via free automated tier with mismatched organization."
    ]
  },
  {
    id: "demo-rogue-wifi",
    title: "Rogue Airport Open WiFi Hotspot",
    category: "Network Exploit",
    verdict: "SUSPICIOUS",
    score: 42,
    badgeText: "Unencrypted Network",
    icon: "fa-wifi",
    payload: "WIFI:S:Airport_Free_HighSpeed_VIP;T:nopass;;",
    description: "Unencrypted Wi-Fi configuration designed to lure users into a Man-in-the-Middle (MitM) packet inspection rogue AP.",
    threatDetails: [
      "Authentication type set to 'nopass' (Unencrypted 802.11).",
      "Uses trust-exploiting SSID naming 'Free_HighSpeed_VIP'.",
      "Auto-connects mobile device without user confirmation, exposing unencrypted traffic."
    ]
  },
  {
    id: "demo-whatsapp-takeover",
    title: "WhatsApp Web Session Hijack Link",
    category: "Session Hijacking",
    verdict: "SUSPICIOUS",
    score: 38,
    badgeText: "Deep Link Attack",
    icon: "fa-comment-dots",
    payload: "https://wa.me/qr/EXPLOIT_PAIRING_SESSION_AUTH?source=link_device_tamper",
    description: "Deceptive QR presented as a contest entry that triggers device pairing authentication for WhatsApp Web.",
    threatDetails: [
      "Deep link invoking WhatsApp Web companion device registration.",
      "Disguised as promotional entry form to trick user into authorizing remote chat access.",
      "Payload contains sensitive session authentication query keys."
    ]
  },
  {
    id: "demo-crypto-giveaway",
    title: "Binance 500 USDT AirDrop Scam",
    category: "Financial Scam",
    verdict: "MALICIOUS",
    score: 12,
    badgeText: "Crypto Phishing",
    icon: "fa-coins",
    payload: "https://binance-usdt-airdrop-claim-2026.cc/connect-wallet?ref=bonus99",
    description: "Fake giveaway flyer distributed at university event requesting Web3 wallet drain approval.",
    threatDetails: [
      "High domain Shannon entropy: multiple hyphenated brand keywords.",
      "Target page contains Web3 wallet draining smart contract interactions.",
      "Unauthorized use of Binance brand identity."
    ]
  },
  {
    id: "demo-vcard-trojan",
    title: "Malicious Recruiter vCard with Exploit URL",
    category: "Payload Abuse",
    verdict: "SUSPICIOUS",
    score: 46,
    badgeText: "vCard Weaponization",
    icon: "fa-address-card",
    payload: "BEGIN:VCARD\nVERSION:3.0\nN:Sharma;Aarav;;;\nFN:Aarav Sharma (Google HR)\nTITLE:Senior Talent Lead\nTEL;TYPE=CELL:+919876543210\nURL:http://careers-google-verify.xyz/login.exe\nEND:VCARD",
    description: "vCard contact containing legitimate-looking contact info but with a hidden trojan .exe in the website field.",
    threatDetails: [
      "vCard URL parameter points to an executable (.exe) binary.",
      "Domain 'careers-google-verify.xyz' unregistered in corporate DNS.",
      "Auto-save on phone contacts may inadvertently prompt download."
    ]
  },
  {
    id: "demo-tax-refund",
    title: "IT Department Tax Refund Quishing",
    category: "Tax Phishing",
    verdict: "MALICIOUS",
    score: 7,
    badgeText: "Financial Fraud",
    icon: "fa-receipt",
    payload: "https://incometax-efiling-refund-gov.co/refund/claim?ack=7726190",
    description: "Spear-phishing QR pretending to refund Rs. 24,500 income tax with debit card CVV harvesting.",
    threatDetails: [
      "Domain 'incometax-efiling-refund-gov.co' mimicks Income Tax Dept.",
      "Non-government TLD (.co instead of .gov.in).",
      "SSL certificate created within last 48 hours."
    ]
  },
  {
    id: "demo-safe-starbucks",
    title: "Official Starbucks India Merchant UPI",
    category: "Verified Merchant",
    verdict: "SAFE",
    score: 98,
    badgeText: "Verified NPCI Merchant",
    icon: "fa-circle-check",
    payload: "upi://pay?pa=starbucks.billing@hdfcbank&pn=Tata%20Starbucks%20Private%20Limited&mc=5812&cu=INR",
    description: "Authentic dynamic counter QR code with registered merchant code (5812: Eating Places & Restaurants).",
    threatDetails: [
      "Merchant category code (MCC) 5812 matches Food & Beverage registry.",
      "VPA handle corresponds to official verified banking corporate pool.",
      "No preset or altered arbitrary payment amounts injected."
    ]
  },
  {
    id: "demo-safe-bharatpe",
    title: "Legitimate BharatPe Retailer QR",
    category: "Verified Merchant",
    verdict: "SAFE",
    score: 95,
    badgeText: "Authentic Retailer",
    icon: "fa-store",
    payload: "upi://pay?pa=bharatpe.9002188441@yesbank&pn=Gupta%20General%20Store&mc=5411&cu=INR",
    description: "Standard local merchant QR for daily groceries with clean verified merchant identity.",
    threatDetails: [
      "Valid YES Bank BharatPe aggregator gateway.",
      "MCC 5411 corresponds to Grocery Stores & Supermarkets.",
      "No malicious deep-links or obfuscated redirect patterns."
    ]
  },
  {
    id: "demo-safe-menu",
    title: "Five-Star Hotel Digital Dining Menu",
    category: "Legitimate Resource",
    verdict: "SAFE",
    score: 99,
    badgeText: "Verified Domain",
    icon: "fa-utensils",
    payload: "https://www.theleela.com/dining/menus/qmin-delhi-curated.pdf",
    description: "Direct link to static PDF menu hosted on high-reputation corporate domain with valid EV SSL certificate.",
    threatDetails: [
      "Canonical domain has 15+ years of clean domain reputation.",
      "Resource is a standard static document with safe MIME type.",
      "Zero redirection hops detected."
    ]
  },
  {
    id: "demo-safe-event",
    title: "Conference VIP Registration Pass",
    category: "Plain Text Pass",
    verdict: "SAFE",
    score: 100,
    badgeText: "Cryptographic Token",
    icon: "fa-ticket",
    payload: "PASS-AUTH-HASH::9B8A7C6E5D4C3B2A10F::SENTINEL-SUMMIT-2026::SEAT-A12",
    description: "Plain text alphanumeric ticket identifier for automated gate check-ins.",
    threatDetails: [
      "Pure data token with no executable hooks, URLs, or network triggers.",
      "Safe to scan on any consumer device.",
      "Zero attack surface."
    ]
  },
  {
    id: "demo-safe-wifi",
    title: "Enterprise WPA3 Secure Office WiFi",
    category: "Secure Network",
    verdict: "SAFE",
    score: 96,
    badgeText: "WPA2/3 Encrypted",
    icon: "fa-shield-halved",
    payload: "WIFI:S:Sentinel_Guest_Corporate;T:WPA;P:Cyb3r$h1eld#2026;;",
    description: "Secure enterprise guest wireless configuration using standard WPA2/WPA3 pre-shared key encryption.",
    threatDetails: [
      "Strong authentication protocol specified (WPA).",
      "No captive portal redirection traps.",
      "Standard authorized corporate hotspot pattern."
    ]
  },
  {
    id: "demo-electricity-bill",
    title: "Spoofed Electricity Bill Urgency Scam",
    category: "Payment Tampering",
    verdict: "MALICIOUS",
    score: 10,
    badgeText: "Urgent Payment Scam",
    icon: "fa-bolt",
    payload: "upi://pay?pa=discom.billcollection88@oksbi&pn=BSES%20Rajdhani%20Power&am=12850.00&cu=INR&tn=Immediate%20Disconnection%20Notice",
    description: "Fraudulent notice threatening immediate power cutoff within 2 hours with pre-filled Rs. 12,850 extortion.",
    threatDetails: [
      "Preset extortion amount 'am=12850.00' configured.",
      "VPA handle 'discom.billcollection88@oksbi' is an unverified individual VPA mimicking a power discom.",
      "Urgency trigger text in transaction note ('Immediate Disconnection Notice')."
    ]
  },
  {
    id: "demo-hindi-sbi",
    title: "भारतीय स्टेट बैंक - तत्काल केवाईसी सत्यापन",
    category: "Multilingual Phishing",
    verdict: "MALICIOUS",
    score: 8,
    badgeText: "Hindi Devanagari Quishing",
    icon: "fa-triangle-exclamation",
    payload: "https://sbi-yono-kyc-update.xyz/login.php",
    description: "एसबीआई नेट बैंकिंग एवं योनो उपयोगकर्ताओं को लक्षित करने वाला फ़िशिंग क्यूआर कोड।",
    threatDetails: [
      "Devanagari script detected in page title: 'भारतीय स्टेट बैंक'.",
      "Multilingual brand impersonation: Targets State Bank of India without sbi.co.in authorization.",
      "Counterfeit domain hosted on high-risk .xyz TLD."
    ]
  },
  {
    id: "demo-tamil-hdfc",
    title: "HDFC வங்கி - உடனடியாக உள்நுழைக",
    category: "Multilingual Phishing",
    verdict: "MALICIOUS",
    score: 6,
    badgeText: "Tamil Regional Quishing",
    icon: "fa-building-columns",
    payload: "https://hdfc-netbanking-verify.club/tamil/auth.html",
    description: "HDFC வங்கி வாடிக்கையாளர்களின் நெட்பேங்கிங் விவரங்களை திருடும் மோசடி தளம்.",
    threatDetails: [
      "Tamil script detected in title: 'HDFC வங்கி'.",
      "Multilingual brand impersonation: Spoofs HDFC Bank on non-official .club domain.",
      "Zero SSL cryptographic EV identity."
    ]
  },
  {
    id: "demo-telugu-gpay",
    title: "గూగుల్ పే - ₹2000 క్యాష్‌బ్యాక్ క్లెయిమ్",
    category: "Multilingual Phishing",
    verdict: "MALICIOUS",
    score: 12,
    badgeText: "Telugu Reward Trap",
    icon: "fa-coins",
    payload: "https://gpay-rewards-claim2026.work/telugu/scratch.php",
    description: "గూగుల్ పే వినియోగదారుల యూపీఐ పిన్ దొంగిలించడానికి రూపొందించిన నకిలీ ఆఫర్.",
    threatDetails: [
      "Telugu script detected in title: 'గూగుల్ పే'.",
      "Multilingual brand impersonation: Deceptive mimicry of Google Pay / Tez.",
      "Obfuscated scratch-card lure harvesting financial credentials."
    ]
  },
  {
    id: "demo-bengali-irctc",
    title: "আইআরসিটিসি তৎকাল টিকিট রিফান্ড পোর্টাল",
    category: "Multilingual Phishing",
    verdict: "MALICIOUS",
    score: 9,
    badgeText: "Bengali Railway Scam",
    icon: "fa-train",
    payload: "https://irctc-refund-service.rest/bengali/refund.html",
    description: "ভারতীয় রেলের আইআরসিটিসি পোর্টাল নকল করে তৈরি করা জাল টিকিট রিফান্ড সাইট।",
    threatDetails: [
      "Bengali script detected in title: 'আইআরসিটিসি তৎকাল টিকিট'.",
      "Multilingual brand impersonation: Mimics official IRCTC railway portal.",
      "Domain registered on low-cost .rest TLD."
    ]
  },
  {
    id: "demo-marathi-discom",
    title: "महावितरण वीज बिल - त्वरित भरा",
    category: "Multilingual Phishing",
    verdict: "MALICIOUS",
    score: 11,
    badgeText: "Marathi Utility Scam",
    icon: "fa-bolt",
    payload: "upi://pay?pa=mahavitaran.pay89@okhdfcbank&pn=%E0%A4%AD%E0%A4%BE%E0%A4%B0%E0%A4%A4%E0%A5%80%E0%A4%AF%20%E0%A4%B8%E0%A5%8D%E0%A4%9F%E0%A5%87%E0%A4%9F%20%E0%A4%AC%E0%A5%85%E0%A4%82%E0%A4%95&am=4850.00&cu=INR&tn=%E0%A4%B5%E0%A5%80%E0%A4%9C%20%E0%A4%AA%E0%A5%81%E0%A4%B0%E0%A4%B5%E0%A4%A0%E0%A4%BE%20%E0%A4%96%E0%A4%82%E0%A4%A1%E0%A4%BF%E0%A4%A4",
    description: "महावितरण वीज पुरवठा खंडित करण्याची भीती दाखवून फसवणूक करणारा यूपीआय क्यूआर कोड.",
    threatDetails: [
      "Devanagari script detected in Marathi utility pretext.",
      "Payee Name spoofing: Claims to be 'भारतीय स्टेट बँक' on personal VPA.",
      "Preset extortion amount ₹4,850 with urgency note."
    ]
  }
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { DEMO_SCENARIOS };
}
