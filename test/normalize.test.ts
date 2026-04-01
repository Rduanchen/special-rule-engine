import { describe, expect, it } from "vitest";
import { stripCLikeComments, stripPythonLineComments } from "../src/normalize/commentStrippers";

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
