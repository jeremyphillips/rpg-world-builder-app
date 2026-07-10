import {
  indexCharacterBuildCatalog,
  resolveEligibleProficiencyChoiceTargets,
  type CharacterClass,
  type Equipment,
} from '@rpg/contracts'
import type { FieldOption } from '@rpg/ui/form'

import { characterCreationProficienciesFromFormValues } from './class-character-creation-proficiencies-form-values'
import type { CharacterCreationProficienciesForm } from './class-character-creation-proficiencies-form-fields'

/** Builds eligible proficiency-choice combobox options for starting-equipment grant rows. */
export function buildProficiencyChoiceTargetOptions(args: {
  rulesetId: string
  classId: string
  proficiencies: CharacterCreationProficienciesForm | undefined
  equipment: readonly Equipment[]
  entity?: CharacterClass
}): FieldOption[] {
  const { rulesetId, classId, proficiencies, equipment, entity } = args
  const characterCreationProficiencies = characterCreationProficienciesFromFormValues(
    proficiencies,
    entity,
  )
  if (!characterCreationProficiencies?.tools?.choices?.length) return []

  const characterClass = {
    id: classId,
    rulesetId,
    characterCreation: { proficiencies: characterCreationProficiencies },
  } as CharacterClass

  const catalogIndex = indexCharacterBuildCatalog({
    species: [],
    classes: [characterClass],
    spells: [],
    equipment: [...equipment],
    skillProficiencies: [],
    languages: [],
  })

  return resolveEligibleProficiencyChoiceTargets(characterClass, catalogIndex).map((target) => ({
    value: target.choiceId,
    label: target.label,
    description: `Tool choice · Choose ${target.choose} · ${target.optionCount} options`,
  }))
}
