import type { SourceNormalizer } from "../types";
import { normalizeNewlines } from "./newlineNormalizer";
import { stripCLikeComments, stripPythonLineComments } from "./commentStrippers";

const cLikeLanguages = new Set([
    "c",
    "cpp",
    "c++",
    "java",
    "javascript",
    "typescript",
    "js",
    "ts",
]);

const pythonLanguages = new Set(["python", "py"]);

export const defaultSourceNormalizer: SourceNormalizer = {
    normalize({ language, sourceText }) {
        const lang = language.trim().toLowerCase();
        const nl = normalizeNewlines(sourceText);

        if (pythonLanguages.has(lang)) {
            return { normalizedText: stripPythonLineComments(nl) };
        }

        if (cLikeLanguages.has(lang)) {
            return { normalizedText: stripCLikeComments(nl) };
        }

        // Fallback: newline-normalize only.
        return { normalizedText: nl };
    },
};
