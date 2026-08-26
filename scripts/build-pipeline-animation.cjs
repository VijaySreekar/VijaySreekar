const fs = require("node:fs");
const path = require("node:path");
const { createCanvas, GifEncoder } = require("@napi-rs/canvas");

const root = path.resolve(__dirname, "..");
const gifOutput = path.join(root, "assets", "code-to-cloud.gif");
const staticOutput = path.join(root, "assets", "code-to-cloud-static.png");

const width = 1000;
const height = 220;
const frameCount = 42;
const delay = 140;
const stages = [
  { label: "CODE", detail: "service.py" },
  { label: "API", detail: "contract" },
  { label: "TEST", detail: "checks" },
  { label: "IMAGE", detail: "container" },
  { label: "CLOUD", detail: "deploy" },
  { label: "SIGNALS", detail: "observe" },
];

const stageX = stages.map((_, index) => 92 + index * 163);
const centerY = 122;

function roundRect(ctx, x, y, w, h, radius) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
}

function glow(ctx, x, y, radius, color) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, "rgba(97,203,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

function render(ctx, frame, forceComplete = false) {
  const phase = forceComplete ? 1 : frame / frameCount;
  const progress = forceComplete ? 1 : (phase * 1.12) % 1;
  const activeFloat = progress * (stages.length - 1);
  const activeIndex = forceComplete ? stages.length - 1 : Math.min(stages.length - 1, Math.floor(activeFloat));
  const localProgress = activeFloat - activeIndex;

  const background = ctx.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, "#07101c");
  background.addColorStop(0.55, "#0a1624");
  background.addColorStop(1, "#07101c");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#0d1727";
  ctx.strokeStyle = "#29435e";
  ctx.lineWidth = 1.5;
  roundRect(ctx, 18, 16, width - 36, height - 32, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#111d2e";
  roundRect(ctx, 19, 17, width - 38, 42, [15, 15, 0, 0]);
  ctx.fill();

  ["#ff5f56", "#ffbd2e", "#27c93f"].forEach((color, index) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(42 + index * 22, 38, 6, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.font = "13px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = "#8aa0b8";
  ctx.fillText("vijay@github: ~/workflows/code-to-cloud.yml", width / 2, 43);

  ctx.lineWidth = 3;
  ctx.strokeStyle = "#243d58";
  ctx.beginPath();
  ctx.moveTo(stageX[0], centerY);
  ctx.lineTo(stageX[stageX.length - 1], centerY);
  ctx.stroke();

  const completedX = forceComplete
    ? stageX[stageX.length - 1]
    : stageX[activeIndex] + (stageX[Math.min(activeIndex + 1, stageX.length - 1)] - stageX[activeIndex]) * localProgress;
  const lineGradient = ctx.createLinearGradient(stageX[0], 0, stageX[stageX.length - 1], 0);
  lineGradient.addColorStop(0, "#e6b85c");
  lineGradient.addColorStop(0.55, "#61cbff");
  lineGradient.addColorStop(1, "#56d364");
  ctx.strokeStyle = lineGradient;
  ctx.beginPath();
  ctx.moveTo(stageX[0], centerY);
  ctx.lineTo(completedX, centerY);
  ctx.stroke();

  stages.forEach((stage, index) => {
    const completed = forceComplete || index < activeIndex;
    const active = forceComplete ? index === stages.length - 1 : index === activeIndex;
    const nodeColor = completed ? "#56d364" : active ? "#61cbff" : "#49627a";
    if (active) glow(ctx, stageX[index], centerY, 45, "rgba(97,203,255,.25)");

    ctx.fillStyle = "#0b1522";
    ctx.strokeStyle = nodeColor;
    ctx.lineWidth = active ? 3 : 2;
    ctx.beginPath();
    ctx.arc(stageX[index], centerY, active ? 21 : 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (completed) {
      ctx.strokeStyle = "#56d364";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(stageX[index] - 7, centerY);
      ctx.lineTo(stageX[index] - 2, centerY + 5);
      ctx.lineTo(stageX[index] + 8, centerY - 6);
      ctx.stroke();
    } else if (active) {
      ctx.fillStyle = "#61cbff";
      ctx.beginPath();
      ctx.arc(stageX[index], centerY, 4.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = "#49627a";
      ctx.beginPath();
      ctx.arc(stageX[index], centerY, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.font = "bold 12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
    ctx.fillStyle = active || completed ? "#c9d1d9" : "#6f8397";
    ctx.fillText(stage.label, stageX[index], 88);
    ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
    ctx.fillStyle = active ? "#e6b85c" : "#6f8397";
    ctx.fillText(stage.detail, stageX[index], 164);
  });

  if (!forceComplete) {
    glow(ctx, completedX, centerY, 23, "rgba(97,203,255,.5)");
    ctx.fillStyle = "#d8f2ff";
    ctx.beginPath();
    ctx.arc(completedX, centerY, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }

  const statusText = forceComplete
    ? "✓ delivery path healthy"
    : `running: ${stages[activeIndex].detail}`;
  ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
  ctx.textAlign = "left";
  ctx.fillStyle = forceComplete ? "#56d364" : "#8aa0b8";
  ctx.fillText(statusText, 38, 197);
}

function main() {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  const encoder = new GifEncoder(width, height, { repeat: 0, quality: 8 });

  for (let frame = 0; frame < frameCount; frame += 1) {
    render(ctx, frame);
    const pixels = ctx.getImageData(0, 0, width, height).data;
    encoder.addFrame(new Uint8Array(pixels.buffer, pixels.byteOffset, pixels.byteLength), width, height, { delay });
  }

  fs.writeFileSync(gifOutput, encoder.finish());
  render(ctx, frameCount, true);
  fs.writeFileSync(staticOutput, canvas.toBuffer("image/png"));
  console.log(gifOutput);
  console.log(staticOutput);
}

main();
