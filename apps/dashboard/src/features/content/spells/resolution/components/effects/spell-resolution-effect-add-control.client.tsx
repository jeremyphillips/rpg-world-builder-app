'use client'

import { Plus } from 'lucide-react'
import { ButtonDropdown, fieldSizeToArrayAddButtonSize } from '@rpg/ui'
import type { ButtonDropdownItem } from '@rpg/ui'
import { getArrayFieldMutators, resolveFormDensity, useFormSectionContext } from '@rpg/ui/form'
import { useFormContext, useWatch } from 'react-hook-form'

import {
  createResolutionEffectAppendDefaults,
  type ResolutionEffectKind,
} from '../../lib/effects/resolution-effect-add-menu.lib'
import type { ResolutionFormValues } from '../../lib/form/resolution-form-schema'
import { RESOLUTION_SECTION_LABELS } from '../../lib/form/resolution-form-labels'
import { RESOLUTION_FIELD_NAME } from '../../lib/form/resolution-form-values'
import { resolutionFormToSelectionContext } from '../../lib/selection/resolution-selection-context.lib'
import { buildResolutionEffectAddMenuItems } from '../../lib/selection/resolution-selection-options.lib'

const EFFECTS_FIELD = `${RESOLUTION_FIELD_NAME}.effects` as const

/** Context-aware add control for resolution effects (replaces generic array add menu). */
export function SpellResolutionEffectAddControl() {
  const { control } = useFormContext()
  const { density } = useFormSectionContext()
  const { size } = resolveFormDensity(density)
  const resolution = useWatch({ name: RESOLUTION_FIELD_NAME }) as ResolutionFormValues | undefined
  const context = resolutionFormToSelectionContext(resolution)

  const menuItems: ButtonDropdownItem[] = buildResolutionEffectAddMenuItems(context).map(
    (item) => ({
      id: item.id,
      label: item.label,
      description: item.description,
      note: item.note,
      disabled: item.disabled,
    }),
  )

  return (
    <ButtonDropdown
      label={RESOLUTION_SECTION_LABELS.addAuthoredEffect}
      leadingIcon={<Plus aria-hidden />}
      width="fit"
      items={menuItems}
      groups={[{ id: 'effects', label: 'Effects' }]}
      size={fieldSizeToArrayAddButtonSize[size]}
      onSelectItem={(itemId) => {
        const mutators = getArrayFieldMutators(control, EFFECTS_FIELD)
        mutators?.append(createResolutionEffectAppendDefaults(itemId as ResolutionEffectKind))
      }}
    />
  )
}
