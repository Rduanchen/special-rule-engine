const fs = require("fs");
const src = fs.readFileSync("tmp_debug.js", "utf8");
function normalizeNewlines(text) {
  return text.replace(/\r\n?/g, "\n");
}
function stripCLikeComments(text) {
  const withoutBlock = text.replace(/\/\*[\s\S]*?\*\//g, "");
  return withoutBlock.replace(/(^|\s)\/\/.*$/gm, (m) => {
    const idx = m.indexOf("//");
    if (idx <= 0) return "";
    return m.slice(0, idx);
  });
}
function stripStrings(s) {
  s = s.replace(/"(?:\\.|[^"\\])*"/g, " ");
  s = s.replace(/'(?:\\.|[^'\\])*'/g, " ");
  return s;
}
const clean = stripStrings(stripCLikeComments(normalizeNewlines(src)));
console.log("clean length", clean.length);
let idx = clean.indexOf("for");
while (idx !== -1) {
  console.log(
    "for at",
    idx,
    "context:",
    clean.slice(Math.max(0, idx - 20), idx + 20),
  );
  idx = clean.indexOf("for", idx + 1);
}
let idx2 = clean.indexOf("while");
while (idx2 !== -1) {
  console.log(
    "while at",
    idx2,
    "context:",
    clean.slice(Math.max(0, idx2 - 20), idx2 + 20),
  );
  idx2 = clean.indexOf("while", idx2 + 1);
}
console.log("\n----RAW CLEAN----\n", clean);
