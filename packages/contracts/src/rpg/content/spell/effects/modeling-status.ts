import type { SpellAtomicEffect } from './schema'

export const EFFECTS_MODELING_STATUS_LABELS = {
  'prose-only': 'Prose only',
  'partially-modeled': 'Partially modeled',
  modeled: 'Modeled',
} as const

export type EffectsModelingStatus = keyof typeof EFFECTS_MODELING_STATUS_LABELS

export const EFFECTS_MODELING_STATUS = Object.keys(EFFECTS_MODELING_STATUS_LABELS) as [
  EffectsModelingStatus,
  ...EffectsModelingStatus[],
]

export function getEffectsModelingStatusLabel(status: EffectsModelingStatus): string {
  return EFFECTS_MODELING_STATUS_LABELS[status]
}

/** Derives effects-layer modeling status from present structure (not persisted). */
export function deriveEffectsModelingStatus(spell: {
  effects?: readonly SpellAtomicEffect[] | null
}): EffectsModelingStatus {
  if (!spell.effects?.length) return 'prose-only'
  return 'partially-modeled'
}
