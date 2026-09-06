/**
 * Sentinel.Audit - 3D Spatial Holographic Landing Experience
 * Powered by Three.js & CSS 3D Transforms
 * Provides real-time interactive 3D Quishing Monolith, Gyro Defense Rings,
 * Laser Scanning Planes, and Spatial Parallax.
 */

(function() {
  'use strict';

  class Hero3DExperience {
    constructor() {
      this.container = document.getElementById('landing-visual-wrap');
      this.canvas = document.getElementById('canvas-3d-hero');
      this.section = document.getElementById('landing-hero-3d');
      if (!this.canvas || !this.container) return;

      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.clock = null;
      
      // 3D Objects
      this.coreGroup = null;
      this.monolith = null;
      this.wireBox = null;
      this.laserPlane = null;
      this.innerRing = null;
      this.midRing = null;
      this.outerRing = null;
      this.satellites = [];
      this.particleSystem = null;
      this.pulseRing = null;

      // Interaction State
      this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
      this.isDragging = false;
      this.prevMousePos = { x: 0, y: 0 };
      this.dragRotation = { x: 0.15, y: -0.35 };
      this.dragVelocity = { x: 0, y: 0 };
      this.isVisible = true;
      this.animFrameId = null;

      this.init();
    }

    init() {
      if (typeof THREE === 'undefined') {
        console.warn('[Hero3D] Three.js not loaded. Retrying in 100ms...');
        setTimeout(() => this.init(), 100);
        return;
      }

      this.setupThree();
      this.createProceduralTexture();
      this.buildScene();
      this.bindEvents();
      this.setupParallax();
      this.animate();
    }

    setupThree() {
      const width = this.container.clientWidth || 500;
      const height = this.container.clientHeight || 500;

      this.scene = new THREE.Scene();
      this.clock = new THREE.Clock();

      // Camera
      this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
      this.camera.position.set(0, 0, 9.5);

      // Renderer
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Lighting
      const ambientLight = new THREE.AmbientLight(0x060f26, 2.5);
      this.scene.add(ambientLight);

      const cyanPoint = new THREE.PointLight(0x00F5FF, 4, 18);
      cyanPoint.position.set(3, 4, 5);
      this.scene.add(cyanPoint);

      const violetPoint = new THREE.PointLight(0x7B2FFF, 3.5, 18);
      violetPoint.position.set(-3, -3, 4);
      this.scene.add(violetPoint);

      const frontLight = new THREE.DirectionalLight(0xffffff, 1.2);
      frontLight.position.set(0, 2, 8);
      this.scene.add(frontLight);
    }

    createProceduralTexture() {
      // Create high-res 512x512 Canvas for the QR Monolith face
      const cvs = document.createElement('canvas');
      cvs.width = 512;
      cvs.height = 512;
      const ctx = cvs.getContext('2d');

      // Deep cyber background
      ctx.fillStyle = '#060B1E';
      ctx.fillRect(0, 0, 512, 512);

      // Grid matrix
      ctx.strokeStyle = 'rgba(0, 245, 255, 0.12)';
      ctx.lineWidth = 1;
      const step = 32;
      for (let x = 0; x <= 512; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
      }
      for (let y = 0; y <= 512; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
      }

      // Draw QR Finder Patterns (Corners)
      const drawFinder = (fx, fy) => {
        // Outer box
        ctx.fillStyle = '#00F5FF';
        ctx.fillRect(fx, fy, 96, 96);
        // Inner cutout
        ctx.fillStyle = '#060B1E';
        ctx.fillRect(fx + 14, fy + 14, 68, 68);
        // Center block
        ctx.fillStyle = '#00FF88';
        ctx.fillRect(fx + 28, fy + 28, 40, 40);
        // Accent border
        ctx.strokeStyle = '#7B2FFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(fx - 4, fy - 4, 104, 104);
      };

      drawFinder(40, 40);
      drawFinder(376, 40);
      drawFinder(40, 376);

      // Random high-tech QR payload blocks
      ctx.fillStyle = '#00F5FF';
      for (let i = 0; i < 90; i++) {
        const rx = 160 + Math.floor(Math.random() * 10) * 18;
        const ry = 60 + Math.floor(Math.random() * 22) * 18;
        ctx.fillRect(rx, ry, 14, 14);
      }
      ctx.fillStyle = '#7B2FFF';
      for (let i = 0; i < 60; i++) {
        const rx = 60 + Math.floor(Math.random() * 22) * 18;
        const ry = 160 + Math.floor(Math.random() * 10) * 18;
        ctx.fillRect(rx, ry, 14, 14);
      }

      // Center Cyber Shield Emblem
      ctx.save();
      ctx.translate(256, 256);
      ctx.fillStyle = 'rgba(10, 14, 39, 0.92)';
      ctx.beginPath();
      ctx.arc(0, 0, 72, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#00F5FF';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#00F5FF';
      ctx.shadowBlur = 18;
      ctx.stroke();

      // Inner Shield glyph
      ctx.fillStyle = '#00F5FF';
      ctx.beginPath();
      ctx.moveTo(0, -38);
      ctx.lineTo(32, -18);
      ctx.lineTo(24, 22);
      ctx.lineTo(0, 42);
      ctx.lineTo(-24, 22);
      ctx.lineTo(-32, -18);
      ctx.closePath();
      ctx.fill();

      // Lock center
      ctx.fillStyle = '#060B1E';
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Top & Bottom Holographic Telemetry Text
      ctx.font = 'bold 16px "JetBrains Mono", monospace';
      ctx.fillStyle = '#00F5FF';
      ctx.fillText('// SENTINEL.AUDIT PROTOCOL', 140, 395);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.fillText('PAYLOAD INTEGRITY: 100% VERIFIED', 145, 425);

      this.qrTexture = new THREE.CanvasTexture(cvs);
      this.qrTexture.needsUpdate = true;
    }

    buildScene() {
      this.coreGroup = new THREE.Group();
      this.coreGroup.rotation.x = this.dragRotation.x;
      this.coreGroup.rotation.y = this.dragRotation.y;
      this.scene.add(this.coreGroup);

      // 1. Central 3D QR Monolith
      const monolithGeo = new THREE.BoxGeometry(3.2, 3.2, 0.35);
      const monolithMat = new THREE.MeshStandardMaterial({
        map: this.qrTexture,
        roughness: 0.2,
        metalness: 0.7,
        emissive: 0x002233,
        emissiveIntensity: 0.5
      });
      this.monolith = new THREE.Mesh(monolithGeo, monolithMat);
      this.coreGroup.add(this.monolith);

      // Wireframe bounding shell
      const wireGeo = new THREE.BoxGeometry(3.35, 3.35, 0.45);
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0x00F5FF,
        wireframe: true,
        transparent: true,
        opacity: 0.35
      });
      this.wireBox = new THREE.Mesh(wireGeo, wireMat);
      this.coreGroup.add(this.wireBox);

      // 2. Concentric Gyroscopic Rings
      // Inner Cyan Ring
      const innerRingGeo = new THREE.TorusGeometry(2.45, 0.035, 16, 80);
      const innerRingMat = new THREE.MeshBasicMaterial({
        color: 0x00F5FF,
        transparent: true,
        opacity: 0.8
      });
      this.innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
      this.innerRing.rotation.x = Math.PI / 3;
      this.coreGroup.add(this.innerRing);

      // Middle Electric Violet Ring
      const midRingGeo = new THREE.TorusGeometry(3.05, 0.04, 16, 90);
      const midRingMat = new THREE.MeshBasicMaterial({
        color: 0x7B2FFF,
        transparent: true,
        opacity: 0.85
      });
      this.midRing = new THREE.Mesh(midRingGeo, midRingMat);
      this.midRing.rotation.y = Math.PI / 4;
      this.coreGroup.add(this.midRing);

      // Outer Neon Green Defense Ring with dashes
      const outerRingGeo = new THREE.TorusGeometry(3.7, 0.028, 16, 100);
      const outerRingMat = new THREE.MeshBasicMaterial({
        color: 0x00FF88,
        transparent: true,
        opacity: 0.6
      });
      this.outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
      this.outerRing.rotation.z = Math.PI / 6;
      this.coreGroup.add(this.outerRing);

      // 3. Scanning Laser Plane
      const laserGeo = new THREE.PlaneGeometry(3.4, 0.08);
      const laserMat = new THREE.MeshBasicMaterial({
        color: 0x00F5FF,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
      });
      this.laserPlane = new THREE.Mesh(laserGeo, laserMat);
      this.laserPlane.position.z = 0.22;
      this.coreGroup.add(this.laserPlane);

      // Laser Glow Curtain
      const glowGeo = new THREE.PlaneGeometry(3.4, 0.8);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0x00F5FF,
        transparent: true,
        opacity: 0.18,
        side: THREE.DoubleSide
      });
      const laserGlow = new THREE.Mesh(glowGeo, glowMat);
      laserGlow.position.y = -0.4;
      this.laserPlane.add(laserGlow);

      // 4. Orbiting Verified Cyber Satellites (Polyhedra)
      const satDefs = [
        { geo: new THREE.OctahedronGeometry(0.18), color: 0x00F5FF, dist: 2.8, speed: 1.2, tilt: 0.4 },
        { geo: new THREE.IcosahedronGeometry(0.15), color: 0x7B2FFF, dist: 3.3, speed: -0.9, tilt: -0.6 },
        { geo: new THREE.TetrahedronGeometry(0.18), color: 0x00FF88, dist: 3.9, speed: 1.5, tilt: 1.1 },
        { geo: new THREE.OctahedronGeometry(0.14), color: 0xFFB800, dist: 2.6, speed: -1.7, tilt: -1.2 }
      ];

      satDefs.forEach(def => {
        const mesh = new THREE.Mesh(def.geo, new THREE.MeshBasicMaterial({
          color: def.color,
          wireframe: true
        }));
        mesh.userData = def;
        this.coreGroup.add(mesh);
        this.satellites.push(mesh);
      });

      // 5. Interactive Pulse Wave Ring (Fires on Click)
      const pulseGeo = new THREE.RingGeometry(0.1, 0.2, 48);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: 0x00F5FF,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide
      });
      this.pulseRing = new THREE.Mesh(pulseGeo, pulseMat);
      this.pulseRing.position.z = 0.25;
      this.coreGroup.add(this.pulseRing);

      // 6. Deep Ambient Particle Field
      const particleCount = 1200;
      const positions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 35;
        positions[i + 1] = (Math.random() - 0.5) * 35;
        positions[i + 2] = (Math.random() - 0.5) * 30 - 5;
      }
      const particleGeo = new THREE.BufferGeometry();
      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particleMat = new THREE.PointsMaterial({
        color: 0x00F5FF,
        size: 0.065,
        transparent: true,
        opacity: 0.55
      });
      this.particleSystem = new THREE.Points(particleGeo, particleMat);
      this.scene.add(this.particleSystem);
    }

    bindEvents() {
      // Mouse move parallax
      window.addEventListener('mousemove', (e) => {
        const nx = (e.clientX / window.innerWidth) * 2 - 1;
        const ny = -(e.clientY / window.innerHeight) * 2 + 1;
        this.mouse.targetX = nx;
        this.mouse.targetY = ny;
      }, { passive: true });

      // Click & Drag Rotation
      const el = this.container;
      el.addEventListener('mousedown', (e) => {
        this.isDragging = true;
        this.prevMousePos = { x: e.clientX, y: e.clientY };
        this.triggerPulse();
      });

      window.addEventListener('mousemove', (e) => {
        if (!this.isDragging) return;
        const dx = e.clientX - this.prevMousePos.x;
        const dy = e.clientY - this.prevMousePos.y;
        this.dragVelocity.y = dx * 0.007;
        this.dragVelocity.x = dy * 0.007;
        this.dragRotation.y += this.dragVelocity.y;
        this.dragRotation.x += this.dragVelocity.x;
        this.prevMousePos = { x: e.clientX, y: e.clientY };
      }, { passive: true });

      window.addEventListener('mouseup', () => {
        this.isDragging = false;
      });

      // Touch events for mobile
      el.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          this.isDragging = true;
          this.prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          this.triggerPulse();
        }
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        if (!this.isDragging || e.touches.length !== 1) return;
        const dx = e.touches[0].clientX - this.prevMousePos.x;
        const dy = e.touches[0].clientY - this.prevMousePos.y;
        this.dragVelocity.y = dx * 0.008;
        this.dragVelocity.x = dy * 0.008;
        this.dragRotation.y += this.dragVelocity.y;
        this.dragRotation.x += this.dragVelocity.x;
        this.prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }, { passive: true });

      window.addEventListener('touchend', () => {
        this.isDragging = false;
      });

      // Window resize
      window.addEventListener('resize', () => this.onResize(), { passive: true });

      // Action Button Smooth Navigators
      const btnScan = document.getElementById('btn-hero-launch-scanner');
      if (btnScan) {
        btnScan.addEventListener('click', (e) => {
          e.preventDefault();
          document.getElementById('tab-btn-optical')?.click();
          const target = document.getElementById('scanner-section');
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }

      const btnDemo = document.getElementById('btn-hero-demo-matrix');
      if (btnDemo) {
        btnDemo.addEventListener('click', (e) => {
          e.preventDefault();
          document.getElementById('tab-btn-demo')?.click();
          const target = document.getElementById('scanner-section');
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }

      const btnRadar = document.getElementById('btn-hero-radar-map');
      if (btnRadar) {
        btnRadar.addEventListener('click', (e) => {
          e.preventDefault();
          const target = document.getElementById('threat-map-section');
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }

      // Intersection Observer to stop render loop when scrolled off
      if ('IntersectionObserver' in window && this.section) {
        const observer = new IntersectionObserver((entries) => {
          this.isVisible = entries[0].isIntersecting;
          if (this.isVisible && !this.animFrameId) {
            this.animate();
          }
        }, { threshold: 0.05 });
        observer.observe(this.section);
      }
    }

    triggerPulse() {
      if (!this.pulseRing) return;
      this.pulseRing.scale.set(0.1, 0.1, 0.1);
      this.pulseRing.material.opacity = 0.9;
      this.pulseStartTime = performance.now();

      // Sound trigger
      if (window.audioEngine && typeof window.audioEngine.playBeep === 'function') {
        window.audioEngine.playBeep(920, 0.06);
      }
    }

    setupParallax() {
      // 3D Tilt for cards in landing section
      const cards = document.querySelectorAll('.stat-3d-card, .floating-chip');
      if (!cards.length) return;

      window.addEventListener('mousemove', (e) => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const dx = (e.clientX - cx) / cx;
        const dy = (e.clientY - cy) / cy;

        cards.forEach(card => {
          const depth = parseFloat(card.getAttribute('data-depth') || 1);
          const rx = -dy * 14 * depth;
          const ry = dx * 14 * depth;
          const tz = 15 * depth;
          card.style.transform = `perspective(800px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(${tz.toFixed(1)}px)`;
        });
      }, { passive: true });
    }

    onResize() {
      if (!this.container || !this.renderer || !this.camera) return;
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      if (width === 0 || height === 0) return;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }

    animate() {
      if (!this.isVisible) {
        this.animFrameId = null;
        return;
      }

      this.animFrameId = requestAnimationFrame(() => this.animate());

      const dt = this.clock ? this.clock.getDelta() : 0.016;
      const elapsed = this.clock ? this.clock.getElapsedTime() : performance.now() * 0.001;

      // Mouse smoothing
      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

      // Inertia on drag rotation
      if (!this.isDragging) {
        this.dragVelocity.x *= 0.94;
        this.dragVelocity.y *= 0.94;
        this.dragRotation.x += this.dragVelocity.x;
        this.dragRotation.y += this.dragVelocity.y;
        // Idle gentle rotation
        this.dragRotation.y += dt * 0.25;
      }

      // Constrain tilt pitch
      this.dragRotation.x = Math.max(-1.1, Math.min(1.1, this.dragRotation.x));

      // Apply to Core Group with mouse parallax addition
      if (this.coreGroup) {
        this.coreGroup.rotation.x = this.dragRotation.x + (this.mouse.y * 0.2);
        this.coreGroup.rotation.y = this.dragRotation.y + (this.mouse.x * 0.35);
        this.coreGroup.position.y = Math.sin(elapsed * 1.5) * 0.15; // Floating levitation
      }

      // Gyroscopic Ring Rotations
      if (this.innerRing) {
        this.innerRing.rotation.z += dt * 0.8;
        this.innerRing.rotation.x += dt * 0.4;
      }
      if (this.midRing) {
        this.midRing.rotation.x -= dt * 0.6;
        this.midRing.rotation.y += dt * 0.7;
      }
      if (this.outerRing) {
        this.outerRing.rotation.z -= dt * 0.35;
        this.outerRing.rotation.y -= dt * 0.25;
      }

      // Wireframe bounding shell pulse
      if (this.wireBox) {
        const s = 1 + Math.sin(elapsed * 3) * 0.015;
        this.wireBox.scale.set(s, s, s);
      }

      // Scanning Laser Beam Animation
      if (this.laserPlane) {
        this.laserPlane.position.y = Math.sin(elapsed * 2.8) * 1.45;
      }

      // Orbiting Satellites
      this.satellites.forEach(sat => {
        const u = sat.userData;
        const angle = elapsed * u.speed;
        sat.position.x = Math.cos(angle) * u.dist;
        sat.position.z = Math.sin(angle) * u.dist;
        sat.position.y = Math.sin(angle * 1.5 + u.tilt) * (u.dist * 0.4);
        sat.rotation.x += dt * 2;
        sat.rotation.y += dt * 2;
      });

      // Pulse ring expansion
      if (this.pulseRing && this.pulseRing.material.opacity > 0.01) {
        this.pulseRing.scale.x += dt * 7;
        this.pulseRing.scale.y += dt * 7;
        this.pulseRing.material.opacity = Math.max(0, this.pulseRing.material.opacity - dt * 1.5);
      }

      // Drift particle field
      if (this.particleSystem) {
        this.particleSystem.rotation.y = elapsed * 0.03;
      }

      this.renderer.render(this.scene, this.camera);
    }
  }

  // Self-initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.hero3D = new Hero3DExperience();
    });
  } else {
    window.hero3D = new Hero3DExperience();
  }
})();
