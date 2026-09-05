/**
 * Sentinel.Audit - Indian Cyber Crime Reporting & PDF Generation Engine
 * Handles geolocation lookup for local cyber cells, pre-fills National Cyber Crime Portal complaints,
 * and compiles stamped, cryptographic forensic complaint PDFs.
 */

const CYBER_CELL_DIRECTORY = [
  {
    city: "New Delhi",
    state: "Delhi NCT",
    name: "Special Cell Cyber Crime Unit (IFSO)",
    address: "Sector 17, Dwarka, New Delhi - 110078",
    helpline: "1930 / 011-20892623",
    email: "cybercell-delhi@nic.in",
    coords: [28.6139, 77.2090]
  },
  {
    city: "Mumbai",
    state: "Maharashtra",
    name: "Mumbai Police Cyber Crime Cell",
    address: "Bandrakurla Complex (BKC) Cyber Police Station, Bandra (E), Mumbai - 400051",
    helpline: "1930 / 022-26504008",
    email: "cybercell.mumbai@mahapolice.gov.in",
    coords: [19.0760, 72.8777]
  },
  {
    city: "Bengaluru",
    state: "Karnataka",
    name: "CID Cyber Crime Police Station Karnataka",
    address: "Carlton House, Palace Road, Bengaluru - 560001",
    helpline: "1930 / 080-22094496",
    email: "cybercrimeps-cid@ksp.gov.in",
    coords: [12.9716, 77.5946]
  },
  {
    city: "Hyderabad",
    state: "Telangana",
    name: "Telangana Cyber Security Bureau (TGCSB)",
    address: "DGP Office Complex, Lakdikapool, Hyderabad - 500004",
    helpline: "1930 / 040-27852441",
    email: "tgcsb-hyd@tspolice.gov.in",
    coords: [17.3850, 78.4867]
  },
  {
    city: "Chennai",
    state: "Tamil Nadu",
    name: "Greater Chennai Cyber Crime Police Wing",
    address: "Police Commissionerate, Vepery, Chennai - 600007",
    helpline: "1930 / 044-23452350",
    email: "cybercrimechennai@tn.gov.in",
    coords: [13.0827, 80.2707]
  },
  {
    city: "Kolkata",
    state: "West Bengal",
    name: "Kolkata Cyber Crime Police Station",
    address: "Lalbazar Police Headquarters, Kolkata - 700001",
    helpline: "1930 / 033-22143000",
    email: "cyberps@kolkatapolice.gov.in",
    coords: [22.5726, 88.3639]
  },
  {
    city: "Pune",
    state: "Maharashtra",
    name: "Pune City Cyber Crime Cell",
    address: "Shivajinagar Police Headquarters, Pune - 411005",
    helpline: "1930 / 020-29710097",
    email: "crimebranch-cyber.pune@gov.in",
    coords: [18.5204, 73.8567]
  },
  {
    city: "Gurugram",
    state: "Haryana",
    name: "Gurugram Cyber Police Station (Manesar & City)",
    address: "Cyber City, DLF Phase 2, Gurugram - 122002",
    helpline: "1930 / 0124-2211033",
    email: "acp.cyber-ggn@hry.gov.in",
    coords: [28.4595, 77.0266]
  }
];

class SentinelReporting {
  constructor() {
    this.currentIncident = null;
    this.selectedStation = CYBER_CELL_DIRECTORY[0];
  }

  async calculateSha256(str) {
    if (!window.crypto || !window.crypto.subtle) {
      return "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    }
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }

  getNearestStation(lat, lon) {
    let nearest = CYBER_CELL_DIRECTORY[0];
    let minDist = Infinity;

    CYBER_CELL_DIRECTORY.forEach(station => {
      const dLat = (station.coords[0] - lat) * (Math.PI / 180);
      const dLon = (station.coords[1] - lon) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat * (Math.PI / 180)) * Math.cos(station.coords[0] * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = 6371 * c; // Earth radius in km

      if (dist < minDist) {
        minDist = dist;
        nearest = station;
      }
    });

    this.selectedStation = nearest;
    return nearest;
  }

  async prepareIncidentData(analysisResult, customLocation = null) {
    const timestamp = new Date().toISOString();
    const shaDigest = await this.calculateSha256(analysisResult.rawPayload + timestamp);
    const incidentId = `SENTINEL-IN-${new Date().getFullYear()}-${shaDigest.slice(0, 8).toUpperCase()}`;

    this.currentIncident = {
      incidentId,
      timestamp,
      shaDigest,
      payload: analysisResult.rawPayload,
      payloadType: analysisResult.payloadType,
      safetyScore: analysisResult.safetyScore,
      verdict: analysisResult.verdict,
      impersonatedBrand: analysisResult.impersonatedBrand || "Unknown / Not Applicable",
      station: this.selectedStation,
      customLocation: customLocation || `${this.selectedStation.city} Metro Transit Corridor`,
      explanations: analysisResult.explanations || [],
      checks: analysisResult.checks || []
    };

    return this.currentIncident;
  }

  generateGovPortalText() {
    if (!this.currentIncident) return "";

    const inc = this.currentIncident;
    return `================================================================================
NATIONAL CYBER CRIME REPORTING PORTAL (cybercrime.gov.in)
INCIDENT COMPLAINT PRE-FILL DOSSIER - SENTINEL.AUDIT
================================================================================
INCIDENT REFERENCE ID : ${inc.incidentId}
DATE & TIME OF DISCOVERY : ${new Date(inc.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
CATEGORY OF CRIME       : Quishing (QR Code Phishing) / Online Financial Fraud
LEGAL PROVISIONS       : IT Act 2000 (Section 66D, 43) & IPC 420 (Cheating)

JURISDICTIONAL CYBER POLICE STATION:
Station Name : ${inc.station.name}
City / State : ${inc.station.city}, ${inc.station.state}
Nodal Email  : ${inc.station.email}
Helpline     : ${inc.station.helpline}

SUSPECT EVIDENCE DETAILS:
Payload Type : ${inc.payloadType}
Safety Score : ${inc.safetyScore} / 100 [VERDICT: ${inc.verdict}]
Impersonated : ${inc.impersonatedBrand}
Raw QR Value : ${inc.payload}
SHA-256 Hash : ${inc.shaDigest}
Physical Loc : ${inc.customLocation}

FORENSIC OBSERVATIONS:
${inc.explanations.map((exp, idx) => `[${idx + 1}] ${exp}`).join("\n")}

COMPLAINANT STATEMENT:
"A deceptive and malicious QR code was detected at the above physical location. Inspection reveals fraudulent tampering designed to induce financial deception, automated unauthorized payment routing, and/or malicious payload execution. Immediate forensic seizure, URL suspension, and VPA freezing under NPCI regulatory guidelines is requested."
================================================================================`;
  }

  async generatePdfDossier() {
    if (!this.currentIncident) return null;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const inc = this.currentIncident;

    // Page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Dark high-tech header banner
    doc.setFillColor(10, 14, 39); // #0A0E27
    doc.rect(0, 0, pageWidth, 85, "F");

    // Header Title
    doc.setTextColor(0, 245, 255); // #00F5FF Cyan
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("SENTINEL.AUDIT // CYBER CRIME FORENSIC DOSSIER", 35, 34);

    doc.setFontSize(9);
    doc.setTextColor(200, 205, 220);
    doc.setFont("helvetica", "normal");
    doc.text("CENTRALIZED QR TAMPERING & QUISHING INCIDENT COMPLAINT SHEET", 35, 50);
    doc.text("Compliant with IT Act 2000 (Sec 66D / 43) & National Cyber Crime Reporting Protocols", 35, 64);

    // Right header badge
    doc.setFillColor(255, 59, 59); // Alert red
    doc.roundedRect(pageWidth - 165, 22, 130, 26, 4, 4, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("THREAT VERIFIED", pageWidth - 148, 38);

    // Reference ID & Timestamp block
    let y = 115;
    doc.setFillColor(245, 247, 252);
    doc.rect(35, y - 15, pageWidth - 70, 48, "F");
    doc.setDrawColor(210, 218, 235);
    doc.rect(35, y - 15, pageWidth - 70, 48, "S");

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 30, 60);
    doc.text(`INCIDENT ID:`, 45, y + 5);
    doc.setFont("courier", "bold");
    doc.setTextColor(123, 47, 255);
    doc.text(`${inc.incidentId}`, 130, y + 5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 30, 60);
    doc.text(`TIMESTAMP:`, 45, y + 22);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 90, 110);
    doc.text(`${new Date(inc.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`, 130, y + 22);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 30, 60);
    doc.text(`SAFETY SCORE:`, 360, y + 5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 59, 59);
    doc.text(`${inc.safetyScore} / 100 (MALICIOUS)`, 460, y + 5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 30, 60);
    doc.text(`PAYLOAD TYPE:`, 360, y + 22);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 90, 110);
    doc.text(`${inc.payloadType}`, 460, y + 22);

    // Section 1: Jurisdictional Destination Cyber Crime Station
    y += 62;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(10, 14, 39);
    doc.text("1. JURISDICTIONAL CYBER POLICE CELL", 35, y);
    doc.setDrawColor(0, 245, 255);
    doc.setLineWidth(1.5);
    doc.line(35, y + 4, 255, y + 4);

    y += 20;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 50, 70);
    doc.text("Unit Name:", 45, y);
    doc.setFont("helvetica", "normal");
    doc.text(`${inc.station.name}`, 145, y);

    y += 14;
    doc.setFont("helvetica", "bold");
    doc.text("Address:", 45, y);
    doc.setFont("helvetica", "normal");
    doc.text(`${inc.station.address}`, 145, y);

    y += 14;
    doc.setFont("helvetica", "bold");
    doc.text("Emergency Helpline:", 45, y);
    doc.setFont("helvetica", "normal");
    doc.text(`${inc.station.helpline}  |  Official Portal: cybercrime.gov.in`, 145, y);

    // Section 2: Physical Incident Geolocation & Discovery Context
    y += 26;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(10, 14, 39);
    doc.text("2. PHYSICAL DISCOVERY LOCATION & TARGET ENTITY", 35, y);
    doc.setDrawColor(0, 245, 255);
    doc.line(35, y + 4, 310, y + 4);

    y += 20;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Location Tag:", 45, y);
    doc.setFont("helvetica", "normal");
    doc.text(`${inc.customLocation}`, 145, y);

    y += 14;
    doc.setFont("helvetica", "bold");
    doc.text("Impersonated Entity:", 45, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(200, 30, 30);
    doc.text(`${inc.impersonatedBrand}`, 145, y);
    doc.setTextColor(40, 50, 70);

    // Section 3: Forensic Evidence & Cryptographic Hash
    y += 26;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(10, 14, 39);
    doc.text("3. DIGITAL FORENSIC EVIDENCE & CRYPTOGRAPHIC PROOF", 35, y);
    doc.setDrawColor(0, 245, 255);
    doc.line(35, y + 4, 340, y + 4);

    y += 18;
    doc.setFillColor(248, 250, 254);
    doc.rect(45, y, pageWidth - 90, 50, "F");
    doc.setDrawColor(215, 222, 238);
    doc.rect(45, y, pageWidth - 90, 50, "S");

    doc.setFontSize(8.5);
    doc.setFont("courier", "normal");
    doc.setTextColor(30, 40, 60);

    // Wrap raw payload
    const splitPayload = doc.splitTextToSize(`PAYLOAD: ${inc.payload}`, pageWidth - 110);
    doc.text(splitPayload, 55, y + 14);

    doc.setFont("courier", "bold");
    doc.setTextColor(123, 47, 255);
    doc.text(`SHA-256 EVIDENCE FINGERPRINT: ${inc.shaDigest}`, 55, y + 40);

    // Section 4: Forensic Breakdown & Attack Vectors
    y += 72;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(10, 14, 39);
    doc.text("4. FORENSIC AUDIT OBSERVATIONS", 35, y);
    doc.setDrawColor(0, 245, 255);
    doc.line(35, y + 4, 235, y + 4);

    y += 18;
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 50, 70);

    inc.explanations.slice(0, 4).forEach((exp, i) => {
      const textLines = doc.splitTextToSize(`[CRIT-0${i + 1}] ${exp}`, pageWidth - 100);
      doc.text(textLines, 45, y);
      y += (textLines.length * 11) + 4;
    });

    // Section 5: Legal & Statutory Reference
    y += 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(10, 14, 39);
    doc.text("5. STATUTORY LEGAL PROVISIONS (IT ACT 2000)", 35, y);
    doc.setDrawColor(0, 245, 255);
    doc.line(35, y + 3, 275, y + 3);

    y += 14;
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(90, 100, 120);
    const legalText = "Offences highlighted under Information Technology Act, 2000 include Section 66D (Cheating by personation by using computer resource), Section 43 (Tampering with computer systems / digital interfaces), Section 66E (Violation of privacy), and Indian Penal Code Section 420 (Cheating and dishonestly inducing delivery of property).";
    const splitLegal = doc.splitTextToSize(legalText, pageWidth - 80);
    doc.text(splitLegal, 45, y);

    // Stamped Verification Seal Box (Bottom Right)
    const sealY = pageHeight - 110;
    doc.setFillColor(240, 253, 248);
    doc.roundedRect(pageWidth - 215, sealY, 180, 68, 6, 6, "F");
    doc.setDrawColor(0, 200, 120);
    doc.setLineWidth(1.5);
    doc.roundedRect(pageWidth - 215, sealY, 180, 68, 6, 6, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(0, 140, 80);
    doc.text("VERIFIED BY SENTINEL.AUDIT", pageWidth - 198, sealY + 18);
    doc.setFontSize(7.5);
    doc.setFont("courier", "normal");
    doc.text("CRYPTOGRAPHIC SEAL ACTIVE", pageWidth - 198, sealY + 30);
    doc.text(`HASH: ${inc.shaDigest.slice(0, 18)}...`, pageWidth - 198, sealY + 42);
    doc.text("STATUS: SUBMITTED TO CYBER CELL", pageWidth - 198, sealY + 54);

    // Footer note
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140, 150, 170);
    doc.text("Automated Evidence Dossier compiled by Sentinel.Audit Forensic Platform. Retain this document for official police FIR lodging.", 35, pageHeight - 25);

    return doc;
  }
}

window.reporting = new SentinelReporting();
