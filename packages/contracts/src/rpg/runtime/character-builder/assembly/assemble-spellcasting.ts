import {
  characterSpellHasCollection,
  mergeCharacterSpellCollections,
  type CharacterSpellCollectionMembership,
  type CharacterSpellEntry,
} from '../../character/sheet/spells'
import type { CharacterSelectionSource } from '../../character/sheet/selection-sources'
import {
  CLASS_SPELLCASTING_CHOICE_SUFFIXES,
  type ClassSpellcastingChoiceSuffix,
} from '../../../content/classes/spellcasting'
import type { CompiledSpellcastingChoiceProgression } from '../../creature/resolve-class-spellcasting'
import type { SpellMutationPolicy } from '../../../vocab/spell/spell-mutation-policy'
import type { ChoiceSet } from '../choice-set'
import type { CharacterBuildContext } from '../context'
import type { CharacterBuilderDraft } from '../draft/draft'
import { resolveSpellcastingProfile } from '../resolvers/spellcasting/builder-spellcasting'

// ---------------------------------------------------------------------------
// Character Builder spellcasting finalization — orchestrates draft selections,
// spellcasting profile facts, and character spell rows with sources.
// ---------------------------------------------------------------------------

export function classSpellcastingSource(
  classId: string,
  progressionId: string,
): CharacterSelectionSource[] {
  return [{ kind: 'classSpellcasting', sourceId: classId, grantId: progressionId }]
}

function progressionSuffixFromChoiceSet(
  choiceSet: ChoiceSet,
): ClassSpellcastingChoiceSuffix | undefined {
  if (choiceSet.sourceType !== 'spellcasting') return undefined
  return choiceSet.id.slice(
    `${choiceSet.sourceType}:${choiceSet.sourceId}:`.length,
  ) as ClassSpellcastingChoiceSuffix
}

function membershipForProgression(
  progression: CompiledSpellcastingChoiceProgression,
): CharacterSpellCollectionMembership {
  const membership: CharacterSpellCollectionMembership = { kind: progression.destination }
  if (progression.destination === 'prepared' && progression.mutation.kind === 'replace') {
    membership.mutable = true
  }
  return membership
}

function membershipForChoiceSet(
  suffix: ClassSpellcastingChoiceSuffix,
  progression: CompiledSpellcastingChoiceProgression | undefined,
): CharacterSpellCollectionMembership | undefined {
  if (suffix === CLASS_SPELLCASTING_CHOICE_SUFFIXES.cantrips) {
    return { kind: 'cantrips' }
  }
  return progression ? membershipForProgression(progression) : undefined
}

function mergeSources(
  existing: CharacterSelectionSource[] | undefined,
  incoming: CharacterSelectionSource[],
): CharacterSelectionSource[] {
  const merged = [...(existing ?? [])]
  for (const source of incoming) {
    const duplicate = merged.some(
      (entry) =>
        entry.kind === source.kind &&
        entry.sourceId === source.sourceId &&
        entry.grantId === source.grantId,
    )
    if (!duplicate) merged.push(source)
  }
  return merged
}

function mergeSelectionIntoEntries(
  entries: Map<string, CharacterSpellEntry>,
  spellIds: readonly string[],
  sources: CharacterSelectionSource[],
  membership: CharacterSpellCollectionMembership,
): void {
  for (const spellId of spellIds) {
    const existing = entries.get(spellId)
    if (!existing) {
      entries.set(spellId, {
        spellId,
        access: {},
        sources,
        collections: [membership],
      })
      continue
    }

    entries.set(spellId, {
      ...existing,
      sources: mergeSources(existing.sources, sources),
      collections: mergeCharacterSpellCollections(existing.collections, [membership]),
    })
  }
}

/** Assembles finalized spell rows from spellcasting ChoiceSet selections. */
export function assembleClassSpellcasting(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
  choiceSets: readonly ChoiceSet[],
): CharacterSpellEntry[] {
  const profile = resolveSpellcastingProfile(draft, context)
  if (!profile) return []

  const progressionsBySuffix = new Map(
    profile.resolved.choiceProgressions.map((progression) => [progression.suffix, progression]),
  )
  const entries = new Map<string, CharacterSpellEntry>()

  for (const choiceSet of choiceSets) {
    if (choiceSet.sourceType !== 'spellcasting' || choiceSet.sourceId !== profile.classId) {
      continue
    }

    const suffix = progressionSuffixFromChoiceSet(choiceSet)
    if (!suffix) continue

    const progression = progressionsBySuffix.get(suffix)
    const membership = membershipForChoiceSet(suffix, progression)
    if (!membership) continue

    mergeSelectionIntoEntries(
      entries,
      draft.choiceSelections[choiceSet.id] ?? [],
      classSpellcastingSource(profile.classId, progression?.suffix ?? suffix),
      membership,
    )
  }

  return Array.from(entries.values())
}

/** Whether a progression's mutation policy allows post-builder changes. */
export function spellcastingProgressionIsMutable(mutation: SpellMutationPolicy): boolean {
  return mutation.kind === 'replace'
}

/** Returns true when an assembled entry includes the given collection kind. */
export function assembledSpellEntryHasCollection(
  entry: CharacterSpellEntry,
  kind: CharacterSpellCollectionMembership['kind'],
): boolean {
  return characterSpellHasCollection(entry, kind)
}
