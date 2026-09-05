/**
 * Sentinel.Audit - Community Threat Radar Map
 * Visualizes geographic hotspots of QR tampering, malicious APK droppers, and Quishing attacks.
 */

class ThreatRadar {
  constructor() {
    this.map = null;
    this.markersLayer = null;
    this.currentFilter = "ALL";
    this.hotspots = [];
  }

  init(containerId = "threat-map-container") {
    const el = document.getElementById(containerId);
    if (!el || typeof L === "undefined") return;

    // Center on India
    this.map = L.map(containerId, {
      center: [20.5937, 78.9629],
      zoom: 5,
      zoomControl: true,
      attributionControl: false
    });

    // Default to OpenStreetMap with dark tactical filter (100% free, NO API key required)
    // If user provides a custom Mapbox / Stadia API key in localStorage, it will use that instead.
    const customMapboxKey = localStorage.getItem("sentinel_mapbox_token");
    
    let tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    let tileOptions = {
      maxZoom: 19,
      subdomains: ["a", "b", "c"],
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    };

    if (customMapboxKey) {
      tileUrl = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token=${customMapboxKey}`;
      tileOptions.tileSize = 512;
      tileOptions.zoomOffset = -1;
    }

    this.tileLayer = L.tileLayer(tileUrl, tileOptions).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);

    // Initial load
    this.loadHotspots();
  }

  async loadHotspots() {
    try {
      const res = await fetch("/api/threat-feed");
      if (res.ok) {
        this.hotspots = await res.json();
      } else {
        throw new Error("Local fallback");
      }
    } catch (e) {
      // Offline / client fallback hotspots
      this.hotspots = [
        {
          id: "SENTINEL-IN-2026-DEL-0419",
          timestamp: "2026-09-04T10:14:22Z",
          type: "UPI_TAMPER_STICKER",
          verdict: "MALICIOUS",
          score: 12,
          city: "New Delhi",
          location: "Rajiv Chowk Metro Station - Parking Booth 3",
          coords: [28.6328, 77.2197],
          target: "State Bank of India (Spoofed)",
          details: "Tampered physical QR sticker pasted over DMRC Smart Parking QR."
        },
        {
          id: "SENTINEL-IN-2026-BOM-0883",
          timestamp: "2026-09-04T18:45:10Z",
          type: "PHISHING_URL",
          verdict: "MALICIOUS",
          score: 8,
          city: "Mumbai",
          location: "Bandra Kurla Complex (BKC) - Cafe Hub",
          coords: [19.0657, 72.8687],
          target: "HDFC NetBanking Clone",
          details: "Tabletop acrylic stand QR redirecting via bit.ly/hdfc-billpay to phishing portal."
        },
        {
          id: "SENTINEL-IN-2026-BLR-0291",
          timestamp: "2026-09-05T07:12:00Z",
          type: "MALWARE_APK",
          verdict: "MALICIOUS",
          score: 5,
          city: "Bengaluru",
          location: "Indiranagar 100ft Road - EV Charging Station",
          coords: [12.9784, 77.6408],
          target: "Fake Bescom Support App",
          details: "QR code prompt claiming urgent KYC update for EV charging, initiating direct download of bescom_quick_kyc.apk."
        },
        {
          id: "SENTINEL-IN-2026-HYD-0174",
          timestamp: "2026-09-05T09:30:15Z",
          type: "ROGUE_WIFI",
          verdict: "SUSPICIOUS",
          score: 45,
          city: "Hyderabad",
          location: "HITEC City Cyber Towers Food Court",
          coords: [17.4474, 78.3762],
          target: "Unencrypted Rogue Hotspot",
          details: "WIFI payload broadcasting fake high-speed guest network with unencrypted credentials."
        },
        {
          id: "SENTINEL-IN-2026-PUN-0512",
          timestamp: "2026-09-05T11:20:00Z",
          type: "UPI_TAMPER_STICKER",
          verdict: "MALICIOUS",
          score: 15,
          city: "Pune",
          location: "FC Road Student Cafe District",
          coords: [18.5284, 73.8436],
          target: "Paytm Soundbox Tampering",
          details: "Secondary QR sticker overlaid atop legitimate table merchant QR."
        }
      ];
    }

    this.renderMarkers();
  }

  setFilter(filterType) {
    this.currentFilter = filterType;
    this.renderMarkers();
  }

  focusCity(city) {
    const cityCoords = {
      delhi: [28.6328, 77.2197],
      mumbai: [19.0760, 72.8777],
      bengaluru: [12.9784, 77.6408],
      hyderabad: [17.4474, 78.3762],
      pune: [18.5284, 73.8436],
      india: [20.5937, 78.9629]
    };

    if (this.map && cityCoords[city]) {
      const zoom = city === "india" ? 5 : 13;
      this.map.flyTo(cityCoords[city], zoom, { duration: 1.2 });
    }
  }

  renderMarkers() {
    if (!this.markersLayer) return;
    this.markersLayer.clearLayers();

    const filtered = this.hotspots.filter(h => {
      if (this.currentFilter === "ALL") return true;
      if (this.currentFilter === "UPI" && h.type.includes("UPI")) return true;
      if (this.currentFilter === "APK" && h.type.includes("APK")) return true;
      if (this.currentFilter === "PHISHING" && h.type.includes("PHISHING")) return true;
      return false;
    });

    filtered.forEach(h => {
      const isMalicious = h.verdict === "MALICIOUS";
      const color = isMalicious ? "#FF3B3B" : "#FFB800";
      const pulseClass = isMalicious ? "pulse-danger" : "pulse-warn";

      const customIcon = L.divIcon({
        className: "custom-radar-pin",
        html: `
          <div class="radar-marker-wrap">
            <span class="radar-pulse ${pulseClass}"></span>
            <span class="radar-dot" style="background-color: ${color}; box-shadow: 0 0 12px ${color};"></span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const popupHtml = `
        <div class="radar-popup-content">
          <div class="popup-badge" style="background-color: ${isMalicious ? 'rgba(255, 59, 59, 0.2)' : 'rgba(255, 184, 0, 0.2)'}; color: ${color};">
            ${h.verdict} // ${h.type.replace(/_/g, " ")}
          </div>
          <h4 class="popup-title">${h.location}</h4>
          <p class="popup-target"><strong>Target Spoof:</strong> ${h.target || "N/A"}</p>
          <p class="popup-desc">${h.details}</p>
          <div class="popup-footer">
            <span><strong>ID:</strong> ${h.id}</span>
            <span>${new Date(h.timestamp).toLocaleDateString()}</span>
          </div>
        </div>
      `;

      const marker = L.marker(h.coords, { icon: customIcon }).bindPopup(popupHtml, {
        className: "sentinel-dark-popup"
      });

      this.markersLayer.addLayer(marker);
    });
  }

  addReport(report) {
    if (!report.coords) {
      // Default to Delhi if no coords
      report.coords = [28.6139, 77.2090];
    }
    this.hotspots.unshift(report);
    this.renderMarkers();
  }
}

window.threatRadar = new ThreatRadar();
