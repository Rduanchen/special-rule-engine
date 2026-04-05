import type { MatchResult, RuleMatcher, SpecialRule } from "../types.js";

export type UseParams = { target: string; caseSensitive?: boolean };
export type RegexParams = { pattern: string; flags?: string };
export type CompositeParams = { op: "AND" | "OR"; rules: SpecialRule[] };

function normalizeUseParams(params: any): { target: string; caseSensitive?: boolean } | null {
    if (!params || typeof params !== "object") return null;

    // New name
    if (typeof (params as any).target === "string") {
        return { target: (params as any).target, caseSensitive: (params as any).caseSensitive };
    }

    return null;
}

export const useMatcher: RuleMatcher<UseParams> = {
    type: "use",
    match(params, input): MatchResult {
        const normalized = normalizeUseParams(params);
        if (!normalized || typeof normalized.target !== "string") {
            return { matched: false, reason: "use: params.target must be a string" };
        }

        const haystack = normalized.caseSensitive ? input.text : input.text.toLowerCase();
        const target = normalized.caseSensitive ? normalized.target : normalized.target.toLowerCase();
        return {
            matched: haystack.includes(target),
            reason: haystack.includes(target)
                ? `use: found '${normalized.target}'`
                : `use: missing '${normalized.target}'`,
        };
    },
};

export const regexMatcher: RuleMatcher<RegexParams> = {
    type: "regex",
    match(params, input): MatchResult {
        if (!params || typeof params.pattern !== "string") {
            return { matched: false, reason: "regex: params.pattern must be a string" };
        }

        try {
            const re = new RegExp(params.pattern, params.flags);
            const matched = re.test(input.text);
            return { matched, reason: matched ? `regex: matched /${params.pattern}/` : `regex: not matched` };
        } catch (e: any) {
            return { matched: false, reason: `regex: invalid regex (${String(e?.message ?? e)})` };
        }
    },
};

function matchChildRule(child: SpecialRule, input: { language: string; text: string }): MatchResult {
    if (!child || typeof child.type !== "string") {
        return { matched: false, reason: "composite: child rule missing type" };
    }

    // IMPORTANT: composite matching is purely about whether the child rule matcher matches.
    // Constraints are applied later by the evaluator.
    if (child.type === "composite") {
        return compositeMatcher.match(child.params as CompositeParams, input);
    }

    if (child.type === "use") {
    return useMatcher.match(child.params as UseParams, input);
    }

    if (child.type === "regex") {
        return regexMatcher.match(child.params as RegexParams, input);
    }

    return { matched: false, reason: `composite: unknown child type '${child.type}'` };
}

export const compositeMatcher: RuleMatcher<CompositeParams> = {
    type: "composite",
    match(params, input): MatchResult {
        if (!params || (params.op !== "AND" && params.op !== "OR") || !Array.isArray(params.rules)) {
            return { matched: false, reason: "composite: params must be { op: AND|OR, rules: SpecialRule[] }" };
        }

        const childMatches = params.rules.map((r) => matchChildRule(r, input));
        const matched =
            params.op === "AND"
                ? childMatches.every((r) => r.matched)
                : childMatches.some((r) => r.matched);

        return {
            matched,
            reason: `composite(${params.op}): ${childMatches.map((r) => (r.matched ? "T" : "F")).join(",")}`,
        };
    },
};
