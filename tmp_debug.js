const src = `
#include<stdio.h>
int main(){
    int n,counter=0;
    scanf("%d", &n);
    for(int i=0;i<n;i++){
        if(12==0){
            printf("\\}");
            return 0;
        }
        for(int j=0;j<n;j++)
            counter++;  
    }
    printf("%d", counter);
    return 0;
}
`;

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
function findMatching(s, start, openCh, closeCh) {
  let depth = 0;
  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (ch === openCh) depth++;
    else if (ch === closeCh) {
      depth--;
      if (depth === 0) return i;
    } else if (ch === '"' || ch === "'") {
      const q = ch;
      i++;
      while (i < s.length && s[i] !== q) {
        if (s[i] === "\\") i += 2;
        else i++;
      }
    }
  }
  return -1;
}

const clean = stripStrings(stripCLikeComments(normalizeNewlines(src)));
console.log("CLEAN:\n", clean);

const loopKeyword = /\b(for|while|do)\b/g;
const loops = [];
let m;
while ((m = loopKeyword.exec(clean)) !== null) {
  const kw = m[1];
  const idx = m.index;
  if (kw === "do") {
    let i = idx + m[0].length;
    while (i < clean.length && /\s/.test(clean[i])) i++;
    if (clean[i] === "{") {
      const end = findMatching(clean, i, "{", "}");
      loops.push({ start: idx, bodyStart: i, bodyEnd: end });
      if (end >= 0) loopKeyword.lastIndex = end + 1;
    } else {
      const semi = clean.indexOf(";", i);
      const end = semi >= 0 ? semi : null;
      loops.push({ start: idx, bodyStart: i, bodyEnd: end });
      if (end) loopKeyword.lastIndex = end + 1;
    }
  } else {
    const parenOpen = clean.indexOf("(", idx + m[0].length);
    if (parenOpen === -1) continue;
    const parenClose = findMatching(clean, parenOpen, "(", ")");
    if (parenClose === -1) continue;
    let i = parenClose + 1;
    while (i < clean.length && /\s/.test(clean[i])) i++;
    if (clean[i] === "{") {
      const end = findMatching(clean, i, "{", "}");
      loops.push({ start: idx, bodyStart: i, bodyEnd: end });
      if (end >= 0) loopKeyword.lastIndex = end + 1;
    } else {
      const tokenMatch = /\b(for|while|do)\b/.exec(clean.slice(i));
      if (tokenMatch && tokenMatch.index === 0) {
        loops.push({ start: idx, bodyStart: i, bodyEnd: null });
        console.log("Immediate nested detected");
        process.exit(0);
      }
      const semi = clean.indexOf(";", i);
      const end = semi >= 0 ? semi : null;
      loops.push({ start: idx, bodyStart: i, bodyEnd: end });
      if (end) loopKeyword.lastIndex = end + 1;
    }
  }
}

console.log("loops:", loops);
for (const outer of loops) {
  if (outer.bodyEnd === null) continue;
  for (const inner of loops) {
    if (inner === outer) continue;
    if (inner.start > outer.bodyStart && inner.start < outer.bodyEnd) {
      console.log("NESTED between", outer, inner);
    }
  }
}
console.log("done");
