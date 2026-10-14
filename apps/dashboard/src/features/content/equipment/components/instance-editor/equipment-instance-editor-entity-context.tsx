import type { Dispatch } from 'react'

import {
  resolveEquipmentInstanceSummary,
  type Equipment,
  type MagicPropertyDefinitionProvider,
} from '@rpg/contracts'
import { NumberStepper, Text } from '@rpg/ui'

import { DrawerEntityContext } from '../../../lib/entity/surfaces/drawer/drawer-entity-context'
import { getContentDisplayImage } from '../../../lib/detail/page/content-display-image'
import { buildEquipmentContentDisplayImageInput } from '../../../lib/detail/page/content-display-image-input'
import type {
  EquipmentEditorAction,
  EquipmentEditorState,
} from '../../lib/instance-editor/equipment-editor-types'
import { buildEquipmentInstanceEditorContextMetadata } from '../../lib/instance-editor/equipment-instance-editor-context.lib'
import {
  EQUIPMENT_INSTANCE_EDITOR_SEPARATED_QUANTITY_LABEL,
  formatQuantityStepperAriaLabel,
} from '../../lib/instance-editor/equipment-instance-editor-form-labels'

type EquipmentInstanceEditorEntityContextProps = {
  state: EquipmentEditorState
  catalogItem: Equipment
  definitions: MagicPropertyDefinitionProvider
  dispatch: Dispatch<EquipmentEditorAction>
}

export function EquipmentInstanceEditorEntityContext({
  state,
  catalogItem,
  definitions,
  dispatch,
}: EquipmentInstanceEditorEntityContextProps) {
  const draft = state.session.draft
  const summary = resolveEquipmentInstanceSummary(draft, catalogItem, definitions)
  const metadata = buildEquipmentInstanceEditorContextMetadata(catalogItem)
  const displayImage = getContentDisplayImage(
    buildEquipmentContentDisplayImageInput(catalogItem, 'compact'),
  )

  const quantity = draft.quantity ?? 1
  const isScopeMode = state.mode.kind === 'scope'
  const showQuantityStepper = !isScopeMode && (state.session.scope === 'all' || quantity <= 1)
  const showSeparatedLabel = !isScopeMode && state.session.scope === 'one' && quantity > 1

  const trailing = showQuantityStepper ? (
    <NumberStepper
      size="sm"
      value={quantity}
      min={1}
      onChange={(value) => dispatch({ type: 'patchDraft', patch: { quantity: value } })}
      aria-label={formatQuantityStepperAriaLabel(summary.displayName)}
    />
  ) : showSeparatedLabel ? (
    <Text variant="muted">{EQUIPMENT_INSTANCE_EDITOR_SEPARATED_QUANTITY_LABEL}</Text>
  ) : undefined

  return (
    <DrawerEntityContext
      heading={summary.displayName}
      metadata={metadata}
      displayImage={displayImage}
      fallback="equipment"
      trailing={trailing}
    />
  )
}
