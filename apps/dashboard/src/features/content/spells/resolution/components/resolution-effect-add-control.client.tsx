'use client'

import { ButtonDropdown } from '@rpg/ui'
import type { ButtonDropdownItem } from '@rpg/ui'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'

import {
  buildResolutionEffectAddMenuItems,
  resolutionFormToSelectionContext,
} from '../lib/resolution-selection-context.lib'
import {
  createResolutionEffectAppendDefaults,
  type ResolutionEffectKind,
} from '../lib/resolution-effect-add-menu.lib'
import type { ResolutionFormValues } from '../lib/resolution-form-schema'
import { RESOLUTION_FIELD_NAME } from '../lib/resolution-form-values'

const EFFECTS_FIELD = `${RESOLUTION_FIELD_NAME}.effects` as const

/** Context-aware add control for resolution effects (replaces generic array add menu). */
export function ResolutionEffectAddControl() {
  const { control } = useFormContext()
  const resolution = useWatch({ name: RESOLUTION_FIELD_NAME }) as ResolutionFormValues | undefined
  const { append } = useFieldArray({ control, name: EFFECTS_FIELD })
  const context = resolutionFormToSelectionContext(resolution)

  const menuItems: ButtonDropdownItem[] = buildResolutionEffectAddMenuItems(context).map(
    (item) => ({
      id: item.id,
      label: item.label,
      description: item.reason,
      disabled: item.disabled,
    }),
  )

  return (
    <ButtonDropdown
      label="Add effect"
      items={menuItems}
      groups={[{ id: 'effects', label: 'Effects' }]}
      onSelectItem={(itemId) => {
        append(createResolutionEffectAppendDefaults(itemId as ResolutionEffectKind))
      }}
    />
  )
}
