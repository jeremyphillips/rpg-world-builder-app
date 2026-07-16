import {
  DEFAULT_CANTrip_SCALING_THRESHOLDS,
  type SpellResolution,
  type SpellResolutionProgression,
  type SpellResolutionProgressionReference,
  type SpellResolutionProgressionTrack,
  type SpellResolutionProgressionValue,
} from '@rpg/contracts'

import {
  normalizeRollFormValue,
  rollToFormShape,
  type RollFormShape,
} from '../../../../lib/forms/mechanics/roll-form-values'
import type {
  ProgressionBasisFormValue,
  ProgressionReferenceProperty,
  ProgressionThresholdEntryFormItem,
  ProgressionTrackFormItem,
} from './resolution-progression-form-schema'

function progressionValueToForm(
  value: SpellResolutionProgressionValue,
): Pick<ProgressionThresholdEntryFormItem, 'valueKind' | 'roll' | 'count'> {
  if (value.kind === 'count') {
    return { valueKind: 'count', count: value.count }
  }

  return { valueKind: 'roll', roll: rollToFormShape(value.roll) ?? {} }
}

function progressionValueFromForm(
  valueKind: 'roll' | 'count',
  roll: RollFormShape | undefined,
  count: number | undefined,
): SpellResolutionProgressionValue | undefined {
  if (valueKind === 'count') {
    if (count === undefined || count < 1) return undefined
    return { kind: 'count', count }
  }

  const normalized = normalizeRollFormValue(roll)
  if (!normalized) return undefined
  return { kind: 'roll', roll: normalized }
}

function referenceToForm(
  reference: SpellResolutionProgressionReference,
): Pick<
  ProgressionTrackFormItem,
  'referenceSubjectKind' | 'referenceEffectId' | 'referenceProperty'
> {
  return {
    referenceSubjectKind: reference.subject.kind,
    referenceEffectId: reference.subject.kind === 'effect' ? reference.subject.effectId : undefined,
    referenceProperty: reference.property,
  }
}

function referenceFromForm(
  track: ProgressionTrackFormItem,
): SpellResolutionProgressionReference | undefined {
  switch (track.referenceSubjectKind) {
    case 'effect':
      if (!track.referenceEffectId) return undefined
      return {
        subject: { kind: 'effect', effectId: track.referenceEffectId },
        property: track.referenceProperty,
      }
    case 'application-pattern':
      return {
        subject: { kind: 'application-pattern' },
        property: track.referenceProperty as Extract<
          ProgressionReferenceProperty,
          'projectile-count'
        >,
      }
    case 'target':
      return {
        subject: { kind: 'target' },
        property: track.referenceProperty as Extract<
          ProgressionReferenceProperty,
          'selected-target-count'
        >,
      }
    default: {
      const _exhaustive: never = track.referenceSubjectKind
      return _exhaustive
    }
  }
}

function trackToForm(
  track: SpellResolutionProgressionTrack,
  trackId: string,
): ProgressionTrackFormItem {
  const referenceFields = referenceToForm(track.reference)

  if (track.kind === 'thresholds') {
    return {
      trackId,
      kind: 'thresholds',
      ...referenceFields,
      entries: track.entries.map((entry) => ({
        threshold: entry.threshold,
        ...progressionValueToForm(entry.value),
      })),
    }
  }

  const incrementForm = progressionValueToForm(track.increment)
  return {
    trackId,
    kind: 'linear',
    ...referenceFields,
    incrementKind: incrementForm.valueKind,
    incrementRoll: incrementForm.roll,
    incrementCount: incrementForm.count,
  }
}

function trackFromForm(
  track: ProgressionTrackFormItem,
): SpellResolutionProgressionTrack | undefined {
  const reference = referenceFromForm(track)
  if (!reference) return undefined

  if (track.kind === 'thresholds') {
    const entries = (track.entries ?? [])
      .map((entry) => {
        const value = progressionValueFromForm(entry.valueKind, entry.roll, entry.count)
        if (!value) return undefined
        return { threshold: entry.threshold, value }
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== undefined)

    if (!entries.length) return undefined
    return { kind: 'thresholds', reference, entries }
  }

  if (!track.incrementKind) return undefined
  const increment = progressionValueFromForm(
    track.incrementKind,
    track.incrementRoll,
    track.incrementCount,
  )
  if (!increment) return undefined
  return { kind: 'linear', reference, increment }
}

export function progressionToForm(progression: SpellResolutionProgression | undefined): {
  progressionBasis?: ProgressionBasisFormValue
  progressionTracks?: ProgressionTrackFormItem[]
} {
  if (!progression?.tracks.length) return {}

  return {
    progressionBasis: progression.basis,
    progressionTracks: progression.tracks.map((track, index) =>
      trackToForm(track, `track-${index}`),
    ),
  }
}

export function progressionFromForm(
  basis: ProgressionBasisFormValue | undefined,
  tracks: ProgressionTrackFormItem[] | undefined,
): SpellResolutionProgression | undefined {
  if (!basis || !tracks?.length) return undefined

  const storedTracks = tracks
    .map(trackFromForm)
    .filter((track): track is SpellResolutionProgressionTrack => track !== undefined)

  if (!storedTracks.length) return undefined
  return { basis, tracks: storedTracks }
}

export function createDefaultThresholdEntries(
  valueKind: 'roll' | 'count',
  seed?: Partial<Record<number, SpellResolutionProgressionValue>>,
): ProgressionThresholdEntryFormItem[] {
  return DEFAULT_CANTrip_SCALING_THRESHOLDS.map((threshold) => {
    const seeded = seed?.[threshold]
    if (seeded) {
      return { threshold, ...progressionValueToForm(seeded) }
    }

    if (valueKind === 'count') {
      return {
        threshold,
        valueKind: 'count',
        count: threshold === 5 ? 2 : threshold === 11 ? 3 : 4,
      }
    }

    return {
      threshold,
      valueKind: 'roll',
      roll: {
        dice: {
          count: threshold === 5 ? 2 : threshold === 11 ? 3 : 4,
          faces: 10,
        },
      },
    }
  })
}

export function createDefaultLinearIncrement(
  valueKind: 'roll' | 'count',
  property: ProgressionReferenceProperty,
): Pick<ProgressionTrackFormItem, 'incrementKind' | 'incrementRoll' | 'incrementCount'> {
  if (valueKind === 'count') {
    return { incrementKind: 'count', incrementCount: 1 }
  }

  if (property === 'roll') {
    return {
      incrementKind: 'roll',
      incrementRoll: { dice: { count: 1, faces: 6 } },
    }
  }

  return { incrementKind: 'roll', incrementRoll: { dice: { count: 1, faces: 4 } } }
}

export function deriveProgressionBasis(spellLevel: number): ProgressionBasisFormValue {
  return spellLevel === 0 ? 'character-level' : 'spell-slot-level'
}

export function deriveProgressionTrackKind(spellLevel: number): 'thresholds' | 'linear' {
  return spellLevel === 0 ? 'thresholds' : 'linear'
}

export function readResolutionForProgression(
  resolution: SpellResolution | undefined,
): SpellResolution | undefined {
  return resolution
}
