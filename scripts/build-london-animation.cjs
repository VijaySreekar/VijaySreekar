const fs = require('node:fs');
const path = require('node:path');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const width = 1200;
const height = 400;
const count = 100;
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

  function render(frame) {
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
        const dx = mask * (1.3 * Math.sin(y * .29 + phase * 2)
          + .45 * Math.sin(y * .61 - phase));
        const sx = x + dx;
        const left = Math.floor(sx);
        const frac = sx - left;
        const k = (y * width + x) * 4;
        const j = (y * width + left) * 4;
        for (let c = 0; c < 3; c++) pixels[k + c] = base.data[j + c] * (1 - frac) + base.data[j + 4 + c] * frac;
      }
    }
    const surface = ctx.createImageData(width, height);
    surface.data.set(pixels);
    ctx.putImageData(surface, 0, 0);

    // Low-amplitude, periodic light variation gives an exact eight-second loop.
    const lamp = .095 + .018 * Math.sin(phase) + .006 * Math.sin(phase * 3);
    glow(width * .215, height * .43, 39, 13, lamp, '255,190,92');
    glow(width * .22, height * .84, 155, 42, .028 + .01 * Math.sin(phase), '255,176,80');
    lights.forEach(([x, y], i) => {
      const strength = .06 + .055 * (.5 + .5 * Math.sin(phase * (i % 2 + 1) + i * 2.4));
      glow(x, y, 1.8, 1.8, strength, '255,205,130');
    });

    // Screen light stays clipped to the existing laptop display.
    ctx.save();
    ctx.beginPath();
    [[.167,.554],[.277,.552],[.301,.826],[.192,.84]].forEach(([x,y],i) => i ? ctx.lineTo(x*width,y*height) : ctx.moveTo(x*width,y*height));
    ctx.closePath();
    ctx.clip();
    glow(width*.23,height*.70,95,76,.035+.018*Math.sin(phase*2),'85,160,218');
    const lineY = height * (.62 + .09 * (.5 + .5 * Math.sin(phase)));
    glow(width*.221,lineY,28,1.6,.13,'117,191,236');
    ctx.restore();

    // Fine steam ribbons above the existing mug, fading gently into the scene.
    for (let ribbon = 0; ribbon < 2; ribbon++) {
      ctx.beginPath();
      for (let n = 0; n <= 30; n++) {
        const t = n / 30;
        const x = width * .495 + ribbon * 4 + Math.sin(t * 6 + phase + ribbon) * (2 + 3 * t);
        const y = height * .85 - t * 34;
        if (!n) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(196,211,224,${.045 + .018 * Math.sin(phase + ribbon)})`;
      ctx.lineWidth = .7;
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
    .toFile(path.join(root, 'assets/london-workspace-animated.gif'));
  const out = path.join(root, 'assets/london-workspace-animated.gif');
  const metadata = await sharp(out, { animated: true }).metadata();
  if (metadata.pages !== count || metadata.delay.some(value => value !== delay)) throw new Error('Unexpected animation timing');
  console.log(JSON.stringify({ output: out, bytes: fs.statSync(out).size, width: metadata.width, frameHeight: metadata.pageHeight, frames: metadata.pages, durationMs: metadata.delay.reduce((a,b) => a+b, 0), seamless: true }));
}

main().catch(error => { console.error(error); process.exitCode = 1; });
