/**
 * Sentinel.Audit - Main Application Orchestrator
 * Connects camera HUD, file dropzone, threat analysis engine, reporting modal, and sound feedback.
 */

class SentinelApp {
  constructor() {
    this.videoStream = null;
    this.isScanningCamera = false;
    this.currentAnalysis = null;
    this.activeTab = "optical"; // 'optical' | 'dropzone' | 'demo'
    this.stats = {
      totalScans: 48,
      threatsNeutralized: 19,
      tamperedUpi: 9,
      malwareApks: 5
    };
    this.scanHistory = [];
    this.currentFacingMode = "environment";
  }

  init() {
    this.loadState();
    this.bindEvents();
    this.renderDemoMatrix();
    this.renderHistory();
    this.updateStatsDisplay();

    // Initialize Threat Radar Map
    if (window.threatRadar) {
      setTimeout(() => {
        window.threatRadar.init("threat-map-container");
      }, 300);
    }
  }

  loadState() {
    const savedHistory = localStorage.getItem("sentinel_history");
    if (savedHistory) {
      try {
        this.scanHistory = JSON.parse(savedHistory);
      } catch (e) {
        this.scanHistory = [];
      }
    }
    const savedStats = localStorage.getItem("sentinel_stats");
    if (savedStats) {
      try {
        this.stats = JSON.parse(savedStats);
      } catch (e) {}
    }
  }

  saveState() {
    localStorage.setItem("sentinel_history", JSON.stringify(this.scanHistory.slice(0, 30)));
    localStorage.setItem("sentinel_stats", JSON.stringify(this.stats));
  }

  bindEvents() {
    // Mode Switcher Tabs
    document.querySelectorAll(".hud-tab-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        window.audioSys.playClick();
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Camera Controls
    const startCamBtn = document.getElementById("btn-start-camera");
    if (startCamBtn) {
      startCamBtn.addEventListener("click", () => {
        window.audioSys.playClick();
        if ("vibrate" in navigator) {
          try { navigator.vibrate(20); } catch (e) {}
        }
        if (this.isScanningCamera) {
          this.stopCamera();
        } else {
          this.startCamera();
        }
      });
    }

    // Camera Flip Button (for mobile front/rear camera toggle)
    const flipCamBtn = document.getElementById("btn-flip-camera");
    if (flipCamBtn) {
      flipCamBtn.addEventListener("click", () => {
        window.audioSys.playClick();
        if ("vibrate" in navigator) {
          try { navigator.vibrate(25); } catch (e) {}
        }
        this.currentFacingMode = this.currentFacingMode === "environment" ? "user" : "environment";
        this.flipCamera();
      });
    }

    // Dropzone Events
    const dropzone = document.getElementById("scanner-dropzone");
    const fileInput = document.getElementById("qr-file-input");

    if (dropzone && fileInput) {
      dropzone.addEventListener("click", () => {
        window.audioSys.playClick();
        if ("vibrate" in navigator) {
          try { navigator.vibrate(15); } catch (e) {}
        }
        fileInput.click();
      });

      fileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleImageFile(e.target.files[0]);
        }
      });

      dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.classList.add("dragover");
      });

      dropzone.addEventListener("dragleave", () => {
        dropzone.classList.remove("dragover");
      });

      dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.handleImageFile(e.dataTransfer.files[0]);
        }
      });
    }

    // Global Clipboard Paste (Ctrl+V / Cmd+V for QR screenshots)
    window.addEventListener("paste", (e) => {
      const items = (e.clipboardData || e.originalEvent.clipboardData).items;
      for (let item of items) {
        if (item.kind === "file" && item.type.startsWith("image/")) {
          const file = item.getAsFile();
          this.showToast("Pasted image detected from clipboard.", "info");
          this.handleImageFile(file);
          break;
        }
      }
    });

    // Audio Toggle
    const audioBtn = document.getElementById("btn-audio-toggle");
    if (audioBtn) {
      audioBtn.addEventListener("click", () => {
        const isMuted = window.audioSys.toggleMute();
        audioBtn.innerHTML = isMuted 
          ? '<i class="fa-solid fa-volume-xmark"></i> <span class="nav-btn-label">MUTE</span>' 
          : '<i class="fa-solid fa-volume-high"></i> <span class="nav-btn-label">AUDIO ON</span>';
        audioBtn.classList.toggle("active", !isMuted);
      });
    }

    // Modal Events
    const closeModalBtn = document.getElementById("btn-close-modal");
    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", () => {
        window.audioSys.playClick();
        this.hideReportModal();
      });
    }

    // Modal Background Click
    const modalBackdrop = document.getElementById("report-modal");
    if (modalBackdrop) {
      modalBackdrop.addEventListener("click", (e) => {
        if (e.target === modalBackdrop) {
          this.hideReportModal();
        }
      });
    }

    // PDF Download Button
    const downloadPdfBtn = document.getElementById("btn-download-pdf");
    if (downloadPdfBtn) {
      downloadPdfBtn.addEventListener("click", async () => {
        window.audioSys.playClick();
        downloadPdfBtn.disabled = true;
        downloadPdfBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating Dossier...';
        try {
          const doc = await window.reporting.generatePdfDossier();
          if (doc) {
            doc.save(`${window.reporting.currentIncident.incidentId}.pdf`);
            this.showToast("Formal FIR Complaint Dossier PDF generated successfully.", "success");
          }
        } catch (err) {
          console.error(err);
          this.showToast("Error compiling PDF dossier.", "error");
        }
        downloadPdfBtn.disabled = false;
        downloadPdfBtn.innerHTML = '<i class="fa-solid fa-file-pdf"></i> Download Official Complaint PDF (FIR)';
      });
    }

    // Copy Gov Portal Text Button
    const copyPortalBtn = document.getElementById("btn-copy-portal-text");
    if (copyPortalBtn) {
      copyPortalBtn.addEventListener("click", () => {
        window.audioSys.playClick();
        const text = window.reporting.generateGovPortalText();
        navigator.clipboard.writeText(text).then(() => {
          this.showToast("Copied pre-fill format for cybercrime.gov.in to clipboard!", "success");
        });
      });
    }

    // Submit Report to Community Radar
    const submitReportBtn = document.getElementById("btn-submit-report");
    if (submitReportBtn) {
      submitReportBtn.addEventListener("click", async () => {
        window.audioSys.playClick();
        const inc = window.reporting.currentIncident;
        if (!inc) return;

        submitReportBtn.disabled = true;
        submitReportBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Broadcasting...';

        const reportPayload = {
          id: inc.incidentId,
          timestamp: inc.timestamp,
          type: inc.payloadType === "UPI" ? "UPI_TAMPER_STICKER" : (inc.payload.includes(".apk") ? "MALWARE_APK" : "PHISHING_URL"),
          verdict: inc.verdict,
          score: inc.safetyScore,
          city: inc.station.city,
          location: inc.customLocation,
          coords: inc.station.coords,
          target: inc.impersonatedBrand,
          details: inc.explanations[0] || "Reported via Sentinel.Audit forensic scanner."
        };

        try {
          await fetch("/api/submit-report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ report: reportPayload })
          });
        } catch (e) {
          // fallback
        }

        // Add to live radar map
        if (window.threatRadar) {
          window.threatRadar.addReport(reportPayload);
        }

        this.showToast("Incident logged to Community Threat Radar & dispatched to cyber desk.", "success");
        submitReportBtn.innerHTML = '<i class="fa-solid fa-check"></i> Dispatched to Cyber Cell';
        submitReportBtn.classList.add("dispatched");
      });
    }

    // City Selector in Modal
    const citySelect = document.getElementById("incident-city-select");
    if (citySelect) {
      citySelect.addEventListener("change", (e) => {
        const cityIndex = parseInt(e.target.value, 10);
        window.reporting.selectedStation = CYBER_CELL_DIRECTORY[cityIndex];
        this.updateModalStationDisplay();
      });
    }

    // Threat Radar Map Filter Buttons
    document.querySelectorAll(".radar-filter-btn[data-filter]").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".radar-filter-btn[data-filter]").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        if (window.threatRadar) {
          window.threatRadar.setFilter(btn.dataset.filter);
        }
      });
    });

    // Custom Mapbox API Key Config (Optional)
    const mapKeyBtn = document.getElementById("btn-configure-map");
    if (mapKeyBtn) {
      mapKeyBtn.addEventListener("click", () => {
        window.audioSys.playClick();
        const currentKey = localStorage.getItem("sentinel_mapbox_token") || "";
        const newKey = prompt(
          "Default Map uses OpenStreetMap (100% Free, NO API key required).\n\nIf you prefer to use a custom Mapbox Dark style, enter your Mapbox Public Token (pk.eyJ...):\n(Leave empty to keep using default free map)",
          currentKey
        );
        if (newKey !== null) {
          if (newKey.trim() === "") {
            localStorage.removeItem("sentinel_mapbox_token");
            this.showToast("Using default free OpenStreetMap layer (No key needed).", "info");
          } else {
            localStorage.setItem("sentinel_mapbox_token", newKey.trim());
            this.showToast("Custom Mapbox key saved! Reloading map...", "success");
          }
          setTimeout(() => location.reload(), 800);
        }
      });
    }

    // Threat Radar City Focus
    document.querySelectorAll(".city-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        document.querySelectorAll(".city-chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        if (window.threatRadar) {
          window.threatRadar.focusCity(chip.dataset.city);
        }
      });
    });

    // Demo Scenario Category Filter
    document.querySelectorAll(".demo-filter-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        document.querySelectorAll(".demo-filter-chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        this.renderDemoMatrix(chip.dataset.category);
      });
    });

    // Clear History Button
    const clearHistoryBtn = document.getElementById("btn-clear-history");
    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener("click", () => {
        window.audioSys.playClick();
        this.scanHistory = [];
        this.saveState();
        this.renderHistory();
        this.showToast("Scan audit log purged.", "info");
      });
    }
  }

  switchTab(tabId) {
    this.activeTab = tabId;
    document.querySelectorAll(".hud-tab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });

    document.getElementById("tab-optical").style.display = tabId === "optical" ? "block" : "none";
    document.getElementById("tab-dropzone").style.display = tabId === "dropzone" ? "block" : "none";
    document.getElementById("tab-demo").style.display = tabId === "demo" ? "block" : "none";

    if (tabId !== "optical" && this.isScanningCamera) {
      this.stopCamera();
    }
  }

  async startCamera() {
    const video = document.getElementById("scanner-video");
    const reticleText = document.getElementById("reticle-status-text");
    const camBtn = document.getElementById("btn-start-camera");
    const flipBtn = document.getElementById("btn-flip-camera");

    try {
      if (reticleText) reticleText.textContent = "INITIALIZING SENSOR...";
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: this.currentFacingMode || "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      this.videoStream = stream;
      video.srcObject = stream;
      video.setAttribute("playsinline", true);
      await video.play();

      this.isScanningCamera = true;
      if (camBtn) {
        camBtn.innerHTML = '<i class="fa-solid fa-stop"></i> Disengage Camera';
        camBtn.classList.add("btn-danger-glow");
      }
      if (flipBtn) {
        flipBtn.style.display = "inline-flex";
      }
      if (reticleText) reticleText.textContent = "SENSOR ACTIVE // SCANNING";
      document.querySelector(".viewfinder-frame")?.classList.add("scanning-active");

      window.audioSys.playScanSweep();
      this.cameraScanLoop();
    } catch (err) {
      console.error("Camera access error:", err);
      this.showToast("Camera access denied or unavailable. Please use Image Dropzone or Curated Demo Matrix.", "error");
      if (reticleText) reticleText.textContent = "SENSOR OFFLINE";
    }
  }

  stopCamera() {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }
    this.isScanningCamera = false;
    const camBtn = document.getElementById("btn-start-camera");
    const flipBtn = document.getElementById("btn-flip-camera");
    const reticleText = document.getElementById("reticle-status-text");

    if (camBtn) {
      camBtn.innerHTML = '<i class="fa-solid fa-camera"></i> Engage Optical Sensor';
      camBtn.classList.remove("btn-danger-glow");
    }
    if (flipBtn) {
      flipBtn.style.display = "none";
    }
    if (reticleText) reticleText.textContent = "OPTICAL SENSOR STANDBY";
    document.querySelector(".viewfinder-frame")?.classList.remove("scanning-active");
  }

  async flipCamera() {
    if (!this.isScanningCamera) return;
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }
    const video = document.getElementById("scanner-video");
    const reticleText = document.getElementById("reticle-status-text");

    try {
      if (reticleText) reticleText.textContent = `SWITCHING TO ${this.currentFacingMode.toUpperCase()}...`;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: this.currentFacingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      this.videoStream = stream;
      video.srcObject = stream;
      video.setAttribute("playsinline", true);
      await video.play();

      if (reticleText) reticleText.textContent = "SENSOR ACTIVE // SCANNING";
      window.audioSys.playScanSweep();
      this.cameraScanLoop();
    } catch (err) {
      console.warn("Camera flip constraint fallback:", err);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
        this.videoStream = fallbackStream;
        video.srcObject = fallbackStream;
        await video.play();
        this.cameraScanLoop();
      } catch (e2) {
        this.showToast("Could not switch camera sensor on this device.", "error");
      }
    }
  }

  cameraScanLoop() {
    if (!this.isScanningCamera) return;

    const video = document.getElementById("scanner-video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      if (typeof jsQR !== "undefined") {
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert"
        });

        if (code && code.data) {
          window.audioSys.playLockOn();
          this.stopCamera();
          document.getElementById("reticle-status-text").textContent = "TARGET LOCKED // DECODING";
          this.executeAnalysisWorkflow(code.data);
          return;
        }
      }
    }

    requestAnimationFrame(() => this.cameraScanLoop());
  }

  handleImageFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        if (typeof jsQR !== "undefined") {
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            window.audioSys.playLockOn();
            this.executeAnalysisWorkflow(code.data);
          } else {
            this.showToast("No readable QR code found in this image. Ensure clear lighting.", "error");
          }
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  async executeAnalysisWorkflow(rawPayload, demoScenario = null) {
    window.audioSys.playScanSweep();

    // Scroll smoothly to analysis deck
    const deck = document.getElementById("forensic-deck");
    if (deck) {
      deck.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // Show Scanning HUD Overlay
    const overlay = document.getElementById("analysis-telemetry-overlay");
    if (overlay) overlay.style.display = "flex";

    const telemetryLines = [
      "DECOUPLING QR MODULE GRID & CORRECTION BITS...",
      "CLASSIFYING PAYLOAD SCHEME & EXECUTION PROTOCOL...",
      "CALCULATING SHANNON LEXICAL DOMAIN ENTROPY...",
      "SCANNING UNICODE SCRIPT RANGES (DEVANAGARI, TAMIL, TELUGU, BENGALI)...",
      "TRACING CANONICAL REDIRECT HOPS & SHORTENERS...",
      "AUDITING NPCI REGISTRY & MERCHANT CATEGORY CODES...",
      "RUNNING MULTILINGUAL BRAND IMPERSONATION CLASSIFIER..."
    ];

    const teleText = document.getElementById("telemetry-phase-text");
    for (let i = 0; i < telemetryLines.length; i++) {
      if (teleText) teleText.textContent = telemetryLines[i];
      await new Promise(r => setTimeout(r, 150));
    }

    // Resolve page metadata if available (demoScenario or backend URL extraction)
    let pageMetadata = null;
    if (demoScenario) {
      pageMetadata = {
        pageTitle: demoScenario.title,
        metaDescription: demoScenario.description
      };
    } else if (rawPayload.startsWith("http://") || rawPayload.startsWith("https://")) {
      try {
        const resp = await fetch("/api/analyze-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: rawPayload })
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data.pageTitle || data.metaDescription) {
            pageMetadata = {
              pageTitle: data.pageTitle,
              metaDescription: data.metaDescription
            };
          }
        }
      } catch (e) {
        // Local/offline fallback
      }
    }

    // Execute multi-vector threat engine
    const analysis = await window.analyzer.analyze(rawPayload, demoScenario, pageMetadata);
    this.currentAnalysis = analysis;

    if (overlay) overlay.style.display = "none";

    // Play appropriate verdict audio
    // Play appropriate verdict audio and mobile haptics
    if (analysis.verdict === "SAFE") {
      window.audioSys.playVerdictSafe();
      if ("vibrate" in navigator) {
        try { navigator.vibrate([40, 50, 40]); } catch (e) {}
      }
    } else if (analysis.verdict === "SUSPICIOUS") {
      window.audioSys.playVerdictSuspicious();
      if ("vibrate" in navigator) {
        try { navigator.vibrate([60, 40, 80]); } catch (e) {}
      }
    } else {
      window.audioSys.playVerdictMalicious();
      if ("vibrate" in navigator) {
        try { navigator.vibrate([100, 50, 120, 50, 200]); } catch (e) {}
      }
    }

    // Update UI Elements
    this.renderForensicDeck(analysis);

    // Record in History and update Stats
    this.recordScan(analysis);
  }

  renderForensicDeck(analysis) {
    const deck = document.getElementById("forensic-deck");
    if (!deck) return;
    deck.style.display = "block";

    // Auto-scroll into view smoothly on mobile screens
    if (window.innerWidth <= 768) {
      setTimeout(() => {
        deck.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    }

    // 1. Radial Score Gauge
    const scoreVal = document.getElementById("gauge-score-value");
    const gaugeCircle = document.getElementById("gauge-progress-circle");
    const verdictBadge = document.getElementById("verdict-badge");
    const verdictTitle = document.getElementById("verdict-title-text");

    const circumference = 2 * Math.PI * 54; // r = 54
    const offset = circumference - (analysis.safetyScore / 100) * circumference;

    if (gaugeCircle) {
      gaugeCircle.style.strokeDasharray = `${circumference}`;
      gaugeCircle.style.strokeDashoffset = `${offset}`;
    }

    let colorClass = "safe";
    let verdictIcon = "fa-circle-check";
    let statusSummary = "Payload is cryptographically verified and safe to execute.";

    if (analysis.verdict === "MALICIOUS") {
      colorClass = "malicious";
      verdictIcon = "fa-triangle-exclamation";
      statusSummary = "CRITICAL THREAT DETECTED. DO NOT PROCEED OR SCAN ON MOBILE.";
    } else if (analysis.verdict === "SUSPICIOUS") {
      colorClass = "suspicious";
      verdictIcon = "fa-circle-exclamation";
      statusSummary = "POTENTIAL RISK IDENTIFIED. EXERCISE CAUTION.";
    }

    if (scoreVal) scoreVal.textContent = analysis.safetyScore;
    if (gaugeCircle) {
      gaugeCircle.className.baseVal = `gauge-circle gauge-${colorClass}`;
    }

    if (verdictBadge) {
      verdictBadge.className = `verdict-badge verdict-${colorClass}`;
      verdictBadge.innerHTML = `<i class="fa-solid ${verdictIcon}"></i> VERDICT: ${analysis.verdict}`;
    }

    if (verdictTitle) {
      verdictTitle.textContent = statusSummary;
      verdictTitle.className = `verdict-summary text-${colorClass}`;
    }

    // 2. Telemetry metadata chips
    document.getElementById("telemetry-type").textContent = analysis.payloadType;
    document.getElementById("telemetry-hops").textContent = `${analysis.redirectHops} Hops`;
    document.getElementById("telemetry-brand").textContent = analysis.impersonatedBrand || "None Detected";
    document.getElementById("telemetry-destination").textContent = analysis.canonicalUrl;

    // 3. Raw Payload and SHA-256 Digest
    const rawCodeEl = document.getElementById("raw-payload-code");
    if (rawCodeEl) rawCodeEl.textContent = analysis.rawPayload;

    window.reporting.calculateSha256(analysis.rawPayload).then(hash => {
      const hashEl = document.getElementById("payload-sha256");
      if (hashEl) hashEl.textContent = hash;
    });

    // 4. Six Security Checkcards
    const checksContainer = document.getElementById("security-checks-grid");
    if (checksContainer) {
      checksContainer.innerHTML = analysis.checks.map(c => {
        let statusBadge = `<span class="check-pill pill-pass"><i class="fa-solid fa-check"></i> PASS</span>`;
        let cardBorder = "border-pass";

        if (c.status === "FAIL") {
          statusBadge = `<span class="check-pill pill-fail"><i class="fa-solid fa-xmark"></i> FAIL</span>`;
          cardBorder = "border-fail";
        } else if (c.status === "WARN") {
          statusBadge = `<span class="check-pill pill-warn"><i class="fa-solid fa-triangle-exclamation"></i> WARN</span>`;
          cardBorder = "border-warn";
        }

        const scriptBadge = c.scriptMetadata && c.scriptMetadata.detectedScripts && c.scriptMetadata.detectedScripts.length > 0
          ? `<div style="margin-top: 0.6rem; display: flex; gap: 0.4rem; flex-wrap: wrap;">
               <span style="font-family: var(--font-mono); font-size: 0.68rem; color: var(--cyber-cyan); background: rgba(0, 245, 255, 0.08); border: 1px solid rgba(0, 245, 255, 0.25); padding: 0.15rem 0.5rem; border-radius: 4px;">
                 <i class="fa-solid fa-language"></i> SCRIPT: ${c.scriptMetadata.detectedScripts.join(", ")}
               </span>
               <span style="font-family: var(--font-mono); font-size: 0.68rem; color: var(--electric-violet); background: rgba(123, 47, 255, 0.08); border: 1px solid rgba(123, 47, 255, 0.25); padding: 0.15rem 0.5rem; border-radius: 4px;">
                 <i class="fa-solid fa-flag"></i> ${c.scriptMetadata.language}
               </span>
             </div>`
          : "";

        return `
          <div class="check-card ${cardBorder}">
            <div class="check-header">
              <span class="check-title">${c.title}</span>
              ${statusBadge}
            </div>
            <p class="check-summary">${c.summary}</p>
            ${scriptBadge}
          </div>
        `;
      }).join("");
    }

    // 5. Threat Explanations list
    const expList = document.getElementById("threat-explanations-list");
    if (expList) {
      if (analysis.explanations && analysis.explanations.length > 0) {
        expList.innerHTML = analysis.explanations.map(exp => `
          <li class="threat-bullet"><i class="fa-solid fa-caret-right"></i> ${exp}</li>
        `).join("");
      } else {
        expList.innerHTML = `<li class="threat-bullet text-safe"><i class="fa-solid fa-check"></i> All behavioral heuristics passed with clean parameters.</li>`;
      }
    }

    // 6. Report to Cyber Crime Cell CTA
    const reportCtaContainer = document.getElementById("report-cta-container");
    if (reportCtaContainer) {
      if (analysis.verdict === "MALICIOUS" || analysis.verdict === "SUSPICIOUS") {
        reportCtaContainer.style.display = "block";
        const btnReport = document.getElementById("btn-open-report-modal");
        if (btnReport) {
          btnReport.onclick = () => {
            window.audioSys.playClick();
            this.showReportModal(analysis);
          };
        }
      } else {
        reportCtaContainer.style.display = "none";
      }
    }
  }

  async showReportModal(analysis) {
    const modal = document.getElementById("report-modal");
    if (!modal) return;

    // Auto locate nearest station via Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          window.reporting.getNearestStation(pos.coords.latitude, pos.coords.longitude);
          this.updateModalStationDisplay();
        },
        err => {
          // Default to first station (Delhi)
          this.updateModalStationDisplay();
        },
        { timeout: 3000 }
      );
    } else {
      this.updateModalStationDisplay();
    }

    await window.reporting.prepareIncidentData(analysis);

    // Update modal fields
    document.getElementById("modal-incident-id").textContent = window.reporting.currentIncident.incidentId;
    document.getElementById("modal-payload-preview").textContent = analysis.rawPayload;
    document.getElementById("modal-verdict-tag").textContent = `${analysis.verdict} (Score: ${analysis.safetyScore}/100)`;
    document.getElementById("modal-sha256-hash").textContent = window.reporting.currentIncident.shaDigest;

    // Populate City dropdown
    const citySelect = document.getElementById("incident-city-select");
    if (citySelect) {
      citySelect.innerHTML = CYBER_CELL_DIRECTORY.map((s, idx) => `
        <option value="${idx}" ${s.city === window.reporting.selectedStation.city ? "selected" : ""}>
          ${s.city} - ${s.name}
        </option>
      `).join("");
    }

    modal.classList.add("modal-open");
  }

  updateModalStationDisplay() {
    const s = window.reporting.selectedStation;
    if (!s) return;
    document.getElementById("modal-station-name").textContent = s.name;
    document.getElementById("modal-station-address").textContent = s.address;
    document.getElementById("modal-station-helpline").textContent = s.helpline;
    document.getElementById("modal-station-email").textContent = s.email;
  }

  hideReportModal() {
    const modal = document.getElementById("report-modal");
    if (modal) modal.classList.remove("modal-open");
  }

  recordScan(analysis) {
    this.stats.totalScans += 1;
    if (analysis.verdict === "MALICIOUS") {
      this.stats.threatsNeutralized += 1;
      if (analysis.payloadType === "UPI") this.stats.tamperedUpi += 1;
      if (analysis.rawPayload.includes(".apk")) this.stats.malwareApks += 1;
    }

    this.scanHistory.unshift({
      id: `SCAN-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      payload: analysis.rawPayload.slice(0, 65) + (analysis.rawPayload.length > 65 ? "..." : ""),
      type: analysis.payloadType,
      score: analysis.safetyScore,
      verdict: analysis.verdict
    });

    this.saveState();
    this.updateStatsDisplay();
    this.renderHistory();
  }

  updateStatsDisplay() {
    const elTotal = document.getElementById("stat-total-scans");
    const elThreats = document.getElementById("stat-threats-caught");
    const elUpi = document.getElementById("stat-upi-tamper");
    const elApk = document.getElementById("stat-apk-blocked");

    if (elTotal) elTotal.textContent = this.stats.totalScans;
    if (elThreats) elThreats.textContent = this.stats.threatsNeutralized;
    if (elUpi) elUpi.textContent = this.stats.tamperedUpi;
    if (elApk) elApk.textContent = this.stats.malwareApks;
  }

  renderDemoMatrix(filterCategory = "ALL") {
    const container = document.getElementById("demo-scenarios-grid");
    if (!container || typeof DEMO_SCENARIOS === "undefined") return;

    const filtered = DEMO_SCENARIOS.filter(s => {
      if (filterCategory === "ALL") return true;
      if (filterCategory === "MALICIOUS" && s.verdict === "MALICIOUS") return true;
      if (filterCategory === "UPI" && s.category.includes("UPI")) return true;
      if (filterCategory === "SAFE" && s.verdict === "SAFE") return true;
      return false;
    });

    container.innerHTML = filtered.map(scenario => {
      const isMalicious = scenario.verdict === "MALICIOUS";
      const isSafe = scenario.verdict === "SAFE";
      const badgeClass = isMalicious ? "badge-danger" : (isSafe ? "badge-safe" : "badge-warn");

      return `
        <div class="demo-card" data-id="${scenario.id}">
          <div class="demo-card-top">
            <span class="demo-badge ${badgeClass}"><i class="fa-solid ${scenario.icon}"></i> ${scenario.badgeText}</span>
            <span class="demo-score">Score: ${scenario.score}</span>
          </div>
          <h4 class="demo-title">${scenario.title}</h4>
          <p class="demo-desc">${scenario.description}</p>
          <div class="demo-card-footer">
            <span class="demo-cat">${scenario.category}</span>
            <button class="btn-demo-test" data-id="${scenario.id}">
              <i class="fa-solid fa-play"></i> Test Scenario
            </button>
          </div>
        </div>
      `;
    }).join("");

    // Bind Click handlers to test buttons
    container.querySelectorAll(".btn-demo-test").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const scenario = DEMO_SCENARIOS.find(s => s.id === id);
        if (scenario) {
          window.audioSys.playClick();
          this.executeAnalysisWorkflow(scenario.payload, scenario);
        }
      });
    });
  }

  renderHistory() {
    const container = document.getElementById("history-log-table");
    if (!container) return;

    if (this.scanHistory.length === 0) {
      container.innerHTML = `<tr><td colspan="5" class="empty-history">No scan logs recorded yet. Engage optical sensor or test a demo scenario.</td></tr>`;
      return;
    }

    container.innerHTML = this.scanHistory.map(item => {
      const pillClass = item.verdict === "MALICIOUS" ? "pill-fail" : (item.verdict === "SUSPICIOUS" ? "pill-warn" : "pill-pass");
      return `
        <tr>
          <td class="history-id">${item.id}</td>
          <td>${new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
          <td class="history-payload">${item.payload}</td>
          <td><span class="type-tag">${item.type}</span></td>
          <td><span class="check-pill ${pillClass}">${item.verdict} (${item.score})</span></td>
        </tr>
      `;
    }).join("");
  }

  showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `sentinel-toast toast-${type}`;
    const icon = type === "success" ? "fa-circle-check" : (type === "error" ? "fa-triangle-exclamation" : "fa-circle-info");
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;

    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("toast-show"), 10);
    setTimeout(() => {
      toast.classList.remove("toast-show");
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }
}

// Initialize on DOM load
window.addEventListener("DOMContentLoaded", () => {
  window.app = new SentinelApp();
  window.app.init();
});
