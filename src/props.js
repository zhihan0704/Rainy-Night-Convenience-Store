import * as THREE from 'three';
import {
  PALETTE, toon, physical, addBox, addCylinder, addPlane, addMesh, labelPlane,
  addOutline, addContactShadow, glowMaterial, makeGlowSprite, makeRadialGlowTexture, tubeBetween,
} from './lib.js';

function canvasTexture(w, h, draw, repeat = null) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  if (repeat) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeat[0], repeat[1]);
  }
  return tex;
}

function makeBrickTexture() {
  return canvasTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#3e4846';
    ctx.fillRect(0, 0, w, h);
    const rows = 8;
    const bh = h / rows;
    for (let r = 0; r < rows; r++) {
      const offset = r % 2 ? 62 : 0;
      for (let c = -1; c < 4; c++) {
        const x = c * 170 + offset;
        const y = r * bh;
        const shade = 56 + Math.random() * 22;
        ctx.fillStyle = 'rgb(' + Math.round(shade * 0.92) + ',' + Math.round(shade * 0.98) + ',' + Math.round(shade * 0.94) + ')';
        ctx.fillRect(x + 5, y + 5, 158, bh - 10);
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(x + 8, y + 8, 148, 4);
        for (let i = 0; i < 10; i++) {
          ctx.fillStyle = 'rgba(24,30,29,' + Math.random() * 0.16 + ')';
          ctx.fillRect(x + 10 + Math.random() * 140, y + 10 + Math.random() * (bh - 20), 2 + Math.random() * 10, 1 + Math.random() * 3);
        }
      }
    }
    ctx.fillStyle = 'rgba(16,24,22,0.25)';
    for (let i = 0; i < 600; i++) ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1 + Math.random() * 3);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(0,0,0,0.18)');
    g.addColorStop(0.8, 'rgba(0,0,0,0.02)');
    g.addColorStop(1, 'rgba(0,0,0,0.32)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }, [2, 3.2]);
}

function makeBinLabel(text, color) {
  return canvasTexture(256, 512, (ctx, w, h) => {
    ctx.fillStyle = '#f2ead8';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = color;
    ctx.lineWidth = 12;
    ctx.strokeRect(9, 9, w - 18, h - 18);
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.font = '900 62px "Yu Gothic", "Meiryo", sans-serif';
    const chars = text.split('');
    chars.forEach((ch, i) => ctx.fillText(ch, w / 2, 114 + i * 76));
    ctx.fillStyle = 'rgba(54,66,58,0.65)';
    ctx.font = '600 25px "Trebuchet MS", sans-serif';
    ctx.fillText('RECYCLE', w / 2, h - 36);
  });
}

function makeNorenTexture(char, sub) {
  return canvasTexture(300, 512, (ctx, w, h) => {
    ctx.fillStyle = '#243f45';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(225,214,186,0.72)';
    ctx.lineWidth = 8;
    ctx.strokeRect(12, 10, w - 24, h - 23);
    ctx.fillStyle = '#eadfc3';
    ctx.font = '900 176px "Yu Gothic", "Hiragino Kaku Gothic ProN", "Meiryo", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(char, w / 2, 245);
    ctx.font = '600 27px "Yu Gothic", "Meiryo", sans-serif';
    ctx.letterSpacing = '8px';
    ctx.fillText(sub, w / 2, 333);
    ctx.strokeStyle = 'rgba(231,220,194,0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 14; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 370 + i * 9);
      ctx.lineTo(w, 370 + i * 9);
      ctx.stroke();
    }
    for (let i = 0; i < 300; i++) {
      ctx.fillStyle = 'rgba(232,226,208,' + Math.random() * 0.03 + ')';
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
  });
}


function makeTruckDecalTexture() {
  const c = document.createElement('canvas');
  c.width = 768;
  c.height = 256;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 768, 256);
  ctx.fillStyle = '#22524c';
  ctx.font = '800 88px "Trebuchet MS", sans-serif';
  ctx.letterSpacing = '6px';
  ctx.textAlign = 'center';
  ctx.fillText('NAMI MART', 384, 116);
  ctx.fillStyle = '#d76e47';
  ctx.fillRect(146, 144, 154, 18);
  ctx.fillStyle = '#d5a838';
  ctx.fillRect(312, 144, 112, 18);
  ctx.fillStyle = '#4f9279';
  ctx.fillRect(436, 144, 92, 18);
  ctx.fillStyle = '#3d7d88';
  ctx.fillRect(540, 144, 82, 18);
  ctx.fillStyle = '#7b6a4e';
  ctx.font = '600 28px "Yu Gothic", "Meiryo", sans-serif';
  ctx.letterSpacing = '8px';
  ctx.fillText('街の灯りを、届けに。', 384, 210);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeBannerTexture() {
  return canvasTexture(256, 640, (ctx, w, h) => {
    ctx.fillStyle = '#f1e6cc';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#284f49';
    ctx.lineWidth = 7;
    ctx.strokeRect(9, 9, w - 18, h - 18);
    ctx.fillStyle = '#d66f49';
    ctx.fillRect(24, 52, w - 48, 17);
    ctx.fillStyle = '#4a8a6f';
    ctx.fillRect(24, 74, w - 70, 11);
    ctx.fillStyle = '#2b4f4a';
    ctx.textAlign = 'center';
    ctx.font = '900 83px "Yu Gothic", "Meiryo", sans-serif';
    ctx.fillText('雨', w / 2, 210);
    ctx.fillText('の', w / 2, 305);
    ctx.fillText('夜', w / 2, 400);
    ctx.font = '600 21px "Trebuchet MS", sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillStyle = '#48695f';
    ctx.fillText('DRIVE', w / 2, 486);
    ctx.fillText('SAFELY', w / 2, 514);
    ctx.fillStyle = '#d66f49';
    ctx.beginPath();
    ctx.arc(w / 2, 571, 17, 0, Math.PI * 2);
    ctx.fill();
  });
}

function tubeSegment(parent, a, b, radius, material) {
  return tubeBetween(parent, new THREE.Vector3(a[0], a[1], a[2]), new THREE.Vector3(b[0], b[1], b[2]), radius, material, 8);
}

export function buildProps(assembly, assets, root) {
  const signMaterials = [];
  const lights = [];
  const glows = [];
  const animated = { splashes: [] };

  function U(name, x, y, z, delay, mode, opts = {}) {
    const g = new THREE.Group();
    g.name = name;
    g.position.set(x, y, z);
    if (opts.rotation) g.rotation.set(opts.rotation[0], opts.rotation[1], opts.rotation[2]);
    if (opts.scale) g.scale.setScalar(opts.scale);
    root.add(g);
    assembly.register(g, delay, mode, opts);
    return g;
  }

  const metal = new THREE.MeshStandardMaterial({ color: 0x87918d, roughness: 0.37, metalness: 0.65 });
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x343d3b, roughness: 0.48, metalness: 0.5 });
  const whitePaint = toon(0xd9d6c7);
  const blackRubber = new THREE.MeshStandardMaterial({ color: 0x1b2021, roughness: 0.72 });

  // ---------------- welcome mat ----------------
  const mat = U('entrance-mat', -0.2, 0.13, -0.18, 3.48, 'fly', { radius: 1.0, lift: 0.45, duration: 0.8 });
  addPlane(mat, 1.38, 0.68, new THREE.MeshStandardMaterial({ map: assets.mat, roughness: 0.83 }), 0, 0.043, 0, { rotation: [-Math.PI / 2, 0, 0], receiveShadow: true });
  addBox(mat, 1.44, 0.03, 0.74, new THREE.MeshStandardMaterial({ color: 0x233d38, roughness: 0.9 }), 0, 0.024, 0);

  // ---------------- bins ----------------
  const bins = U('recycle-bins', -1.67, 0.13, -0.24, 4.08, 'fly', { radius: 1.5, lift: 0.5, duration: 0.9 });
  const binData = [
    ['かん・びん', '#4d7f7c', 0xdce4dc],
    ['ペットボトル', '#648359', 0xe8e6d1],
    ['もえるゴミ', '#9a6452', 0xeee3d4],
  ];
  binData.forEach((data, i) => {
    const bx = -0.5 + i * 0.5;
    addBox(bins, 0.42, 0.76, 0.42, toon(data[2]), bx, 0.44, 0, { rounded: 0.035, outline: 0.006 });
    addBox(bins, 0.44, 0.06, 0.44, toon(data[1]), bx, 0.84, 0, { rounded: 0.03 });
    addBox(bins, 0.24, 0.09, 0.03, toon(0x25342f), bx, 0.73, 0.218);
    addPlane(bins, 0.26, 0.38, new THREE.MeshBasicMaterial({ map: makeBinLabel(data[0], data[1]), toneMapped: true }), bx, 0.46, 0.212);
    addBox(bins, 0.38, 0.03, 0.38, toon(0x27332e), bx, 0.04, 0);
  });
  addBox(bins, 1.46, 0.07, 0.52, darkMetal, 0, 0.06, 0);
  addContactShadow(bins, 0, 0.007, 0, 1.6, 0.62, 0.4);

  // ---------------- umbrella stand ----------------
  const umbrella = U('umbrella-stand', 0.74, 0.13, -0.28, 3.86, 'fly', { radius: 1.25, lift: 0.55, duration: 0.88 });
  addBox(umbrella, 0.24, 0.55, 0.24, new THREE.MeshStandardMaterial({ color: 0x5e6861, roughness: 0.42, metalness: 0.55 }), 0, 0.275, 0);
  addBox(umbrella, 0.2, 0.02, 0.2, darkMetal, 0, 0.02, 0);
  for (const [ox, oz, col, lean] of [[-0.06, -0.03, 0xbcd5d2, 0.07], [0.03, -0.05, 0xddbd66, -0.04], [0.05, 0.04, 0xc68d92, 0.09]]) {
    const u = new THREE.Group();
    u.position.set(ox, 0.07, oz);
    u.rotation.z = lean;
    umbrella.add(u);
    addCylinder(u, 0.013, 0.013, 0.88, new THREE.MeshStandardMaterial({ color: 0x777a6e, roughness: 0.35, metalness: 0.6 }), 0, 0.44, 0);
    addCylinder(u, 0.045, 0.028, 0.68, new THREE.MeshPhysicalMaterial({ color: col, transparent: true, opacity: 0.56, roughness: 0.16, depthWrite: false }), 0, 0.48, 0, { openEnded: true });
    addCylinder(u, 0.05, 0.02, 0.045, toon(0xe7e0cd), 0, 0.86, 0);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.012, 5, 16, Math.PI * 1.1), new THREE.MeshStandardMaterial({ color: 0x7a6245, roughness: 0.55 }));
    handle.position.set(0.08, 0.02, 0);
    handle.rotation.z = Math.PI * 0.5;
    u.add(handle);
  }
  addContactShadow(umbrella, 0, 0.007, 0, 0.6, 0.45, 0.35);

  // ---------------- vending machine ----------------
  const vending = U('vending-machine', 1.67, 0.13, -1.03, 3.78, 'fly', { radius: 2.2, lift: 0.55, duration: 1.0, rotation: [0, Math.PI / 2, 0] });
  addBox(vending, 1.0, 1.9, 0.7, new THREE.MeshStandardMaterial({ color: 0xe3e4d8, roughness: 0.42, metalness: 0.08 }), 0, 0.97, 0, { rounded: 0.06, outline: 0.012 });
  addBox(vending, 0.94, 0.19, 0.68, toon(0x2e5f56), 0, 1.84, 0, { rounded: 0.04 });
  addBox(vending, 0.9, 0.055, 0.62, toon(0x9aa398), 0, 0.11, 0);
  labelPlane(vending, assets.vending, 0.94, 1.64, 0, 1.0, 0.358, { toneMapped: true });
  addBox(vending, 0.97, 0.035, 0.03, glowMaterial(0xdcfceb, null, { transparent: true, opacity: 0.7 }), 0, 1.92, 0.27, { castShadow: false });
  addBox(vending, 0.85, 0.05, 0.055, toon(0xc0c7b9), 0, 0.74, 0.36);
  addBox(vending, 0.56, 0.12, 0.06, toon(0x1b2927), 0, 0.22, 0.36);
  for (let i = 0; i < 4; i++) addBox(vending, 0.04, 0.08, 0.02, glowMaterial(i === 0 ? 0xff8a5e : 0x9dd7c2), 0.32, 1.3 - i * 0.1, 0.38, { castShadow: false });
  addBox(vending, 0.08, 1.58, 0.04, toon(0x2e5f56), 0.42, 1.0, 0.37, { castShadow: false });
  addBox(vending, 0.02, 1.3, 0.22, toon(0xc7cbbd), -0.36, 0.96, -0.24);
  addBox(vending, 0.4, 0.08, 0.35, darkMetal, 0, -0.02, 0);
  addContactShadow(vending, 0, 0.007, 0, 1.5, 1.0, 0.48);
  const vendGlow = new THREE.PointLight(0x8fdccb, 2.4, 3.2, 2);
  vendGlow.position.set(2.3, 1.05, -1.03);
  root.add(vendGlow);
  lights.push({ light: vendGlow, intensity: 2.4, flicker: false });
  const vendPool = addPlane(root, 2.2, 1.7, new THREE.MeshBasicMaterial({
    map: makeRadialGlowTexture(), color: 0x6fc9ba, transparent: true, opacity: 0.11,
    depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
  }), 2.1, 0.185, -0.9, { rotation: [-Math.PI / 2, 0, 0], castShadow: false });
  vendPool.renderOrder = 7;
  glows.push({ mesh: vendPool, opacity: 0.11 });

  // ---------------- bicycle ----------------
  const bike = U('bicycle', -4.72, 0.13, -0.12, 4.28, 'fly', { radius: 2.0, lift: 0.75, duration: 1.05, rotation: [0, -0.06, 0] });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x78a79b, roughness: 0.4, metalness: 0.35 });
  const fenderMat = new THREE.MeshStandardMaterial({ color: 0xcbc3a9, roughness: 0.4, metalness: 0.25 });
  const wheelGeo = new THREE.TorusGeometry(0.34, 0.027, 6, 28);
  const rimGeo = new THREE.TorusGeometry(0.3, 0.007, 4, 28);
  for (const wx of [-0.52, 0.52]) {
    const wheel = addMesh(bike, wheelGeo, blackRubber, wx, 0.35, 0, { castShadow: true });
    addMesh(bike, rimGeo, metal, wx, 0.35, 0.005, { castShadow: false });
    addMesh(bike, new THREE.CylinderGeometry(0.042, 0.042, 0.07, 10), metal, wx, 0.35, 0, { rotation: [Math.PI / 2, 0, 0], castShadow: false });
    for (let s = 0; s < 8; s++) {
      const a = (s / 8) * Math.PI * 2;
      tubeSegment(bike, [wx, 0.35, 0], [wx + Math.cos(a) * 0.29, 0.35 + Math.sin(a) * 0.29, 0.005], 0.003, metal);
    }
    const fender = addMesh(bike, new THREE.TorusGeometry(0.38, 0.024, 4, 20, Math.PI * 1.03), fenderMat, wx, 0.35, 0, { castShadow: true });
    fender.rotation.z = 0.02;
  }
  const rh = [-0.52, 0.35, 0];
  const bb = [-0.02, 0.41, 0];
  const st = [-0.19, 0.84, 0];
  const ht = [0.35, 0.89, 0];
  const fh = [0.52, 0.35, 0];
  tubeSegment(bike, rh, bb, 0.026, frameMat);
  tubeSegment(bike, bb, st, 0.03, frameMat);
  tubeSegment(bike, st, rh, 0.025, frameMat);
  tubeSegment(bike, bb, ht, 0.032, frameMat);
  tubeSegment(bike, ht, st, 0.03, frameMat);
  tubeSegment(bike, ht, fh, 0.024, frameMat);
  tubeSegment(bike, [-0.19, 0.79, 0], [-0.18, 0.96, 0], 0.025, metal);
  addBox(bike, 0.21, 0.045, 0.09, new THREE.MeshStandardMaterial({ color: 0x5b4436, roughness: 0.55 }), -0.19, 0.98, 0);
  addCylinder(bike, 0.018, 0.018, 0.2, metal, 0.37, 1.0, 0, { rotation: [Math.PI / 2, 0, 0] });
  tubeSegment(bike, [0.37, 1.0, -0.17], [0.37, 1.0, 0.17], 0.012, metal);
  tubeSegment(bike, [0.35, 0.89, 0], [0.4, 1.0, 0], 0.018, metal);
  addCylinder(bike, 0.06, 0.06, 0.02, glowMaterial(0xffe1a3), 0.49, 0.83, 0, { rotation: [0, 0, Math.PI / 2], castShadow: false });
  // front basket
  const basket = new THREE.Group();
  basket.position.set(0.55, 0.77, 0);
  bike.add(basket);
  for (let i = 0; i < 4; i++) {
    addBox(basket, 0.025, 0.24, 0.025, metal, -0.16 + i * 0.1, 0.08, 0, { castShadow: false });
    addBox(basket, 0.34, 0.025, 0.18, metal, 0, 0.01 + i * 0.065, 0, { castShadow: false });
  }
  addBox(basket, 0.34, 0.025, 0.025, metal, 0, 0.22, 0.09, { castShadow: false });
  addBox(basket, 0.34, 0.025, 0.025, metal, 0, 0.22, -0.09, { castShadow: false });
  addBox(basket, 0.025, 0.24, 0.025, metal, -0.17, 0.1, 0.09, { castShadow: false });
  addBox(basket, 0.025, 0.24, 0.025, metal, 0.17, 0.1, 0.09, { castShadow: false });
  // rear rack
  addBox(bike, 0.38, 0.025, 0.18, metal, -0.4, 0.69, 0, { castShadow: false });
  for (let i = 0; i < 3; i++) addBox(bike, 0.36, 0.012, 0.012, metal, -0.4, 0.7, -0.06 + i * 0.06, { castShadow: false });
  // kickstand
  tubeSegment(bike, [-0.2, 0.27, 0.05], [-0.29, -0.12, 0.16], 0.014, darkMetal);
  addCylinder(bike, 0.028, 0.028, 0.12, darkMetal, -0.02, 0.42, 0.12, { rotation: [Math.PI / 2, 0, 0], castShadow: false });
  addContactShadow(bike, 0, 0.008, 0, 1.6, 0.6, 0.4);

  // ---------------- notice board (mounted in the alley) ----------------
  const board = U('notice-board', -7.18, 0.13, -2.02, 4.18, 'fly', { radius: 1.3, lift: 0.45, duration: 0.95, rotation: [0, Math.PI / 2, 0] });
  addBox(board, 1.32, 0.98, 0.07, new THREE.MeshStandardMaterial({ color: 0x3b4b42, roughness: 0.55 }), 0, 1.3, 0, { outline: 0.006 });
  labelPlane(board, assets.bulletin, 1.24, 0.89, 0, 1.3, 0.042, { toneMapped: true });
  addBox(board, 1.4, 0.07, 0.18, toon(0x4b5e54), 0, 1.83, 0.04);
  addBox(board, 0.05, 0.75, 0.05, metal, 0.56, 2.26, 0.04);
  addBox(board, 0.16, 0.08, 0.1, glowMaterial(0xffdc9e), 0.5, 2.3, 0.1, { castShadow: false });

  // ---------------- street lamp ----------------
  const lamp = U('street-lamp', 2.46, 0.13, -0.28, 3.92, 'rise', { amount: 0.5, duration: 1.0 });
  addCylinder(lamp, 0.07, 0.1, 4.25, new THREE.MeshStandardMaterial({ color: 0x344a45, roughness: 0.45, metalness: 0.45 }), 0, 2.12, 0, { segments: 12 });
  addCylinder(lamp, 0.16, 0.16, 0.18, darkMetal, 0, 0.09, 0);
  addCylinder(lamp, 0.14, 0.16, 0.13, toon(0x2f423e), 0, 0.23, 0);
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 4.2, 0),
    new THREE.Vector3(0.18, 4.52, 0),
    new THREE.Vector3(0.68, 4.67, 0),
    new THREE.Vector3(1.22, 4.58, 0),
  ]);
  const arm = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.045, 8, false), new THREE.MeshStandardMaterial({ color: 0x344a45, roughness: 0.42, metalness: 0.45 }));
  arm.castShadow = true;
  lamp.add(arm);
  addBox(lamp, 0.38, 0.1, 0.3, toon(0x293c37), 1.22, 4.53, 0);
  addCylinder(lamp, 0.27, 0.16, 0.18, toon(0x2d413b), 1.22, 4.43, 0, { segments: 12 });
  addCylinder(lamp, 0.22, 0.22, 0.035, glowMaterial(0xffe0a6), 1.22, 4.32, 0, { segments: 16, castShadow: false });
  // banner
  const banner = addPlane(lamp, 0.36, 0.92, new THREE.MeshBasicMaterial({ map: makeBannerTexture(), side: THREE.DoubleSide, toneMapped: true }), 0.06, 3.2, 0.06, { castShadow: false });
  addBox(lamp, 0.46, 0.025, 0.025, metal, 0.04, 3.67, 0.03, { castShadow: false });
  // lamp glow pool and light
  const pool = addPlane(root, 5.3, 4.4, new THREE.MeshBasicMaterial({
    map: makeRadialGlowTexture(), color: 0xffc98c, transparent: true, opacity: 0.13,
    depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
  }), 3.4, 0.19, 0.1, { rotation: [-Math.PI / 2, 0, 0], castShadow: false });
  pool.renderOrder = 6;
  glows.push({ mesh: pool, opacity: 0.13 });
  const lampLight = new THREE.SpotLight(0xffcb8c, 34, 15, 0.68, 0.72, 1.8);
  lampLight.position.set(2.46 + 1.22 * Math.cos(0), 4.45, -0.28);
  lampLight.target.position.set(3.55, 0.02, 0.25);
  lampLight.castShadow = true;
  lampLight.shadow.mapSize.set(1024, 1024);
  lampLight.shadow.bias = -0.0004;
  lampLight.shadow.camera.near = 0.3;
  lampLight.shadow.camera.far = 16;
  root.add(lampLight);
  root.add(lampLight.target);
  lights.push({ light: lampLight, intensity: 34 });
  const lampFill = new THREE.PointLight(0xffc580, 2.0, 4.5, 2);
  lampFill.position.set(3.55, 4.2, -0.1);
  root.add(lampFill);
  lights.push({ light: lampFill, intensity: 2.0 });

  // ---------------- guardrail ----------------
  const guard = U('guardrail', 0, 0, 0, 4.0, 'rise', { amount: 0.6, duration: 1.0 });
  const railMat = new THREE.MeshStandardMaterial({ color: 0xd7d6c8, roughness: 0.35, metalness: 0.4 });
  const railZs = [-2.45, -1.72, -1.0, -0.28, 0.44, 0.92];
  for (const z of railZs) {
    addCylinder(guard, 0.042, 0.048, 0.82, railMat, 2.82, 0.54, z, { segments: 8 });
    addCylinder(guard, 0.065, 0.065, 0.045, railMat, 2.82, 0.95, z, { segments: 10 });
    addBox(guard, 0.11, 0.07, 0.025, new THREE.MeshBasicMaterial({ color: 0xc8b58d }), 2.76, 0.78, z + 0.025, { castShadow: false });
  }
  addCylinder(guard, 0.036, 0.036, 3.42, railMat, 2.82, 0.84, -0.78, { rotation: [Math.PI / 2, 0, 0], segments: 8 });
  addCylinder(guard, 0.03, 0.03, 3.42, railMat, 2.82, 0.54, -0.78, { rotation: [Math.PI / 2, 0, 0], segments: 8 });
  // curved end piece hint
  addCylinder(guard, 0.036, 0.036, 0.26, railMat, 2.82, 0.8, 0.78, { rotation: [Math.PI / 2, 0, 0.45], segments: 8 });

  // ---------------- utility pole & wires ----------------
  const pole = U('utility-pole', -6.96, 0.13, 0.68, 3.7, 'rise', { amount: 0.46, duration: 1.2 });
  const concrete = new THREE.MeshStandardMaterial({ color: 0x7d817a, roughness: 0.72, metalness: 0.04 });
  addCylinder(pole, 0.11, 0.17, 6.0, concrete, 0, 3.0, 0, { segments: 12 });
  addCylinder(pole, 0.15, 0.19, 0.18, concrete, 0, 0.09, 0);
  for (const y of [1.6, 3.2, 4.75, 5.55]) {
    addCylinder(pole, 0.18, 0.18, 0.06, toon(0x666b64), 0, y, 0, { segments: 12, castShadow: false });
  }
  addBox(pole, 1.6, 0.1, 0.09, darkMetal, 0.2, 5.48, 0);
  addBox(pole, 1.2, 0.08, 0.08, darkMetal, 0.1, 4.9, 0);
  for (let i = 0; i < 4; i++) {
    addCylinder(pole, 0.033, 0.033, 0.15, toon(0xd8cfb9), -0.55 + i * 0.35, 5.59, 0, { segments: 8 });
    addCylinder(pole, 0.033, 0.033, 0.15, toon(0xd8cfb9), -0.42 + i * 0.35, 5.0, 0, { segments: 8 });
  }
  const transformer = addCylinder(pole, 0.22, 0.22, 0.6, new THREE.MeshStandardMaterial({ color: 0x5f6660, roughness: 0.54, metalness: 0.22 }), -0.3, 4.34, 0, { segments: 14 });
  addCylinder(pole, 0.25, 0.25, 0.06, darkMetal, -0.3, 4.64, 0, { segments: 14 });
  addCylinder(pole, 0.25, 0.25, 0.06, darkMetal, -0.3, 4.04, 0, { segments: 14 });
  // climbing pegs and labels
  for (let i = 0; i < 8; i++) {
    addCylinder(pole, 0.012, 0.012, 0.28, darkMetal, 0.12, 1.1 + i * 0.38, 0, { rotation: [0, 0, Math.PI / 2], castShadow: false });
  }
  addBox(pole, 0.28, 0.15, 0.04, toon(0xd9c67c), 0, 2.25, 0.17);
  addBox(pole, 0.24, 0.12, 0.03, new THREE.MeshBasicMaterial({ color: 0xe7e1cf }), 0, 2.25, 0.19, { castShadow: false });
  // blue street plate + stop sign
  addBox(pole, 0.88, 0.24, 0.04, toon(0x315c78), 0.1, 3.06, 0.18);
  labelPlane(pole, assets.streetName, 0.84, 0.215, 0.1, 3.06, 0.202, { toneMapped: true });
  addBox(pole, 0.58, 0.1, 0.035, metal, 0.06, 2.68, 0.18);
  const stop = addPlane(pole, 0.56, 0.49, new THREE.MeshBasicMaterial({
    map: assets.stop, transparent: true, alphaTest: 0.02, side: THREE.DoubleSide, toneMapped: true,
  }), 0.06, 2.88, 0.2, { castShadow: false });
  stop.renderOrder = 2;

  const pole2 = U('utility-pole-far', 5.12, 0.0, -5.18, 3.95, 'rise', { amount: 0.45, duration: 1.15 });
  addCylinder(pole2, 0.1, 0.15, 5.4, concrete, 0, 2.7, 0, { segments: 12 });
  addCylinder(pole2, 0.2, 0.22, 0.14, concrete, 0, 0.06, 0);
  addBox(pole2, 1.1, 0.08, 0.08, darkMetal, -0.15, 4.9, 0);
  for (let i = 0; i < 3; i++) addCylinder(pole2, 0.03, 0.03, 0.14, toon(0xd8cfb9), -0.4 + i * 0.34, 5.0, 0, { segments: 8 });
  addCylinder(pole2, 0.18, 0.18, 0.5, new THREE.MeshStandardMaterial({ color: 0x5f6660, roughness: 0.55 }), 0.22, 3.85, 0, { segments: 12 });
  addCylinder(pole2, 0.2, 0.2, 0.05, darkMetal, 0.22, 4.1, 0, { segments: 12 });

  const wires = U('overhead-wires', 0, 0, 0, 5.02, 'fly', { radius: 0.3, lift: 0.4, duration: 1.1 });
  const wireMat = new THREE.MeshStandardMaterial({ color: 0x20292b, roughness: 0.48, metalness: 0.3 });
  function wire(points, radius = 0.012) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(p[0], p[1], p[2])));
    const geo = new THREE.TubeGeometry(curve, 28, radius, 5, false);
    const mesh = new THREE.Mesh(geo, wireMat);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    wires.add(mesh);
    return mesh;
  }
  const p1 = [-6.96, 0.13, 0.68];
  const p2 = [5.12, 0.0, -5.18];
  for (let i = 0; i < 4; i++) {
    const y1 = 5.64 + (i % 2) * 0.07;
    const y2 = 4.96 + i * 0.03;
    wire([
      [p1[0] + (i - 1.5) * 0.25, y1, p1[2]],
      [-2.2, y1 - 0.15 - i * 0.06, 1.35],
      [2.3, y2 + 0.5, -0.6],
      [p2[0] - 0.35 + i * 0.12, y2, p2[2]],
    ], i === 0 ? 0.016 : 0.011);
  }
  // service drops to the store roof
  wire([[-6.96, 5.1, 0.68], [-5.0, 4.4, -1.2], [-3.25, 3.98, -1.45]], 0.011);
  wire([[-6.96, 4.9, 0.68], [-4.4, 4.0, -2.0], [-2.5, 3.78, -2.8]], 0.009);
  // a couple of dangling service cables
  wire([[-6.96, 4.4, 0.68], [-6.3, 4.1, -1.2], [-5.9, 3.7, -2.8]], 0.008);

  // ---------------- alley ----------------
  const brick = new THREE.MeshStandardMaterial({ map: makeBrickTexture(), color: 0xa8b0a6, roughness: 0.82 });
  const alley = U('alley-building', -7.43, 0.13, -3.65, 2.08, 'rise', { amount: 0.5, duration: 1.2 });
  addBox(alley, 0.32, 3.22, 5.95, brick, 0, 1.61, 0, { outline: 0.015 });
  addBox(alley, 0.46, 0.14, 6.05, toon(0x394843), -0.01, 3.25, 0);
  addBox(alley, 0.38, 0.1, 5.9, toon(0x2e3b3a), -0.02, 3.36, 0);
  // bamboo screen / garage doors along wall
  addBox(alley, 0.06, 1.8, 1.2, toon(0x5d5949), 0.17, 1.1, -1.65);
  for (let i = 0; i < 13; i++) {
    addBox(alley, 0.015, 1.72, 0.05, toon(0x8b8167), 0.205, 1.1, -2.18 + i * 0.09, { castShadow: false });
  }
  addBox(alley, 0.04, 1.6, 1.0, toon(0x4c5f58), 0.18, 1.1, 1.35);
  // small lit high window on left wall
  addBox(alley, 0.03, 0.55, 0.8, toon(0x3b3d37), 0.185, 2.25, 1.22);
  addBox(alley, 0.015, 0.43, 0.68, glowMaterial(0xcf9d6c, null, { transparent: true, opacity: 0.36 }), 0.203, 2.25, 1.22, { castShadow: false });
  addBox(alley, 0.08, 2.7, 0.08, toon(0x4d4437), -0.06, 1.5, 2.92);
  addBox(alley, 0.11, 0.14, 5.75, toon(0x514f42), -0.12, 2.8, 0);
  // back wall closing the alley, with a small service door
  addBox(alley, 1.42, 2.8, 0.16, new THREE.MeshStandardMaterial({ color: 0x3e4a45, roughness: 0.85 }), 0.81, 1.4, -2.78, { outline: 0.01 });
  addBox(alley, 0.52, 1.62, 0.05, toon(0x5d5749), 0.82, 0.83, -2.68);
  addBox(alley, 0.05, 0.05, 0.03, toon(0xc2ae83), 1.04, 0.9, -2.64);
  addBox(alley, 1.44, 0.12, 0.26, toon(0x2e3b38), 0.81, 2.83, -2.75);
  addBox(alley, 1.0, 0.035, 0.04, darkMetal, 0.85, 2.7, 2.6);
  // pipes
  addCylinder(alley, 0.045, 0.045, 2.8, darkMetal, 0.23, 1.45, -2.6);
  addCylinder(alley, 0.025, 0.025, 1.7, toon(0x91624e), 0.25, 1.2, 2.4);
  // wall-mounted AC
  function acUnit(parent, x, y, z, w, h, d, facing) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    if (facing) g.rotation.y = facing;
    parent.add(g);
    addBox(g, w, h, d, toon(0xd4d4c8), 0, 0, 0, { rounded: 0.025, outline: 0.006 });
    addBox(g, w * 0.82, h * 0.14, d * 1.03, toon(0xb3b4a9), 0, -h * 0.34, 0);
    const fan = addCylinder(g, h * 0.32, h * 0.32, 0.015, new THREE.MeshStandardMaterial({ color: 0x59625d, roughness: 0.5 }), 0, 0.03, d * 0.54, { rotation: [Math.PI / 2, 0, 0], segments: 18 });
    addCylinder(g, h * 0.28, h * 0.28, 0.01, toon(0x7d837b), 0, 0.03, d * 0.55 + 0.01, { rotation: [Math.PI / 2, 0, 0], segments: 18 });
    for (let i = 0; i < 5; i++) addBox(g, w * 0.7, 0.012, 0.015, toon(0xa4a79c), 0, -h * 0.14 + i * 0.025, d * 0.56, { castShadow: false });
    addBox(g, w * 0.82, 0.015, 0.05, toon(0x6c7771), 0, h * 0.33, d * 0.46);
    return g;
  }
  acUnit(alley, 0.32, 2.15, -3.1, 0.35, 0.72, 0.42, Math.PI / 2);
  // ground AC near back
  acUnit(alley, 0.55, 0.48, -4.95, 0.55, 0.62, 0.4, 0);
  // neon snack sign deep in alley
  const neon = U('alley-neon', -6.35, 1.79, -6.26, 4.92, 'fly', { radius: 1.0, lift: 0.5, duration: 0.9 });
  addBox(neon, 0.64, 0.52, 0.06, toon(0x1a292a), 0, 0, 0);
  const neonFace = labelPlane(neon, assets.neon, 0.58, 0.47, 0, 0, 0.036, { toneMapped: true });
  neonFace.material.color.setScalar(1.3);
  signMaterials.push({ material: neonFace.material, base: new THREE.Color(1.3, 1.3, 1.3) });
  addBox(neon, 0.05, 0.55, 0.04, darkMetal, -0.39, 0, 0);
  // warm paper lantern at alley mouth
  const lantern = U('alley-lantern', -6.16, 2.15, -1.05, 4.72, 'drop', { radius: 0.3, lift: 0.3, duration: 0.8 });
  addCylinder(lantern, 0.02, 0.02, 0.36, darkMetal, 0, 0.5, 0);
  addBox(lantern, 0.5, 0.04, 0.05, darkMetal, -0.23, 0.7, 0);
  const lanternBody = addCylinder(lantern, 0.15, 0.15, 0.38, new THREE.MeshBasicMaterial({ color: 0xf3c07a, transparent: true, opacity: 0.85, toneMapped: true }), 0, 0.23, 0, { segments: 14 });
  for (let i = 0; i < 4; i++) addCylinder(lantern, 0.155, 0.155, 0.01, toon(0xb9824d), 0, 0.11 + i * 0.075, 0, { segments: 14, castShadow: false });
  addBox(lantern, 0.16, 0.03, 0.02, glowMaterial(0xffd39a), 0, 0.23, 0.15, { castShadow: false });
  // noren across alley entrance
  const noren = U('alley-noren', -6.6, 2.28, -0.83, 4.85, 'drop', { radius: 0.5, lift: 0.35, duration: 0.9 });
  addCylinder(noren, 0.018, 0.018, 1.65, toon(0x4f4639), 0, 0.32, 0, { rotation: [0, 0, Math.PI / 2] });
  addBox(noren, 0.09, 2.5, 0.09, toon(0x443d31), -0.82, -1.0, 0, { outline: 0.004 });
  addBox(noren, 0.09, 2.5, 0.09, toon(0x443d31), 0.82, -1.0, 0, { outline: 0.004 });
  addBox(noren, 1.76, 0.09, 0.12, toon(0x443d31), 0, 0.37, 0);
  const norenChars = ['ゆ', 'め', 'の'];
  for (let i = 0; i < 3; i++) {
    const tex = makeNorenTexture(norenChars[i], i === 1 ? 'YUME' : 'ROJI');
    const p = addPlane(noren, 0.5, 0.66, new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.9 }), -0.53 + i * 0.53, 0.02, 0, { castShadow: true });
    p.rotation.z = (i - 1) * 0.015;
  }
  // alley floor dark stone overlay
  addPlane(alley, 1.25, 5.3, new THREE.MeshStandardMaterial({ color: 0x5f655e, roughness: 0.4, metalness: 0.1, map: assets.sidewalk }), 0.72, 0.012, 0.05, { rotation: [-Math.PI / 2, 0, 0.1], receiveShadow: true });
  // crates and clutter
  const clutter = U('alley-clutter', 0, 0, 0, 4.6, 'fly', { radius: 1.2, lift: 0.4, duration: 0.85 });
  addBox(clutter, 0.45, 0.33, 0.38, toon(0xb0644e), -6.72, 0.33, -4.95, { outline: 0.005 });
  addBox(clutter, 0.45, 0.08, 0.38, toon(0xca7d61), -6.72, 0.53, -4.95);
  addBox(clutter, 0.45, 0.17, 0.38, toon(0x9d7b4e), -6.72, 0.66, -4.95);
  addBox(clutter, 0.4, 0.28, 0.34, toon(0x4e725c), -6.7, 0.3, -4.45, { outline: 0.005 });
  addCylinder(clutter, 0.17, 0.13, 0.3, toon(0x6a5c48), -6.15, 0.28, -5.4);
  addCylinder(clutter, 0.035, 0.035, 0.58, darkMetal, -6.15, 0.48, -5.38);
  addBox(clutter, 0.5, 0.34, 0.3, toon(0x87775b), -6.68, 0.3, -5.45);
  for (let i = 0; i < 4; i++) addBox(clutter, 0.38, 0.02, 0.02, toon(0xb9a67e), -6.68, 0.2 + i * 0.07, -5.29, { castShadow: false });
  // puddle reflection in alley
  const alleyPuddle = addPlane(root, 0.9, 1.6, new THREE.MeshBasicMaterial({
    map: assets.puddleReflection, color: 0xff7aa6, transparent: true, opacity: 0.21,
    depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
  }), -6.55, 0.149, -3.9, { rotation: [-Math.PI / 2, 0, 0.08], castShadow: false });
  alleyPuddle.renderOrder = 6;
  glows.push({ mesh: alleyPuddle, opacity: 0.21 });
  const alleyGlow = new THREE.PointLight(0xff7eaa, 2.8, 4.2, 2);
  alleyGlow.position.set(-6.3, 1.9, -5.2);
  root.add(alleyGlow);
  lights.push({ light: alleyGlow, intensity: 2.8 });
  const lanternLight = new THREE.PointLight(0xffb76d, 1.2, 3.0, 2);
  lanternLight.position.set(-6.16, 2.25, -1.02);
  root.add(lanternLight);
  lights.push({ light: lanternLight, intensity: 1.2 });
  const lantGlow = makeGlowSprite(0xffb76d, 1.0, 0.35);
  lantGlow.position.set(-6.16, 2.35, -1.04);
  root.add(lantGlow);
  glows.push({ mesh: lantGlow, opacity: 0.35 });

  // ---------------- parking sign ----------------
  const parking = U('parking-sign', 2.82, 0.13, -5.55, 4.32, 'fly', { radius: 1.5, lift: 0.45, duration: 0.9 });
  addCylinder(parking, 0.04, 0.045, 2.0, metal, 0, 1.0, 0);
  addBox(parking, 0.52, 0.78, 0.045, toon(0x31554e), 0, 2.18, 0.02);
  labelPlane(parking, assets.parking, 0.46, 0.7, 0, 2.18, 0.048, { toneMapped: true });
  addBox(parking, 0.7, 0.07, 0.22, darkMetal, 0, 0.04, 0);

  // ---------------- decorative planters ----------------
  function planter(x, z, scale, delay) {
    const g = U('planter', x, 0.13, z, delay, 'fly', { radius: 1.2, lift: 0.5, duration: 0.8, scale });
    addCylinder(g, 0.28, 0.22, 0.42, new THREE.MeshStandardMaterial({ color: 0x8f7c62, roughness: 0.8 }), 0, 0.21, 0, { segments: 14, outline: 0.006 });
    addCylinder(g, 0.3, 0.3, 0.06, toon(0x6f604d), 0, 0.44, 0, { segments: 14 });
    addCylinder(g, 0.035, 0.045, 0.65, toon(0x5e6f49), 0, 0.68, 0, { segments: 7 });
    for (let i = 0; i < 10; i++) {
      const a = i * 2.3;
      addBox(g, 0.28, 0.025, 0.12, toon(i % 2 ? 0x617b58 : 0x748c63), Math.sin(a) * 0.18, 0.78 + (i % 4) * 0.06, Math.cos(a) * 0.15, { rotation: [0.12, a, 0.18] });
    }
    addContactShadow(g, 0, 0.007, 0, 0.7, 0.7, 0.3);
    return g;
  }
  planter(-6.02, 0.47, 0.82, 4.6);
  planter(2.48, -1.6, 0.72, 4.44);

  // ---------------- little delivery kei truck ----------------
  const truck = U('delivery-truck', 4.18, 0.02, -3.64, 4.72, 'fly', { radius: 3.0, lift: 0.9, duration: 1.15, rotation: [0, -0.035, 0] });
  const truckPaint = new THREE.MeshStandardMaterial({ color: 0xe4decd, roughness: 0.38, metalness: 0.16 });
  const truckDark = new THREE.MeshStandardMaterial({ color: 0x243537, roughness: 0.3, metalness: 0.28 });
  const truckGlass = new THREE.MeshStandardMaterial({ color: 0x1e333c, roughness: 0.08, metalness: 0.45, transparent: true, opacity: 0.82 });
  addBox(truck, 1.38, 0.26, 2.6, truckDark, 0, 0.42, 0, { rounded: 0.03, outline: 0.012 });
  addBox(truck, 1.34, 0.8, 2.48, truckPaint, 0, 0.85, 0.06, { rounded: 0.06, outline: 0.012 });
  addBox(truck, 1.38, 0.55, 1.1, truckPaint, 0, 1.23, 0.71, { rounded: 0.07, outline: 0.012 });
  addBox(truck, 1.29, 0.06, 1.0, toon(0xded7c5), 0, 1.54, 0.72, { rounded: 0.03 });
  addPlane(truck, 1.08, 0.52, truckGlass, 0, 1.28, 1.272, { castShadow: false });
  addPlane(truck, 0.94, 0.42, new THREE.MeshStandardMaterial({ color: 0x283b42, roughness: 0.12, metalness: 0.3 }), 0, 1.0, 1.278, { castShadow: false });
  addBox(truck, 1.15, 0.04, 0.06, truckDark, 0, 0.66, 1.31);
  addBox(truck, 0.46, 0.26, 0.07, toon(0x2b3b3d), 0, 0.87, 1.3);
  for (const sx of [-1, 1]) {
    addBox(truck, 0.22, 0.16, 0.08, glowMaterial(0xf1d49b), sx * 0.46, 0.77, 1.31, { castShadow: false });
    addBox(truck, 0.14, 0.04, 0.08, toon(0x293634), sx * 0.24, 0.55, 1.32);
    addBox(truck, 0.018, 0.15, 2.05, toon(0x4a7b6d), sx * 0.697, 0.98, -0.27);
    addBox(truck, 0.018, 0.055, 2.15, toon(0xc66c49), sx * 0.698, 0.72, -0.27);
    addPlane(truck, 0.66, 0.19, new THREE.MeshBasicMaterial({ map: makeTruckDecalTexture(), transparent: true, depthWrite: false, toneMapped: true, side: THREE.DoubleSide }), sx * 0.706, 1.02, 0.38, { rotation: [0, sx > 0 ? Math.PI / 2 : -Math.PI / 2, 0], castShadow: false });
    addPlane(truck, 0.54, 0.4, truckGlass, sx * 0.704, 1.28, 0.83, { rotation: [0, sx > 0 ? Math.PI / 2 : -Math.PI / 2, 0], castShadow: false });
    addBox(truck, 0.015, 0.42, 0.06, toon(0x65706a), sx * 0.704, 1.27, 0.55, { castShadow: false });
    addBox(truck, 0.12, 0.18, 0.42, toon(0x4f5a54), sx * 0.69, 1.0, 1.06);
    addBox(truck, 0.035, 0.035, 0.26, darkMetal, sx * 0.9, 1.15, 1.13, { rotation: [0.2, 0, 0], castShadow: false });
  }
  // open bed with drink crates
  addBox(truck, 1.4, 0.12, 1.64, truckPaint, 0, 0.6, -0.78, { rounded: 0.02, outline: 0.008 });
  addBox(truck, 0.08, 0.28, 1.64, truckPaint, -0.66, 0.78, -0.78);
  addBox(truck, 0.08, 0.28, 1.64, truckPaint, 0.66, 0.78, -0.78);
  addBox(truck, 1.4, 0.28, 0.08, truckPaint, 0, 0.78, -1.58);
  addBox(truck, 0.06, 0.04, 1.5, toon(0x8a7356), 0.45, 0.69, -0.78, { castShadow: false });
  const crateColors = [0x477f70, 0xca6f4b, 0xe0bb62, 0x627e96];
  for (let i = 0; i < 4; i++) {
    addBox(truck, 0.34, 0.25, 0.3, toon(crateColors[i]), -0.26 + (i % 2) * 0.38, 0.86, -0.48 - Math.floor(i / 2) * 0.38, { outline: 0.004 });
    addBox(truck, 0.3, 0.02, 0.26, toon(0x2c3b35), -0.26 + (i % 2) * 0.38, 0.995, -0.48 - Math.floor(i / 2) * 0.38, { castShadow: false });
    for (let b = 0; b < 3; b++) addCylinder(truck, 0.035, 0.035, 0.18, toon(0xccebf1), -0.34 + (i % 2) * 0.38 + b * 0.075, 1.08, -0.48 - Math.floor(i / 2) * 0.38, { segments: 7 });
  }
  // wheels
  for (const [wx, wz] of [[-0.7, 0.86], [0.7, 0.86], [-0.7, -0.9], [0.7, -0.9]]) {
    addCylinder(truck, 0.27, 0.27, 0.16, blackRubber, wx, 0.29, wz, { rotation: [0, 0, Math.PI / 2], segments: 18 });
    addCylinder(truck, 0.12, 0.12, 0.17, metal, wx, 0.29, wz, { rotation: [0, 0, Math.PI / 2], segments: 12 });
    addCylinder(truck, 0.055, 0.055, 0.18, toon(0xd5c7ad), wx, 0.29, wz, { rotation: [0, 0, Math.PI / 2], segments: 10 });
  }
  // little rear lamps and plate
  addBox(truck, 0.17, 0.11, 0.03, glowMaterial(0xff9d6e), -0.49, 0.72, -1.63, { castShadow: false });
  addBox(truck, 0.17, 0.11, 0.03, glowMaterial(0xff9d6e), 0.49, 0.72, -1.63, { castShadow: false });
  addBox(truck, 0.34, 0.15, 0.03, toon(0xe5dfcd), 0, 0.5, -1.63);
  addContactShadow(truck, 0, 0.065, 0, 2.2, 3.1, 0.55);


  // ---------------- little alley gate at the street corner ----------------
  const gate = U('alley-gate', -6.6, 0.13, -0.44, 4.28, 'drop', { radius: 0.5, lift: 0.3, duration: 0.9 });
  const timber = new THREE.MeshStandardMaterial({ color: 0x4d4638, roughness: 0.7 });
  addBox(gate, 0.1, 2.45, 0.1, timber, -0.68, 1.22, 0, { outline: 0.004 });
  addBox(gate, 0.1, 2.45, 0.1, timber, 0.68, 1.22, 0, { outline: 0.004 });
  addBox(gate, 1.5, 0.12, 0.14, timber, 0, 2.42, 0);
  addBox(gate, 1.58, 0.06, 0.64, toon(0x2d3a39), 0, 2.55, 0.1, { rotation: [0.08, 0, 0], outline: 0.004 });
  for (let i = 0; i < 6; i++) {
    addBox(gate, 1.58, 0.035, 0.105, toon(i % 2 ? 0x3e4a47 : 0x34423f), 0, 2.61 + i * 0.004, 0.38 - i * 0.105, { rotation: [0.08, 0, 0], castShadow: false });
  }
  addBox(gate, 0.46, 0.38, 0.07, toon(0x18292a), -0.28, 1.92, 0.09, { outline: 0.004 });
  const gateNeon = labelPlane(gate, assets.neon, 0.42, 0.35, -0.28, 1.92, 0.132, { toneMapped: true });
  gateNeon.material.color.setScalar(1.5);
  signMaterials.push({ material: gateNeon.material, base: new THREE.Color(1.5, 1.5, 1.5) });
  addBox(gate, 0.035, 0.65, 0.035, darkMetal, -0.28, 2.16, 0.08, { castShadow: false });
  addBox(gate, 0.46, 0.035, 0.05, darkMetal, -0.28, 2.48, 0.08, { castShadow: false });
  // small warm lantern hanging at the gate
  addBox(gate, 0.035, 0.42, 0.035, darkMetal, 0.38, 2.18, 0.17, { castShadow: false });
  addCylinder(gate, 0.11, 0.11, 0.32, new THREE.MeshBasicMaterial({ color: 0xf4c37f, transparent: true, opacity: 0.9, toneMapped: true }), 0.38, 1.84, 0.17, { segments: 14 });
  for (let i = 0; i < 3; i++) addCylinder(gate, 0.115, 0.115, 0.008, toon(0xb27e4f), 0.38, 1.74 + i * 0.1, 0.17, { segments: 14, castShadow: false });
  addBox(gate, 0.14, 0.02, 0.02, glowMaterial(0xffd09b), 0.38, 1.86, 0.29, { castShadow: false });
  const gateGlow = makeGlowSprite(0xff9fb9, 1.35, 0.3);
  gateGlow.position.set(-6.88, 2.08, -0.3);
  root.add(gateGlow);
  glows.push({ mesh: gateGlow, opacity: 0.3 });
  const gateLight = new THREE.PointLight(0xff91ad, 2.2, 3.2, 2);
  gateLight.position.set(-6.86, 1.95, -0.25);
  root.add(gateLight);
  lights.push({ light: gateLight, intensity: 2.2 });
  const gateWarm = new THREE.PointLight(0xffba76, 1.4, 2.4, 2);
  gateWarm.position.set(-6.22, 1.85, -0.25);
  root.add(gateWarm);
  lights.push({ light: gateWarm, intensity: 1.4 });

  // ---------------- small warm lights ----------------
  return { lights, signMaterials, animated, glows };
}
