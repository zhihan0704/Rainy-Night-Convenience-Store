import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import {
  PALETTE, toon, physical, addBox, addCylinder, addPlane, addMesh, labelPlane,
  addOutline, addContactShadow, glowMaterial, makeRadialGlowTexture, makeGlowSprite,
} from './lib.js';

export const WORLD = {
  half: 6.7,
  centerX: -0.9,
  centerZ: -0.9,
  left: -7.6,
  right: 5.8,
  back: -7.6,
  front: 5.8,
  roadY: 0.0,
  walkY: 0.13,
  curbY: 0.18,
  crossX: 0.65,
  crossZ0: 1.45,
  cornerX: 3.0,
  frontCurbZ: 1.22,
  eastCurbX: 3.0,
};

function tileTop(parent, x, z, w, d, material, y = WORLD.walkY + 0.002) {
  const p = addPlane(parent, w, d, material, x, y, z, { rotation: [-Math.PI / 2, 0, 0], castShadow: false, receiveShadow: true });
  p.renderOrder = 1;
  return p;
}

export function buildWorld(assembly, assets, root) {
  const units = [];
  const glows = [];
  function U(name, x, y, z, delay, mode, opts = {}) {
    const g = new THREE.Group();
    g.name = name;
    g.position.set(x, y, z);
    root.add(g);
    assembly.register(g, delay, mode, opts);
    units.push(g);
    return g;
  }

  const base = U('base-plinth', -0.9, -0.45, -0.9, 0.18, 'rise', { amount: 0.35, duration: 1.35, radius: 0.1 });
  const plinth = new THREE.Mesh(
    new RoundedBoxGeometry(13.45, 0.9, 13.45, 5, 0.18),
    new THREE.MeshStandardMaterial({ color: 0x2a3e43, roughness: 0.38, metalness: 0.18, emissive: 0x040d10, emissiveIntensity: 1 }),
  );
  plinth.castShadow = true;
  plinth.receiveShadow = true;
  base.add(plinth);
  // brass inlay around the rim
  const inlayMat = new THREE.MeshStandardMaterial({ color: 0xc4aa72, roughness: 0.35, metalness: 0.7 });
  addBox(base, 13.26, 0.016, 0.03, inlayMat, 0, 0.443, 6.56, { castShadow: false });
  addBox(base, 13.26, 0.016, 0.03, inlayMat, 0, 0.443, -6.56, { castShadow: false });
  addBox(base, 0.03, 0.016, 13.26, inlayMat, 6.56, 0.443, 0, { castShadow: false });
  addBox(base, 0.03, 0.016, 13.26, inlayMat, -6.56, 0.443, 0, { castShadow: false });
  // vertical brass bands make the plinth read as a collectible slab
  addBox(base, 13.26, 0.022, 0.026, inlayMat, 0, 0.3, 6.705, { castShadow: false, receiveShadow: false });
  addBox(base, 13.26, 0.022, 0.026, inlayMat, 0, 0.3, -6.705, { castShadow: false, receiveShadow: false });
  addBox(base, 0.026, 0.022, 13.26, inlayMat, 6.705, 0.3, 0, { castShadow: false, receiveShadow: false });
  addBox(base, 0.026, 0.022, 13.26, inlayMat, -6.705, 0.3, 0, { castShadow: false, receiveShadow: false });
  addBox(base, 13.26, 0.012, 0.02, inlayMat, 0, -0.34, 6.708, { castShadow: false, receiveShadow: false });
  addBox(base, 13.26, 0.012, 0.02, inlayMat, 0, -0.34, -6.708, { castShadow: false, receiveShadow: false });
  addBox(base, 0.02, 0.012, 13.26, inlayMat, 6.708, -0.34, 0, { castShadow: false, receiveShadow: false });
  addBox(base, 0.02, 0.012, 13.26, inlayMat, -6.708, -0.34, 0, { castShadow: false, receiveShadow: false });
  // lower foot
  addBox(base, 8.4, 0.2, 8.4, new THREE.MeshStandardMaterial({ color: 0x152327, roughness: 0.55, metalness: 0.1 }), 0, -0.485, 0);
  // plaque
  addBox(base, 3.4, 0.64, 0.06, new THREE.MeshStandardMaterial({ color: 0x1d2a2c, roughness: 0.35, metalness: 0.5 }), 0, 0.03, 6.74);
  labelPlane(base, assets.plaque, 3.22, 0.52, 0, 0.03, 6.773, { toneMapped: true });
  // corner maker's plates
  for (const sx of [-1, 1]) {
    addBox(base, 0.18, 0.018, 0.34, inlayMat, sx * 6.59, 0.31, 1.4, { castShadow: false });
  }

  // soft shadow & display halo beneath the model
  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(26, 26),
    new THREE.MeshBasicMaterial({
      map: makeRadialGlowTexture(), color: 0x06121a, transparent: true, opacity: 0.88,
      depthWrite: false, blending: THREE.NormalBlending, toneMapped: false,
    }),
  );
  halo.rotation.x = -Math.PI / 2;
  halo.position.set(-0.9, -1.23, -0.9);
  root.add(halo);
  const underGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(17.0, 17.0),
    new THREE.MeshBasicMaterial({
      map: makeRadialGlowTexture(), color: 0x205662, transparent: true, opacity: 0.14,
      depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
    }),
  );
  underGlow.rotation.x = -Math.PI / 2;
  underGlow.position.set(-0.9, -1.21, -0.9);
  root.add(underGlow);

  // ---------- road surface ----------
  const asphalt = U('asphalt', -0.9, 0.0, -0.9, 0.62, 'rise', { amount: 0.5, duration: 1.2 });
  const asphaltTop = addPlane(asphalt, 13.2, 13.2, new THREE.MeshStandardMaterial({ color: 0xd2d6d2, map: assets.asphalt, roughness: 0.48, metalness: 0.08 }), 0, 0.012, 0, { rotation: [-Math.PI / 2, 0, 0], receiveShadow: true });
  asphaltTop.renderOrder = 0;

  // ---------- sidewalks ----------
  const walkMat = new THREE.MeshStandardMaterial({ color: 0xe1d9c8, map: assets.sidewalk, roughness: 0.62, metalness: 0.02 });
  const sideMat = new THREE.MeshStandardMaterial({ color: 0x9d9b91, roughness: 0.7 });
  const walkFront = U('sidewalk-front', 0, 0.065, 0.23, 0.88, 'drop', { amount: 0.55, duration: 0.95, lift: 0.35 });
  addBox(walkFront, 10.38, 0.13, 1.98, sideMat, -2.21, 0, 0, { receiveShadow: true, castShadow: true });
  tileTop(walkFront, -2.21, 0, 10.38, 1.98, walkMat, 0.136);
  const walkEast = U('sidewalk-east', 1.98, 0.065, -3.74, 0.98, 'drop', { amount: 0.55, duration: 0.95, lift: 0.35 });
  addBox(walkEast, 2.04, 0.13, 5.96, sideMat, 0, 0, 0, { receiveShadow: true, castShadow: true });
  tileTop(walkEast, 0, 0, 2.04, 5.96, walkMat, 0.136);
  const walkLeft = U('sidewalk-alley', -6.65, 0.065, -3.68, 1.06, 'drop', { amount: 0.55, duration: 0.95, lift: 0.35 });
  addBox(walkLeft, 1.5, 0.13, 5.86, sideMat, 0, 0, 0, { receiveShadow: true, castShadow: true });
  tileTop(walkLeft, 0, 0, 1.5, 5.86, walkMat, 0.136);
  const backWalk = U('sidewalk-back', -2.45, 0.065, -6.95, 1.12, 'drop', { amount: 0.55, duration: 0.95, lift: 0.3 });
  addBox(backWalk, 7.9, 0.13, 0.78, sideMat, 0, 0, 0, { receiveShadow: true });
  tileTop(backWalk, 0, 0, 7.9, 0.78, walkMat, 0.136);

  // express storefront apron to make the entrance read
  addBox(walkFront, 4.9, 0.03, 1.55, new THREE.MeshStandardMaterial({ color: 0xb9b1a0, roughness: 0.62 }), -2.3, 0.145, 0.15);
  tileTop(walkFront, -2.3, 0.15, 4.9, 1.55, walkMat, 0.163);

  // ---------- curbs and gutters ----------
  const curb = U('curbs', 0, 0, 0, 1.14, 'drop', { amount: 0.5, duration: 0.92, lift: 0.22 });
  const curbMat = new THREE.MeshStandardMaterial({ color: 0xb4b1a6, roughness: 0.74 });
  addBox(curb, 10.5, 0.18, 0.19, curbMat, -2.18, 0.09, 1.27);
  addBox(curb, 0.19, 0.18, 5.98, curbMat, 3.01, 0.09, -2.75);
  addBox(curb, 10.43, 0.025, 0.055, new THREE.MeshStandardMaterial({ color: 0xd6d0be, roughness: 0.55 }), -2.18, 0.19, 1.27);
  addBox(curb, 0.055, 0.025, 5.9, new THREE.MeshStandardMaterial({ color: 0xd6d0be, roughness: 0.55 }), 3.01, 0.19, -2.75);
  // corner curb
  addCylinder(curb, 0.18, 0.18, 0.18, curbMat, 3.0, 0.09, 1.22, { segments: 16 });

  const gutterMat = new THREE.MeshStandardMaterial({ color: 0x20282c, roughness: 0.55, metalness: 0.25 });
  addBox(curb, 10.4, 0.016, 0.16, gutterMat, -2.2, 0.019, 1.42, { castShadow: false });
  addBox(curb, 0.16, 0.016, 5.8, gutterMat, 2.88, 0.019, -2.8, { castShadow: false });
  // drain grates along the curb
  const grateX = [-6.3, -4.55, -2.8, -1.05, 0.7, 2.25];
  for (const gx of grateX) {
    const grate = addBox(curb, 0.54, 0.018, 0.19, gutterMat, gx, 0.031, 1.41, { castShadow: false });
    for (let i = 0; i < 6; i++) {
      addBox(curb, 0.035, 0.012, 0.17, new THREE.MeshStandardMaterial({ color: 0x5e6768, roughness: 0.45, metalness: 0.6 }), gx - 0.2 + i * 0.08, 0.043, 1.41, { castShadow: false });
    }
  }
  const grateZ = [-5.7, -3.9, -2.1, -0.35, 0.9];
  for (const gz of grateZ) {
    addBox(curb, 0.19, 0.018, 0.54, gutterMat, 2.88, 0.031, gz, { castShadow: false });
    for (let i = 0; i < 6; i++) {
      addBox(curb, 0.17, 0.012, 0.035, new THREE.MeshStandardMaterial({ color: 0x5e6768, roughness: 0.45, metalness: 0.6 }), 2.88, 0.043, gz - 0.2 + i * 0.08, { castShadow: false });
    }
  }

  // ---------- tactile paving and crosswalk ----------
  const tactileMat = new THREE.MeshStandardMaterial({ color: 0xe7c656, map: assets.tactile, roughness: 0.52, metalness: 0.02 });
  const tactile = U('tactile-paving', 0, 0, 0, 1.28, 'drop', { amount: 0.6, duration: 0.8, lift: 0.2 });
  const t1 = addPlane(tactile, 2.3, 0.3, tactileMat, 0.55, 0.144, 0.95, { rotation: [-Math.PI / 2, 0, 0], castShadow: false });
  const t2 = addPlane(tactile, 0.3, 1.35, tactileMat, 2.73, 0.144, 0.42, { rotation: [-Math.PI / 2, 0, Math.PI / 2], castShadow: false });
  const t3 = addPlane(tactile, 2.05, 0.3, tactileMat, 1.72, 0.144, 1.05, { rotation: [-Math.PI / 2, 0, 0], castShadow: false });

  const paintMat = new THREE.MeshStandardMaterial({ color: 0xbdb6a6, roughness: 0.38, metalness: 0.1 });
  const roadPaint = U('road-markings', 0, 0, 0, 1.38, 'rise', { amount: 0.6, duration: 0.85, lift: 0.3 });
  for (let i = 0; i < 8; i++) {
    addBox(roadPaint, 2.25, 0.012, 0.28, paintMat, 0.65, 0.025, 1.7 + i * 0.54, { castShadow: false });
  }
  addBox(roadPaint, 2.65, 0.013, 0.095, paintMat, 0.65, 0.025, 1.34, { castShadow: false });
  addBox(roadPaint, 2.2, 0.012, 0.09, paintMat, 4.25, 0.025, 1.52, { castShadow: false });
  addBox(roadPaint, 0.075, 0.012, 3.4, paintMat, 5.4, 0.025, 3.6, { castShadow: false });
  // parking bay markings on east road
  addBox(roadPaint, 1.82, 0.012, 0.07, paintMat, 4.32, 0.025, -5.34, { castShadow: false });
  addBox(roadPaint, 1.82, 0.012, 0.07, paintMat, 4.32, 0.025, -2.23, { castShadow: false });
  addBox(roadPaint, 0.07, 0.012, 3.16, paintMat, 3.41, 0.025, -3.78, { castShadow: false });
  addBox(roadPaint, 0.07, 0.012, 3.16, paintMat, 5.23, 0.025, -3.78, { castShadow: false });
  addBox(roadPaint, 0.37, 0.012, 0.5, paintMat, 4.25, 0.025, -3.76, { castShadow: false, rotation: [0, 0.02, 0] });
  addBox(roadPaint, 0.2, 0.012, 0.075, paintMat, 4.16, 0.025, -3.76, { castShadow: false });
  addBox(roadPaint, 0.2, 0.012, 0.075, paintMat, 4.16, 0.025, -3.56, { castShadow: false });

  // manhole
  const manhole = U('manhole', 4.95, 0.027, 2.55, 1.62, 'drop', { amount: 0.7, duration: 0.75, lift: 0.2 });
  addPlane(manhole, 0.92, 0.92, new THREE.MeshStandardMaterial({ map: assets.manhole, transparent: true, roughness: 0.4, metalness: 0.45, alphaTest: 0.01 }), 0, 0, 0, { rotation: [-Math.PI / 2, 0, 0.2], castShadow: false });
  addCylinder(manhole, 0.49, 0.49, 0.014, new THREE.MeshStandardMaterial({ color: 0x2c3337, roughness: 0.45, metalness: 0.5 }), 0, -0.006, 0, { segments: 32, castShadow: false });

  // small patches and worn paint
  const patchMat = new THREE.MeshBasicMaterial({ color: 0x252d33, transparent: true, opacity: 0.35, depthWrite: false });
  addPlane(root, 0.32, 0.9, patchMat, -2.7, 0.023, 3.2, { rotation: [-Math.PI / 2, 0, 0.3], castShadow: false });
  addPlane(root, 0.18, 0.4, patchMat, 4.1, 0.024, 5.2, { rotation: [-Math.PI / 2, 0, -0.5], castShadow: false });
  addPlane(root, 0.22, 0.75, patchMat, 5.35, 0.024, -1.5, { rotation: [-Math.PI / 2, 0, 0.1], castShadow: false });

  // ---------- sidewalk puddles ----------
  const puddleGroup = U('puddles', 0, 0, 0, 1.7, 'fly', { radius: 0.3, lift: 0.25, duration: 0.7 });
  function puddle(x, z, rx, rz, rot) {
    const shape = new THREE.Shape();
    const points = 22;
    for (let i = 0; i <= points; i++) {
      const a = (i / points) * Math.PI * 2;
      const wobble = 1 + 0.13 * Math.sin(a * 3.1 + 1.3) + 0.08 * Math.sin(a * 5.7);
      const px = Math.cos(a) * rx * wobble;
      const py = Math.sin(a) * rz * wobble;
      if (i === 0) shape.moveTo(px, py); else shape.lineTo(px, py);
    }
    shape.closePath();
    const geo = new THREE.ShapeGeometry(shape);
    const water = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({
      color: 0x24333b, transparent: true, opacity: 0.64, roughness: 0.05,
      metalness: 0.45, envMapIntensity: 1.6, depthWrite: false,
    }));
    water.rotation.x = -Math.PI / 2;
    water.rotation.z = rot;
    water.position.set(x, WORLD.walkY + 0.007, z);
    water.receiveShadow = true;
    water.renderOrder = 4;
    puddleGroup.add(water);
    const reflection = new THREE.Mesh(new THREE.PlaneGeometry(rx * 2.1, rz * 2.4), new THREE.MeshBasicMaterial({
      map: assets.puddleReflection, transparent: true, opacity: 0.55, depthWrite: false,
      blending: THREE.AdditiveBlending, toneMapped: false,
    }));
    reflection.rotation.x = -Math.PI / 2;
    reflection.rotation.z = rot;
    reflection.position.set(x, WORLD.walkY + 0.012, z);
    reflection.renderOrder = 5;
    puddleGroup.add(reflection);
    return water;
  }
  puddle(-0.85, 0.33, 0.68, 0.28, 0.2);
  puddle(2.65, 0.72, 0.38, 0.22, -0.4);
  puddle(-5.1, 0.68, 0.42, 0.17, 0.5);
  puddle(1.55, -1.38, 0.25, 0.48, 0.15);

  // wet sheen spills / reflected shop light on pavement
  const spillGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(5.7, 2.4),
    new THREE.MeshBasicMaterial({
      map: assets.puddleReflection, transparent: true, opacity: 0.28, depthWrite: false,
      blending: THREE.AdditiveBlending, color: 0xffbf86, toneMapped: false,
    }),
  );
  spillGlow.rotation.x = -Math.PI / 2;
  spillGlow.position.set(-1.1, 0.17, 0.38);
  spillGlow.renderOrder = 6;
  root.add(spillGlow);
  glows.push({ mesh: spillGlow, opacity: 0.28 });
  const cyanSheen = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 4.8),
    new THREE.MeshBasicMaterial({
      map: makeRadialGlowTexture(), transparent: true, opacity: 0.12, depthWrite: false,
      blending: THREE.AdditiveBlending, color: 0x64bdd4, toneMapped: false,
    }),
  );
  cyanSheen.rotation.x = -Math.PI / 2;
  cyanSheen.position.set(2.5, 0.16, 0.1);
  cyanSheen.renderOrder = 4;
  root.add(cyanSheen);
  glows.push({ mesh: cyanSheen, opacity: 0.12 });

  // parking wheel stop and little service details
  addBox(root, 0.48, 0.18, 0.22, new THREE.MeshStandardMaterial({ color: 0xb0a17c, roughness: 0.8 }), 4.32, 0.1, -5.55, { rotation: [0, 0.06, 0] });
  addBox(root, 0.16, 0.03, 0.24, new THREE.MeshBasicMaterial({ color: 0xcec6b0 }), 4.32, 0.2, -5.55);

  return { units, glows, z: { base, asphalt, walkFront, walkEast, walkLeft, backWalk, curb, tactile, roadPaint, puddleGroup } };
}
