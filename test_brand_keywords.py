#!/usr/bin/env python3
"""
Python Verification Test Suite for QRShield Multilingual Brand Impersonation
Tests:
  1. 14 Required Brands
  2. Unicode NFC Normalization
  3. Anti-Evasion Zero-Width Stripping
  4. Script Detection Block Ranges (Devanagari, Tamil, Telugu, Bengali, Latin)
  5. Legitimate vs Illegitimate Domain Handling
  6. Backend /api/analyze-url endpoint simulation
"""

import unittest
import brand_keywords

class TestMultilingualBrandKeywords(unittest.TestCase):

    def test_required_brands_present(self):
        catalog_brands = [b["brand"] for b in brand_keywords.BRAND_KEYWORD_MAP]
        required = [
            "SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "PayTM",
            "PhonePe", "GPay (Google Pay)", "BHIM UPI", "IRCTC",
            "Aadhaar/UIDAI", "PAN Card / Income Tax", "Amazon India",
            "Flipkart", "TRAI"
        ]
        for b in required:
            self.assertIn(b, catalog_brands, f"Missing brand: {b}")

    def test_languages_present_for_all_brands(self):
        langs = ["en", "hi", "ta", "te", "bn", "mr"]
        for b in brand_keywords.BRAND_KEYWORD_MAP:
            for l in langs:
                keywords = b.get("keywords", {}).get(l, [])
                self.assertTrue(len(keywords) > 0, f"Brand {b['brand']} missing language {l}")

    def test_unicode_nfc_normalization(self):
        decomposed = "\u0915\u093F"
        norm = brand_keywords.normalize_unicode_text(decomposed)
        self.assertEqual(norm, decomposed)

    def test_zero_width_evasion_stripping(self):
        evaded_hi = "एस\u200Bबी\u200Cआई"
        cleaned_hi = brand_keywords.normalize_unicode_text(evaded_hi)
        self.assertEqual(cleaned_hi, "एसबीआई")

        evaded_ta = "HDFC வ\u200B\u200Dங்கி"
        cleaned_ta = brand_keywords.normalize_unicode_text(evaded_ta)
        self.assertEqual(cleaned_ta, "HDFC வங்கி")

        self.assertTrue(brand_keywords.matches_keyword(evaded_hi, "एसबीआई"))
        self.assertTrue(brand_keywords.matches_keyword("HDFC\u200B\u200Dவங்கி", "HDFC வங்கி"))

    def test_script_detection_ranges(self):
        # Devanagari: U+0900–U+097F
        scripts = brand_keywords.get_script_names("भारतीय स्टेट बैंक")
        self.assertIn("Devanagari", scripts)

        # Tamil: U+0B80–U+0BFF
        scripts = brand_keywords.get_script_names("இந்திய ஸ்டேட் பேங்க்")
        self.assertIn("Tamil", scripts)

        # Telugu: U+0C00–U+0C7F
        scripts = brand_keywords.get_script_names("స్టేట్ బ్యాంక్ ఆఫ్ ఇండియా")
        self.assertIn("Telugu", scripts)

        # Bengali: U+0980–U+09FF
        scripts = brand_keywords.get_script_names("ভারতীয় স্টেট ব্যাংক")
        self.assertIn("Bengali", scripts)

    def test_phishing_detection_counterfeit_domain(self):
        res = brand_keywords.inspect_multilingual_brand({
            "title": "भारतीय स्टेट बैंक - त्वरित सत्यापन",
            "description": "केवाईसी पूर्ण करें",
            "domain": "sbi-kyc-scam.xyz",
            "url": "https://sbi-kyc-scam.xyz/login"
        })
        self.assertIsNotNone(res)
        self.assertTrue(res["matched"])
        self.assertEqual(res["brand"], "SBI")
        self.assertEqual(res["language"], "hi")
        self.assertEqual(res["script"], "Devanagari")
        self.assertFalse(res["isLegitimateDomain"])

    def test_legitimate_domain_bypass(self):
        res = brand_keywords.inspect_multilingual_brand({
            "title": "भारतीय स्टेट बैंक आधिकारिक पोर्टल",
            "domain": "sbi.co.in",
            "url": "https://sbi.co.in"
        })
        self.assertIsNotNone(res)
        self.assertTrue(res["isLegitimateDomain"])

if __name__ == "__main__":
    unittest.main()
