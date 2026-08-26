const fs = require("node:fs");
const path = require("node:path");
const { createCanvas, GifEncoder } = require("@napi-rs/canvas");

const root = path.resolve(__dirname, "..");
const gifOutput = path.join(root, "assets", "about-code.gif");
const staticOutput = path.join(root, "assets", "about-code-static.png");

const width = 1000;
const height = 340;
const frameCount = 50;
const revealFrames = 34;
const delay = 140;

const colors = {
  background: "#07101c",
  panel: "#0d1727",
  panelTop: "#111d2e",
  border: "#29435e",
  text: "#c9d1d9",
  muted: "#66788d",
  keyword: "#ff7b72",
  property: "#d2a8ff",
  string: "#a5d6ff",
  stringWarm: "#e6b85c",
  punctuation: "#8b949e",
  cyan: "#61cbff",
  green: "#56d364",
};

const lines = [
  [
    ["const", colors.keyword], [" vijay", colors.text], [" = ", colors.punctuation], ["{", colors.punctuation],
  ],
  [
    ["  role", colors.property], [": ", colors.punctuation], ["\"Backend & Cloud Developer\"", colors.stringWarm], [",", colors.punctuation],
  ],
  [
    ["  focus", colors.property], [": [", colors.punctuation], ["\"APIs\"", colors.string], [", ", colors.punctuation], ["\"Automation\"", colors.stringWarm], [", ", colors.punctuation], ["\"Applied AI\"", colors.string], ["],", colors.punctuation],
  ],
  [
    ["  building", colors.property], [": [", colors.punctuation], ["\"Wandrix\"", colors.string], [", ", colors.punctuation], ["\"Modular ERP\"", colors.stringWarm], ["],", colors.punctuation],
  ],
  [
    ["  stack", colors.property], [": [", colors.punctuation], ["\"Python\"", colors.stringWarm], [", ", colors.punctuation], ["\"TypeScript\"", colors.string], [", ", colors.punctuation], ["\"FastAPI\"", colors.stringWarm], [", ", colors.punctuation], ["\"PostgreSQL\"", colors.string], [", ", colors.punctuation], ["\"Azure\"", colors.stringWarm], ["],", colors.punctuation],
  ],
  [
    ["  principle", colors.property], [": ", colors.punctuation], ["\"reliable systems, shipped well\"", colors.string], [",", colors.punctuation],
  ],
  [
    ["  status", colors.property], [": ", colors.punctuation], ["\"learning, building, improving\"", colors.stringWarm],
  ],
  [
    ["};", colors.punctuation],
  ],
];

const totalCharacters = lines.reduce(
  (total, line) => total + line.reduce((lineTotal, segment) => lineTotal + segment[0].length, 0),
  0,
);

function roundedPanel(ctx, x, y, w, h, radius) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fill();
  ctx.stroke();
}

function drawAmbientGlow(ctx, phase) {
  const x = 120 + phase * 760;
  const gradient = ctx.createRadialGradient(x, height - 8, 0, x, height - 8, 190);
  gradient.addColorStop(0, "rgba(97,203,255,.13)");
  gradient.addColorStop(1, "rgba(97,203,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawCode(ctx, visibleCharacters, showCursor) {
  const codeX = 96;
  const lineNumberX = 48;
  const firstBaseline = 84;
  const lineHeight = 30;
  let remaining = visibleCharacters;
  let cursorX = codeX;
  let cursorY = firstBaseline;

  ctx.font = "17px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
  ctx.textBaseline = "alphabetic";

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const baseline = firstBaseline + lineIndex * lineHeight;
    ctx.fillStyle = colors.muted;
    ctx.textAlign = "right";
    ctx.fillText(String(lineIndex + 1), lineNumberX, baseline);
    ctx.textAlign = "left";

    let x = codeX;
    let lineHasContent = false;
    for (const [text, color] of lines[lineIndex]) {
      if (remaining <= 0) break;
      const visibleText = text.slice(0, remaining);
      if (!visibleText) break;
      ctx.fillStyle = color;
      ctx.fillText(visibleText, x, baseline);
      x += ctx.measureText(visibleText).width;
      remaining -= visibleText.length;
      lineHasContent = true;
      if (visibleText.length < text.length) break;
    }

    if (lineHasContent || visibleCharacters === 0) {
      cursorX = x;
      cursorY = baseline;
    }
    if (remaining <= 0) break;
  }

  if (showCursor) {
    ctx.fillStyle = colors.cyan;
    ctx.fillRect(cursorX + 2, cursorY - 18, 2, 22);
  }
}

function renderFrame(ctx, frame, forceComplete = false) {
  const phase = frame / frameCount;
  const background = ctx.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, "#06101b");
  background.addColorStop(0.55, "#091522");
  background.addColorStop(1, "#07101c");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);
  drawAmbientGlow(ctx, phase);

  ctx.fillStyle = colors.panel;
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 1.5;
  roundedPanel(ctx, 18, 16, width - 36, height - 32, 16);

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(19, 17, width - 38, 43, [15, 15, 0, 0]);
  ctx.clip();
  ctx.fillStyle = colors.panelTop;
  ctx.fillRect(19, 17, width - 38, 43);
  ctx.restore();

  const trafficLights = ["#ff5f56", "#ffbd2e", "#27c93f"];
  trafficLights.forEach((color, index) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(42 + index * 22, 38, 6, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.font = "13px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
  ctx.fillStyle = "#8aa0b8";
  ctx.textAlign = "center";
  ctx.fillText("vijay@github: ~/profile/about.ts", width / 2, 43);
  ctx.textAlign = "left";

  const pulse = 0.55 + Math.sin(phase * Math.PI * 2) * 0.25;
  ctx.fillStyle = `rgba(86,211,100,${pulse})`;
  ctx.beginPath();
  ctx.arc(width - 43, 38, 4.5, 0, Math.PI * 2);
  ctx.fill();

  const revealRatio = forceComplete ? 1 : Math.min(1, frame / revealFrames);
  const easedReveal = 1 - Math.pow(1 - revealRatio, 2);
  const visibleCharacters = Math.floor(totalCharacters * easedReveal);
  const cursorVisible = forceComplete ? false : frame < revealFrames || Math.floor(frame / 3) % 2 === 0;
  drawCode(ctx, visibleCharacters, cursorVisible);

  ctx.fillStyle = "rgba(97,203,255,.12)";
  ctx.fillRect(70, 67, 1, 240);
}

function main() {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  const encoder = new GifEncoder(width, height, { repeat: 0, quality: 8 });

  for (let frame = 0; frame < frameCount; frame += 1) {
    renderFrame(ctx, frame);
    const pixels = ctx.getImageData(0, 0, width, height).data;
    const bytes = new Uint8Array(pixels.buffer, pixels.byteOffset, pixels.byteLength);
    encoder.addFrame(bytes, width, height, { delay });
  }

  fs.writeFileSync(gifOutput, encoder.finish());
  renderFrame(ctx, frameCount, true);
  fs.writeFileSync(staticOutput, canvas.toBuffer("image/png"));

  console.log(gifOutput);
  console.log(staticOutput);
}

main();
