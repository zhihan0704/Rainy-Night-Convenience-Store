import * as THREE from 'three';
import {
  PALETTE, toon, physical, addBox, addCylinder, addPlane, addMesh, labelPlane,
  addOutline, addContactShadow, glowMaterial,
} from './lib.js';

export const STORE = {
  x0: -5.86,
  x1: 0.96,
  z0: -6.55,
  z1: -0.76,
  baseY: 0.13,
  floorY: 0.27,
  glassBottom: 0.44,
  glassTop: 2.70,
  eaveY: 2.84,
  wallTop: 3.56,
  signY: 3.28,
  doorX0: -0.95,
  doorX1: 0.55,
  centerX: -2.45,
  centerZ: -3.65,
};


function makeGlassSheenTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 1024;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 512, 1024);
  ctx.save();
  ctx.filter = 'blur(16px)';
  const g1 = ctx.createLinearGradient(0, 1024, 512, 220);
  g1.addColorStop(0, 'rgba(230,246,250,0)');
  g1.addColorStop(0.3, 'rgba(230,246,250,0.16)');
  g1.addColorStop(0.58, 'rgba(230,246,250,0.03)');
  g1.addColorStop(1, 'rgba(230,246,250,0)');
  ctx.fillStyle = g1;
  ctx.beginPath();
  ctx.moveTo(-90, 1024);
  ctx.lineTo(210, 1024);
  ctx.lineTo(620, 120);
  ctx.lineTo(410, 120);
  ctx.closePath();
  ctx.fill();
  ctx.filter = 'blur(9px)';
  const g2 = ctx.createLinearGradient(300, 1024, 512, 0);
  g2.addColorStop(0, 'rgba(255,247,224,0)');
  g2.addColorStop(0.45, 'rgba(255,247,224,0.1)');
  g2.addColorStop(1, 'rgba(255,247,224,0)');
  ctx.fillStyle = g2;
  ctx.beginPath();
  ctx.moveTo(280, 1024);
  ctx.lineTo(364, 1024);
  ctx.lineTo(560, 0);
  ctx.lineTo(490, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  for (let i = 0; i < 22; i++) {
    ctx.fillStyle = 'rgba(244,252,255,' + (0.05 + Math.random() * 0.14) + ')';
    ctx.beginPath();
    ctx.ellipse(70 + Math.random() * 380, Math.random() * 1024, 1 + Math.random() * 4, 2 + Math.random() * 8, 0.18, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function makeDoorStickerTexture() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 256;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 1024, 256);
  ctx.fillStyle = 'rgba(250,245,228,0.82)';
  ctx.textAlign = 'center';
  ctx.font = '700 78px "Yu Gothic", "Meiryo", sans-serif';
  ctx.letterSpacing = '12px';
  ctx.fillText('自動ドア', 512, 116);
  ctx.font = '600 27px "Trebuchet MS", sans-serif';
  ctx.letterSpacing = '12px';
  ctx.fillText('AUTOMATIC DOOR', 512, 165);
  ctx.strokeStyle = 'rgba(247,242,226,0.55)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(330, 208);
  ctx.lineTo(694, 208);
  ctx.stroke();
  ctx.fillStyle = 'rgba(247,242,226,0.8)';
  ctx.beginPath();
  ctx.moveTo(342, 196);
  ctx.lineTo(320, 208);
  ctx.lineTo(342, 220);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(682, 196);
  ctx.lineTo(704, 208);
  ctx.lineTo(682, 220);
  ctx.closePath();
  ctx.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}


function makeWelcomeTexture() {
  const c = document.createElement('canvas');
  c.width = 768;
  c.height = 192;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 192);
  g.addColorStop(0, '#fff5df');
  g.addColorStop(1, '#ebddc3');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 768, 192);
  ctx.strokeStyle = '#315b52';
  ctx.lineWidth = 9;
  ctx.strokeRect(8, 8, 752, 176);
  ctx.fillStyle = '#2c554c';
  ctx.font = '800 78px "Trebuchet MS", sans-serif';
  ctx.letterSpacing = '12px';
  ctx.textAlign = 'center';
  ctx.fillText('WELCOME', 384, 92);
  ctx.fillStyle = '#cf6e48';
  ctx.fillRect(266, 116, 236, 4);
  ctx.fillStyle = '#7d6747';
  ctx.font = '600 26px "Yu Gothic", "Meiryo", sans-serif';
  ctx.letterSpacing = '9px';
  ctx.fillText('なみマートへ ようこそ', 384, 153);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeCupNoodle(parent, x, y, z, flavor) {
  addCylinder(parent, 0.085, 0.075, 0.17, toon(0xeee6d6), x, y, z, { segments: 12 });
  addCylinder(parent, 0.087, 0.087, 0.035, toon(flavor), x, y + 0.07, z, { segments: 12 });
  addCylinder(parent, 0.065, 0.065, 0.012, toon(0xf3edde), x, y + 0.095, z, { segments: 12 });
  addBox(parent, 0.12, 0.07, 0.045, toon(flavor), x, y + 0.005, z + 0.064, { castShadow: false });
  addBox(parent, 0.055, 0.018, 0.02, toon(0xf4ead6), x, y + 0.005, z + 0.088, { castShadow: false });
}

function makeGlassRainTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 1024;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 512, 1024);
  for (let i = 0; i < 52; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 1024;
    const len = 35 + Math.random() * 190;
    const grad = ctx.createLinearGradient(x, y, x + 8, y + len);
    grad.addColorStop(0, 'rgba(225,245,248,0)');
    grad.addColorStop(0.45, 'rgba(225,245,248,' + (0.06 + Math.random() * 0.16) + ')');
    grad.addColorStop(1, 'rgba(240,252,255,' + (0.16 + Math.random() * 0.22) + ')');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1 + Math.random() * 2.2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x + 4, y + len * 0.35, x + 2, y + len * 0.72, x + 8, y + len);
    ctx.stroke();
    ctx.fillStyle = 'rgba(245,255,255,' + (0.2 + Math.random() * 0.5) + ')';
    ctx.beginPath();
    ctx.ellipse(x + 8, y + len, 1.8 + Math.random() * 2.2, 2.5 + Math.random() * 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 120; i++) {
    ctx.fillStyle = 'rgba(235,250,252,' + (0.08 + Math.random() * 0.22) + ')';
    ctx.beginPath();
    ctx.arc(Math.random() * 512, Math.random() * 1024, 0.7 + Math.random() * 2.1, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1.1, 1.3);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function addInstancedBoxes(parent, specs) {
  if (!specs.length) return null;
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: true });
  const mesh = new THREE.InstancedMesh(geo, mat, specs.length);
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  specs.forEach((s, i) => {
    dummy.position.set(s.x, s.y, s.z);
    dummy.rotation.set(0, s.ry || 0, 0);
    dummy.scale.set(s.w || 1, s.h || 1, s.d || 1);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    color.set(s.color);
    mesh.setColorAt(i, color);
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.frustumCulled = false;
  parent.add(mesh);
  return mesh;
}

function addInstancedDrinks(parent, specs) {
  if (!specs.length) return null;
  const geo = new THREE.CylinderGeometry(1, 1, 1, 8, 1);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: true });
  const mesh = new THREE.InstancedMesh(geo, mat, specs.length);
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  specs.forEach((s, i) => {
    dummy.position.set(s.x, s.y, s.z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(s.r, s.h, s.r);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    color.set(s.color);
    mesh.setColorAt(i, color);
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.frustumCulled = false;
  parent.add(mesh);
  return mesh;
}

function standardFrame(parent, w, h, d, x, y, z, color) {
  return addBox(parent, w, h, d, toon(color), x, y, z, { castShadow: false, receiveShadow: true });
}

export function buildStore(assembly, assets, root) {
  const signMaterials = [];
  const signBaseColor = 1.3;
  const glassRainTexture = makeGlassRainTexture();
  const glassRainMaterial = new THREE.MeshBasicMaterial({
    map: glassRainTexture,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
  const glassSheenTexture = makeGlassSheenTexture();
  const glassSheenMaterial = new THREE.MeshBasicMaterial({
    map: glassSheenTexture,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
  const doorStickerTexture = makeDoorStickerTexture();
  const welcomeTexture = makeWelcomeTexture();
  const doorFrameMat = new THREE.MeshStandardMaterial({ color: 0xaeb8ae, roughness: 0.34, metalness: 0.52 });
  const doorStickerMaterial = new THREE.MeshBasicMaterial({
    map: doorStickerTexture,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xc5e1e3,
    metalness: 0,
    roughness: 0.06,
    opacity: 0.065,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    envMapIntensity: 0.18,
  });
  const warmGlow = glowMaterial(0xffe6bb);
  const warmGlowSoft = glowMaterial(0xffd39b);
  const paleGlow = glowMaterial(0xfff5df);
  const darkTrim = toon(0x203e3b);
  const cream = toon(0xeee3cd);
  const creamDim = toon(0xd8ccb6);
  const green = toon(0x336256);

  function U(name, x, y, z, delay, mode, opts = {}) {
    const g = new THREE.Group();
    g.name = name;
    g.position.set(x, y, z);
    root.add(g);
    assembly.register(g, delay, mode, opts);
    return g;
  }

  // ---------- foundation and shell ----------
  const floor = U('store-floor', STORE.centerX, 0.21, STORE.centerZ, 1.85, 'rise', { amount: 0.48 });
  addBox(floor, 6.55, 0.14, 5.55, toon(0xd8c4a4), 0, 0, 0, { receiveShadow: true });
  addBox(floor, 6.55, 0.09, 5.55, toon(0x9f9179), 0, -0.1, 0);
  // tile seams
  for (let i = -3; i <= 3; i++) {
    addBox(floor, 0.012, 0.004, 5.42, toon(0x9e8b72), i * 0.82, 0.074, 0, { castShadow: false });
  }
  for (let i = -3; i <= 3; i++) {
    addBox(floor, 6.42, 0.004, 0.012, toon(0x9e8b72), 0, 0.074, i * 0.72, { castShadow: false });
  }
  // main entry step
  addBox(floor, 1.9, 0.1, 0.44, toon(0x8b8c85), 0.2, 0.01, 2.9, { castShadow: false });

  const backWall = U('store-back-wall', STORE.centerX, 1.86, STORE.z0, 1.72, 'rise', { amount: 0.48 });
  const bw = addBox(backWall, 6.82, 3.42, 0.24, cream, 0, 0, 0, { outline: 0.02 });
  addBox(backWall, 6.86, 0.32, 0.32, darkTrim, 0, -1.55, 0.05);
  for (let i = -2; i <= 2; i++) {
    addBox(backWall, 0.02, 3.0, 0.012, creamDim, i * 1.18, 0.22, 0.128, { castShadow: false });
  }
  // rear service door
  addBox(backWall, 0.78, 1.62, 0.05, toon(0x55615c), 2.35, -0.74, 0.15);
  addBox(backWall, 0.64, 1.43, 0.015, toon(0x6e7973), 2.35, -0.73, 0.182);
  addCylinder(backWall, 0.028, 0.028, 0.12, toon(0xc5b58e), 2.62, -0.72, 0.205, { rotation: [0, 0, Math.PI / 2] });
  addBox(backWall, 0.38, 0.18, 0.08, paleGlow, 2.35, 0.2, 0.16);

  const leftWall = U('store-left-wall', STORE.x0, 1.86, STORE.centerZ, 1.77, 'rise', { amount: 0.48 });
  addBox(leftWall, 0.24, 3.42, 5.86, cream, 0, 0, 0, { outline: 0.02 });
  addBox(leftWall, 0.34, 0.34, 5.86, darkTrim, 0.02, -1.54, 0);
  for (let i = -2; i <= 2; i++) {
    addBox(leftWall, 0.012, 3.0, 0.02, creamDim, -0.128, 0.2, i * 1.04, { castShadow: false });
  }
  // small service window on alley wall
  addBox(leftWall, 0.04, 0.48, 0.8, toon(0x405551), 0.132, 0.74, -0.72);
  addBox(leftWall, 0.012, 0.38, 0.7, glowMaterial(0xffd9a0, null, { transparent: true, opacity: 0.45 }), 0.157, 0.74, -0.72);
  // vents / pipes on alley side
  addBox(leftWall, 0.1, 0.16, 0.34, toon(0x6d7772), 0.17, -0.9, -2.0);
  for (let i = 0; i < 4; i++) addBox(leftWall, 0.012, 0.11, 0.26, toon(0x3f4b48), 0.225, -0.95 + i * 0.026, -2.0, { castShadow: false });
  addCylinder(leftWall, 0.035, 0.035, 2.0, toon(0x7c837d), 0.22, -0.16, -2.75, { rotation: [0, 0, 0] });

  // facade base + columns + top beam
  const facade = U('store-facade', STORE.centerX, 1.85, STORE.z1, 1.9, 'rise', { amount: 0.5 });
  addBox(facade, 6.8, 0.34, 0.18, darkTrim, 0, -1.48, 0.04);
  addBox(facade, 6.8, 0.13, 0.34, creamDim, 0, -1.28, 0.08);
  addBox(facade, 6.8, 0.84, 0.2, cream, 0, 1.28, 0.02, { outline: 0.02 });
  addBox(facade, 0.18, 3.34, 0.24, cream, -3.32, 0, 0.02, { outline: 0.018 });
  addBox(facade, 0.18, 3.34, 0.24, cream, 3.32, 0, 0.02, { outline: 0.018 });
  addBox(facade, 0.18, 3.34, 0.24, darkTrim, 3.23, 0, 0.045);
  addBox(facade, 0.18, 3.34, 0.24, darkTrim, -3.23, 0, 0.045);
  // canopy
  addBox(facade, 7.05, 0.11, 1.26, cream, 0, 0.99, 0.69, { outline: 0.014 });
  addBox(facade, 7.05, 0.06, 1.26, darkTrim, 0, 1.055, 0.69);
  addBox(facade, 7.05, 0.22, 0.08, creamDim, 0, 1.0, 1.32);
  for (let i = -2; i <= 2; i++) {
    addBox(facade, 0.78, 0.018, 0.035, warmGlow, i * 1.24, 1.052, 0.42, { castShadow: false, rotation: [-Math.PI / 2, 0, 0] });
  }
  // warm dots along the awning edge, like little eave lamps
  const eaveBulbMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.25, 0.55), toneMapped: false });
  for (let i = -2; i <= 2; i++) {
    addMesh(facade, new THREE.SphereGeometry(0.045, 8, 6), eaveBulbMat, i * 1.28, 0.89, 1.35, { castShadow: false, receiveShadow: false });
  }
  // underside of awning ribbing
  for (let i = -3; i <= 3; i++) {
    addBox(facade, 0.025, 0.02, 1.14, creamDim, i * 1.08, 0.925, 0.7, { castShadow: false });
  }
  // security camera under the eave
  addBox(facade, 0.18, 0.12, 0.16, toon(0xe9e5da), 2.8, 0.82, 0.98);
  addCylinder(facade, 0.055, 0.055, 0.09, toon(0x293330), 2.8, 0.78, 1.08, { rotation: [Math.PI / 2, 0, 0] });
  const led = addBox(facade, 0.018, 0.018, 0.013, glowMaterial(0xff4d3f), 2.85, 0.87, 1.08, { castShadow: false });
  led.userData.blink = true;

  // wall trims / gutters
  addBox(facade, 0.1, 3.65, 0.12, toon(0x6d746e), 3.43, 0.1, 0.05);
  addCylinder(facade, 0.045, 0.045, 3.1, toon(0x727872), 3.43, -0.05, 0.16);

  // roof slab and parapet
  const roof = U('store-roof', STORE.centerX, 3.58, STORE.centerZ, 2.75, 'rise', { amount: 0.42 });
  addBox(roof, 7.22, 0.2, 6.05, toon(0x4b514d), 0, 0, 0, { outline: 0.018 });
  addBox(roof, 7.28, 0.1, 0.11, toon(0x6c7069), 0, 0.16, 2.98);
  addBox(roof, 7.28, 0.1, 0.11, toon(0x6c7069), 0, 0.16, -2.98);
  addBox(roof, 0.11, 0.1, 6.05, toon(0x6c7069), 3.56, 0.16, 0);
  addBox(roof, 0.11, 0.1, 6.05, toon(0x6c7069), -3.56, 0.16, 0);
  // side header closes the facade above the wrap-around glazing
  addBox(roof, 0.18, 0.88, 5.86, cream, 3.42, -0.46, 0, { outline: 0.015 });
  addBox(roof, 0.22, 0.12, 5.92, darkTrim, 3.43, -0.02, 0);
  // shallow side awning over the east windows
  addBox(roof, 0.62, 0.09, 5.5, cream, 3.48, -0.73, 0, { outline: 0.008 });
  addBox(roof, 0.64, 0.055, 5.5, darkTrim, 3.48, -0.675, 0);
  addBox(roof, 0.035, 0.04, 4.9, glowMaterial(0xffdca7), 3.78, -0.76, 0, { castShadow: false });
  for (let i = -2; i <= 2; i++) {
    addBox(roof, 0.02, 0.025, 0.5, creamDim, 3.48 + i * 1.1, -0.84, 0, { castShadow: false });
  }
  // roof access hatch
  addBox(roof, 0.92, 0.16, 0.8, toon(0x71766e), -2.1, 0.17, 0.95);
  addBox(roof, 0.72, 0.1, 0.6, toon(0x85877e), -2.1, 0.28, 0.95);
  // roof AC unit
  const ac = new THREE.Group();
  roof.add(ac);
  ac.position.set(-3.15, 0.3, -1.65);
  addBox(ac, 1.02, 0.62, 0.74, toon(0xdad9cc), 0, 0, 0, { rounded: 0.04, outline: 0.008 });
  addBox(ac, 0.92, 0.09, 0.66, toon(0xa9aaa0), 0, -0.35, 0);
  const fan = addCylinder(ac, 0.22, 0.22, 0.03, toon(0x6d746e), -0.15, 0.02, 0.38, { rotation: [Math.PI / 2, 0, 0] });
  addCylinder(ac, 0.21, 0.21, 0.01, toon(0x313b39), -0.15, 0.02, 0.4, { rotation: [Math.PI / 2, 0, 0] });
  for (let i = 0; i < 7; i++) {
    addBox(ac, 0.025, 0.4, 0.025, toon(0xc3c3b7), -0.5, 0.02, 0.38 + (i - 3) * 0.045, { castShadow: false, rotation: [0, 0, Math.PI / 2] });
  }
  addCylinder(ac, 0.07, 0.07, 0.3, toon(0x9da39c), 0.35, 0.26, 0.37, { rotation: [0, 0, Math.PI / 2] });
  // small vent stack
  addCylinder(roof, 0.06, 0.08, 1.15, toon(0x7e847c), 2.55, 0.62, -1.1);
  addCylinder(roof, 0.1, 0.1, 0.12, toon(0x606963), 2.55, 1.22, -1.1);
  addBox(roof, 0.55, 0.35, 0.5, toon(0x757d75), 2.45, 0.22, 0.7);
  for (let i = 0; i < 4; i++) addBox(roof, 0.54, 0.018, 0.02, toon(0x414b48), 2.45, 0.11 + i * 0.065, 0.955, { castShadow: false });
  // roof railing at rear
  const railMat = toon(0x6e786f);
  for (let i = 0; i < 4; i++) {
    addCylinder(roof, 0.018, 0.018, 0.58, railMat, -2.6 + i * 1.4, 0.31, -2.9);
  }
  addBox(roof, 4.5, 0.035, 0.035, railMat, -0.6, 0.56, -2.9);
  addBox(roof, 4.5, 0.03, 0.03, railMat, -0.6, 0.38, -2.9);

  // ---------- front glazing ----------
  const frontGlass = U('store-front-glass', -3.35, (STORE.glassBottom + STORE.glassTop) / 2, STORE.z1, 2.28, 'rise', { amount: 0.45 });
  const glassTopBand = glowMaterial(0xffe1ae, null, { transparent: true, opacity: 0.22 });
  const fgH = STORE.glassTop - STORE.glassBottom;
  addPlane(frontGlass, 4.62, fgH, glassMaterial, 0, 0, 0, { receiveShadow: false, castShadow: false, renderOrder: 8 });
  addPlane(frontGlass, 4.62, fgH, glassSheenMaterial, 0, 0, 0.006, { receiveShadow: false, castShadow: false, renderOrder: 10 });
  addPlane(frontGlass, 4.62, fgH, glassRainMaterial, 0, 0, 0.012, { receiveShadow: false, castShadow: false, renderOrder: 12 });
  addBox(frontGlass, 4.68, 0.08, 0.1, darkTrim, 0, -fgH / 2 - 0.02, 0.012);
  addBox(frontGlass, 4.68, 0.06, 0.1, darkTrim, 0, fgH / 2 + 0.01, 0.012);
  for (let i = -1; i <= 1; i++) addBox(frontGlass, 0.055, fgH, 0.1, darkTrim, i * 1.54, 0, 0.012);
  addBox(frontGlass, 4.68, 0.035, 0.04, toon(0x7c8c83), 0, -fgH / 2 + 0.04, 0.07);
  // window decal
  labelPlane(frontGlass, assets.windowDecal, 1.95, 0.78, 0.55, 0.58, 0.032, { transparent: true, opacity: 0.8, toneMapped: true });
  // subtle interior side sales posters on glass corners
  labelPlane(frontGlass, assets.atm, 0.72, 0.162, -1.8, -0.68, 0.032, { transparent: false, opacity: 0.9 });
  // a warm, graphic food poster tucked into the left-hand window
  labelPlane(frontGlass, assets.promo, 0.5, 0.7, -1.56, -0.23, 0.038, { toneMapped: true });
  addBox(frontGlass, 0.54, 0.745, 0.012, toon(0xe6dac4), -1.56, -0.23, 0.027, { castShadow: false });
  // canopy edge neon band
  addBox(facade, 6.35, 0.03, 0.022, glowMaterial(0xff9f58, null, { transparent: true, opacity: 0.92 }), 0, 0.968, 1.337, { castShadow: false, receiveShadow: false });
  addBox(facade, 6.35, 0.012, 0.028, glowMaterial(0x9ed3c8, null, { transparent: true, opacity: 0.4 }), 0, 0.936, 1.334, { castShadow: false, receiveShadow: false });

  // side glass
  const sideGlass = U('store-side-glass', STORE.x1, (STORE.glassBottom + STORE.glassTop) / 2, -3.43, 2.36, 'rise', { amount: 0.45 });
  addPlane(sideGlass, 4.45, fgH, glassMaterial, 0, 0, 0, { rotation: [0, Math.PI / 2, 0], receiveShadow: false, castShadow: false, renderOrder: 8 });
  addPlane(sideGlass, 4.45, fgH, glassSheenMaterial, 0.006, 0, 0, { rotation: [0, Math.PI / 2, 0], receiveShadow: false, castShadow: false, renderOrder: 10 });
  addPlane(sideGlass, 4.45, fgH, glassRainMaterial, 0.012, 0, 0, { rotation: [0, Math.PI / 2, 0], receiveShadow: false, castShadow: false, renderOrder: 12 });
  addBox(sideGlass, 0.1, 0.08, 4.5, darkTrim, 0, -fgH / 2 - 0.02, 0);
  addBox(sideGlass, 0.1, 0.06, 4.5, darkTrim, 0, fgH / 2 + 0.01, 0);
  for (let i = -1; i <= 1; i++) addBox(sideGlass, 0.1, fgH, 0.055, darkTrim, 0, 0, i * 1.45);
  addBox(sideGlass, 0.04, 0.035, 4.5, toon(0x7c8c83), 0.07, -fgH / 2 + 0.04, 0);
  labelPlane(sideGlass, assets.copy, 0.62, 0.14, 0.034, 0.74, 1.6, { rotation: [0, Math.PI / 2, 0], opacity: 0.95 });
  // warm snack poster, visible through the side glazing
  const sidePoster = labelPlane(sideGlass, assets.promo, 0.52, 0.78, 0.028, -0.35, 0.9, { rotation: [0, Math.PI / 2, 0], toneMapped: true });
  addBox(sideGlass, 0.02, 0.8, 0.56, toon(0xe7ddc8), -0.022, -0.35, 0.9);

  // automatic doors
  const entry = U('store-entry-doors', -0.2, (STORE.glassBottom + STORE.glassTop) / 2, STORE.z1, 2.48, 'rise', { amount: 0.45 });
  addBox(entry, 1.66, 0.09, 0.2, darkTrim, 0, -fgH / 2 - 0.02, 0);
  addBox(entry, 1.66, 0.08, 0.2, darkTrim, 0, fgH / 2 + 0.02, 0);
  addBox(entry, 0.07, fgH + 0.12, 0.2, darkTrim, -0.78, 0.01, 0);
  addBox(entry, 0.07, fgH + 0.12, 0.2, darkTrim, 0.78, 0.01, 0);
  const doorPanels = [];
  for (const side of [-1, 1]) {
    const c = side * 0.365;
    const panel = new THREE.Group();
    panel.name = side < 0 ? 'store-door-left' : 'store-door-right';
    panel.position.set(c, 0, 0);
    entry.add(panel);
    addPlane(panel, 0.68, fgH - 0.08, glassMaterial, 0, 0, 0, { receiveShadow: false, castShadow: false, renderOrder: 8 });
    addBox(panel, 0.055, fgH - 0.05, 0.07, doorFrameMat, -0.34, 0, 0.03);
    addBox(panel, 0.055, fgH - 0.05, 0.07, doorFrameMat, 0.34, 0, 0.03);
    addBox(panel, 0.68, 0.055, 0.07, doorFrameMat, 0, -fgH / 2 + 0.03, 0.03);
    addBox(panel, 0.68, 0.055, 0.07, doorFrameMat, 0, fgH / 2 - 0.04, 0.03);
    addBox(panel, 0.66, 0.05, 0.07, doorFrameMat, 0, 0.16, 0.03);
    addBox(panel, 0.68, 0.12, 0.08, doorFrameMat, 0, -0.96, 0.03);
    addCylinder(panel, 0.025, 0.025, 0.46, new THREE.MeshStandardMaterial({ color: 0x3e4c45, roughness: 0.3, metalness: 0.65 }), -0.25, -0.02, 0.09);
    addCylinder(panel, 0.025, 0.025, 0.46, new THREE.MeshStandardMaterial({ color: 0x3e4c45, roughness: 0.3, metalness: 0.65 }), 0.25, -0.02, 0.09);
    addBox(panel, 0.72, 0.28, 0.018, glowMaterial(0xeadcc2, null, { transparent: true, opacity: 0.15 }), 0, 0.34, 0.025, { castShadow: false, renderOrder: 9 });
    doorPanels.push({ group: panel, closedX: c, openX: c + side * 0.5 });
  }
  // sliding sensor / door pocket trims
  addBox(entry, 0.11, fgH + 0.05, 0.14, toon(0x2b4a44), -0.86, 0.01, 0.02, { outline: 0.005 });
  addBox(entry, 0.11, fgH + 0.05, 0.14, toon(0x2b4a44), 0.86, 0.01, 0.02, { outline: 0.005 });
  addBox(entry, 0.02, fgH - 0.1, 0.1, toon(0x27453f), 0, 0, 0.04);
  addBox(entry, 0.42, 0.12, 0.08, toon(0x1f3934), 0, fgH / 2 + 0.2, 0.025);
  addBox(entry, 0.06, 0.012, 0.012, glowMaterial(0xff473a), 0.08, fgH / 2 + 0.2, 0.07, { castShadow: false });
  addPlane(entry, 0.96, 0.24, doorStickerMaterial, 0, 0.64, 0.075, { receiveShadow: false, castShadow: false, renderOrder: 13 });
  addPlane(entry, 0.8, fgH - 0.06, glassSheenMaterial, 0, 0, 0.065, { receiveShadow: false, castShadow: false, renderOrder: 11 });
  // small warm welcome lightbox over the sliding doors
  addBox(entry, 1.02, 0.2, 0.055, toon(0x315b52), 0, 0.94, 0.055);
  labelPlane(entry, welcomeTexture, 0.96, 0.18, 0, 0.94, 0.085, { toneMapped: false });
  // ATM marker on the narrow pier to the right of the entrance
  addBox(entry, 0.3, 0.55, 0.045, toon(0x32564f), 0.95, -0.08, 0.03);
  labelPlane(entry, assets.atm, 0.26, 0.46, 0.95, -0.08, 0.058, { toneMapped: false });
  // frosted lower safety bands
  for (const side of [-1, 1]) {
    addBox(entry, 0.63, 0.3, 0.02, new THREE.MeshBasicMaterial({ color: 0xeadfc9, transparent: true, opacity: 0.18, depthWrite: false, toneMapped: true }), side * 0.365, -0.86, 0.05, { castShadow: false, renderOrder: 9 });
  }

  // ---------- main lightbox sign ----------
  const sign = U('store-main-sign', STORE.centerX, STORE.signY, STORE.z1 + 0.03, 3.15, 'rise', { amount: 0.45 });
  addBox(sign, 6.78, 0.84, 0.26, cream, 0, 0, 0, { rounded: 0.06, outline: 0.018 });
  addBox(sign, 6.85, 0.075, 0.32, toon(0x315b53), 0, 0.39, 0);
  addBox(sign, 6.85, 0.05, 0.31, toon(0xcbbd9f), 0, -0.4, 0);
  const signFace = labelPlane(sign, assets.mainSign, 6.64, 0.7, 0, 0.02, 0.132, { toneMapped: false });
  signMaterials.push({ material: signFace.material, base: new THREE.Color(signBaseColor, signBaseColor, signBaseColor) });
  // side light panels
  addBox(sign, 0.02, 0.65, 0.16, glowMaterial(0xffe4b5), 3.4, 0.02, 0.02, { castShadow: false });
  addBox(sign, 0.02, 0.65, 0.16, glowMaterial(0xffe4b5), -3.4, 0.02, 0.02, { castShadow: false });
  // little under light dots
  for (let i = -2; i <= 2; i++) {
    addBox(sign, 0.08, 0.025, 0.03, glowMaterial(0xfff0d0), i * 1.2, -0.45, 0.14, { castShadow: false });
  }

  // vertical blade sign
  const blade = U('store-blade-sign', 1.23, 3.12, -1.06, 3.35, 'rise', { amount: 0.4, radius: 1.0 });
  addBox(blade, 0.12, 2.26, 0.7, cream, 0, 0, 0, { rounded: 0.025, outline: 0.012 });
  addBox(blade, 0.14, 2.3, 0.08, toon(0x315b53), 0, 0, 0.34);
  addBox(blade, 0.14, 2.3, 0.08, toon(0x315b53), 0, 0, -0.34);
  const bladeFaceA = labelPlane(blade, assets.bladeSign, 0.6, 2.06, 0.066, 0, 0, { rotation: [0, Math.PI / 2, 0], toneMapped: false });
  const bladeFaceB = labelPlane(blade, assets.bladeSign, 0.6, 2.06, -0.066, 0, 0, { rotation: [0, -Math.PI / 2, 0], toneMapped: false });
  addBox(blade, 0.08, 0.08, 0.5, toon(0x35413e), -0.22, 0.93, 0);
  addBox(blade, 0.08, 0.08, 0.5, toon(0x35413e), -0.22, -0.93, 0);
  addBox(blade, 0.05, 2.1, 0.05, glowMaterial(0xffe2ad), 0.08, 0, 0.29, { castShadow: false });
  signMaterials.push({ material: bladeFaceA.material, base: new THREE.Color(signBaseColor * 0.95, signBaseColor * 0.95, signBaseColor * 0.95) });
  signMaterials.push({ material: bladeFaceB.material, base: new THREE.Color(signBaseColor * 0.95, signBaseColor * 0.95, signBaseColor * 0.95) });

  // ---------- interior: ceiling and lighting ----------
  const ceiling = U('store-ceiling', STORE.centerX, 2.88, STORE.centerZ, 2.62, 'rise', { amount: 0.45 });
  addBox(ceiling, 6.5, 0.1, 5.45, toon(0xece5d4), 0, 0.06, 0);
  addBox(ceiling, 6.5, 0.07, 0.1, toon(0xcfc5b1), 0, -0.01, -1.6);
  addBox(ceiling, 6.5, 0.07, 0.1, toon(0xcfc5b1), 0, -0.01, 0.8);
  const panelPositions = [];
  for (let ix = -1; ix <= 1; ix++) {
    for (let iz = -1; iz <= 1; iz++) {
      panelPositions.push([ix * 2.0, iz * 1.6]);
      addBox(ceiling, 0.76, 0.03, 0.27, glowMaterial(0xffe9c4), ix * 2.0, -0.075, iz * 1.6, { castShadow: false, receiveShadow: false });
      addBox(ceiling, 0.83, 0.05, 0.33, toon(0xbdb6a5), ix * 2.0, -0.045, iz * 1.6, { castShadow: false });
    }
  }
  // air vents + speaker
  for (let i = 0; i < 6; i++) addBox(ceiling, 0.42, 0.012, 0.035, toon(0xa6a291), 0.7, -0.04, 1.8 - i * 0.07, { castShadow: false });
  addCylinder(ceiling, 0.16, 0.16, 0.04, toon(0xc1bca9), -2.4, -0.02, 2.0);
  addCylinder(ceiling, 0.12, 0.12, 0.02, toon(0x938f82), -2.4, -0.045, 2.0);
  // suspended aisle signs
  const aisle = U('store-aisle-signs', 0, 0, 0, 3.72, 'fly', { radius: 1.6, lift: 1.1, duration: 1.0 });
  const aisleData = [
    [-4.2, 2.28, -3.1, assets.bento, 1.02],
    [-2.6, 2.24, -3.8, assets.sweets, 0.8],
    [-1.1, 2.31, -2.7, assets.hot, 0.92],
  ];
  for (const [x, y, z, tex, w] of aisleData) {
    addCylinder(aisle, 0.012, 0.012, 0.58, toon(0x726f62), x - 0.35, y + 0.3, z, { castShadow: false });
    addCylinder(aisle, 0.012, 0.012, 0.58, toon(0x726f62), x + 0.35, y + 0.3, z, { castShadow: false });
    addBox(aisle, 0.82, 0.24, 0.04, toon(0xf2e8d2), x, y, z);
    labelPlane(aisle, tex, 0.78, 0.205, x, y, z + 0.024, { toneMapped: true });
    labelPlane(aisle, tex, 0.78, 0.205, x, y, z - 0.024, { rotation: [0, Math.PI, 0], toneMapped: true });
  }

  // ---------- refrigerators ----------
  const fridge = U('store-fridge-bank', -3.12, 1.48, -6.09, 2.95, 'fly', { radius: 2.4, lift: 0.7, duration: 1.1 });
  const bankW = 4.62;
  const bankH = 2.48;
  // Open-fronted refrigerated cabinet: a shallow carcass rather than a solid block,
  // so the lit drinks and shelves remain visible through the glass doors.
  addBox(fridge, bankW + 0.04, 0.1, 0.66, toon(0x284b45), 0, 1.17, 0);
  addBox(fridge, bankW + 0.06, 0.13, 0.69, toon(0x223f3b), 0, -1.2, 0);
  addBox(fridge, 0.09, 2.38, 0.62, toon(0x32564f), -bankW / 2 + 0.045, -0.01, 0);
  addBox(fridge, 0.09, 2.38, 0.62, toon(0x32564f), bankW / 2 - 0.045, -0.01, 0);
  addBox(fridge, bankW, 2.3, 0.055, toon(0x213f3b), 0, -0.02, -0.29);
  addBox(fridge, bankW + 0.03, 0.26, 0.05, toon(0xf2e8d2), 0, 1.14, 0.33);
  addBox(fridge, bankW, 0.06, 0.08, glowMaterial(0xcdf3ff), 0, 1.02, 0.34, { castShadow: false });
  labelPlane(fridge, assets.drinks, 1.15, 0.22, -1.2, 1.14, 0.358, { toneMapped: true });
  labelPlane(fridge, assets.drinks, 1.15, 0.22, 1.2, 1.14, 0.358, { toneMapped: true });
  const drinkSpecs = [];
  const coldColors = [0xe4492f, 0x2d75b0, 0xdca62d, 0x2d8960, 0xd34a6f, 0x7eaaba, 0x744179, 0xe36b2f, 0x3d6d43, 0xbf3434];
  for (let i = 0; i < 5; i++) {
    const cx = -1.82 + i * 0.91;
    addBox(fridge, 0.07, 2.18, 0.16, toon(0xd3d8ce), cx - 0.42, -0.04, 0.32);
    addBox(fridge, 0.07, 2.18, 0.16, toon(0xd3d8ce), cx + 0.42, -0.04, 0.32);
    addBox(fridge, 0.84, 0.075, 0.17, toon(0xd3d8ce), cx, 1.03, 0.32);
    addBox(fridge, 0.84, 0.06, 0.17, toon(0xb7bfb6), cx, -1.08, 0.32);
    addPlane(fridge, 0.8, 2.0, glowMaterial(0xe8fbff, null, { transparent: true, opacity: 0.72 }), cx, -0.02, -0.2, { receiveShadow: false, castShadow: false });
    addBox(fridge, 0.78, 0.018, 0.05, glowMaterial(0xcdf2ff, null, { transparent: true, opacity: 0.7 }), cx, 0.99, 0.23, { castShadow: false });
    for (let shelf = 0; shelf < 4; shelf++) {
      const sy = -0.84 + shelf * 0.52;
      addBox(fridge, 0.82, 0.025, 0.49, toon(0xd5cfbf), cx, sy, 0.015, { castShadow: false });
      addBox(fridge, 0.82, 0.018, 0.015, toon(0xa9b1a3), cx, sy - 0.018, 0.25, { castShadow: false });
      for (let col = 0; col < 5; col++) {
        const px = cx - 0.29 + col * 0.145;
        drinkSpecs.push({
          x: px, y: sy + 0.095, z: 0.08,
          r: 0.042, h: 0.18 + (col % 2) * 0.015,
          color: coldColors[(i * 5 + shelf * 3 + col) % coldColors.length],
        });
      }
    }
    // sliding glass door and handle
    addPlane(fridge, 0.82, 2.06, glassMaterial, cx, -0.01, 0.39, { receiveShadow: false, castShadow: false, renderOrder: 8 });
    addBox(fridge, 0.055, 2.06, 0.045, toon(0x556b64), cx + 0.37, -0.01, 0.415);
    addCylinder(fridge, 0.018, 0.018, 0.52, toon(0x52645f), cx + 0.31, -0.12, 0.455);
    addBox(fridge, 0.01, 0.18, 0.015, glowMaterial(0xaee9f3, null, { transparent: true, opacity: 0.6 }), cx - 0.25, 0.7, 0.43, { castShadow: false });
  }
  addInstancedDrinks(fridge, drinkSpecs);
  // little price rails
  for (let i = 0; i < 5; i++) {
    addBox(fridge, 0.82, 0.03, 0.015, toon(0xf5ead5), -1.82 + i * 0.91, -1.09, 0.4, { castShadow: false });
  }

  // ---------- shelf islands ----------
  function shelfIsland(name, x, z, length, delay, opts = {}) {
    const g = U(name, x, STORE.floorY, z, delay, 'fly', { radius: 2.5, lift: 0.7, duration: 1.03 });
    const depth = 0.86;
    addBox(g, length, 0.12, depth, toon(0x9c8d73), 0, 0.06, 0);
    addBox(g, length - 0.08, 0.04, depth - 0.08, toon(0xdfd5c2), 0, 0.14, 0);
    const shelfHeights = [0.35, 0.74, 1.12, 1.5];
    for (let sh = 0; sh < shelfHeights.length; sh++) {
      const sy = shelfHeights[sh];
      addBox(g, length, 0.045, depth, toon(0xe6ddcc), 0, sy, 0, { castShadow: true });
      addBox(g, length + 0.02, 0.028, 0.035, toon(0xc9bda7), 0, sy - 0.038, depth / 2 + 0.005, { castShadow: false });
      addBox(g, length + 0.02, 0.028, 0.035, toon(0xc9bda7), 0, sy - 0.038, -depth / 2 - 0.005, { castShadow: false });
      const glowL = addBox(g, length - 0.2, 0.014, 0.018, glowMaterial(0xffd9a1, null, { transparent: true, opacity: 0.55 }), 0, sy - 0.035, depth / 2 + 0.028, { castShadow: false });
      glowL.receiveShadow = false;
    }
    addBox(g, 0.05, 1.5, depth + 0.035, toon(0x2f5c50), -length / 2 + 0.025, 0.77, 0, { outline: 0.006 });
    addBox(g, 0.05, 1.5, depth + 0.035, toon(0x2f5c50), length / 2 - 0.025, 0.77, 0, { outline: 0.006 });
    addBox(g, length + 0.06, 0.1, 0.06, toon(0x2f5c50), 0, 1.55, 0);
    // category boards at the ends
    const endColor = opts.endColor || 0xd77a50;
    addBox(g, 0.62, 0.28, 0.025, toon(endColor), -length / 2 + 0.45, 1.34, depth / 2 + 0.015, { castShadow: false });
    addBox(g, 0.62, 0.28, 0.025, toon(0x3f7a69), length / 2 - 0.45, 1.34, depth / 2 + 0.015, { castShadow: false });
    const products = [];
    const palette = opts.palette || [0xd25235, 0xdda72c, 0x4b8560, 0x81b7a4, 0xc4454e, 0x4a7696, 0xead9b2, 0x88617e, 0x3f735a, 0xdb7b92, 0x4c8ba1, 0xe0ac62];
    for (let sh = 0; sh < shelfHeights.length - 1; sh++) {
      for (const side of [-1, 1]) {
        const rowY = shelfHeights[sh] + 0.112;
        const count = Math.floor((length - 0.3) / 0.165);
        for (let i = 0; i < count; i++) {
          const px = -length / 2 + 0.23 + i * 0.165 + (Math.random() - 0.5) * 0.02;
          const pz = side * (depth * 0.255) + (Math.random() - 0.5) * 0.02;
          const hh = 0.16 + Math.random() * 0.07;
          products.push({
            x: px, y: rowY - (0.2 - hh) * 0.5, z: pz,
            w: 0.105 + Math.random() * 0.025, h: hh, d: 0.1,
            ry: (Math.random() - 0.5) * 0.16,
            color: palette[Math.floor(Math.random() * palette.length)],
          });
        }
      }
      // top display row / small price cards
      for (let i = 0; i < Math.floor(length / 0.4); i++) {
        addBox(g, 0.13, 0.055, 0.01, toon(0xf3e8d3), -length / 2 + 0.28 + i * 0.4, shelfHeights[sh] - 0.15, depth / 2 + 0.035, { castShadow: false });
      }
    }
    // a few products on top, leaving the ends for a cup-noodle display
    const topCount = Math.floor(length / 0.28);
    for (let i = 2; i < topCount - 2; i++) {
      products.push({
        x: -length / 2 + 0.22 + i * 0.28, y: 1.58, z: (Math.random() - 0.5) * 0.26,
        w: 0.17, h: 0.13, d: 0.14, ry: Math.random() * 0.3, color: palette[(i + 2) % palette.length],
      });
    }
    addInstancedBoxes(g, products);
    const cupColors = [0xd34b3e, 0xe1c15c, 0x3f7d63, 0xd88347];
    for (let i = 0; i < 3; i++) {
      makeCupNoodle(g, -length / 2 + 0.35 + i * 0.2, 1.6, 0.22, cupColors[i % cupColors.length]);
      makeCupNoodle(g, length / 2 - 0.35 - i * 0.2, 1.6, 0.22, cupColors[(i + 1) % cupColors.length]);
    }
    return g;
  }

  shelfIsland('store-shelf-a', -2.68, -4.42, 4.32, 3.04, { endColor: 0xd8784f });
  shelfIsland('store-shelf-b', -1.56, -2.97, 2.72, 3.18, { endColor: 0x487d6c, palette: [0xd9a52f, 0xcf6641, 0x6c9e7d, 0xe8d5af, 0x507f9b, 0xa95457, 0x447c68] });

  // ---------- counter ----------
  const counter = U('store-counter', -4.5, STORE.floorY, -1.52, 3.24, 'fly', { radius: 2.2, lift: 0.65, duration: 1.05 });
  const counterWood = toon(0x31564f);
  const counterTop = toon(0xe5d7bd);
  addBox(counter, 1.92, 0.86, 0.58, counterWood, 0.0, 0.47, 0);
  addBox(counter, 0.56, 0.86, 1.48, counterWood, -0.68, 0.47, -0.88);
  addBox(counter, 2.02, 0.09, 0.66, counterTop, 0.0, 0.94, 0);
  addBox(counter, 0.66, 0.09, 1.58, counterTop, -0.68, 0.94, -0.88);
  addBox(counter, 0.05, 0.68, 0.06, toon(0x1e3d38), 0.0, 0.5, 0.302);
  addBox(counter, 1.62, 0.22, 0.02, toon(0x496c60), 0.0, 0.68, 0.303);
  addBox(counter, 0.06, 0.76, 0.06, toon(0x1e3d38), 0.72, 0.49, 0.30);
  // register
  addBox(counter, 0.27, 0.09, 0.31, toon(0x38433e), -0.18, 1.03, -0.03);
  addBox(counter, 0.24, 0.2, 0.025, toon(0x505a54), -0.18, 1.16, -0.02, { rotation: [-0.16, 0, 0] });
  addBox(counter, 0.18, 0.12, 0.01, glowMaterial(0xc9e4bb), -0.18, 1.16, -0.005, { castShadow: false, rotation: [-0.16, 0, 0] });
  addBox(counter, 0.14, 0.018, 0.09, toon(0xe0d1b4), -0.18, 1.12, 0.15);
  addBox(counter, 0.1, 0.07, 0.09, toon(0x263c38), 0.16, 1.01, 0.08);
  addBox(counter, 0.08, 0.12, 0.02, glowMaterial(0x9fc7aa), 0.16, 1.08, 0.13, { castShadow: false });
  // card reader
  addBox(counter, 0.14, 0.06, 0.12, toon(0x282f2b), 0.06, 1.08, 0.13);
  addBox(counter, 0.1, 0.018, 0.06, glowMaterial(0x8fd0a7), 0.06, 1.115, 0.13, { castShadow: false });
  // hot warmer
  const warmer = new THREE.Group();
  warmer.position.set(-0.67, 1.0, 0.03);
  counter.add(warmer);
  addBox(warmer, 0.54, 0.09, 0.44, toon(0x403c35), 0, 0.05, 0);
  addBox(warmer, 0.54, 0.42, 0.44, new THREE.MeshPhysicalMaterial({ color: 0xc8d5ca, roughness: 0.1, transparent: true, opacity: 0.28, depthWrite: false }), 0, 0.32, 0, { castShadow: false });
  addBox(warmer, 0.46, 0.09, 0.36, glowMaterial(0xffb45d), 0, 0.13, 0);
  for (let i = 0; i < 5; i++) {
    addCylinder(warmer, 0.055, 0.04, 0.07, toon(0xd9903f), -0.16 + i * 0.08, 0.2 + (i % 2) * 0.03, (i % 2 ? 0.04 : -0.02));
  }
  addBox(warmer, 0.54, 0.02, 0.44, toon(0xd6c7ae), 0, 0.51, 0);
  addBox(warmer, 0.5, 0.05, 0.38, glowMaterial(0xffc475), 0, 0.55, 0, { castShadow: false });
  // coffee machine
  const coffee = new THREE.Group();
  coffee.position.set(0.63, 1.0, -0.02);
  counter.add(coffee);
  addBox(coffee, 0.38, 0.62, 0.36, toon(0x2f3531), 0, 0.36, 0, { rounded: 0.025, outline: 0.005 });
  addBox(coffee, 0.28, 0.2, 0.02, glowMaterial(0x87c0a3), 0, 0.54, 0.19, { castShadow: false });
  addBox(coffee, 0.16, 0.12, 0.1, toon(0x1d2220), 0, 0.16, 0.22);
  addCylinder(coffee, 0.022, 0.022, 0.12, toon(0xb8b0a0), 0, 0.11, 0.25);
  addCylinder(coffee, 0.06, 0.05, 0.08, toon(0xe4ddcd), 0, 0.06, 0.26);
  addBox(coffee, 0.12, 0.04, 0.06, toon(0xd3c5ad), 0, 0.43, 0.24);
  // cups
  for (let i = 0; i < 3; i++) addCylinder(counter, 0.055, 0.045, 0.1, toon(0xf0e8d7), 0.28 + i * 0.045, 1.03, -0.06);
  // clipboard and little plant
  addBox(counter, 0.23, 0.012, 0.3, toon(0xdbc9a7), -0.5, 1.0, -0.26, { rotation: [0, 0.16, 0] });
  addCylinder(counter, 0.09, 0.075, 0.16, toon(0xb08d66), 0.76, 1.04, 0.2);
  addCylinder(counter, 0.025, 0.025, 0.3, toon(0x4f7759), 0.76, 1.2, 0.2);
  for (let i = 0; i < 5; i++) {
    addBox(counter, 0.18, 0.015, 0.08, toon(0x547c5d), 0.76 + (i - 2) * 0.06, 1.26 + (i % 2) * 0.06, 0.2, { rotation: [0, i * 0.9, 0.2] });
  }
  // pendant lamp above counter
  addCylinder(counter, 0.012, 0.012, 0.85, toon(0x4b4b43), 0, 2.3, 0.02);
  addCylinder(counter, 0.18, 0.06, 0.2, toon(0x2f5149), 0, 1.9, 0.02, { openEnded: true });
  addCylinder(counter, 0.11, 0.11, 0.03, glowMaterial(0xffd79b), 0, 1.8, 0.02, { castShadow: false });

  // ---------- cigarette wall / back counter ----------
  const smokeWall = U('store-back-counter', -5.57, 1.44, -2.33, 3.4, 'fly', { radius: 1.6, lift: 0.7, duration: 0.95 });
  addBox(smokeWall, 0.28, 1.8, 1.82, toon(0x3b5e56), 0, 0, 0);
  addBox(smokeWall, 0.06, 1.55, 1.66, glowMaterial(0xffe8c0, null, { transparent: true, opacity: 0.8 }), 0.15, -0.01, 0, { castShadow: false });
  const packs = [];
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 6; col++) {
      packs.push({
        x: 0.17, y: -0.62 + row * 0.19, z: -0.67 + col * 0.265,
        w: 0.025, h: 0.13, d: 0.17,
        color: [0xd9d4c3, 0xe7d7a9, 0xbe6957, 0x668394, 0xeadfc7, 0x9ca88c][(row + col * 2) % 6],
      });
    }
  }
  addInstancedBoxes(smokeWall, packs);
  addPlane(smokeWall, 0.02, 1.54, new THREE.MeshPhysicalMaterial({ color: 0xc8d8cf, transparent: true, opacity: 0.16, roughness: 0.04, depthWrite: false, side: THREE.DoubleSide }), 0.18, -0.02, 0, { rotation: [0, Math.PI / 2, 0], receiveShadow: false, castShadow: false });
  for (let i = 0; i < 6; i++) addBox(smokeWall, 0.02, 0.025, 1.62, toon(0x9d9b8d), 0.2, -0.68 + i * 0.19, 0, { castShadow: false });
  addBox(smokeWall, 0.04, 0.02, 1.72, glowMaterial(0xffd899), 0.2, 0.88, 0, { castShadow: false });
  labelPlane(smokeWall, assets.hot, 0.7, 0.16, 0.19, 0.99, 0.12, { rotation: [0, Math.PI / 2, 0], toneMapped: true });
  // wall menu board / poster
  labelPlane(smokeWall, assets.promo, 0.78, 1.1, 0.18, 0.38, 1.18, { rotation: [0, Math.PI / 2, 0], toneMapped: true });

  // ---------- magazine rack and baskets ----------
  const mags = U('store-magazines', 0.46, STORE.floorY, -2.24, 3.58, 'fly', { radius: 1.8, lift: 0.65, duration: 0.95 });
  addBox(mags, 0.32, 1.24, 1.44, toon(0x40635b), 0, 0.62, 0);
  addBox(mags, 0.2, 0.08, 1.36, toon(0xe2d7c2), 0, 1.25, 0);
  for (let row = 0; row < 3; row++) {
    const y = 0.15 + row * 0.39;
    addBox(mags, 0.25, 0.035, 1.35, toon(0xe9dfcc), 0.03, y, 0, { castShadow: false });
    for (let i = 0; i < 4; i++) {
      const tex = assets.magazines[(row * 4 + i) % assets.magazines.length];
      const mat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: true });
      const p = addPlane(mags, 0.24, 0.32, mat, 0.16, y + 0.2, -0.48 + i * 0.32, { rotation: [0, Math.PI / 2, -0.045], castShadow: false, receiveShadow: true });
      p.renderOrder = 2;
    }
  }
  addBox(mags, 0.07, 0.06, 1.42, toon(0xd7cbb6), 0.16, 0.72, 0, { castShadow: false });
  addBox(mags, 0.07, 0.06, 1.42, toon(0xd7cbb6), 0.16, 0.33, 0, { castShadow: false });

  const baskets = U('store-baskets', -1.35, STORE.floorY + 0.02, -1.02, 3.92, 'fly', { radius: 1.4, lift: 0.55, duration: 0.85 });
  for (let i = 0; i < 4; i++) {
    addBox(baskets, 0.44, 0.22, 0.32, toon(i % 2 === 0 ? 0xc85442 : 0xd8944f), 0, 0.1 + i * 0.115, 0, { rounded: 0.025 });
    addCylinder(baskets, 0.012, 0.012, 0.34, toon(0x313c38), 0, 0.24 + i * 0.115, -0.11, { rotation: [0, 0, Math.PI / 2] });
    addCylinder(baskets, 0.012, 0.012, 0.34, toon(0x313c38), 0, 0.24 + i * 0.115, 0.11, { rotation: [0, 0, Math.PI / 2] });
  }
  addBox(baskets, 0.36, 0.02, 0.065, toon(0xf1e2c4), 0, 0.56, -0.05);
  // a small stack of warm takeaway cups near the entrance
  for (let i = 0; i < 3; i++) {
    addCylinder(baskets, 0.07, 0.055, 0.13, toon(0xf1e8d7), 0.48 + i * 0.02, 0.07 + i * 0.08, -0.17, { segments: 12 });
    addCylinder(baskets, 0.072, 0.072, 0.025, toon(0xcc754f), 0.48 + i * 0.02, 0.13 + i * 0.08, -0.17, { segments: 12 });
  }

  // small interior entrance greenery
  const plant = U('store-plant', 0.65, STORE.floorY, -0.99, 3.75, 'fly', { radius: 1.1, lift: 0.45, duration: 0.8 });
  addCylinder(plant, 0.16, 0.12, 0.3, toon(0x8f7458), 0, 0.15, 0);
  addCylinder(plant, 0.04, 0.045, 0.5, toon(0x566f4c), 0, 0.48, 0);
  for (let i = 0; i < 7; i++) {
    addBox(plant, 0.23, 0.02, 0.12, toon(0x5d805d), Math.sin(i * 2.1) * 0.14, 0.56 + i * 0.045, Math.cos(i * 2.1) * 0.09, { rotation: [0.1, i * 0.8, 0.1 + Math.sin(i) * 0.18] });
  }
  addContactShadow(plant, 0, 0.008, 0, 0.5, 0.5, 0.25);

  // ---------- warm interior lights ----------
  const lights = [];
  const lightSpecs = [
    [-4.1, 2.42, -3.9, 10.3, 0xffb468, 7.0],
    [-1.9, 2.42, -3.4, 12.3, 0xffc57e, 7.2],
    [-0.5, 2.35, -1.8, 7.0, 0xffc487, 5.0],
    [-3.9, 1.55, -1.35, 3.7, 0xffa65f, 3.6],
    [-2.4, 2.1, -1.15, 6.2, 0xffbf7c, 4.4],
  ];
  for (const [x, y, z, intensity, color, dist] of lightSpecs) {
    const l = new THREE.PointLight(color, intensity, dist, 1.7);
    l.position.set(x, y, z);
    l.castShadow = false;
    root.add(l);
    lights.push({ light: l, intensity });
  }
  const spill = new THREE.PointLight(0xffa95e, 8.5, 5.5, 1.8);
  spill.position.set(-0.4, 2.6, -0.2);
  spill.castShadow = false;
  root.add(spill);
  lights.push({ light: spill, intensity: 8.0 });

  // fake warm room fill planes to help the glass read warm
  const fill = new THREE.Mesh(new THREE.PlaneGeometry(6.1, 2.3), new THREE.MeshBasicMaterial({ color: 0xffe6bd, transparent: true, opacity: 0.06, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false }));
  fill.position.set(-2.5, 1.55, -0.79);
  root.add(fill);

  return {
    signMaterials,
    fillGlow: fill.material,
    glassRainTexture,
    glassMaterial,
    glassRainMaterial,
    doors: doorPanels,
    entry,
    lights,
    blinkLED: led,
    storeWindowLights: panelPositions,
    signFace,
    bladeFaces: [bladeFaceA, bladeFaceB],
  };
}
