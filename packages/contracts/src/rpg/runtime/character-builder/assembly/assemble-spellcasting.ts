import {
  characterSpellHasCollection,
  mergeCharacterSpellCollections,
  type CharacterSpellCollectionMembership,
  type CharacterSpellEntry,
} from '../../character/sheet/spells'
import type { CharacterSelectionSource } from '../../character/sheet/selection-sources'
import type { SpellChoiceProgression } from '../../../campaign/rules/spellcasting-progression'
import type { SpellMutationPolicy } from '../../../vocab/spell/spell-mutation-policy'
import type { ChoiceSet } from '../choice-set'
import type { CharacterBuildContext } from '../context'
import type { CharacterBuilderDraft } from '../draft/draft'
import { spellcastingChoiceSetId } from '../resolvers/spellcasting/resolve-spellcasting-choice-sets'
import { resolveSpellcastingProfile } from '../resolvers/spellcasting/spellcasting-profile'

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

function progressionIdFromChoiceSet(choiceSet: ChoiceSet): string | undefined {
  if (choiceSet.sourceType !== 'spellcasting') return undefined
  return choiceSet.id.slice(`${choiceSet.sourceType}:${choiceSet.sourceId}:`.length)
}

function membershipForProgression(
  progression: SpellChoiceProgression,
): CharacterSpellCollectionMembership {
  const membership: CharacterSpellCollectionMembership = { kind: progression.destination }
  if (progression.destination === 'prepared' && progression.mutation.kind === 'replace') {
    membership.mutable = true
  }
  return membership
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

/** Assembles finalized spell rows from spellcasting ChoiceSet selections. */
export function assembleClassSpellcasting(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
  choiceSets: readonly ChoiceSet[],
): CharacterSpellEntry[] {
  const profile = resolveSpellcastingProfile(draft, context)
  if (!profile) return []

  const progressionsById = new Map(
    profile.profileBundle.profile.choiceProgressions.map((progression) => [
      progression.id,
      progression,
    ]),
  )
  const entries = new Map<string, CharacterSpellEntry>()

  for (const choiceSet of choiceSets) {
    if (choiceSet.sourceType !== 'spellcasting' || choiceSet.sourceId !== profile.classId) {
      continue
    }

    const progressionId = progressionIdFromChoiceSet(choiceSet)
    if (!progressionId) continue

    const progression = progressionsById.get(progressionId)
    if (!progression) continue

    const selections = draft.choiceSelections[choiceSet.id] ?? []
    const membership = membershipForProgression(progression)
    const sources = classSpellcastingSource(profile.classId, progression.id)

    for (const spellId of selections) {
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

  return Array.from(entries.values())
}

/** @deprecated Use progression id via {@link spellcastingChoiceSetId}. */
export function spellcastingGrantId(choiceSet: ChoiceSet): string | undefined {
  return progressionIdFromChoiceSet(choiceSet)
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
