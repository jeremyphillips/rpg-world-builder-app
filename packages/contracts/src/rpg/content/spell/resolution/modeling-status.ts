/**
 * Derived resolution modeling status for spell read models.
 *
 * Classifies spells by whether optional `resolution` coexists with root `effects[]`.
 * Not stored on spell records — computed for authoring badges, coverage inventories,
 * and migration dashboards. Catalog maps `modeled` → `migrated` in
 * `spell-resolution-coverage-inventory.ts`.
 *
 * Parallel to `deriveEffectsModelingStatus()` in `content/spell/effects/`.
 */
import type { SpellResolution } from './schema'

export const RESOLUTION_MODELING_STATUS_LABELS = {
  'prose-only': 'Prose only',
  deferred: 'Effects only',
  hybrid: 'Hybrid',
  modeled: 'Modeled',
} as const

export type ResolutionModelingStatus = keyof typeof RESOLUTION_MODELING_STATUS_LABELS

export const RESOLUTION_MODELING_STATUS = Object.keys(RESOLUTION_MODELING_STATUS_LABELS) as [
  ResolutionModelingStatus,
  ...ResolutionModelingStatus[],
]

export function getResolutionModelingStatusLabel(status: ResolutionModelingStatus): string {
  return RESOLUTION_MODELING_STATUS_LABELS[status]
}

/** Derives resolution-layer modeling status from present structure (not persisted). */
export function deriveResolutionModelingStatus(spell: {
  effects?: readonly unknown[] | null
  resolution?: SpellResolution | null
}): ResolutionModelingStatus {
  if (spell.resolution) {
    if ((spell.effects?.length ?? 0) > 1) return 'hybrid'
    return 'modeled'
  }

  if (spell.effects?.length) return 'deferred'

  return 'prose-only'
}
