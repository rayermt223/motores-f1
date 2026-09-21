/* ═══════════════════════════════════════════════════════════════════
   ENGINE VIEWER — 3D Structural Formula 1 Engine Viewer (Three.js)
   V6 Turbo Hybrid · V8 · V10 · V12 · Solid 3D Engine Architecture
   Crankcase · Cylinder Heads · Curved Exhausts · Velocity Stacks
   Turbocharger · Animated Moving Pistons & Crankshaft · 360° Orbit
   Real F1 Audio Playback (Local .ogg) + Web Audio API Fallback
   ═══════════════════════════════════════════════════════════════════ */

class EngineViewer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.currentEngine = 'v10'; // Default to iconic V10
        this.isPlayingAnim = true;
        this.isCutaway = false;
        this.isAutoRotate = false;
        this.animSpeed = 1.0;
        this.time = 0;
        this.pistonMeshes = [];
        this.rodMeshes = [];
        this.crankMesh = null;
        this.pulleyMeshes = [];
        this.blockMeshes = [];

        this.engines = {
            v6: {
                id: 'v6',
                name: 'Motor V6 Turbo Híbrido F1',
                subtitle: 'Unidad de Potencia 1.6L · Era 2014–Presente',
                cylinders: 6,
                cylPerBank: 3,
                angle: 90,
                displacement: '1.6L',
                rpm: '~15,000',
                power: '1,000+ CV',
                weight: '~145 kg (PU)',
                era: '2014 – Presente',
                hasTurbo: true,
                colorAccent: '#FFD700',
                colorBlock: 0x22252a,
                colorHeads: 0x1a1c20,
                colorPipes: 0x9a7b4f,
                soundFile: 'audio/v6.ogg',
                description: 'Seis cilindros en V a 90° con turbocompresor e intercooler.',
                descLong: 'Arquitectura de Fórmula 1 moderna que combina un bloque V6 de 1.6L a 90° con un turbocompresor e intercooler y sistemas de recuperación de energía cinético-térmica (MGU-K y MGU-H). Supera los 1,000 CV de potencia con alta eficiencia térmica.'
            },
            v8: {
                id: 'v8',
                name: 'Motor V8 F1 Aspiración Natural',
                subtitle: '2.4L · Era 2006–2013 · 19,000 RPM',
                cylinders: 8,
                cylPerBank: 4,
                angle: 90,
                displacement: '2.4L',
                rpm: '19,000',
                power: '~750 CV',
                weight: '95 kg',
                era: '2006 – 2013',
                hasTurbo: false,
                colorAccent: '#FFD700',
                colorBlock: 0x2a2d33,
                colorHeads: 0x1e2126,
                colorPipes: 0xb5893d,
                soundFile: 'audio/v8.ogg',
                description: 'Ocho cilindros en V a 90° con cigüeñal plano.',
                descLong: 'Motor V8 de 2.4 litros a 90° con cigüeñal plano reglamentado en la Fórmula 1 entre 2006 y 2013. Su régimen de giro alcanzaba las 19,000 RPM produciendo 750 CV de potencia con respuesta inmediata del acelerador.'
            },
            v10: {
                id: 'v10',
                name: 'Motor V10 F1 Aspiración Natural',
                subtitle: '3.0L · Era 1995–2005 · 18,000 RPM',
                cylinders: 10,
                cylPerBank: 5,
                angle: 72,
                displacement: '3.0L',
                rpm: '18,000',
                power: '~900 CV',
                weight: '~98 kg',
                era: '1995 – 2005',
                hasTurbo: false,
                colorAccent: '#FFD700',
                colorBlock: 0x262930,
                colorHeads: 0x191c22,
                colorPipes: 0xc4943f,
                soundFile: 'audio/v10.ogg',
                description: 'Diez cilindros en ángulo específico de 72°.',
                descLong: 'Motor V10 de 3.0 litros de aspiración natural con bancadas a 72° utilizado en la Fórmula 1 entre 1995 y 2005. Desarrollaba 900 CV a 18,000 RPM con peso reducido de 98 kg y trompetas de admisión independientes.'
            },
            v12: {
                id: 'v12',
                name: 'Motor V12 F1 Aspiración Natural',
                subtitle: '3.5L · Era 1987–1995 · 15,000 RPM',
                cylinders: 12,
                cylPerBank: 6,
                angle: 60,
                displacement: '3.5L',
                rpm: '15,000',
                power: '~700 CV',
                weight: '~140 kg',
                era: '1987 – 1995',
                hasTurbo: false,
                colorAccent: '#FFD700',
                colorBlock: 0x24262b,
                colorHeads: 0xb32821, // Iconic Ferrari Rosso Corsa valve covers
                colorPipes: 0xd4af37,
                soundFile: 'audio/v12.ogg',
                description: 'Doce cilindros en ángulo perfecto de 60°.',
                descLong: 'Motor V12 de 3.5 litros a 60° de aspiración natural utilizado en la Fórmula 1 hasta 1995. Destaca por su perfecto equilibrio de masas de segundo orden, 12 trompetas de admisión independientes y 700 CV a 15,000 RPM.'
            }
        };

        this.init();
    }

    init() {
        this.buildHTML();
        this.setupThree();
        this.buildEngine3D();
        this.setupEvents();
        this.animate();
    }

    buildHTML() {
        const e = this.engines[this.currentEngine];
        this.container.innerHTML = `
        <div class="ev-wrap">
          <!-- Left Configuration & Specs Panel -->
          <div class="ev-left">
            <div class="ev-sel-label">CONFIGURACIÓN DEL MOTOR</div>
            <div class="ev-sel-row" id="ev-sel-row">
              ${['v6','v8','v10','v12'].map(t=>`
                <button class="ev-sel-btn${this.currentEngine===t?' ev-sel-active':''}" data-eng="${t}">
                  ${t.toUpperCase()}
                </button>
              `).join('')}
            </div>

            <!-- DEDICATED SOUND BUTTON (Pure Text - No Emojis) -->
            <div class="ev-sound-banner">
              <button class="ev-sound-main-btn" id="ev-sound-main-btn" title="Reproducir o detener sonido">
                <span class="ev-smb-title" id="ev-smb-title">REPRODUCIR SONIDO</span>
              </button>
            </div>

            <div class="ev-title" id="ev-title">${e.name}</div>
            <p class="ev-desc" id="ev-desc">${e.descLong}</p>

            <div class="ev-hr"></div>

            <div class="ev-stats" id="ev-stats">
              <div class="ev-stat">
                <div class="ev-stat-label">Cilindros</div>
                <div class="ev-stat-val" id="ev-s-cyl">${e.cylinders} cilindros</div>
              </div>
              <div class="ev-stat">
                <div class="ev-stat-label">Ángulo Bancada</div>
                <div class="ev-stat-val" id="ev-s-angle">${e.angle}° en V</div>
              </div>
              <div class="ev-stat">
                <div class="ev-stat-label">Cilindrada</div>
                <div class="ev-stat-val" id="ev-s-disp">${e.displacement}</div>
              </div>
              <div class="ev-stat">
                <div class="ev-stat-label">Régimen Máx.</div>
                <div class="ev-stat-val" id="ev-s-rpm">${e.rpm} RPM</div>
              </div>
              <div class="ev-stat">
                <div class="ev-stat-label">Potencia</div>
                <div class="ev-stat-val" id="ev-s-power">${e.power}</div>
              </div>
              <div class="ev-stat">
                <div class="ev-stat-label">Era Histórica</div>
                <div class="ev-stat-val" id="ev-s-era">${e.era}</div>
              </div>
            </div>

            <div class="ev-hr"></div>

            <!-- Interactive 3D Controls -->
            <div class="ev-ctrl-row">
              <span class="ev-ctrl-label">Corte didáctico (Rayos X)</span>
              <label class="ev-toggle" title="Ver pistones, bielas y cigüeñal en movimiento">
                <input type="checkbox" id="ev-cutaway-chk">
                <span class="ev-toggle-track"></span>
              </label>
            </div>

            <div class="ev-ctrl-row">
              <span class="ev-ctrl-label">Giro automático 360°</span>
              <label class="ev-toggle" title="Rotación continua de exhibición">
                <input type="checkbox" id="ev-autorotate-chk">
                <span class="ev-toggle-track"></span>
              </label>
            </div>

            <div class="ev-ctrl-row">
              <span class="ev-ctrl-label">Velocidad del motor</span>
              <span class="ev-speed-display" id="ev-spd-disp">${this.animSpeed}x</span>
            </div>
            <input type="range" class="ev-range" id="ev-spd-range" min="0.25" max="2.5" step="0.25" value="${this.animSpeed}">
          </div>

          <!-- Right 3D Viewport Panel -->
          <div class="ev-right">
            <div class="ev-viewer-head">
              <div class="ev-head-left">
                <span class="ev-badge"><span class="ev-badge-dot"></span>MODELO 3D ESTRUCTURAL</span>
                <span class="ev-eng-name" id="ev-eng-name">${e.name.toUpperCase()}</span>
              </div>
              <div class="ev-cam-presets">
                <button class="ev-cam-btn active" data-cam="persp" title="Perspectiva 3D">Perspectiva</button>
                <button class="ev-cam-btn" data-cam="top" title="Vista superior de admisión">Admisión</button>
                <button class="ev-cam-btn" data-cam="front" title="Vista frontal de poleas">Frontal</button>
                <button class="ev-cam-btn" data-cam="side" title="Vista lateral de colectores">Escapes</button>
              </div>
            </div>

            <!-- 3D WebGL Canvas Container -->
            <div class="ev-canvas-wrap" id="ev-canvas-wrap" title="Arrastra para rotar 360°">
              <div id="ev-three-container"></div>

              <!-- Floating Controls Overlay -->
              <div class="ev-canvas-overlay">
                <div class="ev-co-tag" id="ev-co-tag">Órbita 360° Libre</div>
                <div class="ev-co-zoom">
                  <button class="ev-zb" id="ev-zoom-in" title="Acercar">+</button>
                  <button class="ev-zb" id="ev-zoom-out" title="Alejar">−</button>
                  <button class="ev-zb" id="ev-reset-btn" title="Restablecer posición">↻</button>
                </div>
              </div>
            </div>

            <div class="ev-foot-row">
              <button class="ev-pause-btn" id="ev-pause-btn">⏸ Pausar movimiento</button>
              <div class="ev-viewer-info">
                <span>Estructura completa F1: Bloque · Culatas · Colectores · Admisión · Cigüeñal</span>
              </div>
            </div>
          </div>
        </div>
        `;
    }

    setupThree() {
        const wrap = document.getElementById('ev-three-container');
        if (!wrap) return;

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0c0d10);
        this.scene.fog = new THREE.FogExp2(0x0c0d10, 0.022);

        // Camera
        const aspect = wrap.clientWidth / wrap.clientHeight || 1.4;
        this.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);
        this.defaultCamPos = new THREE.Vector3(12, 8, 14);
        this.defaultTarget = new THREE.Vector3(0, 0.5, 0);
        this.camera.position.copy(this.defaultCamPos);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
        this.renderer.setSize(wrap.clientWidth, wrap.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.15;
        wrap.appendChild(this.renderer.domElement);

        // OrbitControls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.07;
        this.controls.target.copy(this.defaultTarget);
        this.controls.minDistance = 4;
        this.controls.maxDistance = 28;
        this.controls.maxPolarAngle = Math.PI * 0.88; // Don't flip completely upside down
        this.controls.update();

        // Lighting (Professional Automotive Studio Setup)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambientLight);

        // Key Light (Warm F1 Sun/Spot)
        const keyLight = new THREE.DirectionalLight(0xfff7e6, 1.4);
        keyLight.position.set(12, 18, 12);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 1024;
        keyLight.shadow.mapSize.height = 1024;
        this.scene.add(keyLight);

        // Cool Rim Light (Sharp edge highlights)
        const rimLight = new THREE.DirectionalLight(0x7599c9, 1.0);
        rimLight.position.set(-14, 10, -10);
        this.scene.add(rimLight);

        // Teal Accent Top Light (For metallic highlights and reflections)
        const tealPoint = new THREE.PointLight(0x008D8E, 1.8, 20);
        tealPoint.position.set(0, 7, 0);
        this.scene.add(tealPoint);

        // Fill Under Light (Soft glow on oil sump/cárter)
        const underLight = new THREE.DirectionalLight(0x1d383b, 0.5);
        underLight.position.set(0, -6, 0);
        this.scene.add(underLight);

        // Ground Pedestal / Turntable Platform
        const platGeo = new THREE.CylinderGeometry(7.5, 7.8, 0.3, 64);
        const platMat = new THREE.MeshStandardMaterial({
            color: 0x0a1618,
            roughness: 0.5,
            metalness: 0.8
        });
        const platform = new THREE.Mesh(platGeo, platMat);
        platform.position.y = -2.2;
        platform.receiveShadow = true;
        this.scene.add(platform);

        // Outer Teal Ring on Platform
        const ringGeo = new THREE.TorusGeometry(7.4, 0.05, 16, 100);
        const ringMat = new THREE.MeshStandardMaterial({
            color: 0x008D8E,
            roughness: 0.2,
            metalness: 0.95,
            emissive: 0x008D8E,
            emissiveIntensity: 0.35
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.position.y = -2.04;
        this.scene.add(ringMesh);

        // Subtle Radial Floor Grid
        const gridHelper = new THREE.PolarGridHelper(7.2, 16, 6, 40, 0x333333, 0x1e1e1e);
        gridHelper.position.y = -2.04;
        this.scene.add(gridHelper);

        // Resize Listener
        this.resizeObserver = new ResizeObserver(() => this.onResize());
        this.resizeObserver.observe(wrap);
    }

    onResize() {
        const wrap = document.getElementById('ev-three-container');
        if (!wrap || !this.renderer || !this.camera) return;
        const w = wrap.clientWidth;
        const h = wrap.clientHeight;
        if (w === 0 || h === 0) return;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }

    buildEngine3D() {
        // Remove previous engine group
        if (this.engineGroup) {
            this.scene.remove(this.engineGroup);
            this.pistonMeshes = [];
            this.rodMeshes = [];
            this.pulleyMeshes = [];
            this.blockMeshes = [];
            this.crankMesh = null;
        }

        const eng = this.engines[this.currentEngine];
        this.engineGroup = new THREE.Group();
        this.scene.add(this.engineGroup);

        const bankAngleRad = (eng.angle / 2) * (Math.PI / 180);
        const cylCount = eng.cylPerBank;
        const spacingZ = 0.95; // Spacing between cylinders along crankshaft
        const totalLen = (cylCount - 1) * spacingZ;
        const halfLen = totalLen / 2;

        // ── Standard Materials ──
        const matBlock = new THREE.MeshStandardMaterial({
            color: eng.colorBlock,
            roughness: 0.45,
            metalness: 0.75,
            transparent: this.isCutaway,
            opacity: this.isCutaway ? 0.32 : 1.0,
            wireframe: false
        });
        this.blockMaterial = matBlock;

        const matHeads = new THREE.MeshStandardMaterial({
            color: eng.colorHeads,
            roughness: 0.35,
            metalness: 0.85
        });

        const matGoldTrumpets = new THREE.MeshStandardMaterial({
            color: 0xffcc00,
            roughness: 0.2,
            metalness: 0.95,
            emissive: 0xaa8800,
            emissiveIntensity: 0.15
        });

        const matExhaust = new THREE.MeshStandardMaterial({
            color: eng.colorPipes,
            roughness: 0.28,
            metalness: 0.92
        });

        const matChrome = new THREE.MeshStandardMaterial({
            color: 0xd8dde6,
            roughness: 0.15,
            metalness: 0.98
        });

        const matPiston = new THREE.MeshStandardMaterial({
            color: 0xdddddd,
            roughness: 0.25,
            metalness: 0.9
        });

        const matCarbon = new THREE.MeshStandardMaterial({
            color: 0x181818,
            roughness: 0.6,
            metalness: 0.4
        });

        // ════ 1. CRANKCASE & DRY SUMP (Cárter y Bloque Inferior) ════
        const crankcaseLen = totalLen + 2.0;
        const crankcaseGeo = new THREE.BoxGeometry(2.4, 1.4, crankcaseLen);
        const crankcase = new THREE.Mesh(crankcaseGeo, matBlock);
        crankcase.position.set(0, -0.4, 0);
        crankcase.castShadow = true;
        crankcase.receiveShadow = true;
        this.engineGroup.add(crankcase);
        this.blockMeshes.push(crankcase);

        // Lower Dry Sump Pan with cooling ribs
        const sumpGeo = new THREE.BoxGeometry(2.0, 0.45, crankcaseLen - 0.2);
        const sump = new THREE.Mesh(sumpGeo, matCarbon);
        sump.position.set(0, -1.25, 0);
        sump.castShadow = true;
        this.engineGroup.add(sump);

        for (let r = -crankcaseLen / 2 + 0.3; r <= crankcaseLen / 2 - 0.3; r += 0.35) {
            const ribGeo = new THREE.BoxGeometry(2.1, 0.08, 0.08);
            const rib = new THREE.Mesh(ribGeo, matChrome);
            rib.position.set(0, -1.45, r);
            this.engineGroup.add(rib);
        }

        // ════ 2. CYLINDER BANKS (Bancadas en V) ════
        // Two angled bank blocks forming the V
        const bankWidth = 1.3;
        const bankHeight = 1.8;
        const bankLength = totalLen + 1.2;

        // Left Bank
        const leftBankGeo = new THREE.BoxGeometry(bankWidth, bankHeight, bankLength);
        const leftBank = new THREE.Mesh(leftBankGeo, matBlock);
        leftBank.position.set(-0.85 * Math.sin(bankAngleRad), 0.7 * Math.cos(bankAngleRad), 0);
        leftBank.rotation.z = -bankAngleRad;
        leftBank.castShadow = true;
        leftBank.receiveShadow = true;
        this.engineGroup.add(leftBank);
        this.blockMeshes.push(leftBank);

        // Right Bank
        const rightBankGeo = new THREE.BoxGeometry(bankWidth, bankHeight, bankLength);
        const rightBank = new THREE.Mesh(rightBankGeo, matBlock);
        rightBank.position.set(0.85 * Math.sin(bankAngleRad), 0.7 * Math.cos(bankAngleRad), 0);
        rightBank.rotation.z = bankAngleRad;
        rightBank.castShadow = true;
        rightBank.receiveShadow = true;
        this.engineGroup.add(rightBank);
        this.blockMeshes.push(rightBank);

        // ════ 3. CYLINDER HEADS & VALVE COVERS (Culatas y Tapas) ════
        const headCoverGeo = new THREE.BoxGeometry(bankWidth * 0.95, 0.45, bankLength * 0.98);

        // Left Valve Cover
        const leftCover = new THREE.Mesh(headCoverGeo, matHeads);
        leftCover.position.set(-1.6 * Math.sin(bankAngleRad), 1.55 * Math.cos(bankAngleRad), 0);
        leftCover.rotation.z = -bankAngleRad;
        leftCover.castShadow = true;
        this.engineGroup.add(leftCover);

        // Right Valve Cover
        const rightCover = new THREE.Mesh(headCoverGeo, matHeads);
        rightCover.position.set(1.6 * Math.sin(bankAngleRad), 1.55 * Math.cos(bankAngleRad), 0);
        rightCover.rotation.z = bankAngleRad;
        rightCover.castShadow = true;
        this.engineGroup.add(rightCover);

        // Carbon fiber / red accent badge strip on valve covers
        const badgeGeo = new THREE.BoxGeometry(0.3, 0.08, bankLength * 0.85);
        const leftBadge = new THREE.Mesh(badgeGeo, matChrome);
        leftBadge.position.set(-1.75 * Math.sin(bankAngleRad), 1.75 * Math.cos(bankAngleRad), 0);
        leftBadge.rotation.z = -bankAngleRad;
        this.engineGroup.add(leftBadge);

        const rightBadge = new THREE.Mesh(badgeGeo, matChrome);
        rightBadge.position.set(1.75 * Math.sin(bankAngleRad), 1.75 * Math.cos(bankAngleRad), 0);
        rightBadge.rotation.z = bankAngleRad;
        this.engineGroup.add(rightBadge);

        // ════ 4. INTAKE VELOCITY STACKS / PLENUM (Admisión F1) ════
        if (eng.hasTurbo) {
            // V6 Turbo: Carbon Fiber Intake Plenums + Twin Air Boxes
            const plenumGeo = new THREE.CylinderGeometry(0.4, 0.45, bankLength * 0.9, 24);
            const leftPlenum = new THREE.Mesh(plenumGeo, matCarbon);
            leftPlenum.rotation.x = Math.PI / 2;
            leftPlenum.position.set(-0.9, 1.8, 0);
            this.engineGroup.add(leftPlenum);

            const rightPlenum = new THREE.Mesh(plenumGeo, matCarbon);
            rightPlenum.rotation.x = Math.PI / 2;
            rightPlenum.position.set(0.9, 1.8, 0);
            this.engineGroup.add(rightPlenum);

            // Crossover bridge pipe
            const bridgeGeo = new THREE.CylinderGeometry(0.28, 0.28, 1.8, 16);
            const bridge = new THREE.Mesh(bridgeGeo, matChrome);
            bridge.rotation.z = Math.PI / 2;
            bridge.position.set(0, 2.1, 0);
            this.engineGroup.add(bridge);
        } else {
            // Naturally Aspirated: Gleaming Flared Velocity Stacks (Trompetas de admisión)
            for (let i = 0; i < cylCount; i++) {
                const zPos = -halfLen + i * spacingZ;

                // Left Bank Velocity Stack
                const stackGroupL = new THREE.Group();
                const coneGeoL = new THREE.CylinderGeometry(0.26, 0.16, 0.7, 24, 1, true);
                const coneL = new THREE.Mesh(coneGeoL, matGoldTrumpets);
                coneL.castShadow = true;
                stackGroupL.add(coneL);

                const lipGeoL = new THREE.TorusGeometry(0.26, 0.03, 12, 32);
                const lipL = new THREE.Mesh(lipGeoL, matGoldTrumpets);
                lipL.rotation.x = Math.PI / 2;
                lipL.position.y = 0.35;
                stackGroupL.add(lipL);

                // Angle stack slightly toward center V
                stackGroupL.position.set(-0.75 * Math.sin(bankAngleRad * 0.7), 1.95, zPos);
                stackGroupL.rotation.z = -bankAngleRad * 0.4;
                this.engineGroup.add(stackGroupL);

                // Right Bank Velocity Stack
                const stackGroupR = new THREE.Group();
                const coneGeoR = new THREE.CylinderGeometry(0.26, 0.16, 0.7, 24, 1, true);
                const coneR = new THREE.Mesh(coneGeoR, matGoldTrumpets);
                coneR.castShadow = true;
                stackGroupR.add(coneR);

                const lipGeoR = new THREE.TorusGeometry(0.26, 0.03, 12, 32);
                const lipR = new THREE.Mesh(lipGeoR, matGoldTrumpets);
                lipR.rotation.x = Math.PI / 2;
                lipR.position.y = 0.35;
                stackGroupR.add(lipR);

                stackGroupR.position.set(0.75 * Math.sin(bankAngleRad * 0.7), 1.95, zPos);
                stackGroupR.rotation.z = bankAngleRad * 0.4;
                this.engineGroup.add(stackGroupR);
            }
        }

        // ════ 5. EXHAUST HEADERS ("Bundle of Snakes" Colectores de Escape) ════
        // Build sweeping 3D tube curves for each cylinder leading back to a collector
        for (let i = 0; i < cylCount; i++) {
            const zStart = -halfLen + i * spacingZ;
            const zMerge = halfLen + 0.8;

            // Left Exhaust Pipe Curve
            const p0L = new THREE.Vector3(-1.4 * Math.sin(bankAngleRad) - 0.4, 0.7, zStart);
            const p1L = new THREE.Vector3(-2.2, 0.3 - i * 0.08, zStart + 0.3);
            const p2L = new THREE.Vector3(-1.8, -0.2, zMerge - 0.4);
            const p3L = new THREE.Vector3(-1.2, -0.4, zMerge);
            const curveL = new THREE.CatmullRomCurve3([p0L, p1L, p2L, p3L]);
            const tubeGeoL = new THREE.TubeGeometry(curveL, 20, 0.12, 10, false);
            const tubeL = new THREE.Mesh(tubeGeoL, matExhaust);
            tubeL.castShadow = true;
            this.engineGroup.add(tubeL);

            // Right Exhaust Pipe Curve
            const p0R = new THREE.Vector3(1.4 * Math.sin(bankAngleRad) + 0.4, 0.7, zStart);
            const p1R = new THREE.Vector3(2.2, 0.3 - i * 0.08, zStart + 0.3);
            const p2R = new THREE.Vector3(1.8, -0.2, zMerge - 0.4);
            const p3R = new THREE.Vector3(1.2, -0.4, zMerge);
            const curveR = new THREE.CatmullRomCurve3([p0R, p1R, p2R, p3R]);
            const tubeGeoR = new THREE.TubeGeometry(curveR, 20, 0.12, 10, false);
            const tubeR = new THREE.Mesh(tubeGeoR, matExhaust);
            tubeR.castShadow = true;
            this.engineGroup.add(tubeR);
        }

        // Exhaust Megaphones / Collectors at the rear
        const collectorLen = 1.3;
        const collGeoL = new THREE.CylinderGeometry(0.28, 0.18, collectorLen, 16);
        const collL = new THREE.Mesh(collGeoL, matChrome);
        collL.rotation.x = Math.PI / 2;
        collL.position.set(-1.15, -0.4, halfLen + 1.4);
        collL.castShadow = true;
        this.engineGroup.add(collL);

        const collGeoR = new THREE.CylinderGeometry(0.28, 0.18, collectorLen, 16);
        const collR = new THREE.Mesh(collGeoR, matChrome);
        collR.rotation.x = Math.PI / 2;
        collR.position.set(1.15, -0.4, halfLen + 1.4);
        collR.castShadow = true;
        this.engineGroup.add(collR);

        // ════ 6. V6 TURBOCHARGER & HYBRID SYSTEM (Si aplica) ════
        if (eng.hasTurbo) {
            const turboGroup = new THREE.Group();

            // Turbine Snail Housing (Cast Bronze)
            const turbineMat = new THREE.MeshStandardMaterial({ color: 0x5a4230, roughness: 0.5, metalness: 0.8 });
            const turbineTorus = new THREE.TorusGeometry(0.55, 0.24, 16, 32, Math.PI * 1.5);
            const turbineMesh = new THREE.Mesh(turbineTorus, turbineMat);
            turbineMesh.rotation.y = Math.PI / 2;
            turboGroup.add(turbineMesh);

            // Compressor Snail Housing (Polished Billet Aluminum)
            const compMat = new THREE.MeshStandardMaterial({ color: 0xdde2ea, roughness: 0.2, metalness: 0.95 });
            const compTorus = new THREE.TorusGeometry(0.65, 0.28, 16, 32, Math.PI * 1.5);
            const compMesh = new THREE.Mesh(compTorus, compMat);
            compMesh.rotation.y = Math.PI / 2;
            compMesh.position.x = 0.5;
            turboGroup.add(compMesh);

            // Center Bearing Housing
            const centerGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.45, 16);
            const centerMesh = new THREE.Mesh(centerGeo, matChrome);
            centerMesh.rotation.z = Math.PI / 2;
            centerMesh.position.x = 0.25;
            turboGroup.add(centerMesh);

            // Large Central F1 Exhaust Tailpipe
            const tailGeo = new THREE.CylinderGeometry(0.42, 0.38, 2.0, 24);
            const tailMesh = new THREE.Mesh(tailGeo, matChrome);
            tailMesh.rotation.x = Math.PI / 2;
            tailMesh.position.set(0, 0.6, 1.2);
            turboGroup.add(tailMesh);

            // MGU-H (Motor Generator Unit - Heat) in center V
            const mguhGeo = new THREE.CylinderGeometry(0.32, 0.32, 1.4, 20);
            const mguhMat = new THREE.MeshStandardMaterial({ color: 0x1f242b, roughness: 0.4, metalness: 0.85 });
            const mguh = new THREE.Mesh(mguhGeo, mguhMat);
            mguh.rotation.x = Math.PI / 2;
            mguh.position.set(0, 0.8, -0.4);
            this.engineGroup.add(mguh);

            // Orange High Voltage Race Cables
            const cableMat = new THREE.MeshStandardMaterial({ color: 0xff6600, roughness: 0.3, metalness: 0.2 });
            for (let c = -0.15; c <= 0.15; c += 0.3) {
                const cGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.2, 12);
                const cable = new THREE.Mesh(cGeo, cableMat);
                cable.position.set(c, 0.5, 0.2);
                cable.rotation.x = 0.2;
                this.engineGroup.add(cable);
            }

            turboGroup.position.set(0, 0.8, halfLen + 1.1);
            this.engineGroup.add(turboGroup);
        }

        // ════ 7. FRONT TIMING SYSTEM (Poleas y Distribución) ════
        const frontZ = -halfLen - 1.05;
        const pulleyGroup = new THREE.Group();

        // Crankshaft Main Damper Pulley
        const crankPulleyGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.18, 32);
        const crankPulley = new THREE.Mesh(crankPulleyGeo, matChrome);
        crankPulley.rotation.x = Math.PI / 2;
        crankPulley.position.set(0, -0.3, 0);
        pulleyGroup.add(crankPulley);
        this.pulleyMeshes.push(crankPulley);

        // Camshaft Pulleys on Left & Right Bank
        const camLeftGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.15, 32);
        const camLeft = new THREE.Mesh(camLeftGeo, matGoldTrumpets);
        camLeft.rotation.x = Math.PI / 2;
        camLeft.position.set(-1.0, 1.4, 0);
        pulleyGroup.add(camLeft);
        this.pulleyMeshes.push(camLeft);

        const camRightGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.15, 32);
        const camRight = new THREE.Mesh(camRightGeo, matGoldTrumpets);
        camRight.rotation.x = Math.PI / 2;
        camRight.position.set(1.0, 1.4, 0);
        pulleyGroup.add(camRight);
        this.pulleyMeshes.push(camRight);

        // Alternator / Water Pump Idler Pulleys
        const idlerGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.14, 24);
        const idler = new THREE.Mesh(idlerGeo, matChrome);
        idler.rotation.x = Math.PI / 2;
        idler.position.set(-0.7, 0.3, 0);
        pulleyGroup.add(idler);

        // Toothed Timing Belt wrapping around
        const beltMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8, metalness: 0.1 });
        const beltGeo = new THREE.BoxGeometry(2.1, 1.8, 0.06);
        // We simulate the belt perimeter with thin angled boxes
        const beltLeft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.6, 0.14), beltMat);
        beltLeft.position.set(-1.1, 0.55, 0);
        pulleyGroup.add(beltLeft);

        const beltRight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.6, 0.14), beltMat);
        beltRight.position.set(1.1, 0.55, 0);
        pulleyGroup.add(beltRight);

        pulleyGroup.position.set(0, 0, frontZ);
        this.engineGroup.add(pulleyGroup);

        // ════ 8. REAR TRANSMISSION / FLYWHEEL (Volante de Inercia) ════
        const rearZ = halfLen + 1.05;
        const flyGroup = new THREE.Group();

        // Starter Ring Gear & Flywheel
        const flyGeo = new THREE.CylinderGeometry(1.05, 1.05, 0.2, 48);
        const flyMesh = new THREE.Mesh(flyGeo, matChrome);
        flyMesh.rotation.x = Math.PI / 2;
        flyMesh.castShadow = true;
        flyGroup.add(flyMesh);

        // Clutch Bellhousing Mount Flange
        const flangeGeo = new THREE.TorusGeometry(1.08, 0.08, 12, 48);
        const flange = new THREE.Mesh(flangeGeo, matCarbon);
        flange.position.set(0, 0, 0.12);
        flyGroup.add(flange);

        flyGroup.position.set(0, -0.3, rearZ);
        this.engineGroup.add(flyGroup);

        // ════ 9. INTERNAL MOVING COMPONENTS (Pistones, Bielas, Cigüeñal) ════
        // Central Rotating Crankshaft Axis
        const crankGeo = new THREE.CylinderGeometry(0.18, 0.18, totalLen + 1.8, 24);
        this.crankMesh = new THREE.Mesh(crankGeo, matChrome);
        this.crankMesh.rotation.x = Math.PI / 2;
        this.crankMesh.position.set(0, -0.3, 0);
        this.engineGroup.add(this.crankMesh);

        // Pistons and Connecting Rods
        for (let i = 0; i < cylCount; i++) {
            const zPos = -halfLen + i * spacingZ;
            const phase = (i / cylCount) * Math.PI * 2;

            // Left Bank Piston Assembly
            const pGroupL = new THREE.Group();
            const pMeshL = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.42, 20), matPiston);
            pMeshL.castShadow = true;
            pGroupL.add(pMeshL);

            // Piston compression rings
            const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.382, 0.02, 8, 24), matCarbon);
            ring1.rotation.x = Math.PI / 2;
            ring1.position.y = 0.1;
            pGroupL.add(ring1);

            // Connecting rod (biela)
            const rodGeoL = new THREE.CylinderGeometry(0.08, 0.08, 1.1, 12);
            const rodL = new THREE.Mesh(rodGeoL, matChrome);
            rodL.position.y = -0.65;
            pGroupL.add(rodL);

            pGroupL.rotation.z = -bankAngleRad;
            pGroupL.position.z = zPos;
            this.engineGroup.add(pGroupL);

            this.pistonMeshes.push({
                group: pGroupL,
                bank: 'left',
                angle: -bankAngleRad,
                phase: phase,
                baseY: 0.8,
                stroke: 0.45
            });

            // Right Bank Piston Assembly
            const pGroupR = new THREE.Group();
            const pMeshR = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.42, 20), matPiston);
            pMeshR.castShadow = true;
            pGroupR.add(pMeshR);

            const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.382, 0.02, 8, 24), matCarbon);
            ring2.rotation.x = Math.PI / 2;
            ring2.position.y = 0.1;
            pGroupR.add(ring2);

            const rodGeoR = new THREE.CylinderGeometry(0.08, 0.08, 1.1, 12);
            const rodR = new THREE.Mesh(rodGeoR, matChrome);
            rodR.position.y = -0.65;
            pGroupR.add(rodR);

            pGroupR.rotation.z = bankAngleRad;
            pGroupR.position.z = zPos;
            this.engineGroup.add(pGroupR);

            this.pistonMeshes.push({
                group: pGroupR,
                bank: 'right',
                angle: bankAngleRad,
                phase: phase + Math.PI * 0.5,
                baseY: 0.8,
                stroke: 0.45
            });
        }
    }

    setEngine(type) {
        if (!this.engines[type]) return;
        this.currentEngine = type;
        const e = this.engines[type];

        // Update selector buttons
        document.querySelectorAll('.ev-sel-btn').forEach(b => {
            b.classList.toggle('ev-sel-active', b.dataset.eng === type);
        });

        // Update Text & Specs
        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        setVal('ev-title', e.name);
        setVal('ev-desc', e.descLong);
        setVal('ev-s-cyl', `${e.cylinders} cilindros`);
        setVal('ev-s-angle', `${e.angle}° en V`);
        setVal('ev-s-disp', e.displacement);
        setVal('ev-s-rpm', `${e.rpm} RPM`);
        setVal('ev-s-power', e.power);
        setVal('ev-s-era', e.era);
        setVal('ev-eng-name', e.name.toUpperCase());

        // Rebuild 3D Engine Geometry
        this.buildEngine3D();

        // If sound is currently active, transition smoothly to this engine's audio
        if (SoundManager.isPlaying()) {
            SoundManager.play(e.soundFile, type);
            this.updateSoundButtonUI(true);
        }
    }

    setCutaway(isCut) {
        this.isCutaway = isCut;
        if (this.blockMaterial) {
            this.blockMaterial.transparent = isCut;
            this.blockMaterial.opacity = isCut ? 0.28 : 1.0;
            this.blockMaterial.needsUpdate = true;
        }
    }

    setCameraPreset(preset) {
        if (!this.controls || !this.camera) return;

        document.querySelectorAll('.ev-cam-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.cam === preset);
        });

        const targetPos = new THREE.Vector3();
        const lookTarget = new THREE.Vector3(0, 0.3, 0);

        switch (preset) {
            case 'top':
                targetPos.set(0, 20, 0.05); // Top-down on velocity stacks
                break;
            case 'front':
                targetPos.set(0, 1.5, 18); // Straight on pulleys and timing belt
                break;
            case 'side':
                targetPos.set(18, 1.5, 0); // Side view of exhaust headers
                break;
            case 'persp':
            default:
                targetPos.copy(this.defaultCamPos);
                break;
        }

        // Smooth camera transition
        this.animateCameraTo(targetPos, lookTarget);
    }

    animateCameraTo(newPos, newTarget) {
        const startPos = this.camera.position.clone();
        const startTarget = this.controls.target.clone();
        const duration = 600;
        const startTime = performance.now();

        const animStep = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1.0);
            const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

            this.camera.position.lerpVectors(startPos, newPos, ease);
            this.controls.target.lerpVectors(startTarget, newTarget, ease);
            this.controls.update();

            if (progress < 1.0) {
                requestAnimationFrame(animStep);
            }
        };
        requestAnimationFrame(animStep);
    }

    updateSoundButtonUI(isPlaying) {
        const btn = document.getElementById('ev-sound-main-btn');
        const title = document.getElementById('ev-smb-title');

        if (btn) {
            btn.classList.toggle('is-playing', isPlaying);
        }
        if (title) {
            title.textContent = isPlaying ? 'DETENER SONIDO' : 'REPRODUCIR SONIDO';
        }

        // Sync individual card buttons in motores.html
        document.querySelectorAll('.engine-sound-btn').forEach(b => {
            b.classList.remove('playing');
            b.textContent = 'SONIDO';
        });

        if (isPlaying) {
            const activeCardBtn = document.getElementById(`btn-${this.currentEngine}`);
            if (activeCardBtn) {
                activeCardBtn.classList.add('playing');
                activeCardBtn.textContent = 'DETENER';
            }
        }
    }

    setupEvents() {
        // Engine selector buttons
        document.getElementById('ev-sel-row').addEventListener('click', e => {
            const btn = e.target.closest('.ev-sel-btn');
            if (btn && btn.dataset.eng) {
                this.setEngine(btn.dataset.eng);
            }
        });

        // Dedicated Sound Toggle Button
        const sndBtn = document.getElementById('ev-sound-main-btn');
        if (sndBtn) {
            sndBtn.addEventListener('click', () => {
                const eng = this.engines[this.currentEngine];
                if (SoundManager.isPlaying() && SoundManager.currentType === this.currentEngine) {
                    SoundManager.stop();
                    this.updateSoundButtonUI(false);
                } else {
                    SoundManager.play(eng.soundFile, this.currentEngine);
                    this.updateSoundButtonUI(true);
                }
            });
        }

        // Cutaway toggle
        const cutChk = document.getElementById('ev-cutaway-chk');
        if (cutChk) {
            cutChk.addEventListener('change', e => {
                this.setCutaway(e.target.checked);
            });
        }

        // Auto-rotate toggle
        const rotChk = document.getElementById('ev-autorotate-chk');
        if (rotChk) {
            rotChk.addEventListener('change', e => {
                this.isAutoRotate = e.target.checked;
                this.controls.autoRotate = this.isAutoRotate;
                this.controls.autoRotateSpeed = 1.8;
            });
        }

        // Speed range slider
        const spdRange = document.getElementById('ev-spd-range');
        if (spdRange) {
            spdRange.addEventListener('input', e => {
                this.animSpeed = parseFloat(e.target.value);
                const disp = document.getElementById('ev-spd-disp');
                if (disp) disp.textContent = `${this.animSpeed}x`;
            });
        }

        // Pause/Resume button
        const pauseBtn = document.getElementById('ev-pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.isPlayingAnim = !this.isPlayingAnim;
                pauseBtn.textContent = this.isPlayingAnim ? '⏸ Pausar movimiento' : '▶ Reanudar movimiento';
            });
        }

        // Zoom buttons
        const zIn = document.getElementById('ev-zoom-in');
        const zOut = document.getElementById('ev-zoom-out');
        const resetBtn = document.getElementById('ev-reset-btn');

        if (zIn) {
            zIn.addEventListener('click', () => {
                this.camera.position.multiplyScalar(0.85);
                this.controls.update();
            });
        }
        if (zOut) {
            zOut.addEventListener('click', () => {
                this.camera.position.multiplyScalar(1.15);
                this.controls.update();
            });
        }
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.setCameraPreset('persp');
            });
        }

        // Camera preset buttons
        document.querySelectorAll('.ev-cam-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setCameraPreset(btn.dataset.cam);
            });
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.isPlayingAnim) {
            this.time += 0.045 * this.animSpeed;

            // Animate Pistons and Connecting Rods
            for (let i = 0; i < this.pistonMeshes.length; i++) {
                const p = this.pistonMeshes[i];
                // Reciprocating harmonic stroke along the cylinder axis
                const travel = Math.sin(this.time * 6 + p.phase) * p.stroke;
                const distanceAlongAxis = p.baseY + travel;

                // Move piston along its bank angle
                p.group.position.x = Math.sin(p.angle) * distanceAlongAxis;
                p.group.position.y = Math.cos(p.angle) * distanceAlongAxis;
            }

            // Animate Crankshaft Rotation
            if (this.crankMesh) {
                this.crankMesh.rotation.z = this.time * 6;
            }

            // Animate Pulleys Rotation
            for (let i = 0; i < this.pulleyMeshes.length; i++) {
                this.pulleyMeshes[i].rotation.z = this.time * (i === 0 ? 6 : 3);
            }
        }

        // Update Orbit Controls (damping / auto-rotation)
        if (this.controls) {
            this.controls.update();
        }

        // Render Scene
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
}

/* ═══════════════════════════════════════════════════════════════════
   SOUND MANAGER — Authentic F1 Audio Player with Synthesizer Fallback
   ═══════════════════════════════════════════════════════════════════ */

const SoundManager = {
    audioElement: null,
    currentType: null,
    activeSynth: null,

    isPlaying() {
        return (this.audioElement && !this.audioElement.paused) || (this.activeSynth !== null);
    },

    play(audioSrc, type) {
        this.stop();
        this.currentType = type;

        // Attempt 1: Play Local Real Audio File (.ogg)
        try {
            this.audioElement = new Audio(audioSrc);
            this.audioElement.loop = true;
            this.audioElement.volume = 0.85;

            const playPromise = this.audioElement.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    console.warn('Audio element play restricted or failed, falling back to Web Audio synth:', err);
                    this.playSynthFallback(type);
                });
            }
        } catch (e) {
            console.warn('Audio tag error, using synth fallback:', e);
            this.playSynthFallback(type);
        }
    },

    stop() {
        if (this.audioElement) {
            try {
                this.audioElement.pause();
                this.audioElement.currentTime = 0;
            } catch (e) {}
            this.audioElement = null;
        }

        if (this.activeSynth) {
            try {
                this.activeSynth.stop();
            } catch (e) {}
            this.activeSynth = null;
        }

        this.currentType = null;
    },

    playSynthFallback(type) {
        const synthProfiles = {
            v6:  { bF: 55,  mF: 110, hF: 320, turbo: true,  vol: 0.22 },
            v8:  { bF: 80,  mF: 160, hF: 540, turbo: false, vol: 0.20 },
            v10: { bF: 120, mF: 240, hF: 960, turbo: false, vol: 0.18 },
            v12: { bF: 75,  mF: 150, hF: 450, turbo: false, vol: 0.22 }
        };

        const p = synthProfiles[type] || synthProfiles.v10;
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();

        const master = ctx.createGain();
        master.gain.setValueAtTime(p.vol, ctx.currentTime);
        master.connect(ctx.destination);

        const o1 = ctx.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = p.bF;
        const o2 = ctx.createOscillator(); o2.type = 'square';   o2.frequency.value = p.mF;
        const o3 = ctx.createOscillator(); o3.type = 'sawtooth'; o3.frequency.value = p.hF;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 2400;

        o1.connect(filter); o2.connect(filter); o3.connect(filter);
        filter.connect(master);

        o1.start(); o2.start(); o3.start();

        this.activeSynth = {
            stop: () => {
                try {
                    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
                    setTimeout(() => { o1.stop(); o2.stop(); o3.stop(); ctx.close(); }, 300);
                } catch (e) {}
            }
        };
    }
};

// Global helper functions for inline HTML event handlers (e.g. engine cards)
function playEngine(type) {
    if (window.engineViewer) {
        window.engineViewer.setEngine(type);
        if (SoundManager.isPlaying() && SoundManager.currentType === type) {
            SoundManager.stop();
            window.engineViewer.updateSoundButtonUI(false);
        } else {
            const eng = window.engineViewer.engines[type];
            SoundManager.play(eng.soundFile, type);
            window.engineViewer.updateSoundButtonUI(true);
        }
    }
}

function stopAllEngines() {
    SoundManager.stop();
    if (window.engineViewer) {
        window.engineViewer.updateSoundButtonUI(false);
    }
}

// Instantiate EngineViewer on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('engine-viewer-container')) {
        window.engineViewer = new EngineViewer('engine-viewer-container');
    }
});
