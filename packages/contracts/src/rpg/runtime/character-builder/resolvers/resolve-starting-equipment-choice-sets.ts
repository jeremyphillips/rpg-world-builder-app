import type { CharacterClass } from '../../../content/classes/class'
import { formatEquipmentPoolLabel } from '../../../content/lib/equipment-grant'
import type { StartingEquipmentItem } from '../../../content/starting-equipment'
import { buildChoiceSetId, type ChoiceSet } from '../choice-set'
import type { CharacterBuildCatalogIndex } from '../context'
import type { CharacterBuilderDraft } from '../draft'
import { resolveEquipmentPoolChoiceOptions } from './equipment-pool-options'

export function startingEquipmentChoiceSetId(classId: string): string {
  return buildChoiceSetId('class', classId, 'starting-equipment')
}

export function nestedStartingEquipmentChoiceSetId(
  classId: string,
  optionId: string,
  itemIndex: number,
): string {
  return buildChoiceSetId('class', classId, `starting-equipment:${optionId}:${itemIndex}`)
}

export function readSelectedStartingEquipmentOptionId(
  draft: CharacterBuilderDraft,
  classId: string,
): string | undefined {
  return draft.choiceSelections[startingEquipmentChoiceSetId(classId)]?.[0]
}

function nestedChoiceSetForItem(
  characterClass: CharacterClass,
  optionId: string,
  item: Extract<StartingEquipmentItem, { kind: 'choice' }>,
  itemIndex: number,
  catalogIndex: CharacterBuildCatalogIndex,
): ChoiceSet {
  const choose = item.choose ?? 1
  return {
    id: nestedStartingEquipmentChoiceSetId(characterClass.id, optionId, itemIndex),
    sourceType: 'class',
    sourceId: characterClass.id,
    choiceType: 'equipment',
    label: formatEquipmentPoolLabel(item.pool),
    min: choose,
    max: choose,
    options: resolveEquipmentPoolChoiceOptions(item.pool, catalogIndex, characterClass.rulesetId),
    required: true,
  }
}

/** Builds starting-equipment ChoiceSets for the selected class package and nested picks. */
export function resolveStartingEquipmentChoiceSets(
  draft: CharacterBuilderDraft,
  characterClass: CharacterClass,
  catalogIndex: CharacterBuildCatalogIndex,
): ChoiceSet[] {
  const startingEquipment = characterClass.characterCreation?.startingEquipment
  if (!startingEquipment) return []

  const choiceSets: ChoiceSet[] = [
    {
      id: startingEquipmentChoiceSetId(characterClass.id),
      sourceType: 'class',
      sourceId: characterClass.id,
      choiceType: 'equipment',
      label: 'Choose Starting Equipment',
      min: startingEquipment.choose,
      max: startingEquipment.choose,
      options: startingEquipment.options.map((option) => ({
        id: option.id,
        label: option.label,
        description: option.description,
      })),
      required: true,
    },
  ]

  const selectedOptionId = readSelectedStartingEquipmentOptionId(draft, characterClass.id)
  if (!selectedOptionId) return choiceSets

  const selectedOption = startingEquipment.options.find((option) => option.id === selectedOptionId)
  if (!selectedOption) return choiceSets

  for (const [itemIndex, item] of selectedOption.items.entries()) {
    if (item.kind !== 'choice') continue
    choiceSets.push(
      nestedChoiceSetForItem(characterClass, selectedOptionId, item, itemIndex, catalogIndex),
    )
  }

  return choiceSets
}
