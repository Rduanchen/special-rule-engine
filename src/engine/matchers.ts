import type { MatchResult, RuleMatcher, SpecialRule } from "../types";

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
