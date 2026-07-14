/**
 * Documented deferral reason codes for the resolution seed manifest.
 *
 * Used by `kind: 'defer'` rows in `spell-seed-resolution.ts` and surfaced on
 * coverage entries via `spell-resolution-coverage-inventory.ts` (`deferReason`,
 * `byDeferReason`). Each code explains why a structured-effect spell does not yet
 * receive a `spell.resolution` envelope.
 *
 * Temporary migration vocabulary — not persisted on spell records. Remove or
 * narrow codes as deferred slugs graduate to applicable manifest entries.
 */
export const SPELL_RESOLUTION_DEFER_REASONS = {
  'automatic-method':
    'Requires resolution method automatic (e.g. Magic Missile) before envelope modeling.',
  'extra-damage-rider':
    'Primary mechanics are non-damage; extra damage is a rider (e.g. Hex, Hunter’s Mark).',
  'multi-effect': 'Multiple damage effects need per-outcome effect linking (e.g. Ice Knife).',
  'choice-model': 'Choice-dependent modes and multiple labeled damage effects (e.g. Arcane Hand).',
  'unsupported-effect-kind':
    'Legacy defer code — healing and temporary hit points are supported as of Tier D.',
  'placeholder-damage':
    'Placeholder flat-zero damage rider is not a real resolution envelope (e.g. True Strike).',
} as const

export type SpellResolutionDeferReason = keyof typeof SPELL_RESOLUTION_DEFER_REASONS
