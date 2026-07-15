/**
 * Partial targeting modeling gaps for catalog resolution spells.
 *
 * Parallel to `spell-resolution-defer-reasons.ts` — documents what structured
 * resolution still does not fully capture for execution or authoring.
 */
export const SPELL_RESOLUTION_TARGETING_GAP_CODES = {
  'dynamic-target-count': 'Target count scales with slot level or beams.',
  'chosen-within-area': 'Caster picks a subset of creatures inside the area.',
  'target-exclusions': 'Creatures of your choice with explicit exclusions.',
  'chained-targets': 'Secondary targets resolved from a primary target.',
  'moving-aura-origin': 'Area origin moves after cast.',
  'wall-or-path-geometry': 'Non-standard zone shape (wall, path, etc.).',
  'reaction-trigger': 'Target implied by the triggering event.',
  'multi-mode-choice': 'Caster picks a mode at cast time.',
} as const

export type SpellResolutionTargetingGapCode = keyof typeof SPELL_RESOLUTION_TARGETING_GAP_CODES

/** Slug → gap code for resolved spells with known partial targeting. */
export const SRD_521_SPELL_RESOLUTION_TARGETING_GAPS = {
  'eldritch-blast': 'dynamic-target-count',
  'ice-knife': 'chained-targets',
  'hellish-rebuke': 'reaction-trigger',
  'wall-of-fire': 'wall-or-path-geometry',
  'arcane-hand': 'multi-mode-choice',
} as const satisfies Partial<Record<string, SpellResolutionTargetingGapCode>>

export function spellResolutionTargetingGap(
  slug: string,
): SpellResolutionTargetingGapCode | undefined {
  return SRD_521_SPELL_RESOLUTION_TARGETING_GAPS[
    slug as keyof typeof SRD_521_SPELL_RESOLUTION_TARGETING_GAPS
  ]
}
