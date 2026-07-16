export const SPELL_RESOLUTION_TARGETING_GAP_CODES = {
  'dynamic-target-count': 'Target count scales with slot level or beams.',
  'chosen-within-area': 'Caster picks a subset of creatures inside the area.',
  'target-exclusions': 'Creatures of your choice with explicit exclusions.',
  'chained-targets': 'Secondary targets resolved from a primary target.',
  'projectile-target-allocation':
    'Each projectile or beam may select a distinct target within range.',
  'retargetable-mark': 'Concentration mark or curse on one creature can move to a new target.',
  'moving-aura-origin': 'Area origin moves after cast.',
  'wall-or-path-geometry': 'Non-standard zone shape (wall, path, etc.).',
  'reaction-trigger': 'Target implied by the triggering event.',
  'multi-mode-choice': 'Caster picks a mode at cast time.',
} as const

export type SpellResolutionTargetingGapCode = keyof typeof SPELL_RESOLUTION_TARGETING_GAP_CODES
