/** Domain-neutral modeling gap codes — extended by content-type-specific registries. */
export const MODELING_GAP_CODES = {
  'effect-schema-missing': 'Structured effect schema does not cover this behavior.',
  'progression-schema-missing': 'Structured progression does not cover this scaling behavior.',
  'catalog-data-incomplete': 'Catalog prose or references are incomplete.',
  'manual-review-required': 'Requires manual review before promotion.',
  'resurrection-model-missing':
    'Death-state restoration rules are not modeled (timing, body requirements, return state).',
  'transformation-model-missing':
    'Creature statistic replacement or override for a duration is not modeled.',
} as const

export type ModelingGapCode = keyof typeof MODELING_GAP_CODES
