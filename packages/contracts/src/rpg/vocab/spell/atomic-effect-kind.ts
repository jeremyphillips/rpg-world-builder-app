import type { GameTermEntry } from '../types'

// ---------------------------------------------------------------------------
// Spell atomic effect kinds — labels for authoring UI and array item headers.
// ---------------------------------------------------------------------------

export const SPELL_ATOMIC_EFFECT_KINDS = [
  'damage',
  'healing',
  'temporary-hit-points',
  'projectile-count',
] as const

export type SpellAtomicEffectKind = (typeof SPELL_ATOMIC_EFFECT_KINDS)[number]

export const SPELL_ATOMIC_EFFECT_KIND_ENTRIES = {
  damage: {
    label: 'Damage',
    description: 'Roll-based damage with a damage type.',
    sentence: {
      singular: 'damage',
      plural: 'damage',
    },
  },
  healing: {
    label: 'Healing',
    description: 'Roll-based hit point restoration.',
    sentence: {
      singular: 'healing',
      plural: 'healing',
    },
  },
  'temporary-hit-points': {
    label: 'Temporary hit points',
    description: 'Roll-based temporary hit points.',
    sentence: {
      singular: 'temporary hit points',
      plural: 'temporary hit points',
    },
  },
  'projectile-count': {
    label: 'Projectile count',
    description: 'Count of projectiles or missiles without implying per-projectile damage.',
    sentence: {
      singular: 'projectile count',
      plural: 'projectile counts',
    },
  },
} as const satisfies Record<SpellAtomicEffectKind, GameTermEntry>

/** Display label for an atomic effect kind (array item title prefix). */
export function getSpellAtomicEffectKindLabel(kind: SpellAtomicEffectKind): string {
  return SPELL_ATOMIC_EFFECT_KIND_ENTRIES[kind].label
}
