const fs = require('node:fs');
const path = require('node:path');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const width = 1200;
const height = 400;
const count = 120;
const delay = 80;
const tau = Math.PI * 2;
const smooth = (a, b, x) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

async function main() {
  const source = await loadImage(path.join(root, 'assets/london-workspace.png'));
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const editor = createCanvas(600, 440);
  const ec = editor.getContext('2d');
  const code = [
    'from fastapi import FastAPI',
    '',
    'app = FastAPI()',
    '',
    '@app.get("/health")',
    'def health():',
    '    return {"status": "ok"}',
    '',
    'def test_health():',
    '    assert health()',
  ];
  ctx.drawImage(source, 0, 0, width, height);
  const base = ctx.getImageData(0, 0, width, height);
  const frames = Buffer.alloc(width * height * 4 * count);
  const lights = [];
  // Sample existing warm window lights; no new buildings or skyline features.
  for (let y = 218; y < 288; y += 7) {
    for (let x = 510; x < 1100; x += 13) {
      const k = (y * width + x) * 4;
      if (base.data[k] > 115 && base.data[k] > base.data[k + 1] * 1.2) lights.push([x, y]);
    }
  }

  function glow(x, y, rx, ry, alpha, rgb) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(rx, ry);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, `rgba(${rgb},${alpha})`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(-1, -1, 2, 2);
    ctx.restore();
  }

  function renderEditor(frame) {
    const step = Math.floor(frame / 12);
    const progress = (frame % 12) / 12;
    const scroll = smooth(.72, 1, progress) * 39;
    ec.fillStyle = '#0a1423';
    ec.fillRect(0, 0, 600, 440);
    ec.fillStyle = '#16283d';
    ec.fillRect(0, 0, 600, 48);
    ec.font = '22px monospace';
    ec.fillStyle = '#d2e7fa';
    ec.fillText('main.py', 32, 32);
    ec.fillStyle = '#61cbff';
    ec.fillRect(23, 44, 128, 3);
    ec.save();
    ec.beginPath();
    ec.rect(0, 53, 600, 348);
    ec.clip();
    ec.font = '28px monospace';
    for (let row = 0; row < 8; row++) {
      const index = (step - 7 + row + code.length * 10) % code.length;
      const y = 84 + row * 39 - scroll;
      const active = row === 7;
      const line = code[index];
      const visible = active ? line.slice(0, Math.floor(line.length * Math.min(1, progress / .65))) : line;
      ec.fillStyle = active ? '#18314a' : '#0a1423';
      ec.fillRect(0, y - 28, 600, 38);
      ec.fillStyle = '#59758d';
      ec.fillText(String(index + 1).padStart(2, ' '), 12, y);
      let x = 61;
      for (const token of visible.split(/("[^"]*"|\b(?:from|import|def|return|assert)\b)/g)) {
        ec.fillStyle = token.startsWith('"') ? '#f0c779'
          : /^(from|import|def|return|assert)$/.test(token) ? '#cb9aff' : '#b9ddf5';
        ec.fillText(token, x, y);
        x += ec.measureText(token).width;
      }
      if (active && frame % 8 < 5) {
        ec.shadowColor = '#7bdcff';
        ec.shadowBlur = 8;
        ec.fillStyle = '#c2f2ff';
        ec.fillRect(Math.min(x + 3, 575), y - 27, 12, 32);
        ec.shadowBlur = 0;
      }
    }
    ec.restore();
    ec.fillStyle = '#123044';
    ec.fillRect(0, 404, 600, 36);
    ec.fillStyle = '#88c8e9';
    ec.font = '19px monospace';
    ec.fillText('Python', 20, 428);
    // The status sweep makes the active screen apparent at profile scale.
    ec.fillStyle = '#64d1db';
    ec.fillRect(290, 414, 260 * (frame % 12) / 11, 10);
  }

  function drawEditor() {
    // Render into the laptop's existing perspective, retaining its bezel.
    const tl = [width * .172, height * .568];
    const tr = [width * .278, height * .568];
    const bl = [width * .198, height * .826];
    const br = [width * .303, height * .817];
    for (let y = 0; y < 440; y += 2) {
      const t = y / 440;
      const left = [tl[0] + (bl[0] - tl[0]) * t, tl[1] + (bl[1] - tl[1]) * t];
      const right = [tr[0] + (br[0] - tr[0]) * t, tr[1] + (br[1] - tr[1]) * t];
      const dx = right[0] - left[0];
      const dy = right[1] - left[1];
      ctx.save();
      ctx.setTransform(dx / 600, dy / 600, (bl[0] - tl[0]) / 440, (bl[1] - tl[1]) / 440, left[0], left[1]);
      ctx.drawImage(editor, 0, y, 600, 2, 0, 0, 600, 2.6);
      ctx.restore();
    }
  }

  function render(frame) {
    frame %= count;
    const phase = tau * frame / count;
    const pixels = new Uint8ClampedArray(base.data);
    // Feather the displacement into the existing river, leaving the camera,
    // architecture, desk and window frame completely stationary.
    for (let y = 302; y < 375; y++) {
      for (let x = 705; x < 1140; x++) {
        const fx = x / width;
        const fy = y / height;
        const mask = smooth(.59, .65, fx) * (1 - smooth(.9, .95, fx))
          * smooth(.755, .79, fy) * (1 - smooth(.91, .938, fy));
        if (!mask) continue;
        const dx = mask * (3.6 * Math.sin(y * .29 + phase * 2)
          + 1.2 * Math.sin(y * .61 - phase));
        const sx = x + dx;
        const left = Math.floor(sx);
        const frac = sx - left;
        const k = (y * width + x) * 4;
        const j = (y * width + left) * 4;
        const shimmer = 1 + mask * .22 * Math.sin(y * .34 + x * .021 + phase * 2);
        for (let c = 0; c < 3; c++) pixels[k + c] = (base.data[j + c] * (1 - frac) + base.data[j + 4 + c] * frac) * shimmer;
      }
    }
    const surface = ctx.createImageData(width, height);
    surface.data.set(pixels);
    ctx.putImageData(surface, 0, 0);

    // Periodic light changes accompany the much more visible code animation.
    const lamp = .14 + .075 * Math.sin(phase) + .018 * Math.sin(phase * 3);
    glow(width * .215, height * .43, 39, 13, lamp, '255,190,92');
    glow(width * .22, height * .84, 155, 42, .065 + .035 * Math.sin(phase), '255,176,80');
    lights.forEach(([x, y], i) => {
      const strength = .06 + .055 * (.5 + .5 * Math.sin(phase * (i % 2 + 1) + i * 2.4));
      glow(x, y, 1.8, 1.8, strength, '255,205,130');
    });

    renderEditor(frame);
    drawEditor();

    // Fine steam ribbons above the existing mug, fading gently into the scene.
    for (let ribbon = 0; ribbon < 2; ribbon++) {
      ctx.beginPath();
      for (let n = 0; n <= 30; n++) {
        const t = n / 30;
        const x = width * .495 + ribbon * 4 + Math.sin(t * 6 + phase + ribbon) * (2 + 3 * t);
        const y = height * .85 - t * 34;
        if (!n) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(196,211,224,${.16 + .06 * Math.sin(phase + ribbon)})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    return ctx.getImageData(0, 0, width, height).data;
  }

  const first = Buffer.from(render(0));
  for (let i = 0; i < count; i++) {
    frames.set(render(i), i * width * height * 4);
  }
  if (!Buffer.from(render(count)).equals(first)) throw new Error('Loop endpoints differ');
  await sharp(frames, { raw: { width, height: height * count, channels: 4, pageHeight: height } })
    .gif({ loop: 0, delay: Array(count).fill(delay), colours: 256, effort: 8, dither: .35, interFrameMaxError: 0, interPaletteMaxError: 0 })
    .toFile(path.join(root, 'assets/london-workspace-animated-v2.gif'));
  const out = path.join(root, 'assets/london-workspace-animated-v2.gif');
  const metadata = await sharp(out, { animated: true }).metadata();
  if (metadata.pages !== count || metadata.delay.some(value => value !== delay)) throw new Error('Unexpected animation timing');
  console.log(JSON.stringify({ output: out, bytes: fs.statSync(out).size, width: metadata.width, frameHeight: metadata.pageHeight, frames: metadata.pages, durationMs: metadata.delay.reduce((a,b) => a+b, 0), seamless: true }));
}

main().catch(error => { console.error(error); process.exitCode = 1; });
