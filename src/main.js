import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  Assembly, initRenderingAssets, createAssets, smoothstep, easeOutCubic,
} from './lib.js';
import { buildWorld } from './world.js';
import { buildStore } from './store.js';
import { buildProps } from './props.js';
import {
  buildSky, buildWetGround, buildRain, buildDust, buildPost, buildEnvironmentMap, buildBackdropGlow,
} from './fx.js';

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance',
  stencil: false,
});
const DPR = Math.min(window.devicePixelRatio || 1, window.innerWidth < 820 ? 1.5 : 1.75);
renderer.setPixelRatio(DPR);
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050b11);
scene.fog = new THREE.FogExp2(0x08141d, 0.0085);

const camera = new THREE.PerspectiveCamera(33, window.innerWidth / window.innerHeight, 0.1, 110);
camera.layers.enable(1);
const target = new THREE.Vector3(-1.0, 0.72, -1.55);
const heroDir = new THREE.Vector3(0.96, 0.62, 1.2).normalize();
const startDir = new THREE.Vector3(1.08, 1.08, 1.42).normalize();

function framingDistance() {
  const a = window.innerWidth / window.innerHeight;
  if (a < 0.8) return 39.5;
  if (a < 1.15) return 31.5;
  if (a < 1.5) return 29.0;
  return 27.2;
}
let heroDistance = framingDistance();
camera.position.copy(target).addScaledVector(heroDir, heroDistance);
camera.lookAt(target);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(target);
controls.enableDamping = true;
controls.dampingFactor = 0.062;
controls.enablePan = false;
controls.minDistance = 10.5;
controls.maxDistance = 46;
controls.minPolarAngle = 0.24;
controls.maxPolarAngle = 1.43;
controls.rotateSpeed = 0.58;
controls.zoomSpeed = 0.75;
controls.enabled = false;
controls.update();

initRenderingAssets();
const assets = createAssets();
const envMap = buildEnvironmentMap(renderer);
scene.environment = envMap;
scene.environmentIntensity = 0.9;

buildSky(scene);
buildBackdropGlow(scene);

const assembly = new Assembly();
const world = buildWorld(assembly, assets, scene);
const store = buildStore(assembly, assets, scene);
const props = buildProps(assembly, assets, scene);

const wet = buildWetGround(scene);
const rain = buildRain(scene, 2000);
const dust = buildDust(scene, 240);
const post = buildPost(renderer, scene, camera);
if (typeof post.composer.setPixelRatio === 'function') post.composer.setPixelRatio(DPR);
post.resize(window.innerWidth, window.innerHeight);

// Lights outside the assembly timeline: moonlight and city fill.
const hemi = new THREE.HemisphereLight(0x9dc9df, 0x3b2f29, 0.68);
scene.add(hemi);
const moon = new THREE.DirectionalLight(0x9bc5e4, 1.45);
moon.position.set(-8.5, 14.5, 8.5);
moon.target.position.set(0, 0, -1.2);
moon.castShadow = true;
moon.shadow.mapSize.set(2048, 2048);
moon.shadow.camera.left = -12;
moon.shadow.camera.right = 12;
moon.shadow.camera.top = 12;
moon.shadow.camera.bottom = -12;
moon.shadow.camera.near = 1;
moon.shadow.camera.far = 36;
moon.shadow.bias = -0.00045;
moon.shadow.normalBias = 0.025;
scene.add(moon);
scene.add(moon.target);
const fill = new THREE.DirectionalLight(0x719cb8, 0.5);
fill.position.set(10, 7, -11);
scene.add(fill);
const warmBounce = new THREE.DirectionalLight(0xd58a63, 0.18);
warmBounce.position.set(6, 3, 9);
warmBounce.target.position.set(-2, 1, -2);
scene.add(warmBounce);
scene.add(warmBounce.target);

const storeLights = store.lights.map(entry => ({ light: entry.light, intensity: entry.light.intensity }));
const propsLights = props.lights.map(entry => ({ light: entry.light, intensity: entry.intensity }));
const signMaterials = store.signMaterials.concat(props.signMaterials);
const glowMaterials = [];
for (const g of world.glows.concat(props.glows)) {
  if (g && g.mesh && g.mesh.material) glowMaterials.push({ material: g.mesh.material, baseOpacity: g.opacity });
}
if (store.fillGlow) glowMaterials.push({ material: store.fillGlow, baseOpacity: 0.06 });
for (const s of signMaterials) s.current = new THREE.Color(0, 0, 0);

let introComplete = false;
let introStart = null;
function finishIntro() {
  if (introComplete) return;
  introComplete = true;
  controls.enabled = true;
  controls.target.copy(target);
  controls.update();
}
let pointerUsed = false;
function interruptIntro() {
  pointerUsed = true;
  finishIntro();
}
renderer.domElement.addEventListener('pointerdown', interruptIntro);
renderer.domElement.addEventListener('wheel', interruptIntro, { passive: true });
renderer.domElement.addEventListener('touchstart', interruptIntro, { passive: true });

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  heroDistance = framingDistance();
  camera.updateProjectionMatrix();
  post.resize(w, h);
  if (typeof post.composer.setPixelRatio === 'function') post.composer.setPixelRatio(DPR);
  if (!introComplete) {
    // keep the current intro camera on screen; the next animation frame reprojects it.
  }
}
window.addEventListener('resize', resize);

const clock = new THREE.Clock();
let elapsed = 0;
if (new URLSearchParams(location.search).has('debug') || location.hash === '#debug') {
  window.__RAINY__ = {
    scene, camera, renderer, controls, assembly, store, props, wet, rain, dust, post,
    setTime(v) { elapsed = v; clock.getDelta(); },
    finishIntro,
  };
}

const flickerValue = (t) => {
  if (t < 4.45) return 0;
  if (t > 5.8) return 1;
  const a = Math.sin(t * 61.7) * Math.sin(t * 17.3 + 1.8);
  const b = Math.sin(t * 113.0 + 2.4);
  return a > -0.25 || b > 0.1 ? 1 : 0.08;
};

function updateLights(t) {
  let power = smoothstep((t - 4.0) / 1.35);
  if (t < 5.7) {
    const f = flickerValue(t);
    if (power > 0.02) power *= 0.22 + 0.78 * f;
  }
  for (const e of storeLights) e.light.intensity = e.intensity * power;
  for (const e of propsLights) e.light.intensity = e.intensity * power;
  for (let i = 0; i < signMaterials.length; i++) {
    const s = signMaterials[i];
    const on = t < 4.35 ? 0 : flickerValue(t + i * 0.11);
    const level = 0.035 + on * 0.965;
    s.material.color.copy(s.base).multiplyScalar(level);
  }
  const ambientLift = 0.48 + smoothstep((t - 0.2) / 2.0) * 0.2;
  hemi.intensity = ambientLift * 0.72;
  moon.intensity = 1.45 * (0.65 + smoothstep((t - 0.2) / 3.0) * 0.35);
  for (const g of glowMaterials) g.material.opacity = g.baseOpacity * power;
  return power;
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  elapsed += dt;
  const t = elapsed;

  if (!introComplete) {
    const p = Math.min(1, t / 7.8);
    const e = easeOutCubic(p);
    const dir = startDir.clone().lerp(heroDir, e).normalize();
    const dist = heroDistance + (1 - e) * 12.5;
    camera.position.copy(target).addScaledVector(dir, dist);
    camera.lookAt(target);
    if (p >= 1) finishIntro();
  } else {
    controls.update();
  }

  const fade = smoothstep(t / 1.15);
  renderer.toneMappingExposure = 0.04 + fade * 0.92;

  assembly.update(t);
  updateLights(t);
  renderer.shadowMap.autoUpdate = t < 8.5;
  const wetness = smoothstep((t - 3.55) / 1.8);
  const rainPower = smoothstep((t - 3.35) / 1.65);
  wet.update(t, wetness);
  rain.update(t, rainPower);
  dust.update(t, 1.0 - smoothstep((t - 6.5) / 1.8));
  post.update(t);

  store.glassRainTexture.offset.y = -t * 0.035;
  store.glassRainTexture.offset.x = Math.sin(t * 0.07) * 0.02;
  const signPulse = 1.0 + Math.sin(t * 1.7) * 0.015;
  post.bloom.strength = 0.18 * (0.35 + Math.min(1, t / 4.0)) * signPulse;
  if (store.blinkLED) {
    const b = (Math.sin(t * 2.2) > 0.95) ? 1.0 : 0.15;
    store.blinkLED.material.color.setRGB(1.0 * b, 0.1 * b, 0.07 * b);
  }

  post.render();
}

animate();
