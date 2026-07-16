import type { SpellResolutionOutcomeResult } from './vocab'

// ---------------------------------------------------------------------------
// Authoring UI labels for method-derived outcome groups.
// ---------------------------------------------------------------------------

export const SPELL_RESOLUTION_OUTCOME_AUTHORING_LABELS = {
  applied: 'Applied automatically',
  hit: 'On hit',
  miss: 'On miss',
  'failed-save': 'On failed save',
  'successful-save': 'On successful save',
} as const satisfies Record<SpellResolutionOutcomeResult, string>

/** Visible label for an outcome group in the resolution authoring UI. */
export function getSpellResolutionOutcomeAuthoringLabel(result: string): string {
  return SPELL_RESOLUTION_OUTCOME_AUTHORING_LABELS[result as SpellResolutionOutcomeResult] ?? result
}

/** Conventional primary branch per method — used for non-blocking authoring warnings. */
export const SPELL_RESOLUTION_CONVENTIONAL_PRIMARY_OUTCOME = {
  automatic: 'applied',
  attack: 'hit',
  'saving-throw': 'failed-save',
} as const satisfies Record<string, SpellResolutionOutcomeResult>
