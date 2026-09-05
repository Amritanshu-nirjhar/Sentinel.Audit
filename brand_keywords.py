#!/usr/bin/env python3
"""
Sentinel.Audit - Multilingual Brand Impersonation & Unicode Anti-Evasion Engine (Python)
Detects deceptive brand mimicry across Hindi, Tamil, Telugu, Bengali, Marathi, and English.

Supports Unicode block ranges:
  - Devanagari: U+0900–U+097F (Hindi, Marathi)
  - Tamil:      U+0B80–U+0BFF
  - Telugu:     U+0C00–U+0C7F
  - Bengali:    U+0980–U+09FF
"""

import re
import unicodedata

# 1. Structured Brand Catalog with Multi-Language Keywords & Verified Official Domains
BRAND_KEYWORD_MAP = [
    {
        "brand": "SBI",
        "fullName": "State Bank of India",
        "category": "Banking / Public Sector",
        "legitimateDomains": [
            "sbi.co.in",
            "onlinesbi.sbi",
            "onlinesbi.com",
            "bank.sbi",
            "sbicard.com",
            "sbimf.com",
            "sbilife.co.in"
        ],
        "keywords": {
            "en": ["SBI Net Banking", "State Bank of India", "SBI YONO", "YONO SBI", "SBI KYC", "OnlineSBI", "SBI Reward"],
            "hi": ["एसबीआई नेट बैंकिंग", "भारतीय स्टेट बैंक", "एसबीआई योनो", "योनो एसबीआई", "सत्यापित करें", "एसबीआई बैंक", "एसबीआई केवाईसी"],
            "ta": ["SBI நெட் பேங்கிங்", "இந்திய ஸ்டேட் பேங்க்", "எஸ்பிஐ வங்கி", "யோனோ எஸ்பிஐ", "எஸ்பிஐ"],
            "te": ["SBI నెట్ బ్యాంకింగ్", "స్టేట్ బ్యాంక్ ఆఫ్ ఇండియా", "ఎస్బీఐ బ్యాంక్", "యోనో ఎస్బీఐ", "ఎస్బీఐ"],
            "bn": ["SBI নেট ব্যাংকিং", "ভারতীয় স্টেট ব্যাংক", "এসবিআই ব্যাংক", "ইয়োনো এসবিআই", "এসবিআই"],
            "mr": ["एसबीआई नेट बँकिंग", "भारतीय स्टेट बँक", "एसबीआय बँक", "योनो एसबीआय", "एसबीआय"]
        }
    },
    {
        "brand": "HDFC Bank",
        "fullName": "HDFC Bank Limited",
        "category": "Banking / Private Sector",
        "legitimateDomains": [
            "hdfcbank.com",
            "hdfc.com",
            "netbanking.hdfcbank.com",
            "leads.hdfcbank.com"
        ],
        "keywords": {
            "en": ["HDFC Bank", "HDFC NetBanking", "HDFC Bank NetBanking", "HDFC KYC", "HDFC Loan", "HDFC Credit Card"],
            "hi": ["एचडीएफसी बैंक", "एचडीएफसी नेटबैंकिंग", "एचडीएफसी बैंक खाता", "एचडीएफसी लोन", "एचडीएफसी केवाईसी"],
            "ta": ["HDFC வங்கி", "HDFC நெட்பேங்கிங்", "எச்டிஎஃப்சி வங்கி", "எச்டிஎஃப்சி நெட்பேங்கிங்"],
            "te": ["HDFC బ్యాంక్", "HDFC నెట్ బ్యాంకింగ్", "హెచ్‌డీఎఫ్‌సీ బ్యాంక్", "హెచ్‌డీఎఫ్‌సీ నెట్ బ్యాంకింగ్"],
            "bn": ["HDFC ব্যাংক", "HDFC নেটব্যাঙ্কিং", "এইচডিএফসি ব্যাঙ্ক", "এইচডিএফসি নেটব্যাঙ্কিং"],
            "mr": ["एचडीएफसी बँक", "एचडीएफसी नेटबँकिंग", "एचडीएफसी बँक खाते", "एचडीएफसी कर्ज"]
        }
    },
    {
        "brand": "ICICI Bank",
        "fullName": "ICICI Bank Limited",
        "category": "Banking / Private Sector",
        "legitimateDomains": [
            "icicibank.com",
            "infinity.icicibank.com",
            "icicidirect.com",
            "iciciprulife.com"
        ],
        "keywords": {
            "en": ["ICICI Bank", "iMobile", "ICICI NetBanking", "ICICI Direct", "iMobile Pay", "ICICI KYC"],
            "hi": ["आईसीआईसीआई बैंक", "आईसीआईसीआई नेटबैंकिंग", "आईमोबाइल", "आईसीआईसीआई खाता", "आईसीआईसीआई बैंक शाखा"],
            "ta": ["ICICI வங்கி", "ஐசிஐசிஐ வங்கி", "ஐமொபைல்", "ஐசிஐசிஐ நெட்பேங்கிங்"],
            "te": ["ICICI బ్యాంక్", "ఐసీఐసీఐ బ్యాంక్", "ఐమొబైల్", "ఐసీఐసీఐ నెట్ బ్యాంకింగ్"],
            "bn": ["ICICI ব্যাংক", "আইসিআইসিআই ব্যাঙ্ক", "আইমোবাইল", "আইসিআইসিআই নেটব্যাঙ্কিং"],
            "mr": ["आयसीआयसीआय बँक", "आयसीआयसीआय नेटबँकिंग", "आयमोबाइल", "आयसीआयसीआय"]
        }
    },
    {
        "brand": "Axis Bank",
        "fullName": "Axis Bank Limited",
        "category": "Banking / Private Sector",
        "legitimateDomains": [
            "axisbank.com",
            "axis.bank",
            "retail.axisbank.co.in"
        ],
        "keywords": {
            "en": ["Axis Bank", "Axis NetBanking", "Axis Mobile", "Axis Bank Account", "Axis KYC"],
            "hi": ["एक्सिस बैंक", "ऐक्सिस बैंक", "एक्सिस नेटबैंकिंग", "एक्सिस मोबाइल", "एक्सिस खाता"],
            "ta": ["ஆக்சிஸ் வங்கி", "ஆக்சிஸ் நெட்பேங்கிங்", "Axis வங்கி", "ஆக்சிஸ் மொபைல்"],
            "te": ["యాక్సిస్ బ్యాంక్", "యాక్సిస్ నెట్ బ్యాంకింగ్", "Axis బ్యాంక్", "యాక్సిస్ మొబైల్"],
            "bn": ["অ্যাক্সিস ব্যাংক", "অ্যাক্সিস ব্যাঙ্ক", "অ্যাক্সিস নেটব্যাঙ্কিং", "অ্যাক্সিস মোবাইল"],
            "mr": ["एक्सिस बँक", "अ‍ॅक्सिस बँक", "एक्सिस नेटबँकिंग", "एक्सिस मोबाईल"]
        }
    },
    {
        "brand": "PayTM",
        "fullName": "Paytm / One97 Communications",
        "category": "Fintech / Payments",
        "legitimateDomains": [
            "paytm.com",
            "paytmbank.com",
            "paytm.in"
        ],
        "keywords": {
            "en": ["Paytm", "Paytm Wallet", "Paytm Payments Bank", "Paytm KYC", "Paytm Postpaid", "Paytm Soundbox"],
            "hi": ["पेटीएम", "पेटीएम वॉलेट", "पेटीएम बैंक", "पेटीएम केवाईसी", "पेटीएम पेमेंट्स बैंक", "पेटीएम पेमेंट"],
            "ta": ["பேடிஎம்", "பேடிஎம் வாலட்", "பேடிஎம் வங்கி", "பேடிஎம் பேமெண்ட்ஸ்"],
            "te": ["పేటీఎం", "పేటిఎమ్", "పేటీఎం వాలెట్", "పేటీఎం బ్యాంక్"],
            "bn": ["পেটিএম", "পেটিএম ওয়ালেট", "পেটিএম পেমেন্ট", "পেটিএম ব্যাঙ্ক"],
            "mr": ["पेटीएम", "पेटीएम वॉलेट", "पेटीएम बँक", "पेटीएम पेमेंट्स बँक"]
        }
    },
    {
        "brand": "PhonePe",
        "fullName": "PhonePe Private Limited",
        "category": "Fintech / UPI",
        "legitimateDomains": [
            "phonepe.com"
        ],
        "keywords": {
            "en": ["PhonePe", "PhonePe Wallet", "PhonePe UPI", "PhonePe Cashback", "PhonePe Merchant"],
            "hi": ["फोनपे", "फोन पे", "फोनपे वॉलेट", "फोनपे यूपीआई", "फोनपे कैशबैक", "फोन पे पेमेंट"],
            "ta": ["போன்பே", "போன் பே", "போன்பே வாலட்", "போன்பே யுபிஐ", "போன்பே கேஷ்பேக்"],
            "te": ["ఫోన్‌పే", "ఫోన్ పే", "ఫోన్‌పే యూపీఐ", "ఫోన్‌పే వాలెట్", "ఫోన్‌పే క్యాష్‌బ్యాక్"],
            "bn": ["ফোনপে", "ফোন পে", "ফোনপে ইউপিআই", "ফোনপে ওয়ালেট", "ফোনপে ক্যাশব্যাক"],
            "mr": ["फोनपे", "फोन पे", "फोनपे वॉलेट", "फोनपे यूपीआय", "फोनपे कॅशबॅक"]
        }
    },
    {
        "brand": "GPay (Google Pay)",
        "fullName": "Google Pay / Tez",
        "category": "Fintech / UPI",
        "legitimateDomains": [
            "pay.google.com",
            "google.com",
            "payments.google.com"
        ],
        "keywords": {
            "en": ["Google Pay", "GPay", "GooglePay", "Google Pay Reward", "Google Pay Scratch Card", "Tez UPI"],
            "hi": ["गूगल पे", "गूगलपे", "जीपे", "गूगल पे रिवॉर्ड", "गूगल पे स्क्रैच कार्ड", "गूगल पेमेंट"],
            "ta": ["கூகுள் பே", "ஜிபே", "கூகிள் பே", "கூகுள் பே வெகுமதி"],
            "te": ["గూగుల్ పే", "జీపే", "గూగుల్‌పే", "గూగుల్ పే రివార్డ్"],
            "bn": ["গুগল পে", "জিপে", "গুগলপে", "গুগল পে রিওয়ার্ড"],
            "mr": ["गुगल पे", "जीपे", "गुगलपे", "गुगल पे रिवॉर्ड"]
        }
    },
    {
        "brand": "BHIM UPI",
        "fullName": "Bharat Interface for Money (NPCI)",
        "category": "Government / Payments",
        "legitimateDomains": [
            "bhimupi.org.in",
            "npci.org.in"
        ],
        "keywords": {
            "en": ["BHIM UPI", "BHIM App", "NPCI BHIM", "Bharat Interface for Money", "BHIM Aadhaar Pay"],
            "hi": ["भीम यूपीआई", "भीम ऐप", "एनपीसीआई भीम", "भारत इंटरफेस फॉर मनी", "भीम आधार पे"],
            "ta": ["பீம் யுபிஐ", "பீம் ஆப்", "என்பிசிஐ பீம்", "பீம் பாரத்"],
            "te": ["భీమ్ యూపీఐ", "భీమ్ యాప్", "ఎన్‌పీసీఐ భీమ్", "భారత్ ఇంటర్‌ఫేస్ ఫర్ మనీ"],
            "bn": ["ভীম ইউপিআই", "ভীম অ্যাপ", "এনপিসিআই ভীম", "ভারত ইন্টারফেস ফর মানি"],
            "mr": ["भीम यूपीआय", "भीम ॲप", "एनपीसीआय भीम", "भारत इंटरफेस फॉर मनी"]
        }
    },
    {
        "brand": "IRCTC",
        "fullName": "Indian Railway Catering and Tourism Corporation",
        "category": "Government / Transport",
        "legitimateDomains": [
            "irctc.co.in",
            "irctc.com",
            "air.irctc.co.in",
            "tourism.irctc.co.in",
            "indianrailways.gov.in"
        ],
        "keywords": {
            "en": ["IRCTC", "IRCTC Next Generation", "IRCTC Rail Connect", "IRCTC Tatkal", "IRCTC Ticket", "IRCTC Refund"],
            "hi": ["आईआरसीटीसी", "आईआरसीटीसी रेल कनेक्ट", "तत्काल टिकट", "आईआरसीटीसी टिकट", "रेलवे टिकट रिफंड"],
            "ta": ["ஐஆர்சிடிசி", "ரயில் கனெக்ட்", "தட்கல் டிக்கெட்", "ஐஆர்சிடிசி டிக்கெட்"],
            "te": ["ఐఆర్‌సీటీసీ", "రైల్ కనెక్ట్", "తత్కాల్ టికెట్", "ఐఆర్‌సీటీసీ టికెట్"],
            "bn": ["আইআরসিটিসি", "রেল কানেক্ট", "তাত্কাল টিকিট", "আইআরসিটিসি টিকিট রিফান্ড"],
            "mr": ["आयआरसीटीसी", "रेल्वे तिकीट", "तत्काळ तिकीट", "आयआरसीटीसी परतावा"]
        }
    },
    {
        "brand": "Aadhaar/UIDAI",
        "fullName": "Unique Identification Authority of India",
        "category": "Government / Identity",
        "legitimateDomains": [
            "uidai.gov.in",
            "myaadhaar.uidai.gov.in",
            "resident.uidai.gov.in"
        ],
        "keywords": {
            "en": ["Aadhaar", "UIDAI", "e-Aadhaar", "Aadhaar Card", "Aadhaar Update", "Aadhaar OTP", "Aadhaar Linking"],
            "hi": ["आधार", "यूआईडीएआई", "आधार कार्ड", "ई-आधार", "आधार सत्यापन", "आधार अपडेट", "आधार लिंक"],
            "ta": ["ஆதார்", "யுஐடிஏஐ", "ஆதார் கார்டு", "இ-ஆதார்", "ஆதார் சரிபார்ப்பு", "ஆதார் புதுப்பிப்பு"],
            "te": ["ఆధార్", "యూఐడీఏఐ", "ఆధార్ కార్డు", "ఈ-ఆధార్", "ఆధార్ అప్‌డేట్", "ఆధార్ లింక్"],
            "bn": ["আধার", "ইউআইডিএআই", "আধার কার্ড", "ই-আধার", "আধার আপডেট", "আধার লিংক"],
            "mr": ["आधार", "युआयडीएआय", "आधार कार्ड", "ई-आधार", "आधार अपडेट", "आधार पडताळणी"]
        }
    },
    {
        "brand": "PAN Card / Income Tax",
        "fullName": "Income Tax Department (CBDT)",
        "category": "Government / Taxation",
        "legitimateDomains": [
            "incometax.gov.in",
            "nsdl.co.in",
            "protean-tinpan.com",
            "utiitsl.com",
            "tin-nsdl.com"
        ],
        "keywords": {
            "en": ["Income Tax e-Filing", "PAN Card", "Income Tax Department", "e-PAN", "NSDL PAN", "PAN Aadhaar Link", "Tax Refund"],
            "hi": ["आयकर विभाग", "पैन कार्ड", "ई-फाइलिंग", "आयकर पोर्टल", "पैन सत्यापन", "आयकर रिफंड", "पैन आधार लिंक"],
            "ta": ["வருமான வரித்துறை", "பான் கார்டு", "இ-ஃபைலிங்", "பான் அட்டை", "வருமான வரி ரீஃபண்ட்"],
            "te": ["ఆదాయపు పన్ను శాఖ", "పాన్ కార్డు", "ఈ-ఫైలింగ్", "పాన్ వెరిఫికేషన్", "టాక్స్ రీఫండ్"],
            "bn": ["আয়কর বিভাগ", "প্যান কার্ড", "ই-ফাইলিং", "প্যান কার্ড সংশোধন", "আয়কর ফেরত"],
            "mr": ["आयकर विभाग", "पॅन कार्ड", "ई-फायलिंग", "आयकर परतावा", "पॅन आधार लिंक"]
        }
    },
    {
        "brand": "Amazon India",
        "fullName": "Amazon India (Amazon Seller Services)",
        "category": "E-Commerce / Merchant",
        "legitimateDomains": [
            "amazon.in",
            "amazon.com",
            "amzn.in",
            "amzn.to"
        ],
        "keywords": {
            "en": ["Amazon India", "Amazon Pay", "Amazon Prime", "Amazon Gift Card", "Amazon Order", "Amazon KYC"],
            "hi": ["अमेज़न", "अमेज़ॅन", "अमेजन पे", "अमेज़न इंडिया", "अमेज़न प्राइम", "अमेज़न गिफ्ट कार्ड"],
            "ta": ["அமேசான்", "அமேசான் பே", "அமேசான் இந்தியா", "அமேசான் பிரைம்"],
            "te": ["అమెజాన్", "అమెజాన్ పే", "అమెజాన్ ఇండియా", "అమెజాన్ ప్రైమ్"],
            "bn": ["অ্যামাজন", "অ্যামাজন পে", "অ্যামাজন ইন্ডিয়া", "অ্যামাজন প্রাইম"],
            "mr": ["ॲमेझॉन", "अमेझॉन", "ॲमेझॉन पे", "ॲमेझॉन प्राईम"]
        }
    },
    {
        "brand": "Flipkart",
        "fullName": "Flipkart Internet Private Limited",
        "category": "E-Commerce / Merchant",
        "legitimateDomains": [
            "flipkart.com",
            "fkrt.it",
            "flipkartcareers.com"
        ],
        "keywords": {
            "en": ["Flipkart", "Flipkart Pay Later", "Flipkart Plus", "Flipkart Grocery", "Flipkart SuperCoins", "Big Billion Days"],
            "hi": ["फ्लिपकार्ट", "फ्लिपकार्ट पे", "फ्लिपकार्ट सेल", "फ्लिपकार्ट सुपरकॉइन", "बिग बिलियन डेज"],
            "ta": ["பிளிப்கார்ட்", "ஃபிளிப்கார்ட்", "பிளிப்கார்ட் ஆஃபர்", "பிளிப்கார்ட் பே"],
            "te": ["ఫ్లిప్‌కార్ట్", "ఫ్లిప్‌కార్ట్ పే", "ఫ్లిప్‌కార్ట్ సూపర్ కాయిన్స్"],
            "bn": ["ফ্লিপকার্ট", "ফ্লিপকার্ট পে", "ফ্লিপকার্ট অফার"],
            "mr": ["फ्लिपकार्ट", "फ्लिपकार्ट पे", "फ्लिपकार्ट सेल"]
        }
    },
    {
        "brand": "TRAI",
        "fullName": "Telecom Regulatory Authority of India",
        "category": "Government / Regulator",
        "legitimateDomains": [
            "trai.gov.in",
            "telecomregulatory.gov.in",
            "sancharsaathi.gov.in",
            "dot.gov.in"
        ],
        "keywords": {
            "en": ["TRAI", "Telecom Regulatory Authority of India", "TRAI KYC", "SIM Verification", "DoT SIM KYC", "Sanchar Saathi"],
            "hi": ["ट्राई", "भारतीय दूरसंचार विनियामक प्राधिकरण", "ट्राई केवाईसी", "सिम सत्यापन", "दूरसंचार विभाग"],
            "ta": ["டிராய்", "தொலைத்தொடர்பு ஒழுங்குமுறை ஆணையம்", "சிம் சரிபார்ப்பு", "டிராய் கேஒய்சி"],
            "te": ["ట్రాయ్", "టెలికాం రెగ్యులేటరీ అథారిటీ", "సిమ్ వెరిఫికేషన్", "ట్రాయ్ కేవైసీ"],
            "bn": ["ট্রাই", "টেলিকম নিয়ন্ত্রক সংস্থা", "সিম যাচাইকরণ", "ট্রাই কেওয়াইসি"],
            "mr": ["ट्राय", "भारतीय दूरसंचार नियामक प्राधिकरण", "सिम पडताळणी", "ट्राय केवायसी"]
        }
    }
]

LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "ta": "Tamil",
    "te": "Telugu",
    "bn": "Bengali",
    "mr": "Marathi"
}

# 2. Unicode Normalization & Evasion Stripper
ZERO_WIDTH_PATTERN = re.compile(r"[\u200B-\u200D\uFEFF\u00AD\u2060\u180E\u200E\u200F\u0000-\u001F]")

def normalize_unicode_text(text: str) -> str:
    if not text:
        return ""
    # Unicode NFC normalization
    normalized = unicodedata.normalize("NFC", str(text))
    # Strip invisible zero-width characters used for evading keyword filters
    normalized = ZERO_WIDTH_PATTERN.sub("", normalized)
    # Collapse multiple whitespace
    normalized = re.sub(r"\s+", " ", normalized).strip()
    return normalized

# 3. Script Detection via Unicode Block Ranges
SCRIPT_RANGES = [
    {
        "name": "Devanagari",
        "pattern": re.compile(r"[\u0900-\u097F]"),
        "languages": ["Hindi", "Marathi"],
        "range": "U+0900–U+097F"
    },
    {
        "name": "Tamil",
        "pattern": re.compile(r"[\u0B80-\u0BFF]"),
        "languages": ["Tamil"],
        "range": "U+0B80–U+0BFF"
    },
    {
        "name": "Telugu",
        "pattern": re.compile(r"[\u0C00-\u0C7F]"),
        "languages": ["Telugu"],
        "range": "U+0C00–U+0C7F"
    },
    {
        "name": "Bengali",
        "pattern": re.compile(r"[\u0980-\u09FF]"),
        "languages": ["Bengali"],
        "range": "U+0980–U+09FF"
    },
    {
        "name": "Latin",
        "pattern": re.compile(r"[a-zA-Z]"),
        "languages": ["English"],
        "range": "U+0041–U+007A"
    }
]

def detect_scripts(text: str):
    if not text:
        return []
    normalized = normalize_unicode_text(text)
    detected = []
    for item in SCRIPT_RANGES:
        if item["pattern"].search(normalized):
            detected.append({
                "name": item["name"],
                "languages": item["languages"],
                "range": item["range"]
            })
    return detected

def get_script_names(text: str):
    return [s["name"] for s in detect_scripts(text)]

# 4. Domain Validation
def is_legitimate_domain(domain: str, brand_obj: dict) -> bool:
    if not domain or not brand_obj:
        return False
    clean_domain = domain.lower().strip().removeprefix("www.")
    for legit in brand_obj.get("legitimateDomains", []):
        clean_legit = legit.lower().strip()
        if clean_domain == clean_legit or clean_domain.endswith("." + clean_legit):
            return True
    return False

# 5. Fuzzy Matching Logic
def build_fuzzy_key(text: str) -> str:
    norm = normalize_unicode_text(text).lower()
    return re.sub(r"[\s\-_.:,;/\\|~`!@#$%^&*()[\]{}<>?+=]", "", norm)

def matches_keyword(text: str, keyword: str) -> bool:
    if not text or not keyword:
        return False
    norm_text = normalize_unicode_text(text).lower()
    norm_kw = normalize_unicode_text(keyword).lower()

    if norm_kw in norm_text:
        return True

    fuzzy_text = build_fuzzy_key(norm_text)
    fuzzy_kw = build_fuzzy_key(norm_kw)
    if len(fuzzy_kw) >= 3 and fuzzy_kw in fuzzy_text:
        return True

    return False

def inspect_multilingual_brand(context: dict):
    if not context:
        return None

    raw_title = context.get("title", "")
    raw_desc = context.get("description", "")
    domain = context.get("domain", "").lower().strip()
    url = context.get("url", "")

    norm_title = normalize_unicode_text(raw_title)
    norm_desc = normalize_unicode_text(raw_desc)
    norm_url = normalize_unicode_text(url)

    title_scripts = detect_scripts(norm_title)
    all_scripts = detect_scripts(f"{norm_title} {norm_desc} {norm_url}")
    script_names = list(set([s["name"] for s in all_scripts]))

    candidates = [
        {"text": norm_title, "location": "title", "priority": 1},
        {"text": norm_desc, "location": "description", "priority": 2},
        {"text": norm_url, "location": "url", "priority": 3}
    ]

    for brand_obj in BRAND_KEYWORD_MAP:
        is_official = is_legitimate_domain(domain, brand_obj)

        for lang in ["hi", "ta", "te", "bn", "mr", "en"]:
            keywords = brand_obj.get("keywords", {}).get(lang, [])
            for kw in keywords:
                for candidate in candidates:
                    if candidate["text"] and matches_keyword(candidate["text"], kw):
                        primary_script = "Latin"
                        if lang in ("hi", "mr"):
                            primary_script = "Devanagari"
                        elif lang == "ta":
                            primary_script = "Tamil"
                        elif lang == "te":
                            primary_script = "Telugu"
                        elif lang == "bn":
                            primary_script = "Bengali"

                        return {
                            "matched": True,
                            "brand": brand_obj["brand"],
                            "fullName": brand_obj["fullName"],
                            "category": brand_obj["category"],
                            "matchedKeyword": kw,
                            "language": lang,
                            "languageName": LANGUAGE_NAMES.get(lang, lang),
                            "script": primary_script,
                            "matchLocation": candidate["location"],
                            "isLegitimateDomain": is_official,
                            "domain": domain,
                            "detectedScripts": script_names,
                            "titleScripts": [s["name"] for s in title_scripts],
                            "legitimateDomains": brand_obj["legitimateDomains"]
                        }

    return None
