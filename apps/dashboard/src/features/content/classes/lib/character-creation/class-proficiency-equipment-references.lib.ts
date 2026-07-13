import type {
  StartingEquipmentForm,
  StartingEquipmentItemForm,
} from './class-starting-equipment-form-fields'

export type ProficiencyEquipmentReference = {
  choiceId: string
  packageId: string
  packageLabel: string
  itemIndex: number
}

function isProficiencyLinkedGrantRow(
  item: StartingEquipmentItemForm,
): item is Extract<StartingEquipmentItemForm, { itemKind: 'grant' }> {
  return item.itemKind === 'grant' && item.grantTargetSource === 'proficiency_choice'
}

/** Lists starting-equipment grant rows that reference a tool proficiency choice id. */
export function findProficiencyEquipmentReferences(
  startingEquipment: StartingEquipmentForm | undefined,
  choiceId: string,
): ProficiencyEquipmentReference[] {
  if (!startingEquipment?.options?.length || !choiceId) return []

  const references: ProficiencyEquipmentReference[] = []

  for (const option of startingEquipment.options) {
    for (const [itemIndex, item] of option.items.entries()) {
      if (!isProficiencyLinkedGrantRow(item)) continue
      if (item.proficiencyChoiceId !== choiceId) continue

      references.push({
        choiceId,
        packageId: option.id ?? option.label,
        packageLabel: option.label,
        itemIndex,
      })
    }
  }

  return references
}
