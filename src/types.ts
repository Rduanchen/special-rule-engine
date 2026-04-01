export type RuleConstraint = "MUST_HAVE" | "MUST_NOT_HAVE";

export type SpecialRuleType = "regex" | "includes" | "composite";

export type SpecialRuleSeverity = "info" | "warn";

export type SpecialRule = {
    id: string;
    type: SpecialRuleType;
    constraint: RuleConstraint;
    message: string;
    severity?: SpecialRuleSeverity;
    params: unknown;
};

export type RuleEvalContext = {
    language: string;
    sourceText: string;
};

export type RuleEvalResult = {
    ruleId: string;
    passed: boolean;
    message: string;
    reason?: string;
};

export type MatchResult = { matched: boolean; reason?: string };

export interface SourceNormalizer {
    normalize(input: { language: string; sourceText: string }): {
        normalizedText: string;
    };
}

export interface RuleMatcher<Params = unknown> {
    readonly type: SpecialRuleType;
    match(params: Params, input: { language: string; text: string }): MatchResult;
}
