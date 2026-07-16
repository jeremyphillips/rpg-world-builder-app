import type { CharacterSpellEntry } from '../../character/spells'
import type { CharacterSelectionSource } from '../../character/selection-sources'
import type { ChoiceSet } from '../choice-set'
import type { CharacterBuildContext } from '../context'
import type { CharacterBuilderDraft } from '../draft'
import { resolveSpellcastingProfile } from '../resolvers/spellcasting/spellcasting-profile'

// ---------------------------------------------------------------------------
// Character Builder spellcasting finalization — orchestrates draft selections,
// spellcasting profile facts, and character spell rows with sources.
// ---------------------------------------------------------------------------

export function classSpellcastingSource(
  classId: string,
  grantId: 'cantrips' | 'spells',
): CharacterSelectionSource[] {
  return [{ kind: 'classSpellcasting', sourceId: classId, grantId }]
}

export function spellcastingGrantId(choiceSet: ChoiceSet): 'cantrips' | 'spells' | undefined {
  if (choiceSet.choiceType === 'cantrip') return 'cantrips'
  if (choiceSet.choiceType === 'spell') return 'spells'
  return undefined
}

/** Assembles finalized spell rows from spellcasting ChoiceSet selections. */
export function assembleClassSpellcasting(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
  choiceSets: readonly ChoiceSet[],
): CharacterSpellEntry[] {
  const profile = resolveSpellcastingProfile(draft, context)
  if (!profile) return []

  const spells: CharacterSpellEntry[] = []

  for (const choiceSet of choiceSets) {
    const grantId = spellcastingGrantId(choiceSet)
    if (!grantId) continue

    const selections = draft.choiceSelections[choiceSet.id] ?? []
    const preparationState = grantId === 'cantrips' ? undefined : profile.preparation

    for (const spellId of selections) {
      spells.push({
        spellId,
        preparationState,
        sources: classSpellcastingSource(profile.classId, grantId),
      })
    }
  }

  return spells
}
