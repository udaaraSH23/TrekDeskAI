import fs from "fs";
import path from "path";

const VAD_DIST = path.resolve("node_modules/@ricky0123/vad-web/dist");
const ONNX_DIST = path.resolve("node_modules/onnxruntime-web/dist");
const PUBLIC_VAD = path.resolve("public/vad");

if (!fs.existsSync(PUBLIC_VAD)) {
  fs.mkdirSync(PUBLIC_VAD, { recursive: true });
}

const assets = [
  {
    src: path.join(VAD_DIST, "silero_vad_v5.onnx"),
    dest: "silero_vad_v5.onnx",
  },
  {
    src: path.join(VAD_DIST, "silero_vad_legacy.onnx"),
    dest: "silero_vad_legacy.onnx", // Put it back as fallback
  },
  {
    src: path.join(VAD_DIST, "bundle.min.js"),
    dest: "bundle.min.js",
  },
  {
    src: path.join(VAD_DIST, "vad.worklet.bundle.min.js"),
    dest: "vad.worklet.bundle.min.js",
  },
  {
    src: path.join(ONNX_DIST, "ort-wasm-simd-threaded.wasm"),
    dest: "ort-wasm-simd-threaded.wasm",
  },
  {
    src: path.join(ONNX_DIST, "ort-wasm-simd-threaded.mjs"),
    dest: "ort-wasm-simd-threaded.js",
  },
  {
    src: path.join(ONNX_DIST, "ort-wasm-simd-threaded.jsep.wasm"),
    dest: "ort-wasm-simd-threaded.jsep.wasm",
  },
];

assets.forEach(({ src, dest }) => {
  const destPath = path.join(PUBLIC_VAD, dest);
  if (fs.existsSync(src)) {
    console.log(`Copying ${src} to ${destPath}`);
    fs.copyFileSync(src, destPath);
  } else {
    console.warn(`Warning: Asset not found: ${src}`);
  }
});

console.log("VAD assets synchronized successfully.");
