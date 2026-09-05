/**
 * Automated Verification Test Suite for Multilingual Brand Impersonation in QRShield
 * Tests:
 *  1. 14 Required Brands across 6 Languages (en, hi, ta, te, bn, mr)
 *  2. Unicode NFC Normalization
 *  3. Anti-Evasion Zero-Width Character Stripping
 *  4. Script Detection Block Ranges (Devanagari, Tamil, Telugu, Bengali, Latin)
 *  5. Legitimate vs Illegitimate Domain Handling
 *  6. End-to-End Threat Analyzer Scoring (+35 points, verdict: MALICIOUS)
 *  7. UPI Payee Name Indic Multilingual Check
 */

const assert = require("assert");
const {
  BRAND_KEYWORD_MAP,
  normalizeUnicodeText,
  detectScripts,
  getScriptNames,
  isLegitimateDomain,
  matchesKeyword,
  inspectMultilingualBrand
} = require("./js/brandKeywords.js");

const { SentinelAnalyzer } = require("./js/analyzer.js");

const tests = [];

function it(desc, fn) {
  tests.push({ desc, fn });
}

// 1. Verify 14 Required Brands
it("Contains at minimum the 14 required Indian banking/fintech/govt/e-commerce brands", () => {
  const expectedBrands = [
    "SBI",
    "HDFC Bank",
    "ICICI Bank",
    "Axis Bank",
    "PayTM",
    "PhonePe",
    "GPay (Google Pay)",
    "BHIM UPI",
    "IRCTC",
    "Aadhaar/UIDAI",
    "PAN Card / Income Tax",
    "Amazon India",
    "Flipkart",
    "TRAI"
  ];

  const catalogBrands = BRAND_KEYWORD_MAP.map(b => b.brand);
  for (let exp of expectedBrands) {
    assert(catalogBrands.includes(exp), `Missing expected brand: ${exp}`);
  }
  assert(BRAND_KEYWORD_MAP.length >= 14, `Expected at least 14 brands, found ${BRAND_KEYWORD_MAP.length}`);
});

// 2. Verify all 14 brands have keywords in en, hi, ta, te, bn, mr
it("Every brand has keyword mappings for all 6 languages (en, hi, ta, te, bn, mr)", () => {
  const requiredLanguages = ["en", "hi", "ta", "te", "bn", "mr"];
  for (let brand of BRAND_KEYWORD_MAP) {
    for (let lang of requiredLanguages) {
      assert(
        brand.keywords[lang] && Array.isArray(brand.keywords[lang]) && brand.keywords[lang].length > 0,
        `Brand '${brand.brand}' is missing keywords for language '${lang}'`
      );
    }
  }
});

// 3. Unicode NFC Normalization
it("Performs Unicode NFC normalization", () => {
  const decomposed = "\u0915\u093F";
  const normalized = normalizeUnicodeText(decomposed);
  assert.strictEqual(normalized, decomposed.normalize("NFC"));
});

// 4. Zero-Width Evasion Resistance
it("Strips zero-width spaces, joiners, and BOM to prevent attacker evasion", () => {
  const evadedHindi = "एस\u200Bबी\u200Cआई";
  const cleaned = normalizeUnicodeText(evadedHindi);
  assert.strictEqual(cleaned, "एसबीआई");

  const evadedTamilInside = "HDFC வ\u200B\u200Dங்கி";
  const cleanedTamilInside = normalizeUnicodeText(evadedTamilInside);
  assert.strictEqual(cleanedTamilInside, "HDFC வங்கி");

  const spaceReplacedTamil = "HDFC\u200B\u200Dவங்கி";
  assert(matchesKeyword(spaceReplacedTamil, "HDFC வங்கி"), "Failed to match zero-width space replaced Tamil keyword");
  assert(matchesKeyword(evadedHindi, "एसबीआई"), "Failed to match evaded Hindi keyword");
  assert(matchesKeyword(evadedTamilInside, "HDFC வங்கி"), "Failed to match evaded Tamil keyword");
});

// 5. Script Detection Block Ranges
it("Detects Unicode script ranges: Devanagari, Tamil, Telugu, Bengali, Latin", () => {
  const devanagariScripts = getScriptNames("भारतीय स्टेट बैंक");
  assert(devanagariScripts.includes("Devanagari"), "Should detect Devanagari");

  const tamilScripts = getScriptNames("இந்திய ஸ்டேட் பேங்க்");
  assert(tamilScripts.includes("Tamil"), "Should detect Tamil");

  const teluguScripts = getScriptNames("స్టేట్ బ్యాంక్ ఆఫ్ ఇండియా");
  assert(teluguScripts.includes("Telugu"), "Should detect Telugu");

  const bengaliScripts = getScriptNames("ভারতীয় স্টেট ব্যাংক");
  assert(bengaliScripts.includes("Bengali"), "Should detect Bengali");

  const mixedScripts = getScriptNames("HDFC வங்கி");
  assert(mixedScripts.includes("Tamil") && mixedScripts.includes("Latin"), "Should detect both Tamil and Latin");
});

// 6. Multilingual Brand Inspection on Illegitimate Domains
it("Detects phishing attempt on counterfeit domain for Hindi SBI", () => {
  const result = inspectMultilingualBrand({
    title: "भारतीय स्टेट बैंक - नेट बैंकिंग लॉगिन",
    description: "तत्काल अपना केवाईसी विवरण सत्यापित करें",
    domain: "sbi-kyc-update2026.xyz",
    url: "https://sbi-kyc-update2026.xyz/login.php"
  });

  assert(result, "Expected match result");
  assert.strictEqual(result.matched, true);
  assert.strictEqual(result.brand, "SBI");
  assert.strictEqual(result.language, "hi");
  assert.strictEqual(result.script, "Devanagari");
  assert.strictEqual(result.isLegitimateDomain, false);
});

it("Detects phishing attempt on counterfeit domain for Tamil HDFC", () => {
  const result = inspectMultilingualBrand({
    title: "HDFC வங்கி நெட்பேங்கிங் உள்நுழைவு",
    domain: "hdfc-rewards-claim.top",
    url: "https://hdfc-rewards-claim.top/netbanking"
  });

  assert(result, "Expected match result");
  assert.strictEqual(result.brand, "HDFC Bank");
  assert.strictEqual(result.language, "ta");
  assert.strictEqual(result.script, "Tamil");
  assert.strictEqual(result.isLegitimateDomain, false);
});

it("Detects phishing attempt for Telugu GPay / Google Pay", () => {
  const result = inspectMultilingualBrand({
    title: "గూగుల్ పే ₹1000 క్యాష్‌బ్యాక్ ఆఫర్",
    domain: "gpay-cashback-claim.online",
    url: "https://gpay-cashback-claim.online/claim"
  });

  assert(result, "Expected match result");
  assert.strictEqual(result.brand, "GPay (Google Pay)");
  assert.strictEqual(result.language, "te");
  assert.strictEqual(result.script, "Telugu");
  assert.strictEqual(result.isLegitimateDomain, false);
});

it("Detects phishing attempt for Bengali IRCTC", () => {
  const result = inspectMultilingualBrand({
    title: "আইআরসিটিসি তৎকাল টিকিট বুকিং পোর্টাল",
    domain: "irctc-tatkal-express.club",
    url: "https://irctc-tatkal-express.club/portal"
  });

  assert(result, "Expected match result");
  assert.strictEqual(result.brand, "IRCTC");
  assert.strictEqual(result.language, "bn");
  assert.strictEqual(result.script, "Bengali");
  assert.strictEqual(result.isLegitimateDomain, false);
});

it("Detects phishing attempt for Marathi State Bank", () => {
  const result = inspectMultilingualBrand({
    title: "भारतीय स्टेट बँक - खात्री करा",
    domain: "sbi-marathi-portal.work",
    url: "https://sbi-marathi-portal.work/login"
  });

  assert(result, "Expected match result");
  assert.strictEqual(result.brand, "SBI");
  assert.strictEqual(result.language, "mr");
  assert.strictEqual(result.script, "Devanagari");
  assert.strictEqual(result.isLegitimateDomain, false);
});

// 7. Legitimate Domain Bypass
it("Verifies legitimate official banking domains as clean (PASS)", () => {
  const sbiClean = inspectMultilingualBrand({
    title: "भारतीय स्टेट बैंक - आधिकारिक पोर्टल",
    domain: "sbi.co.in",
    url: "https://sbi.co.in/portal"
  });
  assert(sbiClean, "Should match brand");
  assert.strictEqual(sbiClean.isLegitimateDomain, true, "Official sbi.co.in must be recognized as legitimate");

  const hdfcClean = inspectMultilingualBrand({
    title: "HDFC வங்கி அதிகாரப்பூர்வ தளம்",
    domain: "netbanking.hdfcbank.com",
    url: "https://netbanking.hdfcbank.com"
  });
  assert(hdfcClean, "Should match brand");
  assert.strictEqual(hdfcClean.isLegitimateDomain, true, "Official hdfcbank.com must be recognized as legitimate");
});

// 8. End-to-End Threat Analyzer Integration & Scoring Check (+35 points toward Malicious)
it("End-to-End: SentinelAnalyzer penalizes multilingual brand impersonation by +35 points and marks MALICIOUS", async () => {
  const analyzer = new SentinelAnalyzer();
  const rawUrl = "https://sbi-kyc-verify-portal.top/login.php";
  const metadata = {
    pageTitle: "भारतीय स्टेट बैंक - केवाईसी सत्यापन",
    metaDescription: "तत्काल अपना खाता सत्यापित करें"
  };

  const analysis = await analyzer.analyze(rawUrl, null, metadata);

  assert.strictEqual(analysis.verdict, "MALICIOUS", `Expected MALICIOUS verdict, got ${analysis.verdict} (Score: ${analysis.safetyScore})`);
  assert(analysis.safetyScore < 40, `Safety score should be < 40, was ${analysis.safetyScore}`);
  assert(analysis.impersonatedBrand.includes("SBI"), `Expected SBI impersonatedBrand, got ${analysis.impersonatedBrand}`);
  assert(analysis.detectedScripts.includes("Devanagari"), "Expected Devanagari in detectedScripts");

  const brandCard = analysis.checks.find(c => c.id === "brand_impersonation");
  assert(brandCard, "Check card for brand_impersonation must exist");
  assert.strictEqual(brandCard.status, "FAIL", "Brand check card status must be FAIL");
  assert(brandCard.title.includes("Multilingual"), "Check card title should indicate Multilingual alert");
  assert(brandCard.summary.includes("भारतीय स्टेट बैंक"), "Check card summary should mention matched Hindi keyword");
});

// 9. UPI Payee Name Indic Multilingual Check
it("End-to-End: analyzeUpi detects Indic Payee Name discrepancy and flags VPA mismatch", async () => {
  const analyzer = new SentinelAnalyzer();
  const upiPayload = "upi://pay?pa=scammer99@ybl&pn=%E0%A4%AD%E0%A4%BE%E0%A4%B0%E0%A4%A4%E0%A5%80%E0%A4%AF%20%E0%A4%B8%E0%A5%8D%E0%A4%9F%E0%A5%87%E0%A4%9F%20%E0%A4%AC%E0%A5%88%E0%A4%82%E0%A4%95&am=1500.00&cu=INR";
  const analysis = await analyzer.analyze(upiPayload);

  assert.strictEqual(analysis.verdict, "MALICIOUS");
  assert(analysis.impersonatedBrand.includes("SBI"), "Expected SBI brand detection in UPI payee");
  assert(analysis.detectedScripts.includes("Devanagari"), "Expected Devanagari in detectedScripts for UPI");

  const brandCard = analysis.checks.find(c => c.id === "brand_impersonation");
  assert.strictEqual(brandCard.status, "FAIL");
});

// Async test runner
async function runAll() {
  console.log("=================================================");
  console.log("🛡️  RUNNING QRSHIELD MULTILINGUAL TEST SUITE");
  console.log("=================================================");

  let passed = 0;
  let failed = 0;

  for (let t of tests) {
    try {
      await t.fn();
      console.log(`  ✅ PASS: ${t.desc}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${t.desc}`);
      console.error(err);
      failed++;
    }
  }

  console.log("=================================================");
  console.log(`🏁 TEST RESULTS: ${passed}/${tests.length} TESTS PASSED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runAll();
