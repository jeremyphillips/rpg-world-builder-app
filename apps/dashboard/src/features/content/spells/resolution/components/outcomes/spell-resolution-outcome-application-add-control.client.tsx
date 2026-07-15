'use client'

import { ButtonDropdown, fieldSizeToArrayAddButtonSize } from '@rpg/ui'
import type { ButtonDropdownItem } from '@rpg/ui'
import { getArrayFieldMutators, useFormSectionContext } from '@rpg/ui/form'
import { useFormContext, useWatch } from 'react-hook-form'

import {
  buildOutcomeEffectApplicationMenuItems,
  createOutcomeApplicationAppendValue,
  outcomeApplicationsFieldPath,
} from '../../lib/form/resolution-outcome-form-fields'
import {
  appendOutcomeApplication,
  readOutcomeApplications,
} from '../../lib/form/resolution-outcome-applications.lib'
import { RESOLUTION_SECTION_LABELS } from '../../lib/form/resolution-form-labels'
import type { ResolutionFormValues } from '../../lib/form/resolution-form-schema'
import { RESOLUTION_FIELD_NAME } from '../../lib/form/resolution-form-values'

export type SpellResolutionOutcomeApplicationAddControlProps = {
  outcomeIndex: number
}

/** Context-aware add control for one outcome branch's effect applications. */
export function SpellResolutionOutcomeApplicationAddControl({
  outcomeIndex,
}: SpellResolutionOutcomeApplicationAddControlProps) {
  const { control, getValues, setValue } = useFormContext()
  const { size } = useFormSectionContext()
  const resolution = useWatch({ name: RESOLUTION_FIELD_NAME }) as ResolutionFormValues | undefined
  const outcome = resolution?.outcomes?.[outcomeIndex]
  const effects = resolution?.effects ?? []

  const menuItems: ButtonDropdownItem[] = buildOutcomeEffectApplicationMenuItems(effects, {
    applications: readOutcomeApplications(outcome?.applications),
  }).map((item) => ({ id: item.id, label: item.label }))

  if (menuItems.length === 0) return null

  return (
    <ButtonDropdown
      label={RESOLUTION_SECTION_LABELS.addOutcomeApplication}
      items={menuItems}
      groups={[{ id: 'effects', label: 'Effects' }]}
      size={fieldSizeToArrayAddButtonSize[size]}
      onSelectItem={(effectId) => {
        const applicationsPath = outcomeApplicationsFieldPath(outcomeIndex)
        const mutators = getArrayFieldMutators(control, applicationsPath)
        if (mutators) {
          mutators.append(createOutcomeApplicationAppendValue(effectId))
          return
        }

        appendOutcomeApplication(getValues, setValue, outcomeIndex, effectId)
      }}
    />
  )
}
