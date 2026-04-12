const src = `#include<stdio.h>
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

const clean = stripStrings(stripCLikeComments(normalizeNewlines(src)));
console.log("CLEAN:\n", clean);

let idx = clean.indexOf("for");
while (idx !== -1) {
  console.log(
    "for at",
    idx,
    "context:",
    JSON.stringify(clean.slice(Math.max(0, idx - 20), idx + 20)),
  );
  idx = clean.indexOf("for", idx + 3);
}
let idx2 = clean.indexOf("while");
while (idx2 !== -1) {
  console.log(
    "while at",
    idx2,
    "context:",
    JSON.stringify(clean.slice(Math.max(0, idx2 - 20), idx2 + 20)),
  );
  idx2 = clean.indexOf("while", idx2 + 5);
}
console.log("\nloops regex matches:");
const loopKeyword = /\b(for|while|do)\b/g;
let m;
while ((m = loopKeyword.exec(clean)) !== null) {
  console.log("match", m[0], "at", m.index);
}
