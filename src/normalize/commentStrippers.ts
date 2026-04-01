import { normalizeNewlines } from "./newlineNormalizer";

export function stripCLikeComments(sourceText: string): string {
    // Best-effort stripping that does NOT understand string literals.
    // Good enough for v1 regex/includes rules.
    const text = normalizeNewlines(sourceText);

    // Remove block comments first (including newlines).
    const withoutBlock = text.replace(/\/\*[\s\S]*?\*\//g, "");

    // Remove line comments.
    return withoutBlock.replace(/(^|\s)\/\/.*$/gm, (m) => {
        // Keep leading whitespace so line structure doesn't collapse too much.
        const idx = m.indexOf("//");
        if (idx <= 0) return "";
        return m.slice(0, idx);
    });
}

export function stripPythonLineComments(sourceText: string): string {
    // Best-effort stripping that does NOT understand string literals.
    const text = normalizeNewlines(sourceText);
    return text.replace(/(^|\s)#.*$/gm, (m) => {
        const idx = m.indexOf("#");
        if (idx <= 0) return "";
        return m.slice(0, idx);
    });
}
