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
  equipmentPoolToFormRow,
} from '../../../lib/forms/grants/equipment/equipment-grant-form-values'
import { createStartingEquipmentContributionId } from './class-starting-equipment-form-fields'
import {
  type StartingEquipmentDraftForm,
  type StartingEquipmentForm,
  type StartingEquipmentItemForm,
  type StartingEquipmentOptionForm,
} from './class-starting-equipment-form-fields'

type StartingEquipmentGrantItemForm = Extract<StartingEquipmentItemForm, { itemKind: 'grant' }>
type StartingEquipmentChoiceItemForm = Extract<StartingEquipmentItemForm, { itemKind: 'choice' }>

function startingEquipmentItemToFormRow(item: StartingEquipmentItem): StartingEquipmentItemForm {
  if (item.kind === 'grant') {
    const proficiencyChoiceId = startingEquipmentGrantProficiencyChoiceId(item)
    if (proficiencyChoiceId) {
      return {
        id: item.id,
        itemKind: 'grant',
        grantTargetSource: 'proficiency_choice',
        proficiencyChoiceId,
        quantity: item.quantity,
        equipped: item.equipped,
      }
    }

    return {
      id: item.id,
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
  return {
    id: item.id,
    itemKind: 'choice',
    choose: 1,
    ...equipmentPoolToFormRow(item.pool),
  }
}

function startingEquipmentProficiencyGrantFromFormRow(
  row: StartingEquipmentGrantItemForm,
): StartingEquipmentGrantedItem {
  const item: StartingEquipmentGrantedItem = {
    id: row.id,
    kind: 'grant',
    target: { source: 'proficiency_choice', choiceId: row.proficiencyChoiceId! },
    quantity: row.quantity ?? 1,
  }
  if (row.equipped !== undefined) {
    item.equipped = row.equipped
  }
  return item
}

function startingEquipmentEquipmentGrantFromFormRow(
  row: StartingEquipmentGrantItemForm,
): StartingEquipmentGrantedItem {
  const grant = equipmentGrantFromFormRow(row)
  if (grant.kind !== 'grant') {
    throw new Error('Starting equipment grant rows require an equipment slug in v1')
  }

  const item: StartingEquipmentGrantedItem = {
    id: row.id || createStartingEquipmentContributionId(),
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

function startingEquipmentGrantFromFormRow(
  row: StartingEquipmentGrantItemForm,
): StartingEquipmentGrantedItem {
  if (row.grantTargetSource === 'proficiency_choice') {
    return startingEquipmentProficiencyGrantFromFormRow(row)
  }
  return startingEquipmentEquipmentGrantFromFormRow(row)
}

function startingEquipmentChoiceFromFormRow(
  row: StartingEquipmentChoiceItemForm,
): StartingEquipmentItem {
  const choice = equipmentGrantFromFormRow({ ...row, choose: 1 })
  if (choice.kind !== 'choice') {
    throw new Error('Starting equipment choice rows require a choice grant')
  }
  return {
    ...choice,
    id: row.id || createStartingEquipmentContributionId(),
    choose: 1,
  }
}

function startingEquipmentItemFromFormRow(row: StartingEquipmentItemForm): StartingEquipmentItem {
  if (row.itemKind === 'grant') {
    return startingEquipmentGrantFromFormRow(row)
  }
  return startingEquipmentChoiceFromFormRow(row)
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
