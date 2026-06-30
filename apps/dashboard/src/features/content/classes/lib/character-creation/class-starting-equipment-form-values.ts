import type {
  StartingEquipmentChoice,
  StartingEquipmentFixedItem,
  StartingEquipmentItem,
  StartingEquipmentItemChoice,
  StartingEquipmentOption,
} from '@rpg/contracts'
import { buildItemDefaultValues } from '@rpg/ui/form'

import {
  wealthGrantMoneyFromForm,
  wealthGrantMoneyToForm,
} from '../../../lib/forms/fields/content-economy-form-fields'
import { applyStableIdsForChoiceOptions } from '../../../lib/forms/content-form-key-helpers'
import type { ContentFormCtx } from '../../../lib/forms/content-form-registry'
import {
  startingEquipmentOptionItemFields,
  type StartingEquipmentForm,
  type StartingEquipmentItemForm,
  type StartingEquipmentOptionForm,
} from './class-starting-equipment-form-fields'

type StartingEquipmentFixedItemForm = Extract<StartingEquipmentItemForm, { itemKind: 'fixed' }>
type StartingEquipmentChoiceItemForm = Extract<StartingEquipmentItemForm, { itemKind: 'choice' }>

function fixedItemToFormRow(item: StartingEquipmentFixedItem): StartingEquipmentItemForm {
  return {
    itemKind: 'fixed',
    equipmentSlug: item.equipmentSlug,
    quantity: item.quantity,
    equipped: item.equipped,
    modifiers: item.modifiers?.map((modifier) => ({
      kind: modifier.kind,
      focusKind: modifier.focusKind,
    })),
  }
}

function choiceItemToFormRow(item: StartingEquipmentItemChoice): StartingEquipmentItemForm {
  return {
    itemKind: 'choice',
    label: item.label,
    choose: item.choose,
    fromEquipmentSlugs: item.from.equipmentSlugs,
    fromToolCategories: item.from.toolCategories,
  }
}

function startingEquipmentItemToFormRow(item: StartingEquipmentItem): StartingEquipmentItemForm {
  return item.kind === 'fixed' ? fixedItemToFormRow(item) : choiceItemToFormRow(item)
}

function fixedItemFromFormRow(row: StartingEquipmentFixedItemForm): StartingEquipmentFixedItem {
  const item: StartingEquipmentFixedItem = {
    kind: 'fixed',
    equipmentSlug: row.equipmentSlug,
    quantity: row.quantity ?? 1,
  }
  if (row.equipped !== undefined) {
    item.equipped = row.equipped
  }
  if (row.modifiers?.length) {
    item.modifiers = row.modifiers
  }
  return item
}

function choiceItemFromFormRow(row: StartingEquipmentChoiceItemForm): StartingEquipmentItemChoice {
  const from: StartingEquipmentItemChoice['from'] = {}
  if (row.fromEquipmentSlugs?.length) {
    from.equipmentSlugs = row.fromEquipmentSlugs
  }
  if (row.fromToolCategories?.length) {
    from.toolCategories = row.fromToolCategories
  }

  return {
    kind: 'choice',
    label: row.label,
    choose: row.choose ?? 1,
    from,
  }
}

function startingEquipmentItemFromFormRow(row: StartingEquipmentItemForm): StartingEquipmentItem {
  return row.itemKind === 'fixed' ? fixedItemFromFormRow(row) : choiceItemFromFormRow(row)
}

export function startingEquipmentOptionToFormRow(
  option: StartingEquipmentOption,
): StartingEquipmentOptionForm {
  return {
    id: option.id,
    label: option.label,
    description: option.description,
    wealth: wealthGrantMoneyToForm(option.wealth),
    items: option.items.map(startingEquipmentItemToFormRow),
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
  if (row.description) {
    option.description = row.description
  }
  const wealth = wealthGrantMoneyFromForm(row.wealth)
  if (wealth) {
    option.wealth = wealth
  }
  return option
}

export function startingEquipmentToFormValues(
  startingEquipment: StartingEquipmentChoice,
): StartingEquipmentForm {
  return {
    choose: startingEquipment.choose,
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
    choose: row.choose ?? existing?.choose ?? 1,
    options,
  }
}

export function startingEquipmentDefaultValues(ctx: ContentFormCtx): StartingEquipmentForm {
  const standardOption = {
    ...(buildItemDefaultValues(
      startingEquipmentOptionItemFields(ctx),
    ) as StartingEquipmentOptionForm),
    id: 'standard',
    label: 'Standard Equipment',
    items: [],
  }

  const goldOption: StartingEquipmentOptionForm = {
    id: 'gold',
    label: 'Starting Gold',
    description: '',
    items: [],
  }

  return {
    choose: 1,
    options: [standardOption, goldOption],
  }
}
