const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");
const { createCanvas, loadImage, GifEncoder } = require("@napi-rs/canvas");

const root = path.resolve(__dirname, "..");
const input = path.join(root, "assets", "hero-static.png");
const output = path.join(root, "assets", "hero-animated.gif");

const width = 1280;
const height = 320;
const frameCount = 18;
const delay = 220;

function cubic(a, b, c, d, t) {
  const mt = 1 - t;
  return (
    mt * mt * mt * a +
    3 * mt * mt * t * b +
    3 * mt * t * t * c +
    t * t * t * d
  );
}

function pointOnRoute(route, t) {
  return {
    x: cubic(route[0], route[2], route[4], route[6], t),
    y: cubic(route[1], route[3], route[5], route[7], t),
  };
}

function drawGlow(ctx, x, y, color, radius, alpha = 1) {
  const [red, green, blue] = color;
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, `rgba(${red},${green},${blue},${alpha})`);
  gradient.addColorStop(0.24, `rgba(${red},${green},${blue},${alpha * 0.65})`);
  gradient.addColorStop(1, `rgba(${red},${green},${blue},0)`);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

async function main() {
  const baseBuffer = await sharp(input)
    .resize(width, height, { fit: "cover", position: "south" })
    .png()
    .toBuffer();

  const base = await loadImage(baseBuffer);
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  const encoder = new GifEncoder(width, height, { repeat: 0, quality: 8 });

  const routes = [
    [430, 248, 660, 215, 860, 212, 1248, 78],
    [575, 268, 740, 225, 1000, 245, 1242, 146],
    [350, 212, 620, 164, 840, 178, 1132, 112],
  ];
  const colors = [[85, 199, 255], [236, 190, 91], [85, 199, 255]];

  for (let frame = 0; frame < frameCount; frame += 1) {
    const phase = frame / frameCount;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(base, 0, 0, width, height);

    const ambience = ctx.createLinearGradient(0, 0, width, 0);
    ambience.addColorStop(0, `rgba(230,184,92,${0.018 + 0.012 * Math.sin(phase * Math.PI * 2)})`);
    ambience.addColorStop(0.46, "rgba(9,17,29,0)");
    ambience.addColorStop(1, `rgba(53,185,255,${0.025 + 0.015 * Math.cos(phase * Math.PI * 2)})`);
    ctx.fillStyle = ambience;
    ctx.fillRect(0, 0, width, height);

    routes.forEach((route, index) => {
      const t = (phase + index * 0.31) % 1;
      const point = pointOnRoute(route, t);
      drawGlow(ctx, point.x, point.y, colors[index], index === 1 ? 13 : 16);
      ctx.fillStyle = `rgb(${colors[index].join(",")})`;
      ctx.beginPath();
      ctx.arc(point.x, point.y, index === 1 ? 2 : 2.4, 0, Math.PI * 2);
      ctx.fill();
    });

    const pulse = 0.35 + 0.25 * Math.sin(phase * Math.PI * 2);
    drawGlow(ctx, 1088, 104, [85, 199, 255], 22, pulse);
    drawGlow(ctx, 1172, 170, [236, 190, 91], 16, pulse * 0.7);

    const frameData = ctx.getImageData(0, 0, width, height).data;
    const bytes = new Uint8Array(frameData.buffer, frameData.byteOffset, frameData.byteLength);
    encoder.addFrame(bytes, width, height, { delay });
  }

  fs.writeFileSync(output, encoder.finish());
  console.log(output);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
