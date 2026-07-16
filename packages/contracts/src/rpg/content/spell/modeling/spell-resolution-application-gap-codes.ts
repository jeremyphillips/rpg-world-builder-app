export const SPELL_RESOLUTION_APPLICATION_GAP_CODES = {
  'unconditional-application': 'Behavior applies regardless of attack or save outcome branch.',
  'per-hit-application': 'Effect applies on each hit rather than once per cast.',
  'per-projectile-application':
    'Effect applies per projectile or beam rather than as a single aggregated roll.',
  'modifier-model-missing': 'Personal or spellcasting modifier source not modeled.',
  'choice-model-missing': 'Caster choice menus or modes not modeled.',
  'conditional-effect-model-missing': 'Conditional riders or triggered branches not modeled.',
} as const

export type SpellResolutionApplicationGapCode = keyof typeof SPELL_RESOLUTION_APPLICATION_GAP_CODES
