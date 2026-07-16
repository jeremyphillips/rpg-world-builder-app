/** Domain-neutral modeling gap codes — extended by content-type-specific registries. */
export const MODELING_GAP_CODES = {
  'effect-schema-missing': 'Structured effect schema does not cover this behavior.',
  'progression-schema-missing': 'Structured progression does not cover this scaling behavior.',
  'catalog-data-incomplete': 'Catalog prose or references are incomplete.',
  'manual-review-required': 'Requires manual review before promotion.',
} as const

export type ModelingGapCode = keyof typeof MODELING_GAP_CODES
