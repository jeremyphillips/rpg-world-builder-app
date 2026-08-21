import {
  indexCharacterBuildCatalog,
  resolveEligibleProficiencyChoiceTargets,
  type CharacterClass,
  type Equipment,
} from '@rpg/contracts'
import type { FieldOption } from '@rpg/ui/form'

import { formatProficiencyChoiceOptionDescription } from '../../../lib/forms/grants/equipment-grant-form-labels'
import { characterCreationProficienciesWithLiveToolLabel } from './class-character-creation-proficiencies-form-values'
import type { CharacterCreationProficienciesForm } from './class-character-creation-proficiencies-form-fields'
import { findProficiencyEquipmentReferences } from './class-proficiency-equipment-references.lib'
import type { StartingEquipmentForm } from './class-starting-equipment-form-fields'

export type ProficiencyChoiceTargetFieldOption = FieldOption & {
  choiceId: string
  referencedByStartingEquipment: boolean
}

/** Builds eligible proficiency-choice combobox options for starting-equipment grant rows. */
export function buildProficiencyChoiceTargetOptions(args: {
  rulesetId: string
  classId: string
  proficiencies: CharacterCreationProficienciesForm | undefined
  equipment: readonly Equipment[]
  startingEquipment?: StartingEquipmentForm
}): ProficiencyChoiceTargetFieldOption[] {
  const { rulesetId, classId, proficiencies, equipment, startingEquipment } = args
  const characterCreationProficiencies =
    characterCreationProficienciesWithLiveToolLabel(proficiencies)
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
    organizations: [],
    languages: [],
  })

  return resolveEligibleProficiencyChoiceTargets(characterClass, catalogIndex).map((target) => ({
    value: target.choiceId,
    choiceId: target.choiceId,
    label: target.label,
    description: formatProficiencyChoiceOptionDescription(target.choiceId),
    referencedByStartingEquipment:
      findProficiencyEquipmentReferences(startingEquipment, target.choiceId).length > 0,
  }))
}
