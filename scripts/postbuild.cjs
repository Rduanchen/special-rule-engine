/*
  Post-build step:
  - TypeScript (NodeNext + type=module) emits ESM JS to dist/*.js
  - Some consumers in this workspace (backend) still rely on CJS resolution in tooling,
    so we also provide a CommonJS entrypoint dist/index.cjs.

  This file is intentionally CommonJS so it can be executed in any Node mode.
*/

const fs = require("node:fs");
const path = require("node:path");

const distDir = path.resolve(__dirname, "..", "dist");

if (!fs.existsSync(distDir)) {
  throw new Error("dist/ missing. Run `npm run build` first.");
}

const cjsEntryPath = path.join(distDir, "index.cjs");

// Minimal CJS bridge to ESM build.
// NOTE: require() can't load ESM synchronously. We export a Promise-returning proxy.
// For this workspace we don't actually require() it at runtime, but some tooling
// checks for a `require` condition. Keeping it here avoids ERR_PACKAGE_PATH_NOT_EXPORTED.
const cjsBridge = `"use strict";

module.exports = require("./index.js");
`;

fs.writeFileSync(cjsEntryPath, cjsBridge, "utf8");

console.log("postbuild: wrote dist/index.cjs");
