import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import {
  asphaltTexture, sidewalkTexture, tactileTexture, mainSignTexture, bladeSignTexture,
  vendingTexture, windowDecalTexture, bulletinTexture, promoPosterTexture, magazineTexture,
  neonSignTexture, streetNameTexture, stopTexture, parkingTexture, matTexture, manholeTexture,
  puddleReflectionTexture, plaqueTexture, shopSignSmallTexture,
} from './textures.js';

export const PALETTE = {
  ink: 0x18232b,
  night: 0x0a141d,
  asphalt: 0x333b44,
  sidewalk: 0xb7b2a5,
  curb: 0xc7c1b1,
  storeCream: 0xf1e7d2,
  storeTrim: 0x244b46,
  storeGreen: 0x3f7c68,
  storeOrange: 0xd9754b,
  storeTeal: 0x3e7e87,
  warmWhite: 0xfff2d8,
  warmLight: 0xffcf92,
  coolLight: 0xaed8e5,
  glass: 0xb9dce0,
  shelf: 0xe9e2d2,
  shelfBack: 0xd9d2c2,
  counter: 0x31554f,
  counterTop: 0xe7dcc6,
  roof: 0x4a5350,
};

let gradientMap = null;

export function initRenderingAssets() {
  if (gradientMap) return;
  const steps = new Uint8Array([42, 86, 132, 188, 236, 255]);
  gradientMap = new THREE.DataTexture(steps, steps.length, 1, THREE.RedFormat);
  gradientMap.minFilter = THREE.NearestFilter;
  gradientMap.magFilter = THREE.NearestFilter;
  gradientMap.generateMipmaps = false;
  gradientMap.needsUpdate = true;
}

const toonCache = new Map();

export function toon(color, opts = {}) {
  const key = color + '|' + JSON.stringify(opts);
  if (toonCache.has(key)) return toonCache.get(key);
  const mat = new THREE.MeshToonMaterial({
    color,
    gradientMap,
    ...opts,
  });
  toonCache.set(key, mat);
  return mat;
}

export function physical(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.48,
    metalness: 0.05,
    ...opts,
  });
}

export function glowMaterial(color = 0xffffff, map = null, opts = {}) {
  return new THREE.MeshBasicMaterial({
    color,
    map,
    toneMapped: false,
    ...opts,
  });
}

const outlineMaterials = new Map();
function outlineMaterial(thickness, color = 0x101820) {
  const key = thickness + '|' + color;
  if (outlineMaterials.has(key)) return outlineMaterials.get(key);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uThickness: { value: thickness },
    },
    vertexShader: 'uniform float uThickness; void main(){ vec3 p = position + normalize(normal) * uThickness; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }',
    fragmentShader: 'uniform vec3 uColor; void main(){ gl_FragColor = vec4(uColor, 1.0); }',
    side: THREE.BackSide,
  });
  outlineMaterials.set(key, mat);
  return mat;
}

export function addOutline(mesh, thickness = 0.012) {
  const outline = new THREE.Mesh(mesh.geometry, outlineMaterial(thickness));
  outline.position.copy(mesh.position);
  outline.quaternion.copy(mesh.quaternion);
  outline.scale.copy(mesh.scale);
  outline.name = 'outline';
  outline.castShadow = false;
  outline.receiveShadow = false;
  mesh.parent.add(outline);
  return outline;
}

export function addMesh(parent, geometry, material, x = 0, y = 0, z = 0, opts = {}) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  if (opts.rotation) mesh.rotation.set(opts.rotation[0], opts.rotation[1], opts.rotation[2]);
  mesh.castShadow = opts.castShadow !== false;
  mesh.receiveShadow = opts.receiveShadow !== false;
  if (opts.renderOrder !== undefined) mesh.renderOrder = opts.renderOrder;
  parent.add(mesh);
  return mesh;
}

export function addBox(parent, w, h, d, material, x = 0, y = 0, z = 0, opts = {}) {
  const geo = opts.rounded
    ? new RoundedBoxGeometry(w, h, d, opts.segments || 2, opts.rounded === true ? 0.035 : opts.rounded)
    : new THREE.BoxGeometry(w, h, d);
  const mesh = addMesh(parent, geo, typeof material === 'number' ? toon(material) : material, x, y, z, opts);
  if (opts.outline) addOutline(mesh, opts.outline === true ? 0.012 : opts.outline);
  return mesh;
}

export function addCylinder(parent, rTop, rBottom, h, material, x = 0, y = 0, z = 0, opts = {}) {
  const geo = new THREE.CylinderGeometry(rTop, rBottom, h, opts.segments || 12, 1, opts.openEnded || false);
  return addMesh(parent, geo, typeof material === 'number' ? toon(material) : material, x, y, z, opts);
}

export function addPlane(parent, w, h, material, x, y, z, opts = {}) {
  const geo = new THREE.PlaneGeometry(w, h, opts.segX || 1, opts.segY || 1);
  const mesh = addMesh(parent, geo, material, x, y, z, opts);
  return mesh;
}

export function labelPlane(parent, texture, w, h, x, y, z, opts = {}) {
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: opts.transparent || false,
    alphaTest: opts.transparent ? 0.02 : 0,
    toneMapped: opts.toneMapped === undefined ? false : opts.toneMapped,
    side: opts.side || THREE.FrontSide,
    depthWrite: opts.depthWrite === undefined ? true : opts.depthWrite,
    opacity: opts.opacity === undefined ? 1 : opts.opacity,
    blending: opts.blending || THREE.NormalBlending,
  });
  const p = addPlane(parent, w, h, mat, x, y, z, {
    rotation: opts.rotation,
    castShadow: false,
    receiveShadow: false,
    renderOrder: opts.renderOrder,
  });
  return p;
}

export class Assembly {
  constructor() {
    this.units = [];
    this.startTime = 0;
  }

  register(object, delay, mode = 'fly', opts = {}) {
    const finalPosition = object.position.clone();
    const finalRotation = object.rotation.clone();
    const finalScale = object.scale.clone();
    const seed = Math.random() * 1000;
    const angle = Math.random() * Math.PI * 2;
    const radius = (opts.radius === undefined ? 3.2 : opts.radius) * (0.55 + Math.random() * 0.7);
    const lift = opts.lift === undefined ? 0.9 : opts.lift;
    let startPosition = finalPosition.clone();
    if (mode === 'rise') {
      startPosition.y = -0.8 - Math.random() * 1.4;
      startPosition.x += (Math.random() - 0.5) * 0.3;
      startPosition.z += (Math.random() - 0.5) * 0.3;
    } else if (mode === 'drop') {
      startPosition.y += 2.5 + Math.random() * 1.8;
      startPosition.x += (Math.random() - 0.5) * 0.6;
      startPosition.z += (Math.random() - 0.5) * 0.6;
    } else {
      startPosition.x += Math.cos(angle) * radius;
      startPosition.z += Math.sin(angle) * radius;
      startPosition.y += lift + Math.random() * 2.0;
    }
    const spin = mode === 'rise' ? (Math.random() - 0.5) * 0.25 : (Math.random() - 0.5) * 1.2;
    const duration = opts.duration === undefined ? 0.95 : opts.duration;
    object.visible = false;
    this.units.push({
      object, finalPosition, finalRotation, finalScale,
      startPosition, startRotation: new THREE.Euler(finalRotation.x, finalRotation.y + spin, finalRotation.z + spin * 0.24),
      delay, duration, mode, seed,
      amount: opts.amount === undefined ? 0.55 : opts.amount,
      elastic: opts.elastic === undefined ? true : opts.elastic,
    });
  }

  update(t) {
    for (const unit of this.units) {
      const lt = t - unit.delay;
      if (lt < 0) {
        unit.object.visible = false;
        continue;
      }
      unit.object.visible = true;
      const pr = Math.min(1, lt / unit.duration);
      const reveal = Math.min(1, lt / (unit.duration * unit.amount));
      const posEase = easeOutCubic(pr);
      unit.object.position.lerpVectors(unit.startPosition, unit.finalPosition, posEase);
      if (posEase > 0.92) unit.object.position.copy(unit.finalPosition);
      const rp = easeOutCubic(Math.min(1, lt / (unit.duration * 0.85)));
      unit.object.rotation.set(
        THREE.MathUtils.lerp(unit.startRotation.x, unit.finalRotation.x, rp),
        THREE.MathUtils.lerp(unit.startRotation.y, unit.finalRotation.y, rp),
        THREE.MathUtils.lerp(unit.startRotation.z, unit.finalRotation.z, rp),
      );
      let scaleEase = unit.elastic ? easeOutBack(reveal) : easeOutCubic(reveal);
      scaleEase = Math.max(0.001, scaleEase);
      unit.object.scale.set(
        unit.finalScale.x * scaleEase,
        unit.finalScale.y * scaleEase,
        unit.finalScale.z * scaleEase,
      );
      if (pr >= 1) {
        unit.object.position.copy(unit.finalPosition);
        unit.object.rotation.copy(unit.finalRotation);
        unit.object.scale.copy(unit.finalScale);
      }
    }
  }
}

export function easeOutCubic(t) {
  const u = 1 - Math.min(1, Math.max(0, t));
  return 1 - u * u * u;
}

export function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export function smoothstep(t) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

export function createAssets() {
  return {
    asphalt: asphaltTexture(),
    sidewalk: sidewalkTexture(),
    tactile: tactileTexture(),
    mainSign: mainSignTexture(),
    bladeSign: bladeSignTexture(),
    vending: vendingTexture(),
    windowDecal: windowDecalTexture(),
    bulletin: bulletinTexture(),
    promo: promoPosterTexture(),
    magazines: Array.from({ length: 6 }, (_, i) => magazineTexture(i)),
    neon: neonSignTexture(),
    streetName: streetNameTexture(),
    stop: stopTexture(),
    parking: parkingTexture(),
    mat: matTexture(),
    manhole: manholeTexture(),
    puddleReflection: puddleReflectionTexture(),
    plaque: plaqueTexture(),
    atm: shopSignSmallTexture('ATM', 'CASH SERVICE'),
    copy: shopSignSmallTexture('コピー', 'MULTI COPY'),
    delivery: shopSignSmallTexture('宅配便', 'DELIVERY'),
    drinks: shopSignSmallTexture('DRINK', 'COLD BEVERAGE'),
    hot: shopSignSmallTexture('HOT SNACK', 'FRIED & WARM'),
    sweets: shopSignSmallTexture('SWEETS', 'SWEET TIME'),
    bento: shopSignSmallTexture('おにぎり・お弁当', 'RICE & BENTO'),
    storeHours: shopSignSmallTexture('24', 'OPEN EVERY DAY'),
  };
}

let contactTexture = null;
export function contactShadowMaterial(opacity = 0.42) {
  if (!contactTexture) {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(128, 128, 17, 128, 128, 124);
    g.addColorStop(0, 'rgba(0,0,0,0.9)');
    g.addColorStop(0.48, 'rgba(0,0,0,0.5)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    contactTexture = new THREE.CanvasTexture(c);
  }
  return new THREE.MeshBasicMaterial({
    map: contactTexture,
    transparent: true,
    opacity,
    depthWrite: false,
    toneMapped: false,
    color: 0x071018,
    blending: THREE.NormalBlending,
  });
}

export function addContactShadow(parent, x, y, z, w, d, opacity = 0.42, rotY = 0) {
  const p = addPlane(parent, w, d, contactShadowMaterial(opacity), x, y, z, {
    rotation: [-Math.PI / 2, 0, rotY],
    castShadow: false,
    receiveShadow: false,
    renderOrder: 3,
  });
  p.renderOrder = 3;
  return p;
}

export function makeRadialGlowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.7)');
  g.addColorStop(0.62, 'rgba(255,255,255,0.18)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function makeGlowSprite(color, scale, opacity = 0.5, texture = null) {
  const mat = new THREE.SpriteMaterial({
    map: texture || makeRadialGlowTexture(),
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
  const s = new THREE.Sprite(mat);
  s.scale.set(scale, scale, 1);
  return s;
}

export function tubeBetween(parent, start, end, radius, material, segments = 12) {
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const dir = end.clone().sub(start);
  const len = dir.length();
  const geo = new THREE.CylinderGeometry(radius, radius, len, segments);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.copy(mid);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
