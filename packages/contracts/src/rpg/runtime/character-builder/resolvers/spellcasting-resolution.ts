import type { Spell } from '../../../content/spell'
import type { CharacterSpellEntry } from '../../character/spells'
import type { CharacterSelectionSource } from '../../character/selection-sources'
import { buildChoiceSetId, type ChoiceSet, type ChoiceSetOption } from '../choice-set'
import type { CharacterBuildCatalogIndex } from '../context'
import type { CharacterBuilderDraft } from '../draft'
import type { SpellcastingProfile } from './spellcasting-profile'
import { resolveSpellcastingProfile } from './spellcasting-profile'

export function spellcastingCantripsChoiceSetId(classId: string): string {
  return buildChoiceSetId('spellcasting', classId, 'cantrips')
}

export function spellcastingSpellsChoiceSetId(classId: string): string {
  return buildChoiceSetId('spellcasting', classId, 'spells')
}

function spellOptionsForClass(
  catalogIndex: CharacterBuildCatalogIndex,
  classSlug: string,
  predicate: (spell: Spell) => boolean,
): ChoiceSetOption[] {
  return [...catalogIndex.spells.values()]
    .filter((spell) => spell.classIds.includes(classSlug) && predicate(spell))
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((spell) => ({ id: spell.id, label: spell.name }))
}

export function buildSpellcastingChoiceSets(
  profile: SpellcastingProfile,
  characterClassSlug: string,
  catalogIndex: CharacterBuildCatalogIndex,
): ChoiceSet[] {
  const choiceSets: ChoiceSet[] = []

  if (profile.cantripsKnown > 0 && profile.choiceSetIds.cantrips) {
    choiceSets.push({
      id: profile.choiceSetIds.cantrips,
      sourceType: 'spellcasting',
      sourceId: profile.classId,
      choiceType: 'cantrip',
      label: 'Cantrips',
      min: profile.cantripsKnown,
      max: profile.cantripsKnown,
      options: spellOptionsForClass(catalogIndex, characterClassSlug, (spell) => spell.level === 0),
      required: true,
    })
  }

  if (profile.spellsAvailable > 0 && profile.choiceSetIds.spells) {
    choiceSets.push({
      id: profile.choiceSetIds.spells,
      sourceType: 'spellcasting',
      sourceId: profile.classId,
      choiceType: 'spell',
      label: 'Prepared Spells',
      min: profile.spellsAvailable,
      max: profile.spellsAvailable,
      options: spellOptionsForClass(
        catalogIndex,
        characterClassSlug,
        (spell) => spell.level >= 1 && spell.level <= profile.maxSelectableSpellLevel,
      ),
      required: true,
    })
  }

  return choiceSets
}

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

export function assembleClassSpellcasting(
  draft: CharacterBuilderDraft,
  context: Parameters<typeof resolveSpellcastingProfile>[1],
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
