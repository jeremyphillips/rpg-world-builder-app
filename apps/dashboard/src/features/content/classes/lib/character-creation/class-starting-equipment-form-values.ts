import type {
  StartingEquipmentChoice,
  StartingEquipmentGrantedItem,
  StartingEquipmentItem,
  StartingEquipmentOption,
} from '@rpg/contracts'
import {
  startingEquipmentGrantEquipmentSlug,
  startingEquipmentGrantProficiencyChoiceId,
} from '@rpg/contracts'
import {
  wealthGrantMoneyFromForm,
  wealthGrantMoneyToForm,
} from '../../../lib/forms/fields/content-economy-form-fields'
import { applyStableIdsForChoiceOptions } from '../../../lib/forms/registry/content-form-key-helpers'
import {
  equipmentGrantFromFormRow,
  equipmentGrantToFormRow,
} from '../../../lib/forms/grants/equipment/equipment-grant-form-values'
import {
  type StartingEquipmentDraftForm,
  type StartingEquipmentForm,
  type StartingEquipmentItemForm,
  type StartingEquipmentOptionForm,
} from './class-starting-equipment-form-fields'

function startingEquipmentItemToFormRow(item: StartingEquipmentItem): StartingEquipmentItemForm {
  if (item.kind === 'grant') {
    const proficiencyChoiceId = startingEquipmentGrantProficiencyChoiceId(item)
    if (proficiencyChoiceId) {
      return {
        itemKind: 'grant',
        grantTargetSource: 'proficiency_choice',
        proficiencyChoiceId,
        quantity: item.quantity,
        equipped: item.equipped,
      }
    }

    return {
      itemKind: 'grant',
      grantTargetSource: 'equipment',
      equipmentSlug: startingEquipmentGrantEquipmentSlug(item) ?? '',
      quantity: item.quantity,
      equipped: item.equipped,
      modifiers: item.modifiers?.map((modifier) => ({
        kind: modifier.kind,
        spellcastingGearKind: modifier.spellcastingGearKind,
      })),
    }
  }
  return equipmentGrantToFormRow(item)
}

function startingEquipmentItemFromFormRow(row: StartingEquipmentItemForm): StartingEquipmentItem {
  if (row.itemKind === 'grant') {
    if (row.grantTargetSource === 'proficiency_choice') {
      const item: StartingEquipmentGrantedItem = {
        kind: 'grant',
        target: { source: 'proficiency_choice', choiceId: row.proficiencyChoiceId! },
        quantity: row.quantity ?? 1,
      }
      if (row.equipped !== undefined) {
        item.equipped = row.equipped
      }
      return item
    }

    const grant = equipmentGrantFromFormRow(row)
    if (grant.kind !== 'grant') {
      throw new Error('Starting equipment grant rows require an equipment slug in v1')
    }

    const item: StartingEquipmentGrantedItem = {
      kind: 'grant',
      target: { source: 'equipment', equipmentSlug: grant.equipmentSlug },
      quantity: grant.quantity ?? 1,
    }
    if (grant.equipped !== undefined) {
      item.equipped = grant.equipped
    }
    if (row.modifiers?.length) {
      item.modifiers = row.modifiers
    }
    return item
  }
  return equipmentGrantFromFormRow(row) as StartingEquipmentItem
}

export function startingEquipmentOptionToFormRow(
  option: StartingEquipmentOption,
): StartingEquipmentOptionForm {
  const available = option.available === false ? false : true
  return {
    id: option.id,
    label: option.label,
    description: option.description,
    wealth: wealthGrantMoneyToForm(option.wealth),
    items: option.items.map(startingEquipmentItemToFormRow),
    available,
  }
}

export function startingEquipmentOptionFromFormRow(
  row: StartingEquipmentOptionForm & { id: string },
): StartingEquipmentOption {
  const option: StartingEquipmentOption = {
    id: row.id,
    label: row.label,
    items: row.items.map(startingEquipmentItemFromFormRow),
  }
  const description = row.description?.trim()
  if (description) {
    option.description = description
  }
  const wealth = wealthGrantMoneyFromForm(row.wealth)
  if (wealth) {
    option.wealth = wealth
  }
  if (row.available === false) {
    option.available = false
  }
  return option
}

export function startingEquipmentToFormValues(
  startingEquipment: StartingEquipmentChoice,
): StartingEquipmentForm {
  return {
    choose: 1,
    options: startingEquipment.options.map(startingEquipmentOptionToFormRow),
  }
}

export function startingEquipmentFromFormValues(
  row: StartingEquipmentForm | undefined,
  existing?: StartingEquipmentChoice,
): StartingEquipmentChoice | undefined {
  if (!row?.options?.length) return undefined

  const options = applyStableIdsForChoiceOptions(
    row.options.filter((option) => option.label.trim()),
    existing?.options,
  ).map((option) => startingEquipmentOptionFromFormRow(option))

  if (!options.length) return undefined

  return {
    choose: 1,
    options,
  }
}

export function startingEquipmentEmptyFormValues(): StartingEquipmentDraftForm {
  return {
    choose: 1,
    options: [],
  }
}
