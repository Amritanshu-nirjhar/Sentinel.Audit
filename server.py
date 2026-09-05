#!/usr/bin/env python3
"""
Sentinel.Audit (QRShield) - Forensic API & Static Web Server
Provides local HTTP serving, live URL unshortening & redirect analysis,
incident reporting persistence, and threat telemetry.
"""

import http.server
import socketserver
import urllib.request
import urllib.parse
import json
import os
import sys
import datetime
import socket
import ssl

PORT = 8000
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
REPORTS_FILE = os.path.join(DATA_DIR, "reports.json")
STATS_FILE = os.path.join(DATA_DIR, "stats.json")

# Ensure data dir exists
os.makedirs(DATA_DIR, exist_ok=True)

if not os.path.exists(REPORTS_FILE):
    default_reports = [
        {
            "id": "SENTINEL-IN-2026-DEL-0419",
            "timestamp": "2026-09-04T10:14:22Z",
            "type": "UPI_TAMPER_STICKER",
            "verdict": "MALICIOUS",
            "score": 12,
            "city": "New Delhi",
            "location": "Rajiv Chowk Metro Station - Parking Booth 3",
            "coords": [28.6328, 77.2197],
            "target": "State Bank of India (Spoofed)",
            "details": "Tampered physical QR sticker pasted over DMRC Smart Parking QR. Payee address altered to fake VPA."
        },
        {
            "id": "SENTINEL-IN-2026-BOM-0883",
            "timestamp": "2026-09-04T18:45:10Z",
            "type": "PHISHING_URL",
            "verdict": "MALICIOUS",
            "score": 8,
            "city": "Mumbai",
            "location": "Bandra Kurla Complex (BKC) - Cafe Hub",
            "coords": [19.0657, 72.8687],
            "target": "HDFC NetBanking Clone",
            "details": "Tabletop acrylic stand QR redirecting via bit.ly/hdfc-billpay to freshly registered phishing domain."
        },
        {
            "id": "SENTINEL-IN-2026-BLR-0291",
            "timestamp": "2026-09-05T07:12:00Z",
            "type": "MALWARE_APK",
            "verdict": "MALICIOUS",
            "score": 5,
            "city": "Bengaluru",
            "location": "Indiranagar 100ft Road - EV Charging Station",
            "coords": [12.9784, 77.6408],
            "target": "Fake Bescom Support App",
            "details": "QR code prompt claiming urgent KYC update for EV charging, initiating direct download of bescom_quick_kyc.apk."
        },
        {
            "id": "SENTINEL-IN-2026-HYD-0174",
            "timestamp": "2026-09-05T09:30:15Z",
            "type": "ROGUE_WIFI",
            "verdict": "SUSPICIOUS",
            "score": 45,
            "city": "Hyderabad",
            "location": "HITEC City Cyber Towers Food Court",
            "coords": [17.4474, 78.3762],
            "target": "Unencrypted Rogue Hotspot",
            "details": "WIFI payload broadcasting fake high-speed guest network with unencrypted credentials."
        }
    ]
    with open(REPORTS_FILE, "w", encoding="utf-8") as f:
        json.dump(default_reports, f, indent=2)

if not os.path.exists(STATS_FILE):
    default_stats = {
        "totalScans": 3482,
        "threatsCaught": 489,
        "upiTampering": 218,
        "phishingUrls": 194,
        "malwareApks": 77,
        "avgAnalysisLatencyMs": 142
    }
    with open(STATS_FILE, "w", encoding="utf-8") as f:
        json.dump(default_stats, f, indent=2)


class SentinelHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/stats":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            with open(STATS_FILE, "r", encoding="utf-8") as f:
                self.wfile.write(f.read().encode("utf-8"))
            return

        if parsed.path == "/api/threat-feed":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            with open(REPORTS_FILE, "r", encoding="utf-8") as f:
                self.wfile.write(f.read().encode("utf-8"))
            return

        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"

        try:
            body = json.loads(post_data)
        except Exception:
            body = {}

        if parsed.path == "/api/analyze-url":
            target_url = body.get("url", "").strip()
            result = self.analyze_url(target_url)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(result).encode("utf-8"))
            return

        if parsed.path == "/api/submit-report":
            report = body.get("report", {})
            report_id = f"SENTINEL-IN-2026-{datetime.datetime.utcnow().strftime('%m%d%H%M%S')}"
            report["id"] = report.get("id") or report_id
            report["timestamp"] = datetime.datetime.utcnow().isoformat() + "Z"

            try:
                with open(REPORTS_FILE, "r", encoding="utf-8") as f:
                    reports = json.load(f)
                reports.insert(0, report)
                with open(REPORTS_FILE, "w", encoding="utf-8") as f:
                    json.dump(reports, f, indent=2)

                # Update stats
                with open(STATS_FILE, "r", encoding="utf-8") as f:
                    stats = json.load(f)
                stats["threatsCaught"] += 1
                stats["totalScans"] += 1
                with open(STATS_FILE, "w", encoding="utf-8") as f:
                    json.dump(stats, f, indent=2)

                res = {"success": True, "reportId": report["id"]}
            except Exception as e:
                res = {"success": False, "error": str(e)}

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(res).encode("utf-8"))
            return

        self.send_response(404)
        self.end_headers()

    def analyze_url(self, target_url):
        """Follow redirect chain and extract basic forensic details."""
        if not target_url.startswith(("http://", "https://")):
            return {"error": "Invalid URL protocol"}

        redirect_chain = [target_url]
        current_url = target_url
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) SentinelAudit/2.0"}

        max_hops = 6
        hops = 0
        final_status = 200
        content_type = ""
        is_direct_download = False

        class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
            def http_error_302(self, req, fp, code, msg, headers):
                infourl = urllib.response.addinfourl(fp, headers, req.get_full_url())
                infourl.status = code
                infourl.code = code
                return infourl
            http_error_301 = http_error_302
            http_error_303 = http_error_302
            http_error_307 = http_error_302
            http_error_308 = http_error_302

        opener = urllib.request.build_opener(NoRedirectHandler())

        while hops < max_hops:
            hops += 1
            try:
                req = urllib.request.Request(current_url, headers=headers, method="HEAD")
                try:
                    with opener.open(req, timeout=3.5) as resp:
                        status = getattr(resp, "status", getattr(resp, "code", 200))
                        resp_headers = resp.headers
                        loc = resp_headers.get("Location")
                        content_type = resp_headers.get("Content-Type", "")
                        content_disp = resp_headers.get("Content-Disposition", "")

                        if ".apk" in current_url.lower() or ".apk" in content_disp.lower() or "vnd.android.package-archive" in content_type:
                            is_direct_download = True

                        if loc:
                            new_url = urllib.parse.urljoin(current_url, loc)
                            redirect_chain.append(new_url)
                            current_url = new_url
                        else:
                            final_status = status
                            break
                except urllib.error.HTTPError as e:
                    final_status = e.code
                    if e.headers and e.headers.get("Location"):
                        new_url = urllib.parse.urljoin(current_url, e.headers.get("Location"))
                        redirect_chain.append(new_url)
                        current_url = new_url
                    else:
                        break
            except Exception as e:
                break

        parsed_final = urllib.parse.urlparse(current_url)
        domain = parsed_final.netloc.split(":")[0]

        # Check IP resolution
        ip_addr = "Unknown"
        try:
            ip_addr = socket.gethostbyname(domain)
        except Exception:
            pass

        return {
            "initialUrl": target_url,
            "finalUrl": current_url,
            "redirectChain": redirect_chain,
            "hopCount": len(redirect_chain) - 1,
            "finalDomain": domain,
            "resolvedIp": ip_addr,
            "contentType": content_type,
            "isDirectDownload": is_direct_download,
            "status": final_status
        }


def run_server():
    server_address = ("", PORT)
    httpd = socketserver.TCPServer(server_address, SentinelHandler)
    print(f"🛡️  Sentinel.Audit Engine operational on port {PORT}...")
    print(f"📡  Access UI at: http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑  Server stopped.")
        httpd.server_close()


if __name__ == "__main__":
    run_server()
