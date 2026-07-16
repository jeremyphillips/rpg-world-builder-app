export const SPELL_RESOLUTION_ENVIRONMENT_GAP_CODES = {
  'object-state-awareness': 'Object worn, carried, unattended, or eligibility facts not modeled.',
  'flammability-rules': 'Whether an object may ignite is not modeled.',
  'area-origin-model-missing': 'Area anchoring, movement, or object-centered origin not modeled.',
  'summoning-model-missing': 'Summoning or stat-block reference not modeled.',
  'targeting-model-missing':
    'Targeting a spell or effect rather than a creature or object not modeled.',
} as const

export type SpellResolutionEnvironmentGapCode = keyof typeof SPELL_RESOLUTION_ENVIRONMENT_GAP_CODES
