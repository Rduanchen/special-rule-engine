import { describe, expect, it } from "vitest";
import type { SpecialRule } from "../src/types";
import { evaluateRules } from "../src/engine";

describe("rule engine (v1)", () => {
    it("MUST_HAVE includes passes when needle exists", () => {
        const rules: SpecialRule[] = [
            {
                id: "r1",
                type: "includes",
                constraint: "MUST_HAVE",
                message: "must include printf",
                params: { needle: "printf" },
            },
        ];

        const results = evaluateRules(rules, {
            language: "c",
            sourceText: "int main(){ printf(\"hi\"); }",
        });

        expect(results[0]?.passed).toBe(true);
    });

    it("MUST_NOT_HAVE regex passes when pattern does not match", () => {
        const rules: SpecialRule[] = [
            {
                id: "r1",
                type: "regex",
                constraint: "MUST_NOT_HAVE",
                message: "must not use for-loop",
                params: { pattern: "\\bfor\\b" },
            },
        ];

        const results = evaluateRules(rules, {
            language: "c",
            sourceText: "while(1){}",
        });

        expect(results[0]?.passed).toBe(true);
    });

    it("composite AND obeys child matching (as a matcher)", () => {
        const rules: SpecialRule[] = [
            {
                id: "r-and",
                type: "composite",
                constraint: "MUST_HAVE",
                message: "must have both a and b",
                params: {
                    op: "AND",
                    rules: [
                        {
                            id: "a",
                            type: "includes",
                            constraint: "MUST_HAVE",
                            message: "a",
                            params: { needle: "aaa" },
                        },
                        {
                            id: "b",
                            type: "includes",
                            constraint: "MUST_HAVE",
                            message: "b",
                            params: { needle: "bbb" },
                        },
                    ],
                },
            },
        ];

        const results = evaluateRules(rules, {
            language: "javascript",
            sourceText: "// aaa\nconst x = 'aaa bbb';",
        });

        expect(results[0]?.passed).toBe(true);
    });
});
