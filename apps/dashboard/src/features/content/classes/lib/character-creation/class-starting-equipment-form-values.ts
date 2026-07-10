import type {
  StartingEquipmentChoice,
  StartingEquipmentGrantedItem,
  StartingEquipmentItem,
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
  equipmentGrantFromFormRow,
  equipmentGrantToFormRow,
} from '../../../lib/forms/grants/equipment-grant-form-values'
import {
  startingEquipmentOptionItemFields,
  type StartingEquipmentForm,
  type StartingEquipmentItemForm,
  type StartingEquipmentOptionForm,
} from './class-starting-equipment-form-fields'

function startingEquipmentItemToFormRow(item: StartingEquipmentItem): StartingEquipmentItemForm {
  if (item.kind === 'grant') {
    return {
      itemKind: 'grant',
      equipmentSlug: item.equipmentSlug,
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
    const grant = equipmentGrantFromFormRow(row) as StartingEquipmentGrantedItem
    if (row.modifiers?.length) {
      grant.modifiers = row.modifiers
    }
    return grant
  }
  return equipmentGrantFromFormRow(row)
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
