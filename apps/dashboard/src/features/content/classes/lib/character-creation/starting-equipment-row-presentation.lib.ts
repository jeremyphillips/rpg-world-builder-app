import { createElement } from 'react'
import type { ArrayItemShellRenderProps, FieldOption } from '@rpg/ui/form'

import { EntityDisclosureArrayItemShell } from '../../../lib/entity/surfaces/cards/disclosure/entity-disclosure-array-item-shell'
import type { EquipmentGrantItemForm } from '../../../lib/forms/grants/equipment/equipment-grant-form-fields'
import {
  equipmentGrantDetail,
  equipmentGrantSummary,
} from '../../../lib/forms/grants/equipment/equipment-grant-form-values'
import { GRANT_ROW_TYPE_LABELS } from '../../../lib/forms/grants/grant-form-schema'
import {
  formatGrantRowToolbarAriaLabel,
  type GrantRowPresentation,
} from '../../../lib/forms/grants/grant-row-presentation.lib'

export function resolveStartingEquipmentRowPresentation(
  row: EquipmentGrantItemForm | undefined,
  equipmentOptions: FieldOption[] = [],
  proficiencyChoiceOptions: FieldOption[] = [],
): GrantRowPresentation | undefined {
  if (!row?.itemKind) return undefined

  const heading = GRANT_ROW_TYPE_LABELS.equipment
  const detail = equipmentGrantDetail(row, equipmentOptions, proficiencyChoiceOptions)
  const description = equipmentGrantSummary(row, equipmentOptions)

  return {
    heading,
    ...(detail ? { detail } : {}),
    ...(description ? { description } : {}),
  }
}

export function createStartingEquipmentItemShell(
  equipmentOptions: FieldOption[],
  proficiencyChoiceOptions: FieldOption[],
) {
  return function renderStartingEquipmentItemShell(props: ArrayItemShellRenderProps) {
    const presentation = resolveStartingEquipmentRowPresentation(
      props.itemValues as EquipmentGrantItemForm,
      equipmentOptions,
      proficiencyChoiceOptions,
    )
    const heading = presentation?.heading ?? props.header.fallback
    const detail = presentation?.detail

    const toolbarAriaLabel = presentation
      ? formatGrantRowToolbarAriaLabel({ heading, detail })
      : props.header.ariaLabel

    return createElement(EntityDisclosureArrayItemShell, {
      ...props,
      classification: detail,
      toolbarAriaLabel,
    })
  }
}
