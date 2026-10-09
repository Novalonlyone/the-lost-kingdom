import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* ==========================================================================
   THE LOST KINGDOM — Fantasy World 3D Exploration Engine
   ========================================================================== */

// 1. Scene, Camera, Renderer Setup
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

// Twilight exponential fog for fantasy atmosphere
scene.fog = new THREE.FogExp2(0x231438, 0.0078);

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.5,
  800
);
const defaultCameraPos = new THREE.Vector3(62, 34, 68);
const defaultCameraTarget = new THREE.Vector3(0, 14, 0);
camera.position.copy(defaultCameraPos);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
container.appendChild(renderer.domElement);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 14;
controls.maxDistance = 190;
controls.maxPolarAngle = Math.PI / 2 - 0.03; // Prevent dipping underground
controls.target.copy(defaultCameraTarget);
controls.autoRotate = false;
controls.autoRotateSpeed = 0.8;

/* ==========================================================================
   2. Web Audio API Synthesizer (Fantasy Ambiance & Magic Chimes)
   ========================================================================== */
let audioCtx = null;
let isAudioPlaying = false;
let droneOsc1 = null;
let droneOsc2 = null;
let droneGain = null;

function initAudio() {
  if (audioCtx) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  audioCtx = new AudioContext();
}

function toggleAmbiance() {
  initAudio();
  if (!audioCtx) return;

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  if (isAudioPlaying) {
    if (droneGain) droneGain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 1);
    setTimeout(() => {
      if (droneOsc1) { droneOsc1.stop(); droneOsc1.disconnect(); }
      if (droneOsc2) { droneOsc2.stop(); droneOsc2.disconnect(); }
      isAudioPlaying = false;
      updateAudioUI();
    }, 1000);
  } else {
    // Generate soft mystical chord (D minor / A ethereal pad)
    droneGain = audioCtx.createGain();
    droneGain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    droneGain.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 2.5);

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;

    droneOsc1 = audioCtx.createOscillator();
    droneOsc1.type = 'sine';
    droneOsc1.frequency.value = 146.83; // D3

    droneOsc2 = audioCtx.createOscillator();
    droneOsc2.type = 'triangle';
    droneOsc2.frequency.value = 220.00; // A3

    droneOsc1.connect(filter);
    droneOsc2.connect(filter);
    filter.connect(droneGain);
    droneGain.connect(audioCtx.destination);

    droneOsc1.start();
    droneOsc2.start();
    isAudioPlaying = true;
    updateAudioUI();
  }
}

function updateAudioUI() {
  const icon = document.getElementById('audio-icon');
  if (icon) {
    icon.textContent = isAudioPlaying ? '🎵' : '🔇';
  }
}

function playMagicChime(highPitch = false) {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';

  const baseFreq = highPitch ? 880 : 587.33;
  osc.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, audioCtx.currentTime + 0.4);

  gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.85);
}

/* ==========================================================================
   3. Materials System (Fantasy Twilight Palette)
   ========================================================================== */
const materials = {
  // Castle Stone
  stoneDark: new THREE.MeshStandardMaterial({
    color: 0x3e374d,
    roughness: 0.85,
    metalness: 0.12,
    flatShading: true
  }),
  stoneLight: new THREE.MeshStandardMaterial({
    color: 0x625974,
    roughness: 0.8,
    metalness: 0.15,
    flatShading: true
  }),
  stonePlatform: new THREE.MeshStandardMaterial({
    color: 0x4f475f,
    roughness: 0.9,
    metalness: 0.1,
    flatShading: true
  }),
  // Spires & Roofs
  roofPurple: new THREE.MeshStandardMaterial({
    color: 0x271e3b,
    roughness: 0.45,
    metalness: 0.35,
    flatShading: true
  }),
  goldTrim: new THREE.MeshStandardMaterial({
    color: 0xffd166,
    roughness: 0.28,
    metalness: 0.9,
    emissive: 0x4a3208,
    emissiveIntensity: 0.4
  }),
  woodGate: new THREE.MeshStandardMaterial({
    color: 0x2c1a11,
    roughness: 0.85,
    metalness: 0.05
  }),
  windowGlow: new THREE.MeshStandardMaterial({
    color: 0xffe28a,
    emissive: 0xffaa00,
    emissiveIntensity: 2.8,
    roughness: 0.2
  }),
  torchFlame: new THREE.MeshBasicMaterial({
    color: 0xff9900
  }),
  // Magic Crystals
  crystalCore: new THREE.MeshPhysicalMaterial({
    color: 0x00f5d4,
    emissive: 0x00c4b4,
    emissiveIntensity: 2.2,
    roughness: 0.08,
    metalness: 0.15,
    transmission: 0.55,
    thickness: 1.5,
    transparent: true,
    opacity: 0.94
  }),
  crystalSatellite: new THREE.MeshPhysicalMaterial({
    color: 0xbf55ec,
    emissive: 0x9b51e0,
    emissiveIntensity: 1.8,
    roughness: 0.12,
    metalness: 0.1,
    transmission: 0.5,
    thickness: 1.2,
    transparent: true,
    opacity: 0.9
  }),
  runeRing: new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    wireframe: true,
    transparent: true,
    opacity: 0.65
  }),
  bannerFabric: new THREE.MeshStandardMaterial({
    color: 0x8b1e42,
    roughness: 0.7,
    side: THREE.DoubleSide
  }),
  // Nature & Landscape
  pineNeedles: new THREE.MeshStandardMaterial({
    color: 0x1b382b,
    roughness: 0.85,
    flatShading: true
  }),
  pineNeedlesHigh: new THREE.MeshStandardMaterial({
    color: 0x244a38,
    roughness: 0.85,
    flatShading: true
  }),
  magicFoliage: new THREE.MeshStandardMaterial({
    color: 0x833ab4,
    emissive: 0x511878,
    emissiveIntensity: 0.6,
    roughness: 0.5,
    flatShading: true
  }),
  woodTrunk: new THREE.MeshStandardMaterial({
    color: 0x261912,
    roughness: 0.92,
    flatShading: true
  }),
  rockBoulders: new THREE.MeshStandardMaterial({
    color: 0x484252,
    roughness: 0.9,
    metalness: 0.08,
    flatShading: true
  }),
  waterSurface: new THREE.MeshStandardMaterial({
    color: 0x141f38,
    roughness: 0.12,
    metalness: 0.85,
    transparent: true,
    opacity: 0.86
  })
};

/* ==========================================================================
   4. Procedural Sky Dome & Celestial Moon
   ========================================================================== */
function createSkyDome() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Sunset Twilight Gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0.0, '#0a0518'); // Cosmic night zenith
  grad.addColorStop(0.3, '#190a30'); // Deep purple
  grad.addColorStop(0.6, '#491448'); // Dusk magenta
  grad.addColorStop(0.8, '#a23b49'); // Sunset crimson
  grad.addColorStop(0.92, '#df6943'); // Amber horizon
  grad.addColorStop(1.0, '#1c0f2b'); // Dark ground horizon
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Twinkling Stars in upper atmosphere
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 350; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 260;
    const r = Math.random() * 1.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.globalAlpha = Math.random() * 0.8 + 0.2;
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;

  const skyTexture = new THREE.CanvasTexture(canvas);
  const skyGeo = new THREE.SphereGeometry(380, 32, 24);
  const skyMat = new THREE.MeshBasicMaterial({
    map: skyTexture,
    side: THREE.BackSide
  });
  const skyMesh = new THREE.Mesh(skyGeo, skyMat);
  scene.add(skyMesh);

  // Giant Celestial Crescent Moon
  const moonGroup = new THREE.Group();
  const moonGeo = new THREE.SphereGeometry(18, 24, 24);
  const moonMat = new THREE.MeshStandardMaterial({
    color: 0xfffae0,
    emissive: 0xffd166,
    emissiveIntensity: 0.85,
    roughness: 0.4
  });
  const moon = new THREE.Mesh(moonGeo, moonMat);
  moonGroup.position.set(-140, 110, -180);
  moonGroup.add(moon);

  // Moon Glow Aura
  const haloGeo = new THREE.RingGeometry(18, 28, 32);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0xffd166,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.25
  });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  halo.lookAt(camera.position);
  moonGroup.add(halo);

  scene.add(moonGroup);
}
createSkyDome();

/* ==========================================================================
   5. Dynamic Lighting System
   ========================================================================== */
// Twilight Sun (Directional Light with crisp soft shadows)
const sunLight = new THREE.DirectionalLight(0xffaa77, 2.4);
sunLight.position.set(90, 85, -80);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 10;
sunLight.shadow.camera.far = 280;
const d = 90;
sunLight.shadow.camera.left = -d;
sunLight.shadow.camera.right = d;
sunLight.shadow.camera.top = d;
sunLight.shadow.camera.bottom = -d;
sunLight.shadow.bias = -0.0006;
scene.add(sunLight);

// Ambient & Hemisphere Twilight Glow
const hemiLight = new THREE.HemisphereLight(0x7e52a0, 0x1a2b1f, 0.85);
scene.add(hemiLight);

const ambientLight = new THREE.AmbientLight(0x3a2254, 0.45);
scene.add(ambientLight);

// Primary Magic Point Light inside Central Monolith
const centralCrystalLight = new THREE.PointLight(0x00f5d4, 3.8, 65, 1.4);
centralCrystalLight.position.set(0, 32, 0);
centralCrystalLight.castShadow = false;
scene.add(centralCrystalLight);

// Warm Hearth Point Light in Grand Gateway
const gateLight = new THREE.PointLight(0xff8c2b, 2.5, 38, 1.6);
gateLight.position.set(0, 16, 26);
scene.add(gateLight);

// Auxiliary Shrine Point Lights
const shrineLightEast = new THREE.PointLight(0xbf55ec, 2.2, 35, 1.5);
shrineLightEast.position.set(45, 13, -25);
scene.add(shrineLightEast);

const shrineLightWest = new THREE.PointLight(0x00e5ff, 2.2, 35, 1.5);
shrineLightWest.position.set(-48, 10, 32);
scene.add(shrineLightWest);

/* ==========================================================================
   6. Procedural Terrain & Water Basin
   ========================================================================== */
function createLandscape() {
  const terrainGeo = new THREE.PlaneGeometry(320, 320, 96, 96);
  terrainGeo.rotateX(-Math.PI / 2);

  const pos = terrainGeo.attributes.position;
  const colors = [];
  const colorGrass = new THREE.Color(0x273b2a);
  const colorHighGrass = new THREE.Color(0x354f38);
  const colorStone = new THREE.Color(0x483e54);
  const colorRockPeak = new THREE.Color(0x5e506d);
  const tempColor = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);

    const distFromCenter = Math.sqrt(x * x + z * z);
    let height = 0;

    // Distant dramatic mountain perimeter
    if (distFromCenter > 48) {
      const rimFactor = Math.min((distFromCenter - 48) / 70, 1);
      const wave1 = Math.sin(x * 0.04) * Math.cos(z * 0.04) * 14;
      const wave2 = Math.sin(x * 0.09 + 1.2) * Math.cos(z * 0.08) * 8;
      const mountainRidge = Math.sin(x * 0.025 + z * 0.02) * 16;
      height = (wave1 + wave2 + mountainRidge) * rimFactor;
    } else {
      // Gentle central valley around castle
      height = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 1.5;
    }

    // River / Moat depression on South-East
    if (x > 8 && z > 8 && x < 75 && z < 75) {
      const riverDepth = Math.sin((x + z) * 0.06) * 4.5;
      height -= Math.max(riverDepth, 0);
    }

    pos.setY(i, height);

    // Color gradient based on altitude
    if (height > 18) {
      tempColor.lerpColors(colorStone, colorRockPeak, (height - 18) / 16);
    } else if (height > 5) {
      tempColor.lerpColors(colorHighGrass, colorStone, (height - 5) / 13);
    } else {
      tempColor.lerpColors(colorGrass, colorHighGrass, (height + 4) / 9);
    }
    colors.push(tempColor.r, tempColor.g, tempColor.b);
  }

  terrainGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  terrainGeo.computeVertexNormals();

  const terrainMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.95,
    metalness: 0.05,
    flatShading: true
  });

  const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
  terrainMesh.receiveShadow = true;
  scene.add(terrainMesh);

  // Reflective Water Basin in Valley
  const waterGeo = new THREE.PlaneGeometry(130, 130);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMesh = new THREE.Mesh(waterGeo, materials.waterSurface);
  waterMesh.position.set(38, 0.4, 38);
  waterMesh.receiveShadow = true;
  scene.add(waterMesh);
}
createLandscape();

/* ==========================================================================
   7. The Grand Castle Citadel ("The Lost Kingdom")
   ========================================================================== */
const castleGroup = new THREE.Group();
const banners = [];

function buildCastle() {
  // --- A. Elevated Stone Plateau Foundation ---
  const plateauGeo = new THREE.CylinderGeometry(29, 35, 13, 16);
  const plateau = new THREE.Mesh(plateauGeo, materials.stoneDark);
  plateau.position.y = 6.5;
  plateau.castShadow = true;
  plateau.receiveShadow = true;
  castleGroup.add(plateau);

  // Paved Courtyard Platform Deck
  const courtyardGeo = new THREE.CylinderGeometry(28.5, 28.5, 1.2, 24);
  const courtyard = new THREE.Mesh(courtyardGeo, materials.stonePlatform);
  courtyard.position.y = 13.2;
  courtyard.receiveShadow = true;
  castleGroup.add(courtyard);

  // --- B. Central Grand Keep (Menara Utama Kerajaan) ---
  const keepGroup = new THREE.Group();

  // Keep Base (Octagonal)
  const keepBaseGeo = new THREE.CylinderGeometry(9.2, 10.6, 16, 8);
  const keepBase = new THREE.Mesh(keepBaseGeo, materials.stoneDark);
  keepBase.position.y = 21;
  keepBase.castShadow = true;
  keepBase.receiveShadow = true;
  keepGroup.add(keepBase);

  // Keep Mid Tier (Octagonal with corbels)
  const keepMidGeo = new THREE.CylinderGeometry(7.8, 8.8, 14, 8);
  const keepMid = new THREE.Mesh(keepMidGeo, materials.stoneLight);
  keepMid.position.y = 35;
  keepMid.castShadow = true;
  keepMid.receiveShadow = true;
  keepGroup.add(keepMid);

  // Keep Upper Observatory Deck
  const keepHighGeo = new THREE.CylinderGeometry(6.4, 7.2, 11, 8);
  const keepHigh = new THREE.Mesh(keepHighGeo, materials.stoneDark);
  keepHigh.position.y = 47;
  keepHigh.castShadow = true;
  keepHigh.receiveShadow = true;
  keepGroup.add(keepHigh);

  // Parapet Wall & Battlements on Keep Roof
  const parapetGeo = new THREE.CylinderGeometry(7.2, 6.4, 2.5, 8);
  const parapet = new THREE.Mesh(parapetGeo, materials.stoneLight);
  parapet.position.y = 53.2;
  keepGroup.add(parapet);

  // Grand Imperial Spire (Dark purple slate roof)
  const spireGeo = new THREE.ConeGeometry(7.5, 22, 8);
  const spire = new THREE.Mesh(spireGeo, materials.roofPurple);
  spire.position.y = 64.5;
  spire.castShadow = true;
  keepGroup.add(spire);

  // Golden Spire Finial & Crown
  const finialBallGeo = new THREE.SphereGeometry(1.0, 16, 16);
  const finialBall = new THREE.Mesh(finialBallGeo, materials.goldTrim);
  finialBall.position.y = 75.8;
  keepGroup.add(finialBall);

  const finialSpireGeo = new THREE.ConeGeometry(0.35, 4.5, 8);
  const finialSpire = new THREE.Mesh(finialSpireGeo, materials.goldTrim);
  finialSpire.position.y = 78.4;
  keepGroup.add(finialSpire);

  // Glowing Windows on Keep
  const winGeo = new THREE.BoxGeometry(0.9, 2.4, 0.3);
  for (let a = 0; a < 8; a++) {
    const angle = (a * Math.PI) / 4;
    // Mid tier windows
    const win1 = new THREE.Mesh(winGeo, materials.windowGlow);
    win1.position.set(Math.cos(angle) * 8.2, 35, Math.sin(angle) * 8.2);
    win1.rotation.y = -angle + Math.PI / 2;
    keepGroup.add(win1);

    // High tier windows
    if (a % 2 === 0) {
      const win2 = new THREE.Mesh(winGeo, materials.windowGlow);
      win2.position.set(Math.cos(angle) * 6.8, 47, Math.sin(angle) * 6.8);
      win2.rotation.y = -angle + Math.PI / 2;
      keepGroup.add(win2);
    }
  }

  castleGroup.add(keepGroup);

  // --- C. Four Bastion Sentry Towers ---
  const towerPositions = [
    { x: 19, z: 19 },
    { x: -19, z: 19 },
    { x: -19, z: -19 },
    { x: 19, z: -19 }
  ];

  towerPositions.forEach((pos) => {
    const towerGroup = new THREE.Group();
    towerGroup.position.set(pos.x, 0, pos.z);

    // Tower Body
    const tBodyGeo = new THREE.CylinderGeometry(4.6, 5.4, 27, 16);
    const tBody = new THREE.Mesh(tBodyGeo, materials.stoneLight);
    tBody.position.y = 26.5;
    tBody.castShadow = true;
    tBody.receiveShadow = true;
    towerGroup.add(tBody);

    // Overhanging Machicolation Ring
    const tMachiGeo = new THREE.CylinderGeometry(5.6, 4.8, 3, 16);
    const tMachi = new THREE.Mesh(tMachiGeo, materials.stoneDark);
    tMachi.position.y = 40.5;
    tMachi.castShadow = true;
    towerGroup.add(tMachi);

    // Conical Slate Roof
    const tRoofGeo = new THREE.ConeGeometry(5.6, 12, 16);
    const tRoof = new THREE.Mesh(tRoofGeo, materials.roofPurple);
    tRoof.position.y = 47.5;
    tRoof.castShadow = true;
    towerGroup.add(tRoof);

    // Golden Tower Finial
    const tFinialGeo = new THREE.ConeGeometry(0.3, 3, 8);
    const tFinial = new THREE.Mesh(tFinialGeo, materials.goldTrim);
    tFinial.position.y = 54.8;
    towerGroup.add(tFinial);

    // Glowing Arrow Slit Windows
    const slitGeo = new THREE.BoxGeometry(0.5, 1.8, 0.2);
    for (let i = 0; i < 4; i++) {
      const ang = (i * Math.PI) / 2;
      const slit = new THREE.Mesh(slitGeo, materials.windowGlow);
      slit.position.set(Math.cos(ang) * 4.9, 28, Math.sin(ang) * 4.9);
      slit.rotation.y = -ang + Math.PI / 2;
      towerGroup.add(slit);
    }

    castleGroup.add(towerGroup);
  });

  // --- D. Stone Curtain Walls with Crenellations ---
  const wallConfigs = [
    { x: 0, z: 19, rotY: 0, len: 29 },
    { x: 0, z: -19, rotY: 0, len: 29 },
    { x: 19, z: 0, rotY: Math.PI / 2, len: 29 },
    { x: -19, z: 0, rotY: Math.PI / 2, len: 29 }
  ];

  wallConfigs.forEach((cfg) => {
    // If it's the front wall, leave an opening for the gatehouse
    const wallGroup = new THREE.Group();
    wallGroup.position.set(cfg.x, 0, cfg.z);
    wallGroup.rotation.y = cfg.rotY;

    if (cfg.z === 19 && cfg.x === 0) {
      // Split wall with center gate gap
      const segmentLen = 9.5;
      [-10, 10].forEach((offset) => {
        const segGeo = new THREE.BoxGeometry(segmentLen, 16, 3.8);
        const seg = new THREE.Mesh(segGeo, materials.stoneDark);
        seg.position.set(offset, 21, 0);
        seg.castShadow = true;
        seg.receiveShadow = true;
        wallGroup.add(seg);

        // Crenellations on segment
        for (let c = -4; c <= 4; c += 2) {
          const merlon = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 4.0), materials.stoneLight);
          merlon.position.set(offset + c, 29.5, 0);
          merlon.castShadow = true;
          wallGroup.add(merlon);
        }
      });
    } else {
      // Solid Wall
      const wallGeo = new THREE.BoxGeometry(cfg.len, 16, 3.8);
      const wallMesh = new THREE.Mesh(wallGeo, materials.stoneDark);
      wallMesh.position.y = 21;
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      wallGroup.add(wallMesh);

      // Crenellations along top
      for (let c = -cfg.len / 2 + 1.5; c < cfg.len / 2; c += 2.4) {
        const merlon = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.4, 4.0), materials.stoneLight);
        merlon.position.set(c, 29.5, 0);
        merlon.castShadow = true;
        wallGroup.add(merlon);
      }
    }

    castleGroup.add(wallGroup);
  });

  // --- E. Grand Gatehouse & Viaduct Drawbridge ---
  const gateGroup = new THREE.Group();
  gateGroup.position.set(0, 0, 22.5);

  // Twin Gatehouse Towers
  [-5.5, 5.5].forEach((gx) => {
    const gTowerGeo = new THREE.CylinderGeometry(3.5, 4.0, 18, 12);
    const gTower = new THREE.Mesh(gTowerGeo, materials.stoneLight);
    gTower.position.set(gx, 22, 0);
    gTower.castShadow = true;
    gateGroup.add(gTower);

    const gRoofGeo = new THREE.ConeGeometry(4.0, 8, 12);
    const gRoof = new THREE.Mesh(gRoofGeo, materials.roofPurple);
    gRoof.position.set(gx, 34.5, 0);
    gRoof.castShadow = true;
    gateGroup.add(gRoof);

    // Glowing Entrance Torch Brazier
    const torchPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 2.5, 8), materials.stoneDark);
    torchPillar.position.set(gx, 15, 3.8);
    gateGroup.add(torchPillar);

    const flameMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.4), materials.torchFlame);
    flameMesh.position.set(gx, 16.5, 3.8);
    gateGroup.add(flameMesh);
  });

  // Arched Gate Portal
  const archTop = new THREE.Mesh(new THREE.BoxGeometry(6.5, 3.5, 4), materials.stoneLight);
  archTop.position.set(0, 24, 0);
  gateGroup.add(archTop);

  // Heavy Timber Portcullis Gate
  const doorGeo = new THREE.BoxGeometry(5.2, 9.5, 0.6);
  const door = new THREE.Mesh(doorGeo, materials.woodGate);
  door.position.set(0, 17.5, 0);
  door.castShadow = true;
  gateGroup.add(door);

  // Iron Grate Spikes on Portcullis
  const ironBarGeo = new THREE.CylinderGeometry(0.08, 0.08, 9.5, 6);
  for (let b = -2; b <= 2; b += 1) {
    const bar = new THREE.Mesh(ironBarGeo, materials.stoneDark);
    bar.position.set(b, 17.5, 0.4);
    gateGroup.add(bar);
  }

  // Stone Viaduct Bridge extending forward over the terrain
  const bridgeGeo = new THREE.BoxGeometry(8, 2.2, 32);
  const bridge = new THREE.Mesh(bridgeGeo, materials.stonePlatform);
  bridge.position.set(0, 12.8, 17);
  bridge.castShadow = true;
  bridge.receiveShadow = true;
  gateGroup.add(bridge);

  // Bridge Guard Rails
  [-3.8, 3.8].forEach((rx) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.4, 32), materials.stoneLight);
    rail.position.set(rx, 14.3, 17);
    rail.castShadow = true;
    gateGroup.add(rail);
  });

  // Bridge Support Arches / Pillars
  [8, 20, 28].forEach((pz) => {
    const pillarGeo = new THREE.CylinderGeometry(1.8, 2.4, 12, 8);
    const pillar = new THREE.Mesh(pillarGeo, materials.stoneDark);
    pillar.position.set(0, 6, pz);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    gateGroup.add(pillar);
  });

  castleGroup.add(gateGroup);

  // --- F. Elevated Skybridge (Connecting Keep to East Bastion) ---
  const skybridgeGeo = new THREE.BoxGeometry(2.4, 2.2, 13);
  const skybridge = new THREE.Mesh(skybridgeGeo, materials.stoneLight);
  skybridge.position.set(10, 35, 10);
  skybridge.rotation.y = -Math.PI / 4;
  skybridge.castShadow = true;
  castleGroup.add(skybridge);

  // --- G. Royal Banners / Pennants ---
  const bannerPositions = [
    { x: 0, y: 53, z: 7.4, rotY: 0 },
    { x: -7.4, y: 53, z: 0, rotY: Math.PI / 2 },
    { x: 19, y: 39, z: 24.5, rotY: 0 },
    { x: -19, y: 39, z: 24.5, rotY: 0 }
  ];

  bannerPositions.forEach((bp) => {
    const bannerGeo = new THREE.PlaneGeometry(1.8, 5.5, 6, 10);
    const banner = new THREE.Mesh(bannerGeo, materials.bannerFabric);
    banner.position.set(bp.x, bp.y - 2.8, bp.z);
    banner.rotation.y = bp.rotY;
    castleGroup.add(banner);
    banners.push(banner);
  });

  scene.add(castleGroup);
}
buildCastle();

/* ==========================================================================
   8. Magic Crystals & Arcane Energy Rings (Kristal Ajaib)
   ========================================================================== */
const crystalGroup = new THREE.Group();
let mainCrystalMesh;
const satelliteShards = [];
const arcaneRings = [];

function createMagicCrystals() {
  // Central Floating Monolith Core (Octahedron crystal)
  const coreGeo = new THREE.OctahedronGeometry(4.2, 0);
  coreGeo.scale(1, 1.8, 1);
  mainCrystalMesh = new THREE.Mesh(coreGeo, materials.crystalCore);
  mainCrystalMesh.position.set(0, 33, 0);
  crystalGroup.add(mainCrystalMesh);

  // Orbiting Satellite Shards (6 crystals orbiting at different angles)
  for (let i = 0; i < 6; i++) {
    const shardGeo = new THREE.OctahedronGeometry(0.9, 0);
    shardGeo.scale(0.8, 1.6, 0.8);
    const shard = new THREE.Mesh(shardGeo, materials.crystalSatellite);
    shard.userData = {
      orbitAngle: (i * Math.PI * 2) / 6,
      orbitRadius: 7.2 + (i % 2) * 1.8,
      orbitSpeed: 0.8 + (i % 3) * 0.3,
      verticalPhase: i * 1.2
    };
    satelliteShards.push(shard);
    crystalGroup.add(shard);
  }

  // Concentric Arcane Runic Rings
  const ring1Geo = new THREE.TorusGeometry(6.6, 0.1, 16, 64);
  const ring1 = new THREE.Mesh(ring1Geo, materials.runeRing);
  ring1.position.set(0, 33, 0);
  ring1.rotation.x = Math.PI / 3;
  arcaneRings.push(ring1);
  crystalGroup.add(ring1);

  const ring2Geo = new THREE.TorusGeometry(8.8, 0.08, 16, 64);
  const ring2 = new THREE.Mesh(ring2Geo, materials.runeRing);
  ring2.position.set(0, 33, 0);
  ring2.rotation.y = Math.PI / 4;
  arcaneRings.push(ring2);
  crystalGroup.add(ring2);

  scene.add(crystalGroup);

  // --- Auxiliary Shrines Across the Landscape ---
  const shrines = [
    { x: 45, y: 11, z: -25, color: 0xbf55ec },
    { x: -48, y: 8, z: 32, color: 0x00f5d4 },
    { x: 3, y: 22, z: -72, color: 0xffd166 },
    { x: -35, y: 4, z: -45, color: 0x00c4b4 }
  ];

  shrines.forEach((shrine) => {
    const shrineGroup = new THREE.Group();
    shrineGroup.position.set(shrine.x, shrine.y, shrine.z);

    // Stone Pillars / Runestones
    for (let p = 0; p < 4; p++) {
      const pAng = (p * Math.PI) / 2;
      const pGeo = new THREE.BoxGeometry(0.9, 4.2, 0.9);
      const pillar = new THREE.Mesh(pGeo, materials.stoneLight);
      pillar.position.set(Math.cos(pAng) * 3.4, 2.1, Math.sin(pAng) * 3.4);
      pillar.rotation.y = pAng;
      shrineGroup.add(pillar);
    }

    // Levitating Shrine Crystal
    const sCrystalGeo = new THREE.OctahedronGeometry(1.6, 0);
    sCrystalGeo.scale(0.9, 1.7, 0.9);
    const sMat = shrine.color === 0xbf55ec ? materials.crystalSatellite : materials.crystalCore;
    const sCrystal = new THREE.Mesh(sCrystalGeo, sMat);
    sCrystal.position.y = 4.2;
    sCrystal.userData = { isAuxCrystal: true, rotSpeed: 0.9 };
    shrineGroup.add(sCrystal);

    scene.add(shrineGroup);
  });
}
createMagicCrystals();

/* ==========================================================================
   9. Nature & Foliage (Trees & Low-Poly Rocks)
   ========================================================================== */
function populateNature() {
  const treeCount = 130;
  const rockCount = 70;

  // Reusable Tree Geometries
  const trunkGeo = new THREE.CylinderGeometry(0.35, 0.6, 2.8, 6);
  const coneGeo1 = new THREE.ConeGeometry(2.4, 3.8, 6);
  const coneGeo2 = new THREE.ConeGeometry(1.9, 3.2, 6);
  const coneGeo3 = new THREE.ConeGeometry(1.3, 2.6, 6);
  const magicFoliageGeo = new THREE.DodecahedronGeometry(2.0, 1);

  // Procedural Tree Distribution
  for (let i = 0; i < treeCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    // Don't spawn right on the castle courtyard (radius 32)
    const dist = 36 + Math.random() * 95;
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist;

    // Approximate ground height
    let y = 0;
    if (dist > 48) {
      y = Math.sin(x * 0.04) * Math.cos(z * 0.04) * 8;
    }

    const tree = new THREE.Group();
    tree.position.set(x, Math.max(y, 0.2), z);
    const scale = 0.75 + Math.random() * 0.7;
    tree.scale.set(scale, scale, scale);
    tree.rotation.y = Math.random() * Math.PI * 2;

    const isMagicTree = i % 4 === 0;

    // Trunk
    const trunk = new THREE.Mesh(trunkGeo, materials.woodTrunk);
    trunk.position.y = 1.4;
    trunk.castShadow = true;
    tree.add(trunk);

    if (isMagicTree) {
      // Ancient glowing fantasy tree
      const foliage = new THREE.Mesh(magicFoliageGeo, materials.magicFoliage);
      foliage.position.y = 4.2;
      foliage.castShadow = true;
      tree.add(foliage);
    } else {
      // Fantasy Evergreen Pine Tree (Tiered cones)
      const mat = i % 2 === 0 ? materials.pineNeedles : materials.pineNeedlesHigh;
      const c1 = new THREE.Mesh(coneGeo1, mat);
      c1.position.y = 3.2;
      c1.castShadow = true;
      tree.add(c1);

      const c2 = new THREE.Mesh(coneGeo2, mat);
      c2.position.y = 5.2;
      c2.castShadow = true;
      tree.add(c2);

      const c3 = new THREE.Mesh(coneGeo3, mat);
      c3.position.y = 6.8;
      c3.castShadow = true;
      tree.add(c3);
    }

    scene.add(tree);
  }

  // Procedural Deformed Boulders
  const rockGeo = new THREE.DodecahedronGeometry(1.5, 0);
  for (let i = 0; i < rockCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 28 + Math.random() * 100;
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist;

    const rock = new THREE.Mesh(rockGeo, materials.rockBoulders);
    const rScale = 0.6 + Math.random() * 1.8;
    rock.scale.set(rScale * (0.8 + Math.random() * 0.4), rScale * (0.6 + Math.random() * 0.4), rScale);
    rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    rock.position.set(x, rScale * 0.6, z);
    rock.castShadow = true;
    rock.receiveShadow = true;
    scene.add(rock);
  }
}
populateNature();

/* ==========================================================================
   10. Floating Magic Particles System (Partikel Sihir Melayang)
   ========================================================================== */
let magicParticlesMesh;
let magicParticlesGeo;
const particleCount = 1400;
let isMagicActive = true;
let magicIntensity = 1.0;

function createGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.2, 'rgba(0, 245, 212, 0.9)');
  gradient.addColorStop(0.55, 'rgba(192, 132, 252, 0.4)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  return new THREE.CanvasTexture(canvas);
}

function initMagicParticles() {
  magicParticlesGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const particleMeta = [];

  const color1 = new THREE.Color(0x00f5d4); // Cyan
  const color2 = new THREE.Color(0xbf55ec); // Magenta
  const color3 = new THREE.Color(0xffd166); // Golden Amber

  for (let i = 0; i < particleCount; i++) {
    // Distribute in cylindrical vortex around the kingdom
    const angle = Math.random() * Math.PI * 2;
    const radius = 6 + Math.random() * 55;
    const y = 8 + Math.random() * 65;

    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(angle) * radius;

    // Color gradient
    const mix = Math.random();
    const pColor = mix < 0.45 ? color1 : mix < 0.85 ? color2 : color3;
    colors[i * 3] = pColor.r;
    colors[i * 3 + 1] = pColor.g;
    colors[i * 3 + 2] = pColor.b;

    particleMeta.push({
      angle,
      radius,
      y,
      speed: (0.4 + Math.random() * 0.8) * (Math.random() < 0.5 ? 1 : -1),
      verticalSpeed: 0.15 + Math.random() * 0.4,
      initialY: y,
      phase: Math.random() * Math.PI * 2
    });
  }

  magicParticlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  magicParticlesGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  magicParticlesGeo.userData = { meta: particleMeta };

  const particleMat = new THREE.PointsMaterial({
    size: 2.2,
    map: createGlowTexture(),
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  magicParticlesMesh = new THREE.Points(magicParticlesGeo, particleMat);
  scene.add(magicParticlesMesh);
}
initMagicParticles();

/* ==========================================================================
   11. Smooth Camera Transition System
   ========================================================================== */
let isTransitioningCamera = false;
let cameraStartPos = new THREE.Vector3();
let cameraEndPos = new THREE.Vector3();
let cameraStartTarget = new THREE.Vector3();
let cameraEndTarget = new THREE.Vector3();
let transitionProgress = 0;
const transitionDuration = 1.3; // seconds

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function flyCameraTo(targetPos, lookAtTarget, onComplete) {
  isTransitioningCamera = true;
  transitionProgress = 0;
  cameraStartPos.copy(camera.position);
  cameraEndPos.copy(targetPos);
  cameraStartTarget.copy(controls.target);
  cameraEndTarget.copy(lookAtTarget);

  if (controls.autoRotate) {
    controls.autoRotate = false;
    updateCinematicUI();
  }

  function updateTransition(delta) {
    if (!isTransitioningCamera) return;
    transitionProgress += delta / transitionDuration;

    if (transitionProgress >= 1) {
      transitionProgress = 1;
      isTransitioningCamera = false;
      camera.position.copy(cameraEndPos);
      controls.target.copy(cameraEndTarget);
      if (onComplete) onComplete();
    } else {
      const ease = easeOutCubic(transitionProgress);
      camera.position.lerpVectors(cameraStartPos, cameraEndPos, ease);
      controls.target.lerpVectors(cameraStartTarget, cameraEndTarget, ease);
    }
  }

  return updateTransition;
}

let activeCameraTransition = null;

function resetCamera() {
  playMagicChime(false);
  activeCameraTransition = flyCameraTo(defaultCameraPos, defaultCameraTarget, () => {
    activeCameraTransition = null;
  });
  showToast('Sudut pandang kamera berhasil direset ke Ikhtisar!');
}

/* ==========================================================================
   12. Points of Interest (POI) Navigation
   ========================================================================== */
const POI_LOCATIONS = {
  overview: {
    pos: new THREE.Vector3(62, 34, 68),
    target: new THREE.Vector3(0, 14, 0),
    title: 'Ikhtisar Kerajaan'
  },
  castle: {
    pos: new THREE.Vector3(18, 48, 42),
    target: new THREE.Vector3(0, 42, 0),
    title: 'Istana Utama & Menara'
  },
  crystal: {
    pos: new THREE.Vector3(14, 34, 16),
    target: new THREE.Vector3(0, 33, 0),
    title: 'Monolit Kristal Ajaib'
  },
  gate: {
    pos: new THREE.Vector3(0, 18, 52),
    target: new THREE.Vector3(0, 18, 22),
    title: 'Gerbang Megah & Jembatan'
  },
  grove: {
    pos: new THREE.Vector3(45, 18, -48),
    target: new THREE.Vector3(20, 12, -20),
    title: 'Hutan Kuno & Kuil'
  }
};

function goToPOI(key) {
  const poi = POI_LOCATIONS[key];
  if (!poi) return;
  playMagicChime(true);
  activeCameraTransition = flyCameraTo(poi.pos, poi.target, () => {
    activeCameraTransition = null;
  });
  showToast(`Menuju: ${poi.title}`);
}

/* ==========================================================================
   13. Magic Effect State Toggle (Aktifkan / Nonaktifkan)
   ========================================================================== */
function toggleMagicEffect() {
  isMagicActive = !isMagicActive;
  playMagicChime(isMagicActive);

  const btn = document.getElementById('btn-magic-effect');
  const badge = document.getElementById('magic-status-badge');
  const manaLabel = document.getElementById('realm-mana-label');

  if (isMagicActive) {
    btn.classList.add('active');
    badge.textContent = 'AKTIF';
    badge.className = 'badge-active';
    if (manaLabel) manaLabel.textContent = 'Mana Kuno: 100%';
    showToast('✨ Efek Sihir Diaktifkan! Partikel & kristal menyala.');
  } else {
    btn.classList.remove('active');
    badge.textContent = 'NONAKTIF';
    badge.className = 'badge-inactive';
    if (manaLabel) manaLabel.textContent = 'Mana Kuno: Tertidur';
    showToast('🌑 Efek Sihir Dinonaktifkan. Partikel mereda.');
  }
}

/* ==========================================================================
   14. Cinematic Mode Toggle
   ========================================================================== */
function toggleCinematicMode() {
  controls.autoRotate = !controls.autoRotate;
  updateCinematicUI();
  if (controls.autoRotate) {
    showToast('🎬 Mode Sinematik aktif: Kamera memutar otomatis.');
  } else {
    showToast('Tur sinematik dijeda.');
  }
}

function updateCinematicUI() {
  const btn = document.getElementById('btn-cinematic');
  const badge = document.getElementById('cinematic-status-badge');
  if (controls.autoRotate) {
    btn.classList.add('active');
    badge.textContent = 'ON';
    badge.className = 'badge-active';
  } else {
    btn.classList.remove('active');
    badge.textContent = 'OFF';
    badge.className = 'badge-subtle';
  }
}

/* ==========================================================================
   15. UI Notifications & Modal Controls
   ========================================================================== */
let toastTimeout = null;
function showToast(message) {
  const toast = document.getElementById('toast-notification');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

function setupUIEvents() {
  // Reset Camera Button
  const btnReset = document.getElementById('btn-reset-cam');
  if (btnReset) {
    btnReset.addEventListener('click', resetCamera);
  }

  // Magic Effect Toggle Button
  const btnMagic = document.getElementById('btn-magic-effect');
  if (btnMagic) {
    btnMagic.addEventListener('click', toggleMagicEffect);
  }

  // Cinematic Mode Button
  const btnCinematic = document.getElementById('btn-cinematic');
  if (btnCinematic) {
    btnCinematic.addEventListener('click', toggleCinematicMode);
  }

  // Audio Toggle
  const btnAudio = document.getElementById('btn-audio-toggle');
  if (btnAudio) {
    btnAudio.addEventListener('click', toggleAmbiance);
  }

  // Help Guide Modal Toggle
  const btnHelp = document.getElementById('btn-help-toggle');
  const guideCard = document.getElementById('controls-guide');
  const btnCloseGuide = document.getElementById('btn-close-guide');

  if (btnHelp && guideCard) {
    btnHelp.addEventListener('click', () => {
      guideCard.classList.toggle('hidden');
    });
  }

  if (btnCloseGuide && guideCard) {
    btnCloseGuide.addEventListener('click', () => {
      guideCard.classList.add('hidden');
    });
  }

  // POI Selector Buttons
  const poiButtons = document.querySelectorAll('.poi-btn');
  poiButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      poiButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const poiKey = btn.dataset.poi;
      goToPOI(poiKey);
    });
  });

  // Hide loading screen after scene initialization
  setTimeout(() => {
    const loader = document.getElementById('loading-overlay');
    if (loader) {
      loader.classList.add('fade-out');
    }
  }, 650);
}
setupUIEvents();

/* ==========================================================================
   16. Render Loop & Smooth Animations
   ========================================================================== */
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const elapsedTime = clock.getElapsedTime();

  // A. Camera Smooth Flight Interpolation
  if (activeCameraTransition) {
    activeCameraTransition(delta);
  }

  // Update OrbitControls
  controls.update();

  // B. Magic Effect Intensity Interpolation
  const targetIntensity = isMagicActive ? 1.0 : 0.0;
  magicIntensity = THREE.MathUtils.lerp(magicIntensity, targetIntensity, delta * 3.5);

  // C. Central Monolith Animation (Multi-axis rotation & levitation)
  if (mainCrystalMesh) {
    mainCrystalMesh.rotation.y = elapsedTime * (0.4 + magicIntensity * 0.6);
    mainCrystalMesh.rotation.z = Math.sin(elapsedTime * 1.2) * 0.15;
    mainCrystalMesh.position.y = 33 + Math.sin(elapsedTime * 1.8) * 1.2;

    // Dynamic Pulsing Light
    const pulseFactor = 0.5 + Math.sin(elapsedTime * 3.0) * 0.5;
    centralCrystalLight.intensity = (1.0 + pulseFactor * 2.8) * Math.max(magicIntensity, 0.2);
    materials.crystalCore.emissiveIntensity = 1.0 + pulseFactor * 1.8 * magicIntensity;
  }

  // D. Orbiting Satellite Shards Animation
  satelliteShards.forEach((shard) => {
    const meta = shard.userData;
    meta.orbitAngle += delta * meta.orbitSpeed * (0.6 + magicIntensity * 0.8);
    shard.position.x = Math.cos(meta.orbitAngle) * meta.orbitRadius;
    shard.position.z = Math.sin(meta.orbitAngle) * meta.orbitRadius;
    shard.position.y = 33 + Math.sin(elapsedTime * 2.2 + meta.verticalPhase) * 1.8;
    shard.rotation.x = elapsedTime * 1.4;
    shard.rotation.y = elapsedTime * 1.8;
  });

  // E. Arcane Energy Rings Counter-Rotation
  if (arcaneRings.length >= 2) {
    arcaneRings[0].rotation.z = elapsedTime * (0.7 + magicIntensity * 0.9);
    arcaneRings[1].rotation.x = -elapsedTime * (0.5 + magicIntensity * 0.7);
    materials.runeRing.opacity = 0.2 + magicIntensity * 0.5;
  }

  // F. Auxiliary Shrines Levitation
  scene.traverse((obj) => {
    if (obj.userData && obj.userData.isAuxCrystal) {
      obj.rotation.y += delta * obj.userData.rotSpeed * (0.6 + magicIntensity * 0.5);
      obj.position.y = 4.2 + Math.sin(elapsedTime * 2.0 + obj.position.x) * 0.4;
    }
  });

  // G. Castle Royal Banners Wind Physics (Vertex oscillation)
  banners.forEach((banner, idx) => {
    const pos = banner.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vy = pos.getY(i);
      // Wave bottom vertices more than top anchor
      const factor = Math.abs(vy) / 5.5;
      const wave = Math.sin(elapsedTime * 3.2 + pos.getX(i) * 2 + idx) * 0.3 * factor;
      pos.setZ(i, wave);
    }
    pos.needsUpdate = true;
  });

  // H. Gate Brazier Flame Flicker Animation
  gateLight.intensity = 2.0 + Math.sin(elapsedTime * 9.0) * 0.4 + Math.cos(elapsedTime * 14.0) * 0.2;

  // I. Swirling Magic Particles System Animation
  if (magicParticlesMesh && magicParticlesGeo) {
    const posAttr = magicParticlesGeo.attributes.position;
    const meta = magicParticlesGeo.userData.meta;
    const positions = posAttr.array;

    for (let i = 0; i < particleCount; i++) {
      const p = meta[i];
      // Angular vortex drift
      p.angle += delta * p.speed * (0.3 + magicIntensity * 1.4);
      // Vertical oscillation and drift
      p.y += delta * p.verticalSpeed * (0.4 + magicIntensity * 1.0);

      if (p.y > 75) {
        p.y = 8 + Math.random() * 5;
      }

      const activeRadius = p.radius + Math.sin(elapsedTime * 2.0 + p.phase) * (magicIntensity * 2.5);

      positions[i * 3] = Math.cos(p.angle) * activeRadius;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = Math.sin(p.angle) * activeRadius;
    }

    posAttr.needsUpdate = true;
    magicParticlesMesh.material.opacity = Math.max(magicIntensity * 0.95, 0.0);
    magicParticlesMesh.material.size = 1.2 + magicIntensity * 1.4;
  }

  // Render Scene
  renderer.render(scene, camera);
}
animate();

/* ==========================================================================
   17. Viewport Resize Handler & Interactive Raycasting
   ========================================================================== */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Interactive Click on Central Crystal to trigger Magic Burst
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('pointerdown', (e) => {
  // Only handle clicks on the 3D canvas (not UI HUD elements)
  if (e.target.closest('#ui-hud') || e.target.closest('#loading-overlay')) return;

  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(mainCrystalMesh);

  if (intersects.length > 0) {
    playMagicChime(true);
    showToast('✦ Resonansi Kristal! Energi sihir meluap.');
    // Temporary particle burst
    if (!isMagicActive) {
      toggleMagicEffect();
    }
  }
});
