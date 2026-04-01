import { describe, expect, it } from "vitest";
import { stripCLikeComments, stripPythonLineComments } from "../src/normalize/commentStrippers";
import { defaultSourceNormalizer } from "../src/normalize/registry";

describe("normalization - comment stripping (v1)", () => {
    it("strips C-like line and block comments", () => {
        const input = [
            "int main() {",
            "  // comment-only line",
            "  int x = 1; // trailing comment",
            "  /* block\n     comment */",
            "  return x;",
            "}",
        ].join("\n");

        const out = stripCLikeComments(input);

        expect(out).not.toContain("comment-only");
        expect(out).not.toContain("trailing comment");
        expect(out).not.toContain("block");
        expect(out).toContain("int x = 1;");
    });

    it("strips Python # line comments", () => {
        const input = [
            "x = 1  # trailing",
            "# full line",
            "y = 2",
        ].join("\n");

        const out = stripPythonLineComments(input);

        expect(out).not.toContain("full line");
        expect(out).not.toContain("trailing");
        expect(out).toContain("y = 2");
    });
});

describe("normalization - defaultSourceNormalizer (engine internal)", () => {
    it("normalizes CRLF and strips JS comments", () => {
        const input = [
            "const x = 1; // trailing\r",
            "/* block\r",
            "comment */\r",
            "console.log(x)\r",
        ].join("\n");

        const out = defaultSourceNormalizer.normalize({
            language: "javascript",
            sourceText: input,
        }).normalizedText;

        expect(out).not.toContain("// trailing");
        expect(out).not.toContain("block");
        expect(out).toContain("const x = 1;");
        expect(out).not.toContain("\r");
    });

    it("strips Python comments", () => {
        const out = defaultSourceNormalizer.normalize({
            language: "python",
            sourceText: "x = 1  # hi\n# full\ny = 2\n",
        }).normalizedText;

        expect(out).not.toContain("# hi");
        expect(out).not.toContain("# full");
        expect(out).toContain("y = 2");
    });

    it("falls back to newline normalization for unknown languages", () => {
        const out = defaultSourceNormalizer.normalize({
            language: "unknownlang",
            sourceText: "a = 1\r\n# should remain\r\n",
        }).normalizedText;

        expect(out).toBe("a = 1\n# should remain\n");
    });
});
