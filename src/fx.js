import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { makeRadialGlowTexture } from './lib.js';

export const WET_GROUND_Y = 0.055;

const wetShader = {
  name: 'WetAsphaltShader',
  uniforms: {
    color: { value: new THREE.Color(0xffffff) },
    tDiffuse: { value: null },
    textureMatrix: { value: null },
    uTime: { value: 0 },
    uWetness: { value: 0 },
  },
  vertexShader: [
    'uniform mat4 textureMatrix;',
    'varying vec4 vUv;',
    'varying vec3 vWorld;',
    'void main() {',
    '  vUv = textureMatrix * vec4( position, 1.0 );',
    '  vec4 wp = modelMatrix * vec4( position, 1.0 );',
    '  vWorld = wp.xyz;',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
    '}',
  ].join('\n'),
  fragmentShader: [
    'uniform sampler2D tDiffuse;',
    'uniform float uTime;',
    'uniform float uWetness;',
    'varying vec4 vUv;',
    'varying vec3 vWorld;',
    'float hash( vec2 p ) {',
    '  p = fract( p * vec2( 123.34, 456.21 ) );',
    '  p += dot( p, p + 45.32 );',
    '  return fract( p.x * p.y );',
    '}',
    'float noise( vec2 p ) {',
    '  vec2 i = floor( p );',
    '  vec2 f = fract( p );',
    '  f = f * f * ( 3.0 - 2.0 * f );',
    '  float a = hash( i );',
    '  float b = hash( i + vec2( 1.0, 0.0 ) );',
    '  float c = hash( i + vec2( 0.0, 1.0 ) );',
    '  float d = hash( i + vec2( 1.0, 1.0 ) );',
    '  return mix( mix( a, b, f.x ), mix( c, d, f.x ), f.y );',
    '}',
    'float fbm( vec2 p ) {',
    '  float v = 0.0;',
    '  float a = 0.5;',
    '  for ( int i = 0; i < 4; i++ ) {',
    '    v += a * noise( p );',
    '    p = p * 2.03 + 17.1;',
    '    a *= 0.5;',
    '  }',
    '  return v;',
    '}',
    'void main() {',
    '  vec2 p = vWorld.xz;',
    '  float broad = fbm( p * 0.33 + vec2( 2.1, 7.3 ) );',
    '  float fine = fbm( p * 1.06 - vec2( 5.2, 1.8 ) );',
    '  float puddle = smoothstep( 0.52, 0.70, broad + 0.12 * fine );',
    '  vec2 uv = vUv.xy / vUv.w;',
    '  float flow1 = noise( p * 1.5 + vec2( 0.0, -uTime * 0.075 ) );',
    '  float flow2 = noise( p * 1.9 + vec2( uTime * 0.055, 4.0 ) );',
    '  vec2 distort = ( vec2( flow1, flow2 ) - 0.5 ) * ( 0.0018 + puddle * 0.0022 );',
    '  vec2 q = p * 1.75;',
    '  vec2 id = floor( q );',
    '  vec2 f = fract( q ) - 0.5;',
    '  float h = hash( id );',
    '  float phase = fract( uTime * 0.52 + h * 8.37 );',
    '  vec2 center = ( vec2( hash( id + 3.2 ), hash( id + 8.9 ) ) - 0.5 ) * 0.36;',
    '  vec2 dvec = f - center;',
    '  float dist = length( dvec );',
    '  float isActive = smoothstep( 0.38, 0.64, hash( id + 4.7 ) );',
    '  float ring = smoothstep( 0.028, 0.0, abs( dist - phase * 0.43 ) ) * ( 1.0 - phase ) * isActive * ( 0.35 + puddle * 0.65 );',
    '  distort += normalize( dvec + 0.0001 ) * ring * 0.008;',
    '  vec3 refl = texture2D( tDiffuse, uv + distort ).rgb * 0.38;',
    '  refl += texture2D( tDiffuse, uv + distort + vec2( 0.0034, 0.0012 ) ).rgb * 0.17;',
    '  refl += texture2D( tDiffuse, uv + distort * 1.7 - vec2( 0.0027, 0.0019 ) ).rgb * 0.17;',
    '  refl += texture2D( tDiffuse, uv + distort * 2.4 + vec2( -0.0013, 0.0031 ) ).rgb * 0.14;',
    '  refl += texture2D( tDiffuse, uv + distort * 0.55 - vec2( 0.0036, 0.0023 ) ).rgb * 0.14;',
    '  vec3 viewDir = normalize( cameraPosition - vWorld );',
    '  float fres = pow( 1.0 - max( dot( viewDir, vec3( 0.0, 1.0, 0.0 ) ), 0.0 ), 2.2 );',
    '  float warm = smoothstep( 0.0, 5.0, p.y - 3.0 );',
    '  vec3 tint = mix( vec3( 0.66, 0.82, 0.88 ), vec3( 1.0, 0.82, 0.62 ), warm * 0.28 );',
    '  vec3 glint = vec3( 1.0, 0.72, 0.42 ) * ring * puddle * 0.09;',
    '  glint += vec3( 0.55, 0.75, 0.85 ) * ring * 0.04;',
    '  vec3 col = refl * tint * ( 0.68 + 0.42 * fres ) + glint;',
    '  float wet = uWetness * ( 0.095 + puddle * 0.33 + fres * 0.055 );',
    '  gl_FragColor = vec4( col, wet );',
    '}',
  ].join('\n'),
};

export function buildSky(scene) {
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      uTop: { value: new THREE.Color(0x030811) },
      uHorizon: { value: new THREE.Color(0x102b38) },
      uBottom: { value: new THREE.Color(0x050c12) },
      uGlow: { value: new THREE.Color(0x39222b) },
    },
    vertexShader: [
      'varying vec3 vDir;',
      'void main() {',
      '  vDir = normalize( position );',
      '  vec4 mv = modelViewMatrix * vec4( position, 1.0 );',
      '  gl_Position = projectionMatrix * mv;',
      '}',
    ].join('\n'),
    fragmentShader: [
      'uniform vec3 uTop;',
      'uniform vec3 uHorizon;',
      'uniform vec3 uBottom;',
      'uniform vec3 uGlow;',
      'varying vec3 vDir;',
      'void main() {',
      '  float h = vDir.y;',
      '  vec3 col = mix( uHorizon, uTop, smoothstep( 0.02, 0.72, h ) );',
      '  col = mix( uBottom, col, smoothstep( -0.48, 0.02, h ) );',
      '  float city = pow( max( 0.0, 1.0 - abs( h + 0.02 ) * 4.2 ), 3.0 );',
      '  city *= smoothstep( 0.5, 1.0, vDir.z * 0.5 + 0.5 );',
      '  col += uGlow * city * 0.34;',
      '  float haze = smoothstep( 0.22, 0.0, abs( h - 0.06 ) ) * 0.035;',
      '  col += vec3( 0.09, 0.16, 0.19 ) * haze;',
      '  gl_FragColor = vec4( col, 1.0 );',
      '}',
    ].join('\n'),
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(58, 32, 18), skyMat);
  sky.frustumCulled = false;
  sky.renderOrder = -100;
  scene.add(sky);
  return sky;
}

export function buildWetGround(scene) {
  const geometry = new THREE.PlaneGeometry(13.26, 13.26);
  const wet = new Reflector(geometry, {
    clipBias: 0.0035,
    textureWidth: 1024,
    textureHeight: 1024,
    multisample: 2,
    color: 0xffffff,
    shader: wetShader,
  });
  wet.rotation.x = -Math.PI / 2;
  wet.position.set(-0.9, WET_GROUND_Y, -0.9);
  wet.material.transparent = true;
  wet.material.depthWrite = false;
  wet.material.blending = THREE.NormalBlending;
  wet.material.toneMapped = false;
  wet.renderOrder = 2;
  wet.frustumCulled = false;
  scene.add(wet);
  const uniforms = wet.material.uniforms;
  return {
    mesh: wet,
    update(t, wetness) {
      uniforms.uTime.value = t;
      uniforms.uWetness.value = wetness;
    },
  };
}

export function buildRain(scene, amount = 2200) {
  const positions = new Float32Array(amount * 2 * 3);
  const ends = new Float32Array(amount * 2);
  const baseY = new Float32Array(amount * 2);
  const speeds = new Float32Array(amount * 2);
  const lengths = new Float32Array(amount * 2);
  const alphas = new Float32Array(amount * 2);
  const warms = new Float32Array(amount * 2);
  for (let i = 0; i < amount; i++) {
    const x = (Math.random() - 0.5) * 20.5;
    const z = (Math.random() - 0.5) * 20.5;
    const y = Math.random() * 17;
    const speed = 7.5 + Math.random() * 9.5;
    const len = 0.26 + Math.random() * 0.55;
    const alpha = 0.10 + Math.random() * 0.26;
    const warm = Math.random() < 0.25 ? 0.55 + Math.random() * 0.45 : Math.random() * 0.17;
    for (let e = 0; e < 2; e++) {
      const idx = i * 2 + e;
      positions[idx * 3] = x;
      positions[idx * 3 + 1] = 0;
      positions[idx * 3 + 2] = z;
      ends[idx] = e;
      baseY[idx] = y;
      speeds[idx] = speed;
      lengths[idx] = len;
      alphas[idx] = alpha;
      warms[idx] = warm;
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aEnd', new THREE.BufferAttribute(ends, 1));
  geo.setAttribute('aBaseY', new THREE.BufferAttribute(baseY, 1));
  geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
  geo.setAttribute('aLength', new THREE.BufferAttribute(lengths, 1));
  geo.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
  geo.setAttribute('aWarm', new THREE.BufferAttribute(warms, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    uniforms: { uTime: { value: 0 }, uOpacity: { value: 0.7 } },
    vertexShader: [
      'attribute float aEnd;',
      'attribute float aBaseY;',
      'attribute float aSpeed;',
      'attribute float aLength;',
      'attribute float aAlpha;',
      'attribute float aWarm;',
      'uniform float uTime;',
      'varying float vAlpha;',
      'varying float vWarm;',
      'varying float vY;',
      'void main() {',
      '  float fall = mod( aBaseY - uTime * aSpeed, 17.0 );',
      '  vec3 p = position;',
      '  p.y = fall - aEnd * aLength;',
      '  p.x += ( 17.0 - fall ) * 0.045 - aEnd * aLength * 0.13;',
      '  p.z += ( 17.0 - fall ) * 0.012 - aEnd * aLength * 0.04;',
      '  vAlpha = aAlpha * smoothstep( 0.0, 1.2, fall );',
      '  vWarm = aWarm;',
      '  vY = fall;',
      '  gl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );',
      '}',
    ].join('\n'),
    fragmentShader: [
      'uniform float uOpacity;',
      'varying float vAlpha;',
      'varying float vWarm;',
      'varying float vY;',
      'void main() {',
      '  vec3 cold = vec3( 0.52, 0.69, 0.82 );',
      '  vec3 warm = vec3( 1.0, 0.74, 0.46 );',
      '  vec3 col = mix( cold, warm, vWarm );',
      '  float a = vAlpha * uOpacity * smoothstep( 17.0, 13.0, vY );',
      '  gl_FragColor = vec4( col, a );',
      '}',
    ].join('\n'),
  });
  const rain = new THREE.LineSegments(geo, mat);
  rain.frustumCulled = false;
  rain.renderOrder = 40;
  rain.layers.set(1);
  scene.add(rain);

  // low drifting rain mist, layered to catch the storefront light
  const mistCount = 260;
  const mistPos = new Float32Array(mistCount * 3);
  for (let i = 0; i < mistCount; i++) {
    mistPos[i * 3] = (Math.random() - 0.5) * 16;
    mistPos[i * 3 + 1] = 0.08 + Math.random() * 2.2;
    mistPos[i * 3 + 2] = (Math.random() - 0.5) * 16;
  }
  const mistGeo = new THREE.BufferGeometry();
  mistGeo.setAttribute('position', new THREE.BufferAttribute(mistPos, 3));
  const mist = new THREE.Points(mistGeo, new THREE.PointsMaterial({
    color: 0x9abcca,
    size: 0.035,
    map: makeRadialGlowTexture(),
    transparent: true,
    opacity: 0.2,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    toneMapped: false,
  }));
  mist.layers.set(1);
  mist.renderOrder = 39;
  scene.add(mist);

  const lightShaftMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 } },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    vertexShader: [
      'varying vec2 vUv;',
      'varying vec3 vNormalW;',
      'varying vec3 vViewDir;',
      'void main() {',
      '  vUv = uv;',
      '  vec4 world = modelMatrix * vec4( position, 1.0 );',
      '  vNormalW = normalize( mat3( modelMatrix ) * normal );',
      '  vViewDir = normalize( cameraPosition - world.xyz );',
      '  gl_Position = projectionMatrix * viewMatrix * world;',
      '}',
    ].join('\n'),
    fragmentShader: [
      'uniform float uOpacity;',
      'varying vec2 vUv;',
      'varying vec3 vNormalW;',
      'varying vec3 vViewDir;',
      'void main() {',
      '  float edge = pow( 1.0 - abs( dot( normalize( vNormalW ), normalize( vViewDir ) ) ), 2.0 );',
      '  float fade = smoothstep( 0.0, 0.55, vUv.y ) * smoothstep( 1.0, 0.5, vUv.y );',
      '  gl_FragColor = vec4( vec3( 1.0, 0.72, 0.41 ), edge * fade * 0.038 * uOpacity );',
      '}',
    ].join('\n'),
  });
  const shaft = new THREE.Mesh(new THREE.ConeGeometry(2.1, 4.3, 32, 1, true), lightShaftMat);
  shaft.position.set(3.62, 2.22, -0.05);
  shaft.layers.set(1);
  shaft.renderOrder = 30;
  scene.add(shaft);

  return {
    rain,
    mist,
    shaft,
    update(t, intensity) {
      mat.uniforms.uTime.value = t;
      mat.uniforms.uOpacity.value = intensity * 0.48;
      mist.material.opacity = 0.1 + intensity * 0.12;
      mist.rotation.y = t * 0.01;
      lightShaftMat.uniforms.uTime.value = t;
      lightShaftMat.uniforms.uOpacity.value = Math.max(0, intensity);
    },
  };
}

export function buildDust(scene, count = 220) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 14.5;
    positions[i * 3 + 1] = 0.2 + Math.random() * 4.7;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 14.5;
    seeds[i] = Math.random() * 10;
    sizes[i] = 0.025 + Math.random() * 0.06;
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 1 },
      uMap: { value: makeRadialGlowTexture() },
    },
    vertexShader: [
      'attribute float aSeed;',
      'attribute float aSize;',
      'uniform float uTime;',
      'varying float vGlow;',
      'void main() {',
      '  vec3 p = position;',
      '  p.y += sin( uTime * 0.23 + aSeed ) * 0.22 + mod( uTime * 0.08 + aSeed, 0.4 );',
      '  p.x += sin( uTime * 0.11 + aSeed * 3.0 ) * 0.18;',
      '  vec4 mv = modelViewMatrix * vec4( p, 1.0 );',
      '  gl_PointSize = aSize * 900.0 / max( -mv.z, 1.0 );',
      '  gl_Position = projectionMatrix * mv;',
      '  vGlow = 0.35 + 0.65 * pow( abs( sin( uTime * 0.9 + aSeed * 5.0 ) ), 3.0 );',
      '}',
    ].join('\n'),
    fragmentShader: [
      'uniform sampler2D uMap;',
      'uniform float uOpacity;',
      'varying float vGlow;',
      'void main() {',
      '  vec4 tex = texture2D( uMap, gl_PointCoord );',
      '  vec3 col = mix( vec3( 0.82, 0.94, 1.0 ), vec3( 1.0, 0.8, 0.51 ), 0.55 );',
      '  gl_FragColor = vec4( col, tex.a * vGlow * uOpacity * 0.65 );',
      '}',
    ].join('\n'),
  });
  const dust = new THREE.Points(geometry, mat);
  dust.frustumCulled = false;
  dust.layers.set(1);
  dust.renderOrder = 35;
  scene.add(dust);
  return {
    mesh: dust,
    update(t, opacity) {
      mat.uniforms.uTime.value = t;
      mat.uniforms.uOpacity.value = opacity;
    },
  };
}

export function buildPost(renderer, scene, camera) {
  const size = renderer.getSize(new THREE.Vector2());
  const target = new THREE.WebGLRenderTarget(size.x, size.y, {
    type: THREE.HalfFloatType,
    samples: 4,
  });
  const composer = new EffectComposer(renderer, target);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  const bloom = new UnrealBloomPass(new THREE.Vector2(size.x, size.y), 0.2, 0.5, 1.06);
  composer.addPass(bloom);
  const output = new OutputPass();
  composer.addPass(output);

  const finish = {
    uniforms: {
      tDiffuse: { value: null },
      uTime: { value: 0 },
      uVignette: { value: 0.24 },
      uGrain: { value: 0.022 },
      uAberration: { value: 0.0009 },
    },
    vertexShader: [
      'varying vec2 vUv;',
      'void main() {',
      '  vUv = uv;',
      '  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
      '}',
    ].join('\n'),
    fragmentShader: [
      'uniform sampler2D tDiffuse;',
      'uniform float uTime;',
      'uniform float uVignette;',
      'uniform float uGrain;',
      'uniform float uAberration;',
      'varying vec2 vUv;',
      'float hash( vec2 p ) {',
      '  p = fract( p * vec2( 123.34, 456.21 ) );',
      '  p += dot( p, p + 45.32 );',
      '  return fract( p.x * p.y );',
      '}',
      'void main() {',
      '  vec2 centered = vUv - 0.5;',
      '  float r2 = dot( centered, centered );',
      '  vec2 dir = centered * uAberration * ( 0.35 + r2 * 2.2 );',
      '  vec3 color;',
      '  color.r = texture2D( tDiffuse, vUv + dir ).r;',
      '  color.g = texture2D( tDiffuse, vUv ).g;',
      '  color.b = texture2D( tDiffuse, vUv - dir ).b;',
      '  float luma = dot( color, vec3( 0.299, 0.587, 0.114 ) );',
      '  color += vec3( -0.008, 0.012, 0.018 ) * ( 1.0 - luma );',
      '  color = mix( vec3( luma ), color, 0.96 );',
      '  color = pow( max( color, 0.0 ), vec3( 0.97, 0.985, 1.015 ) );',
      '  float vignette = smoothstep( 0.92, 0.24, length( centered * vec2( 1.0, 1.08 ) ) * 1.42 );',
      '  color *= mix( 1.0, vignette, uVignette );',
      '  float n = hash( vUv * vec2( 1920.0, 1080.0 ) + fract( uTime ) * 83.7 ) - 0.5;',
      '  color += n * uGrain;',
      '  color += vec3( 0.08, 0.035, 0.0 ) * pow( luma, 3.0 ) * 0.1;',
      '  gl_FragColor = vec4( color, 1.0 );',
      '}',
    ].join('\n'),
  };
  const finishPass = new ShaderPass(finish);
  composer.addPass(finishPass);
  return {
    composer,
    bloom,
    finish,
    resize(w, h) {
      composer.setSize(w, h);
      bloom.setSize(w, h);
    },
    update(t) {
      finish.uniforms.uTime.value = t;
    },
    render() {
      composer.render();
    },
  };
}


export function buildBackdropGlow(scene) {
  const defs = [
    { color: 0x2b5966, pos: [-2.0, 6.8, -17.0], scale: [36, 24], opacity: 0.14 },
    { color: 0x5a303b, pos: [7.0, 4.2, -14.0], scale: [19, 14], opacity: 0.09 },
  ];
  for (const def of defs) {
    const mat = new THREE.SpriteMaterial({
      map: makeRadialGlowTexture(),
      color: def.color,
      transparent: true,
      opacity: def.opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.position.set(def.pos[0], def.pos[1], def.pos[2]);
    sprite.scale.set(def.scale[0], def.scale[1], 1);
    sprite.renderOrder = -20;
    scene.add(sprite);
  }
}

export function buildEnvironmentMap(renderer) {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext('2d');
  const sky = ctx.createLinearGradient(0, 0, 0, 512);
  sky.addColorStop(0, '#02060b');
  sky.addColorStop(0.42, '#0a1a24');
  sky.addColorStop(0.58, '#15262c');
  sky.addColorStop(1, '#05090d');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1024, 512);
  ctx.filter = 'blur(22px)';
  ctx.fillStyle = 'rgba(255,203,139,0.85)';
  ctx.fillRect(350, 300, 210, 54);
  ctx.fillStyle = 'rgba(160,226,220,0.4)';
  ctx.fillRect(620, 312, 90, 40);
  ctx.fillStyle = 'rgba(240,134,166,0.26)';
  ctx.fillRect(170, 322, 64, 32);
  ctx.fillStyle = 'rgba(255,226,175,0.22)';
  ctx.fillRect(760, 338, 120, 22);
  ctx.filter = 'none';
  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const env = pmrem.fromEquirectangular(tex).texture;
  tex.dispose();
  pmrem.dispose();
  return env;
}
