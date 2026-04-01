import type {
    MatchResult,
    RuleEvalContext,
    RuleEvalResult,
    RuleMatcher,
    SpecialRule,
    SourceNormalizer,
} from "../types";
import { defaultSourceNormalizer } from "../normalize/registry";
import {
    includesMatcher,
    regexMatcher,
    type CompositeParams,
    type IncludesParams,
    type RegexParams,
} from "./matchers";

const matcherByType: Record<string, RuleMatcher<any>> = {
    includes: includesMatcher,
    regex: regexMatcher,
};

function applyConstraint(constraint: SpecialRule["constraint"], matched: boolean): boolean {
    return constraint === "MUST_HAVE" ? matched : !matched;
}

function matchRule(rule: SpecialRule, input: { language: string; text: string }): MatchResult {
    if (rule.type === "composite") {
        const params = rule.params as CompositeParams;
        if (!params || (params.op !== "AND" && params.op !== "OR") || !Array.isArray(params.rules)) {
            return { matched: false, reason: "composite: params must be { op: AND|OR, rules: SpecialRule[] }" };
        }

        const childMatches = params.rules.map((child) => matchRule(child, input));
        const matched =
            params.op === "AND"
                ? childMatches.every((r) => r.matched)
                : childMatches.some((r) => r.matched);

        return {
            matched,
            reason: `composite(${params.op}): ${childMatches.map((r) => (r.matched ? "T" : "F")).join(",")}`,
        };
    }

    const matcher = matcherByType[rule.type];
    if (!matcher) {
        return { matched: false, reason: `unknown rule type: ${rule.type}` };
    }

    return matcher.match(rule.params as IncludesParams | RegexParams, input);
}

export function evaluateRule(
    rule: SpecialRule,
    ctx: RuleEvalContext,
    opts?: { normalizer?: SourceNormalizer },
): RuleEvalResult {
    const normalizer = opts?.normalizer ?? defaultSourceNormalizer;
    const { normalizedText } = normalizer.normalize({
        language: ctx.language,
        sourceText: ctx.sourceText,
    });

    const match = matchRule(rule, { language: ctx.language, text: normalizedText });
    const passed = applyConstraint(rule.constraint, match.matched);

    return {
        ruleId: rule.id,
        passed,
        message: rule.message,
        reason: match.reason,
    };
}

export function evaluateRules(
    rules: SpecialRule[],
    ctx: RuleEvalContext,
    opts?: { normalizer?: SourceNormalizer },
): RuleEvalResult[] {
    return rules.map((r) => evaluateRule(r, ctx, opts));
}
