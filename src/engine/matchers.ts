import type { MatchResult, RuleMatcher, SpecialRule } from "../types.js";

export type IncludesParams = { needle: string; caseSensitive?: boolean };
export type RegexParams = { pattern: string; flags?: string };
export type CompositeParams = { op: "AND" | "OR"; rules: SpecialRule[] };

export const includesMatcher: RuleMatcher<IncludesParams> = {
    type: "includes",
    match(params, input): MatchResult {
        if (!params || typeof params.needle !== "string") {
            return { matched: false, reason: "includes: params.needle must be a string" };
        }

        const haystack = params.caseSensitive ? input.text : input.text.toLowerCase();
        const needle = params.caseSensitive ? params.needle : params.needle.toLowerCase();
        return {
            matched: haystack.includes(needle),
            reason: haystack.includes(needle)
                ? `includes: found '${params.needle}'`
                : `includes: missing '${params.needle}'`,
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

    if (child.type === "includes") {
        return includesMatcher.match(child.params as IncludesParams, input);
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
