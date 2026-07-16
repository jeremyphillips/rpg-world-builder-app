import { listCompatibleProgressionReferences, type SpellResolution } from '@rpg/contracts'

import type { ProgressionTrackFormItem } from './resolution-progression-form-schema'
import {
  createDefaultLinearIncrement,
  createDefaultThresholdEntries,
  deriveProgressionBasis,
  deriveProgressionTrackKind,
} from './resolution-progression-values'

export type ProgressionPresetId = 'effect-roll' | 'projectile-count' | 'target-count'

export type ProgressionPresetMenuItem = {
  id: ProgressionPresetId
  label: string
  description: string
  disabled?: boolean
  disabledReason?: string
}

const PRESET_LABELS: Record<ProgressionPresetId, { label: string; description: string }> = {
  'effect-roll': {
    label: 'Effect value',
    description: 'Scale a damage, healing, or temporary HP roll.',
  },
  'projectile-count': {
    label: 'Projectile count',
    description: 'Scale beams, darts, or similar per-projectile instances.',
  },
  'target-count': {
    label: 'Target count',
    description: 'Scale the maximum number of selected targets.',
  },
}

function matchesTrackReference(
  track: ProgressionTrackFormItem,
  reference: ReturnType<typeof listCompatibleProgressionReferences>[number]['reference'],
): boolean {
  return (
    track.referenceProperty === reference.property &&
    track.referenceSubjectKind === reference.subject.kind &&
    (reference.subject.kind !== 'effect' || track.referenceEffectId === reference.subject.effectId)
  )
}

export function buildProgressionPresetMenuItems(
  resolution: SpellResolution | undefined,
  existingTracks: ProgressionTrackFormItem[] | undefined,
  spellLevel: number,
): ProgressionPresetMenuItem[] {
  const compatible = resolution ? listCompatibleProgressionReferences(resolution) : []
  const tracks = existingTracks ?? []

  const hasEffectRoll = compatible.some((ctx) => ctx.reference.property === 'roll')
  const hasProjectileCount = compatible.some((ctx) => ctx.reference.property === 'projectile-count')
  const hasTargetCount = compatible.some(
    (ctx) => ctx.reference.property === 'selected-target-count',
  )

  const effectRollTaken = tracks.some(
    (track) => track.referenceProperty === 'roll' && track.referenceSubjectKind === 'effect',
  )
  const projectileTaken = tracks.some((track) => track.referenceProperty === 'projectile-count')
  const targetTaken = tracks.some((track) => track.referenceProperty === 'selected-target-count')

  const items: ProgressionPresetMenuItem[] = []

  if (hasEffectRoll) {
    items.push({
      id: 'effect-roll',
      ...PRESET_LABELS['effect-roll'],
      disabled: effectRollTaken,
      disabledReason: effectRollTaken ? 'An effect roll track is already configured.' : undefined,
    })
  }

  if (hasProjectileCount) {
    items.push({
      id: 'projectile-count',
      ...PRESET_LABELS['projectile-count'],
      disabled: projectileTaken,
      disabledReason: projectileTaken ? 'Projectile count is already configured.' : undefined,
    })
  }

  if (hasTargetCount && spellLevel >= 1) {
    items.push({
      id: 'target-count',
      ...PRESET_LABELS['target-count'],
      disabled: targetTaken,
      disabledReason: targetTaken ? 'Target count is already configured.' : undefined,
    })
  }

  return items
}

export function createProgressionTrackFromPreset(
  presetId: ProgressionPresetId,
  resolution: SpellResolution,
  spellLevel: number,
  trackId: string,
): ProgressionTrackFormItem | undefined {
  const compatible = listCompatibleProgressionReferences(resolution)
  const kind = deriveProgressionTrackKind(spellLevel)
  void deriveProgressionBasis(spellLevel)

  if (presetId === 'effect-roll') {
    const context = compatible.find((ctx) => ctx.reference.property === 'roll')
    if (!context || context.reference.subject.kind !== 'effect') return undefined

    const referenceFields = {
      referenceSubjectKind: 'effect' as const,
      referenceEffectId: context.reference.subject.effectId,
      referenceProperty: 'roll' as const,
    }

    if (kind === 'thresholds') {
      return {
        trackId,
        kind: 'thresholds',
        ...referenceFields,
        entries: createDefaultThresholdEntries('roll'),
      }
    }

    return {
      trackId,
      kind: 'linear',
      ...referenceFields,
      ...createDefaultLinearIncrement('roll', 'roll'),
    }
  }

  if (presetId === 'projectile-count') {
    const context = compatible.find((ctx) => ctx.reference.property === 'projectile-count')
    if (!context) return undefined

    const referenceFields = {
      referenceSubjectKind: 'application-pattern' as const,
      referenceProperty: 'projectile-count' as const,
    }

    if (kind === 'thresholds') {
      return {
        trackId,
        kind: 'thresholds',
        ...referenceFields,
        entries: createDefaultThresholdEntries('count'),
      }
    }

    return {
      trackId,
      kind: 'linear',
      ...referenceFields,
      ...createDefaultLinearIncrement('count', 'projectile-count'),
    }
  }

  if (presetId === 'target-count') {
    const context = compatible.find((ctx) => ctx.reference.property === 'selected-target-count')
    if (!context) return undefined

    const referenceFields = {
      referenceSubjectKind: 'target' as const,
      referenceProperty: 'selected-target-count' as const,
    }

    return {
      trackId,
      kind: 'linear',
      ...referenceFields,
      ...createDefaultLinearIncrement('count', 'selected-target-count'),
    }
  }

  return undefined
}

export function trackUsesReference(
  track: ProgressionTrackFormItem,
  reference: ReturnType<typeof listCompatibleProgressionReferences>[number]['reference'],
): boolean {
  return matchesTrackReference(track, reference)
}

export function progressionTracksAfterReferenceRemoval(
  tracks: ProgressionTrackFormItem[],
  removedReference: ReturnType<typeof listCompatibleProgressionReferences>[number]['reference'],
): ProgressionTrackFormItem[] {
  return tracks.filter((track) => !matchesTrackReference(track, removedReference))
}
