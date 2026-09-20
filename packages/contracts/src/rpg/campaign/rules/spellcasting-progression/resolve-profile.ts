import type { CharacterClass } from '../../../content/classes/class'
import type { Spellcasting } from '../../../content/classes/spellcasting'
import type { SpellCollectionKind } from '../../../vocab/spell/spell-collection-kind'

import { resolveGainQuotaThroughLevel, resolveProgressionValueAtLevel } from './lookup'
import type { SpellcastingProgressionSeed } from './patch'
import { indexSpellcastingProgressionRecords } from './patch'
import {
  maxSelectableSpellLevelFromSlotProgression,
  resolveLeveledSlotCountsAtLevel,
  spellcastingFeatureLabelForSlotProgression,
  type ResolvedSlotRow,
} from './resolve-slots'
import type { SlotProgression } from './slot-progression'
import type { SpellChoiceProgression } from './spell-choice-progression'
import type { SpellcastingProfile } from './spellcasting-profile'

// ---------------------------------------------------------------------------
// Profile resolution — class references slot progression + profile independently.
// ---------------------------------------------------------------------------

export type ResolvedSpellcastingProfileBundle = {
  profile: SpellcastingProfile
  slotProgression: SlotProgression
}

export type ResolvedSpellcastingProgressionConfig = ReturnType<
  typeof indexSpellcastingProgressionRecords
>

export function resolveSpellcastingProgressionConfig(
  seed: SpellcastingProgressionSeed,
): ResolvedSpellcastingProgressionConfig {
  return indexSpellcastingProgressionRecords(seed)
}

/** Resolves a class spellcasting block to its slot progression record. */
export function resolveSlotProgressionForClass(
  characterClass: Pick<CharacterClass, 'spellcasting'>,
  config: ResolvedSpellcastingProgressionConfig,
): SlotProgression | null {
  const slotProgressionId = characterClass.spellcasting?.slotProgressionId
  if (!slotProgressionId) return null
  return config.slotProgressions.get(slotProgressionId) ?? null
}

export function resolveSlotProgressionForSpellcasting(
  spellcasting: Spellcasting,
  config: ResolvedSpellcastingProgressionConfig,
): SlotProgression | null {
  return config.slotProgressions.get(spellcasting.slotProgressionId) ?? null
}

/** Resolves a class spellcasting block to its spell selection profile record. */
export function resolveSpellcastingProfileRecordForClass(
  characterClass: Pick<CharacterClass, 'spellcasting'>,
  config: ResolvedSpellcastingProgressionConfig,
): SpellcastingProfile | null {
  const profileId = characterClass.spellcasting?.profileId
  if (!profileId) return null
  return config.profiles.get(profileId) ?? null
}

export function resolveSpellcastingProfileRecordForSpellcasting(
  spellcasting: Spellcasting,
  config: ResolvedSpellcastingProgressionConfig,
): SpellcastingProfile | null {
  return config.profiles.get(spellcasting.profileId) ?? null
}

/** Resolves profile + slot progression independently from class spellcasting references. */
export function resolveSpellcastingProfileForClass(
  characterClass: Pick<CharacterClass, 'spellcasting'>,
  config: ResolvedSpellcastingProgressionConfig,
): ResolvedSpellcastingProfileBundle | null {
  const profile = resolveSpellcastingProfileRecordForClass(characterClass, config)
  const slotProgression = resolveSlotProgressionForClass(characterClass, config)
  if (!profile || !slotProgression) return null
  return { profile, slotProgression }
}

export function resolveSpellcastingProfileForSpellcasting(
  spellcasting: Spellcasting,
  config: ResolvedSpellcastingProgressionConfig,
): ResolvedSpellcastingProfileBundle | null {
  const profile = resolveSpellcastingProfileRecordForSpellcasting(spellcasting, config)
  const slotProgression = resolveSlotProgressionForSpellcasting(spellcasting, config)
  if (!profile || !slotProgression) return null
  return { profile, slotProgression }
}

export function resolveChoiceProgressionQuotaAtLevel(
  progression: SpellChoiceProgression,
  level: number,
): number {
  if (progression.kind === 'gain') {
    return resolveGainQuotaThroughLevel({
      rows: progression.curve.rows,
      level,
      extension: progression.extension,
    }).count
  }

  return resolveProgressionValueAtLevel({
    kind: 'capacity',
    rows: progression.curve.rows,
    level,
    extension: progression.extension,
  }).count
}

export function findChoiceProgressionByDestination(
  profile: SpellcastingProfile,
  destination: SpellCollectionKind,
  kind?: SpellChoiceProgression['kind'],
): SpellChoiceProgression | undefined {
  return profile.choiceProgressions.find(
    (progression) =>
      progression.destination === destination && (kind === undefined || progression.kind === kind),
  )
}

/** Builder-facing cantrip quota from profile (0 when no cantrip capacity progression). */
export function resolveCantripsKnownFromProfile(
  profile: SpellcastingProfile,
  level: number,
): number {
  const cantripProgression = findChoiceProgressionByDestination(profile, 'cantrips', 'capacity')
  if (!cantripProgression) return 0
  return resolveChoiceProgressionQuotaAtLevel(cantripProgression, level)
}

/**
 * Builder-facing spell quota — prepared capacity first, else repertoire capacity.
 * Matches prior behavior where a single spells choice set covered loadout/repertoire.
 */
export function resolveSpellsAvailableFromProfile(
  profile: SpellcastingProfile,
  level: number,
): number {
  const prepared = findChoiceProgressionByDestination(profile, 'prepared', 'capacity')
  if (prepared) return resolveChoiceProgressionQuotaAtLevel(prepared, level)

  const repertoire = findChoiceProgressionByDestination(profile, 'repertoire', 'capacity')
  if (repertoire) return resolveChoiceProgressionQuotaAtLevel(repertoire, level)

  return 0
}

export function resolveMaxSelectableSpellLevelFromProfile(
  bundle: ResolvedSpellcastingProfileBundle,
  level: number,
): number {
  return maxSelectableSpellLevelFromSlotProgression(bundle.slotProgression, level)
}

export function resolveSlotCountsFromProfile(
  bundle: ResolvedSpellcastingProfileBundle,
  level: number,
): { slots: number[]; row: ResolvedSlotRow } {
  const { slots, provenance } = resolveLeveledSlotCountsAtLevel(bundle.slotProgression, level)
  const row = resolveLeveledSlotCountsAtLevel(bundle.slotProgression, level)
  return {
    slots,
    row:
      bundle.slotProgression.kind === 'pact'
        ? {
            kind: 'pact',
            slotCount: row.slots.find((count) => count > 0) ?? 0,
            slotLevel: row.slots.findIndex((count) => count > 0) + 1,
            provenance,
          }
        : { kind: 'leveled', slots, provenance },
  }
}

export function spellcastingFeatureLabelFromProfile(
  bundle: ResolvedSpellcastingProfileBundle,
): string {
  return spellcastingFeatureLabelForSlotProgression(bundle.slotProgression)
}

/** Whether profile uses pact slot progression (legacy feature-row filter). */
export function isPactSpellcastingProfile(bundle: ResolvedSpellcastingProfileBundle): boolean {
  return bundle.slotProgression.kind === 'pact'
}

/** Table columns enabled for combined progression display. */
export function resolveDisplayChoiceColumns(
  profile: SpellcastingProfile,
): SpellChoiceProgression[] {
  return profile.choiceProgressions.filter(
    (progression) => progression.presentation?.column?.enabled,
  )
}
