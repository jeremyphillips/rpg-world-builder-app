import type { Spell } from '../../../../content/spell'
import { buildChoiceSetId, type ChoiceSet, type ChoiceSetOption } from '../../choice-set'
import type { CharacterBuildCatalogIndex } from '../../context'
import type { SpellcastingProfile } from './spellcasting-profile'

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

/** Builds cantrip and prepared-spell ChoiceSets from a spellcasting profile. */
export function resolveSpellcastingChoiceSets(
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
