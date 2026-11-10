import * as THREE from 'three';

const JP_FONT = '"Yu Gothic UI", "Yu Gothic", "Hiragino Kaku Gothic ProN", "Meiryo", "Microsoft YaHei", sans-serif';
const EN_FONT = '"Avenir Next", "Futura", "Trebuchet MS", "Arial", sans-serif';

function canvasTexture(w, h, draw, repeat = null) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  if (repeat) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeat[0], repeat[1]);
  }
  tex.needsUpdate = true;
  return tex;
}

function rounded(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function grain(ctx, w, h, amount = 0.05, step = 2) {
  const image = ctx.getImageData(0, 0, w, h);
  const d = image.data;
  for (let i = 0; i < d.length; i += 4 * step) {
    const n = (Math.random() - 0.5) * 255 * amount;
    d[i] = Math.max(0, Math.min(255, d[i] + n));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
  }
  ctx.putImageData(image, 0, 0);
}

function rgba(r, g, b, a) {
  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}

function rgb(r, g, b) {
  return 'rgb(' + r + ',' + g + ',' + b + ')';
}

export function asphaltTexture() {
  return canvasTexture(640, 640, (ctx, w, h) => {
    ctx.fillStyle = '#363c43';
    ctx.fillRect(0, 0, w, h);
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, 'rgba(73,82,92,0.22)');
    g.addColorStop(0.5, 'rgba(20,24,30,0.1)');
    g.addColorStop(1, 'rgba(89,97,105,0.16)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 4800; i++) {
      const v = 38 + Math.random() * 55;
      ctx.fillStyle = rgba(v, v + 4, v + 8, 0.05 + Math.random() * 0.3);
      const s = Math.random() < 0.9 ? 1 : 2 + Math.random() * 2;
      ctx.fillRect(Math.random() * w, Math.random() * h, s, s);
    }
    ctx.strokeStyle = 'rgba(15,18,23,0.4)';
    ctx.lineWidth = 1.1;
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      let x = Math.random() * w;
      let y = Math.random() * h;
      ctx.moveTo(x, y);
      for (let j = 0; j < 5; j++) {
        x += (Math.random() - 0.5) * 50;
        y += 15 + Math.random() * 36;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(140,149,155,0.12)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 14; i++) {
      ctx.beginPath();
      const y = Math.random() * h;
      ctx.moveTo(0, y);
      ctx.lineTo(w, y + (Math.random() - 0.5) * 30);
      ctx.stroke();
    }
    grain(ctx, w, h, 0.08, 3);
  }, [5, 5]);
}

export function sidewalkTexture() {
  return canvasTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#a9a69d';
    ctx.fillRect(0, 0, w, h);
    const n = 4;
    const s = w / n;
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const v = 155 + Math.random() * 24;
        ctx.fillStyle = rgb(v + 8, v + 5, v - 2);
        ctx.fillRect(x * s + 3, y * s + 3, s - 6, s - 6);
        ctx.fillStyle = 'rgba(255,255,255,0.10)';
        ctx.fillRect(x * s + 4, y * s + 4, s - 8, 2);
      }
    }
    ctx.strokeStyle = 'rgba(80,80,76,0.35)';
    ctx.lineWidth = 3;
    for (let i = 0; i <= n; i++) {
      ctx.beginPath();
      ctx.moveTo(i * s, 0);
      ctx.lineTo(i * s, h);
      ctx.moveTo(0, i * s);
      ctx.lineTo(w, i * s);
      ctx.stroke();
    }
    for (let i = 0; i < 1600; i++) {
      ctx.fillStyle = rgba(60 + Math.random() * 90, 60 + Math.random() * 90, 55 + Math.random() * 80, Math.random() * 0.14);
      ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }
    grain(ctx, w, h, 0.035, 4);
  }, [3.2, 3.2]);
}

export function tactileTexture() {
  return canvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#c9a74b';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,218,115,0.55)';
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        ctx.beginPath();
        ctx.arc(32 + x * 64, 32 + y * 64, 15, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.strokeStyle = 'rgba(99,77,22,0.3)';
    ctx.lineWidth = 4;
    for (let i = 0; i <= 4; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 64, 0);
      ctx.lineTo(i * 64, h);
      ctx.stroke();
    }
    grain(ctx, w, h, 0.07, 2);
  }, [1, 5]);
}

export function mainSignTexture() {
  return canvasTexture(2560, 360, (ctx, w, h) => {
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#fff8e7');
    bg.addColorStop(0.58, '#f8ecd2');
    bg.addColorStop(1, '#e9d8b9');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(100,84,57,0.13)';
    ctx.lineWidth = 3;
    ctx.strokeRect(11, 11, w - 22, h - 22);
    for (let i = 0; i < 360; i++) {
      ctx.fillStyle = rgba(105, 86, 52, Math.random() * 0.04);
      ctx.fillRect(Math.random() * w, Math.random() * h, Math.random() * 4, Math.random() * 2);
    }

    const lx = 74;
    const ly = 74;
    ctx.lineCap = 'round';
    const bars = [
      ['#ea7546', 0, 26],
      ['#eba63a', 16, 31],
      ['#4f9b72', 49, 27],
      ['#3d7e8c', 66, 23],
    ];
    for (const [color, off, ww] of bars) {
      ctx.fillStyle = color;
      rounded(ctx, lx + off, ly + 16, ww + 104, 24, 12);
      ctx.fill();
    }
    ctx.fillStyle = '#244e4b';
    ctx.font = '700 22px ' + EN_FONT;
    ctx.letterSpacing = '7px';
    ctx.fillText('NAMI MART', lx + 4, ly + 105);
    ctx.font = '700 17px ' + JP_FONT;
    ctx.fillStyle = '#967954';
    ctx.letterSpacing = '3px';
    ctx.fillText('なみのまちの、いつもの灯り。', lx + 2, ly + 139);

    ctx.letterSpacing = '3px';
    ctx.font = '900 178px ' + JP_FONT;
    ctx.fillStyle = '#173e3b';
    ctx.fillText('なみマート', 420, 222);
    ctx.font = '800 39px ' + EN_FONT;
    ctx.letterSpacing = '15px';
    ctx.fillStyle = '#476d68';
    ctx.fillText('CONVENIENCE STORE', 432, 285);

    ctx.strokeStyle = 'rgba(41,79,74,0.26)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(2010, 66);
    ctx.lineTo(2010, 294);
    ctx.stroke();
    ctx.fillStyle = '#ea7546';
    ctx.font = '900 150px ' + EN_FONT;
    ctx.letterSpacing = '-4px';
    ctx.fillText('24', 2074, 230);
    ctx.fillStyle = '#234b47';
    ctx.font = '800 32px ' + EN_FONT;
    ctx.letterSpacing = '9px';
    ctx.fillText('HOURS', 2220, 228);
    ctx.font = '700 26px ' + JP_FONT;
    ctx.letterSpacing = '7px';
    ctx.fillStyle = '#496f68';
    ctx.fillText('年中無休', 2110, 278);
    ctx.font = '600 22px ' + JP_FONT;
    ctx.letterSpacing = '3px';
    ctx.fillStyle = '#7f674a';
    ctx.fillText('ATM ・ コーヒー ・ コピー ・ 宅配便', 1460, 315);

    const lamp = ctx.createRadialGradient(1280, 20, 40, 1280, 20, 880);
    lamp.addColorStop(0, 'rgba(255,239,196,0.24)');
    lamp.addColorStop(1, 'rgba(255,239,196,0)');
    ctx.fillStyle = lamp;
    ctx.fillRect(0, 0, w, h);
    grain(ctx, w, h, 0.022, 4);
  });
}

export function bladeSignTexture() {
  return canvasTexture(512, 1536, (ctx, w, h) => {
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#f9edd5');
    bg.addColorStop(1, '#e9d3af');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#254e49';
    ctx.lineWidth = 18;
    ctx.strokeRect(14, 14, w - 28, h - 28);
    ctx.fillStyle = '#ea7546';
    ctx.fillRect(58, 67, w - 116, 16);
    ctx.fillStyle = '#4f9b72';
    ctx.fillRect(58, 91, w - 154, 12);
    ctx.fillStyle = '#3b7c89';
    ctx.fillRect(58, 111, w - 208, 10);
    ctx.fillStyle = '#1a4440';
    ctx.textAlign = 'center';
    ctx.font = '900 155px ' + EN_FONT;
    ctx.letterSpacing = '-4px';
    ctx.fillText('24', w / 2, 305);
    ctx.font = '800 49px ' + EN_FONT;
    ctx.letterSpacing = '15px';
    ctx.fillText('HOURS', w / 2 + 8, 368);
    ctx.strokeStyle = 'rgba(35,75,70,0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(94, 432);
    ctx.lineTo(w - 94, 432);
    ctx.stroke();
    ctx.font = '900 140px ' + JP_FONT;
    ctx.letterSpacing = '6px';
    const chars = ['な', 'み', 'マ', 'ー', 'ト'];
    chars.forEach((ch, i) => ctx.fillText(ch, w / 2, 578 + i * 162));
    ctx.strokeStyle = '#254e49';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(w / 2, 1448, 32, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#254e49';
    ctx.beginPath();
    ctx.arc(w / 2, 1448, 15, 0, Math.PI * 2);
    ctx.fill();
    grain(ctx, w, h, 0.025, 4);
  });
}

export function vendingTexture() {
  return canvasTexture(900, 1400, (ctx, w, h) => {
    ctx.fillStyle = '#edf3e8';
    ctx.fillRect(0, 0, w, h);
    const top = ctx.createLinearGradient(0, 0, 0, 380);
    top.addColorStop(0, '#2f7b6e');
    top.addColorStop(1, '#194d4c');
    ctx.fillStyle = top;
    ctx.fillRect(0, 0, w, 360);
    ctx.fillStyle = '#f6e4bd';
    ctx.font = '900 58px ' + JP_FONT;
    ctx.letterSpacing = '2px';
    ctx.fillText('つめた〜い', 62, 100);
    ctx.font = '800 30px ' + EN_FONT;
    ctx.letterSpacing = '10px';
    ctx.fillStyle = '#bfe2cf';
    ctx.fillText('MORI DRINK', 64, 149);
    ctx.fillStyle = '#ea7546';
    rounded(ctx, 596, 38, 240, 104, 52);
    ctx.fill();
    ctx.fillStyle = '#fff4dc';
    ctx.font = '900 54px ' + EN_FONT;
    ctx.textAlign = 'center';
    ctx.fillText('100', 716, 106);
    ctx.font = '700 24px ' + JP_FONT;
    ctx.fillText('円', 814, 107);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f5d7a1';
    rounded(ctx, 482, 188, 128, 150, 20);
    ctx.fill();
    ctx.fillStyle = '#e9efe7';
    rounded(ctx, 497, 197, 98, 48, 15);
    ctx.fill();
    ctx.fillStyle = '#234e49';
    rounded(ctx, 531, 207, 32, 28, 14);
    ctx.fill();
    ctx.fillStyle = '#fff9ea';
    ctx.font = '900 28px ' + JP_FONT;
    ctx.fillText('COFFEE', 500, 287);
    ctx.font = '700 17px ' + EN_FONT;
    ctx.fillText('HOT / ICE', 510, 314);
    ctx.fillStyle = '#dce8e2';
    ctx.fillRect(32, 382, w - 64, 650);
    ctx.fillStyle = 'rgba(255,255,255,0.84)';
    ctx.fillRect(46, 394, w - 92, 624);
    for (let row = 0; row < 4; row++) {
      const yy = 416 + row * 154;
      ctx.fillStyle = 'rgba(34,81,74,0.2)';
      ctx.fillRect(55, yy + 132, w - 110, 5);
      for (let col = 0; col < 6; col++) {
        const xx = 98 + col * 115;
        const palette = ['#e77748', '#7cbf91', '#507f9f', '#e7c159', '#d5d9d6', '#c86464', '#5b9a81', '#e8a04e'];
        ctx.fillStyle = palette[(row * 6 + col) % palette.length];
        rounded(ctx, xx, yy + 25, 68, 104, 14);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillRect(xx + 10, yy + 47, 48, 31);
        ctx.fillStyle = 'rgba(24,51,49,0.45)';
        ctx.fillRect(xx + 15, yy + 55, 38, 4);
        ctx.fillRect(xx + 15, yy + 64, 25, 3);
        ctx.fillStyle = '#e8b84c';
        rounded(ctx, xx + 17, yy + 15, 34, 10, 4);
        ctx.fill();
      }
    }
    ctx.fillStyle = '#204f4a';
    ctx.fillRect(48, 1058, 234, 265);
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i === 0 ? '#ed7547' : 'rgba(240,226,195,0.8)';
      rounded(ctx, 68, 1083 + i * 51, 92, 28, 7);
      ctx.fill();
      ctx.fillStyle = '#21524c';
      ctx.font = '700 16px ' + EN_FONT;
      ctx.fillText(String(i + 1), 79, 1103 + i * 51);
    }
    ctx.fillStyle = '#d7dfd6';
    ctx.fillRect(180, 1090, 74, 168);
    ctx.fillStyle = '#414e4b';
    ctx.fillRect(192, 1112, 50, 7);
    ctx.fillStyle = '#2c3936';
    ctx.fillRect(222, 1126, 10, 22);
    ctx.fillStyle = '#b8c3bb';
    ctx.fillRect(195, 1175, 44, 44);
    ctx.fillStyle = '#2e3d3a';
    ctx.font = '700 17px ' + JP_FONT;
    ctx.fillText('IC', 208, 1204);
    ctx.fillStyle = '#1c3432';
    rounded(ctx, 300, 1128, 534, 148, 14);
    ctx.fill();
    ctx.fillStyle = '#0b1b1b';
    rounded(ctx, 320, 1148, 494, 72, 10);
    ctx.fill();
    ctx.fillStyle = '#b8c8bf';
    ctx.font = '700 22px ' + JP_FONT;
    ctx.letterSpacing = '4px';
    ctx.fillText('とりだしぐち', 466, 1257);
    ctx.fillStyle = '#e8eee6';
    ctx.fillRect(0, 1334, w, 66);
    ctx.fillStyle = '#295c54';
    ctx.font = '800 22px ' + JP_FONT;
    ctx.letterSpacing = '5px';
    ctx.fillText('MORI BEVERAGE  /  RECYCLE', 52, 1374);
    grain(ctx, w, h, 0.02, 5);
  });
}

export function windowDecalTexture() {
  return canvasTexture(1600, 640, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'rgba(255,251,236,0.8)';
    ctx.fillStyle = 'rgba(255,251,236,0.92)';
    ctx.lineWidth = 4;
    ctx.font = '800 112px ' + EN_FONT;
    ctx.letterSpacing = '5px';
    ctx.fillText('OPEN', w / 2, 180);
    ctx.font = '900 176px ' + EN_FONT;
    ctx.fillText('24H', w / 2, 370);
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(360, 425);
    ctx.lineTo(w - 360, 425);
    ctx.stroke();
    ctx.font = '700 54px ' + JP_FONT;
    ctx.letterSpacing = '14px';
    ctx.fillText('COFFEE  ·  ATM  ·  COPY', w / 2, 510);
    ctx.globalAlpha = 0.55;
    ctx.font = '500 36px ' + JP_FONT;
    ctx.letterSpacing = '8px';
    ctx.fillText('なみのまちの、いつもの灯り。', w / 2, 574);
  });
}

export function bulletinTexture() {
  return canvasTexture(1024, 700, (ctx, w, h) => {
    ctx.fillStyle = '#cabf9e';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#2e4c46';
    ctx.fillRect(0, 0, w, 88);
    ctx.fillStyle = '#f7ead2';
    ctx.font = '800 44px ' + JP_FONT;
    ctx.letterSpacing = '4px';
    ctx.fillText('浜町二丁目 おしらせ板', 36, 60);
    const posters = [
      { x: 34, y: 118, w: 300, h: 510, color: '#efe2c2', title: '夏の\n商店街\n祭り', accent: '#d7603f', sub: '8.24  sat' },
      { x: 360, y: 140, w: 286, h: 268, color: '#d9e3d6', title: '子猫の\n里親募集', accent: '#527f72', sub: 'TEL 090-...' },
      { x: 360, y: 430, w: 286, h: 200, color: '#ecdcc2', title: '防犯\nパトロール', accent: '#3e647e', sub: '毎週金曜 19:00' },
      { x: 676, y: 118, w: 312, h: 332, color: '#e7e0cc', title: '喫茶\nこもれび', accent: '#8f5f47', sub: 'OPEN 7:00 - 19:00' },
      { x: 676, y: 472, w: 312, h: 158, color: '#d8e2e2', title: '資源ごみ\n収集日', accent: '#3e7473', sub: '水曜日 朝8時まで' },
    ];
    for (const p of posters) {
      ctx.save();
      ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
      ctx.rotate((Math.random() - 0.5) * 0.035);
      ctx.translate(-p.w / 2, -p.h / 2);
      ctx.fillStyle = 'rgba(22,29,25,0.2)';
      ctx.fillRect(7, 8, p.w, p.h);
      ctx.fillStyle = p.color;
      ctx.fillRect(0, 0, p.w, p.h);
      ctx.strokeStyle = 'rgba(46,58,48,0.22)';
      ctx.lineWidth = 2;
      ctx.strokeRect(7, 7, p.w - 14, p.h - 14);
      ctx.fillStyle = p.accent;
      ctx.fillRect(0, 0, p.w, 11);
      const lines = p.title.split('\n');
      ctx.fillStyle = '#22342e';
      ctx.font = '900 ' + (p.h > 240 ? 47 : 37) + 'px ' + JP_FONT;
      ctx.textAlign = 'center';
      lines.forEach((line, i) => ctx.fillText(line, p.w / 2, 72 + i * 58));
      ctx.font = '700 19px ' + EN_FONT;
      ctx.fillStyle = '#58655c';
      ctx.fillText(p.sub, p.w / 2, p.h - 42);
      ctx.fillStyle = p.accent;
      ctx.beginPath();
      ctx.arc(p.w / 2, p.h - 86, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(252,246,229,0.7)';
      ctx.beginPath();
      ctx.arc(p.w / 2, p.h - 86, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = 'rgba(42,56,46,0.22)';
    ctx.fillRect(0, 0, w, h);
    grain(ctx, w, h, 0.06, 3);
  });
}

export function promoPosterTexture() {
  return canvasTexture(640, 900, (ctx, w, h) => {
    ctx.fillStyle = '#f3e4c6';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#2d5c52';
    ctx.fillRect(0, 0, w, 138);
    ctx.fillStyle = '#f8ecd5';
    ctx.textAlign = 'center';
    ctx.font = '900 58px ' + JP_FONT;
    ctx.letterSpacing = '5px';
    ctx.fillText('ホットスナック', w / 2, 88);
    ctx.fillStyle = '#e46f45';
    ctx.beginPath();
    ctx.arc(w / 2, 390, 178, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f4c56f';
    ctx.beginPath();
    ctx.arc(w / 2 - 40, 370, 45, 0, Math.PI * 2);
    ctx.arc(w / 2 + 62, 430, 33, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f8ead2';
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.arc(w / 2, 390, 154, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#254842';
    ctx.font = '900 74px ' + JP_FONT;
    ctx.fillText('揚げたて', w / 2, 675);
    ctx.font = '800 37px ' + EN_FONT;
    ctx.letterSpacing = '7px';
    ctx.fillStyle = '#8c6943';
    ctx.fillText('FRIED & WARM', w / 2, 737);
    ctx.font = '600 26px ' + JP_FONT;
    ctx.fillText('店内でどうぞ', w / 2, 806);
    grain(ctx, w, h, 0.035, 4);
  });
}

export function magazineTexture(index = 0) {
  const palettes = [
    ['#e57345', '#f3ddb7', '#244c49'],
    ['#4d8579', '#edf1df', '#233d3b'],
    ['#d7b24e', '#f6ead0', '#59462e'],
    ['#657d9f', '#e8e6dc', '#243545'],
    ['#b76767', '#f2e3d4', '#3d2d2d'],
    ['#338181', '#eef4e6', '#173d3e'],
  ];
  const p = palettes[index % palettes.length];
  const titles = ['街の\n小さな\n喫茶店', '夏の\n夜空\n特集', 'おいしい\n朝ごはん', '週末\nドライブ', '部屋と\n植物', '雨の日\nの音楽'];
  return canvasTexture(320, 440, (ctx, w, h) => {
    ctx.fillStyle = p[1];
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = p[0];
    ctx.fillRect(0, 0, w, 92);
    ctx.fillStyle = p[2];
    ctx.font = '900 27px ' + EN_FONT;
    ctx.letterSpacing = '3px';
    ctx.fillText('MACHI', 20, 40);
    ctx.font = '700 12px ' + JP_FONT;
    ctx.fillText('CITY LIFE MAGAZINE', 20, 61);
    ctx.fillStyle = p[2];
    ctx.beginPath();
    ctx.arc(230, 172, 72, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p[0];
    ctx.beginPath();
    ctx.arc(190, 208, 52, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.36)';
    ctx.beginPath();
    ctx.arc(250, 152, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(30,48,46,0.1)';
    ctx.fillRect(0, 233, w, 207);
    ctx.fillStyle = p[2];
    ctx.font = '900 36px ' + JP_FONT;
    ctx.textAlign = 'right';
    titles[index % titles.length].split('\n').forEach((line, i) => {
      ctx.fillText(line, w - 20, 285 + i * 42);
    });
    ctx.fillStyle = 'rgba(247,239,220,0.88)';
    ctx.fillRect(20, 344, 170, 58);
    ctx.fillStyle = p[2];
    ctx.font = '700 16px ' + JP_FONT;
    ctx.textAlign = 'left';
    ctx.fillText('特集 / 雨の夜の過ごし方', 29, 370);
    ctx.font = '500 12px ' + JP_FONT;
    ctx.fillText('NAMI MART 店内限定', 29, 390);
    grain(ctx, w, h, 0.04, 4);
  });
}

export function neonSignTexture() {
  return canvasTexture(512, 420, (ctx, w, h) => {
    ctx.fillStyle = '#132b2e';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#c8e5d7';
    ctx.lineWidth = 7;
    ctx.strokeRect(14, 14, w - 28, h - 28);
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ff7da8';
    ctx.shadowBlur = 32;
    ctx.fillStyle = '#ff9cbc';
    ctx.font = '700 43px ' + JP_FONT;
    ctx.letterSpacing = '12px';
    ctx.fillText('スナック', w / 2, 100);
    ctx.font = '900 210px ' + JP_FONT;
    ctx.letterSpacing = '0px';
    ctx.fillText('夢', w / 2, 320);
    ctx.shadowBlur = 12;
    ctx.strokeStyle = '#ffb0c6';
    ctx.lineWidth = 3;
    ctx.strokeText('夢', w / 2, 320);
    ctx.shadowBlur = 0;
    ctx.font = '600 24px ' + EN_FONT;
    ctx.letterSpacing = '9px';
    ctx.fillStyle = '#f4c4d1';
    ctx.fillText('YUME  ·  BAR', w / 2, 376);
  });
}

export function streetNameTexture() {
  return canvasTexture(900, 230, (ctx, w, h) => {
    ctx.fillStyle = '#254f71';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#e6f2ef';
    ctx.lineWidth = 10;
    ctx.strokeRect(13, 13, w - 26, h - 26);
    ctx.fillStyle = '#f4f7ee';
    ctx.textAlign = 'center';
    ctx.font = '800 86px ' + JP_FONT;
    ctx.letterSpacing = '12px';
    ctx.fillText('浜町二丁目', w / 2, 135);
    ctx.font = '600 27px ' + EN_FONT;
    ctx.letterSpacing = '7px';
    ctx.fillText('HAMAMACHI 2-CHOME', w / 2, 186);
    ctx.fillStyle = '#e8c05e';
    ctx.beginPath();
    ctx.moveTo(858, 112);
    ctx.lineTo(820, 146);
    ctx.lineTo(858, 180);
    ctx.closePath();
    ctx.fill();
  });
}

export function stopTexture() {
  return canvasTexture(640, 560, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#b73d38';
    ctx.beginPath();
    ctx.moveTo(70, 55);
    ctx.lineTo(w - 70, 55);
    ctx.lineTo(w / 2, h - 45);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#f1e6cf';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(100, 80);
    ctx.lineTo(w - 100, 80);
    ctx.lineTo(w / 2, h - 82);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = '#fff4de';
    ctx.textAlign = 'center';
    ctx.font = '900 126px ' + JP_FONT;
    ctx.fillText('止まれ', w / 2, 315);
  });
}

export function parkingTexture() {
  return canvasTexture(320, 480, (ctx, w, h) => {
    ctx.fillStyle = '#ece8d9';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#28504a';
    ctx.lineWidth = 16;
    ctx.strokeRect(12, 12, w - 24, h - 24);
    ctx.fillStyle = '#28504a';
    ctx.fillRect(0, 0, w, 78);
    ctx.fillStyle = '#f0e3c7';
    ctx.font = '800 36px ' + JP_FONT;
    ctx.textAlign = 'center';
    ctx.letterSpacing = '8px';
    ctx.fillText('PARKING', w / 2, 52);
    ctx.fillStyle = '#ea7546';
    ctx.font = '900 260px ' + EN_FONT;
    ctx.fillText('P', w / 2, 350);
    ctx.fillStyle = '#31554e';
    ctx.font = '600 23px ' + JP_FONT;
    ctx.fillText('前払い / 1時間 300円', w / 2, 420);
  });
}

export function matTexture() {
  return canvasTexture(640, 320, (ctx, w, h) => {
    ctx.fillStyle = '#2e4d45';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#b9a776';
    ctx.lineWidth = 7;
    ctx.strokeRect(18, 18, w - 36, h - 36);
    ctx.strokeStyle = 'rgba(235,222,190,0.35)';
    ctx.lineWidth = 3;
    ctx.strokeRect(37, 37, w - 74, h - 74);
    ctx.fillStyle = '#eadfc7';
    ctx.textAlign = 'center';
    ctx.font = '800 59px ' + EN_FONT;
    ctx.letterSpacing = '12px';
    ctx.fillText('WELCOME', w / 2, 156);
    ctx.font = '600 28px ' + JP_FONT;
    ctx.letterSpacing = '8px';
    ctx.fillStyle = '#d6c59e';
    ctx.fillText('なみマート', w / 2, 216);
    for (let i = 0; i < 300; i++) {
      ctx.fillStyle = rgba(190, 180, 150, Math.random() * 0.08);
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 3);
    }
  });
}

export function manholeTexture() {
  return canvasTexture(512, 512, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#363d42';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 246, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#697177';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 234, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(150,158,159,0.4)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 174, 0, Math.PI * 2);
    ctx.stroke();
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.strokeStyle = 'rgba(155,163,164,0.45)';
    ctx.lineWidth = 6;
    for (let i = 0; i < 16; i++) {
      ctx.rotate(Math.PI / 8);
      ctx.beginPath();
      ctx.moveTo(66, 0);
      ctx.lineTo(158, 0);
      ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = 'rgba(115,126,125,0.46)';
    ctx.font = '700 36px ' + JP_FONT;
    ctx.textAlign = 'center';
    ctx.fillText('浜町市 下水道', w / 2, h / 2 + 18);
    grain(ctx, w, h, 0.12, 2);
  });
}

export function puddleReflectionTexture() {
  return canvasTexture(512, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(255,226,174,0)');
    grad.addColorStop(0.32, 'rgba(255,215,155,0.2)');
    grad.addColorStop(1, 'rgba(255,210,150,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.filter = 'blur(10px)';
    ctx.fillStyle = 'rgba(255,219,156,0.45)';
    ctx.fillRect(130, 20, 58, 176);
    ctx.fillRect(264, 16, 36, 180);
    ctx.fillStyle = 'rgba(195,240,229,0.32)';
    ctx.fillRect(340, 50, 24, 136);
    ctx.fillStyle = 'rgba(255,154,182,0.18)';
    ctx.fillRect(53, 94, 34, 100);
    ctx.filter = 'none';
    ctx.strokeStyle = 'rgba(255,238,197,0.15)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.moveTo(20 + Math.random() * (w - 40), Math.random() * h);
      ctx.lineTo(20 + Math.random() * (w - 40), Math.random() * h);
      ctx.stroke();
    }
  });
}

export function plaqueTexture() {
  return canvasTexture(1200, 230, (ctx, w, h) => {
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#303a3b');
    bg.addColorStop(1, '#151e20');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(201,176,118,0.9)';
    ctx.lineWidth = 4;
    ctx.strokeRect(13, 13, w - 26, h - 26);
    ctx.fillStyle = '#d8c8a1';
    ctx.font = '600 33px ' + EN_FONT;
    ctx.letterSpacing = '12px';
    ctx.fillText('NAMI MART  /  AFTER RAIN', 54, 86);
    ctx.fillStyle = '#f1e6cc';
    ctx.font = '800 62px ' + JP_FONT;
    ctx.letterSpacing = '10px';
    ctx.fillText('雨の夜、いつもの街角。', 54, 160);
    ctx.fillStyle = '#b8a57c';
    ctx.font = '500 22px ' + EN_FONT;
    ctx.letterSpacing = '5px';
    ctx.fillText('MINIATURE DIORAMA  ·  1:64', 56, 200);
  });
}

export function shopSignSmallTexture(label, sub) {
  return canvasTexture(800, 180, (ctx, w, h) => {
    ctx.fillStyle = '#f2e7d0';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#224b46';
    ctx.font = '800 76px ' + JP_FONT;
    ctx.textAlign = 'center';
    ctx.letterSpacing = '5px';
    ctx.fillText(label, w / 2, 108);
    ctx.font = '600 23px ' + EN_FONT;
    ctx.fillStyle = '#8a6d46';
    ctx.letterSpacing = '8px';
    ctx.fillText(sub, w / 2, 151);
  });
}

export const FONTS = { JP_FONT, EN_FONT };
