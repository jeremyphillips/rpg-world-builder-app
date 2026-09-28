import { useCallback, useId, useRef, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import {
  ORGANIZATION_AUTHORING_PRESETS,
  ORGANIZATION_AUTHORING_PRESET_IDS,
  type CharacterClass,
  type OrganizationAuthoringPresetId,
} from '@rpg/contracts'
import { ComboboxField, ConfirmDialog } from '@rpg/ui'

import {
  ORGANIZATION_STARTING_POINT_HINT,
  ORGANIZATION_STARTING_POINT_LEGEND,
  ORGANIZATION_STARTING_POINT_PLACEHOLDER,
  organizationApplyStartingPointConfirmLabel,
  organizationChangeStartingPointDialogBody,
  organizationChangeStartingPointDialogTitle,
} from '../../lib/presets/organization-form-copy.lib'
import { useOrganizationAuthoringContext } from './organization-authoring-context'
import {
  isOrganizationAuthoringPresetId,
  listOrganizationStartingPointConfirmOverwriteFieldLabels,
  organizationAuthoringPresetComboboxDescription,
  organizationStartingPointFieldPath,
} from '../../lib/presets/organization-starting-point.lib'

const presetOptions = ORGANIZATION_AUTHORING_PRESET_IDS.map((id) => {
  const preset = ORGANIZATION_AUTHORING_PRESETS[id]
  return {
    value: id,
    label: preset.label,
    metadata: organizationAuthoringPresetComboboxDescription(preset.description),
    ...('discoveryTerms' in preset && preset.discoveryTerms
      ? { searchTerms: preset.discoveryTerms }
      : {}),
  }
})

export type OrganizationStartingPointFieldProps = {
  prefix?: string
  discoverableClasses: readonly CharacterClass[]
}

export function OrganizationStartingPointField({
  prefix,
  discoverableClasses,
}: OrganizationStartingPointFieldProps) {
  const fieldPath = organizationStartingPointFieldPath(prefix)
  const comboboxId = useId()
  const comboboxTriggerRef = useRef<HTMLButtonElement>(null)
  const form = useFormContext()
  const { enterProfileSetup } = useOrganizationAuthoringContext()
  const startingPointId = useWatch({ name: fieldPath })
  const values = useWatch() as Record<string, unknown>

  const [pendingPresetId, setPendingPresetId] = useState<OrganizationAuthoringPresetId | null>(null)

  const applied = isOrganizationAuthoringPresetId(startingPointId)

  const applyPreset = useCallback(
    (presetId: OrganizationAuthoringPresetId) => {
      enterProfileSetup()
      form.setValue(fieldPath, presetId, { shouldDirty: true, shouldValidate: true })
      setPendingPresetId(null)
    },
    [enterProfileSetup, fieldPath, form],
  )

  const handlePick = useCallback(
    (nextValue: string) => {
      if (!isOrganizationAuthoringPresetId(nextValue)) {
        return
      }
      if (!applied) {
        applyPreset(nextValue)
        return
      }
      if (nextValue === startingPointId) {
        return
      }
      const overwriteFieldLabels = listOrganizationStartingPointConfirmOverwriteFieldLabels(
        values,
        {
          prefix,
          currentPresetId: startingPointId,
          nextPresetId: nextValue,
          discoverableClasses,
        },
      )
      if (overwriteFieldLabels.length > 0) {
        setPendingPresetId(nextValue)
        return
      }
      applyPreset(nextValue)
    },
    [applied, applyPreset, discoverableClasses, prefix, startingPointId, values],
  )

  const handleClear = useCallback(() => {
    form.setValue(fieldPath, undefined, { shouldDirty: true })
  }, [fieldPath, form])

  const focusStartingPointControl = useCallback(() => {
    requestAnimationFrame(() => {
      comboboxTriggerRef.current?.focus()
    })
  }, [])

  return (
    <>
      <ComboboxField
        id={comboboxId}
        label={ORGANIZATION_STARTING_POINT_LEGEND}
        labelVisibility="srOnly"
        hint={ORGANIZATION_STARTING_POINT_HINT}
        hintPosition="below-control"
        options={presetOptions}
        multiple={false}
        placeholder={ORGANIZATION_STARTING_POINT_PLACEHOLDER}
        value={applied ? startingPointId : ''}
        clearable={applied}
        clearAccessibleName={`Clear ${ORGANIZATION_STARTING_POINT_LEGEND}`}
        onClear={handleClear}
        triggerRef={comboboxTriggerRef}
        onChange={(next) => {
          if (typeof next === 'string') {
            handlePick(next)
          }
        }}
      />

      {pendingPresetId ? (
        <ConfirmDialog
          open
          onOpenChange={(open) => {
            if (!open) {
              setPendingPresetId(null)
              focusStartingPointControl()
            }
          }}
          headline={organizationChangeStartingPointDialogTitle()}
          description={organizationChangeStartingPointDialogBody(
            ORGANIZATION_AUTHORING_PRESETS[pendingPresetId].label,
            listOrganizationStartingPointConfirmOverwriteFieldLabels(values, {
              prefix,
              currentPresetId: startingPointId as OrganizationAuthoringPresetId,
              nextPresetId: pendingPresetId,
              discoverableClasses,
            }),
          )}
          confirmLabel={organizationApplyStartingPointConfirmLabel(
            ORGANIZATION_AUTHORING_PRESETS[pendingPresetId].label,
          )}
          confirmVariant="warning"
          onConfirm={() => applyPreset(pendingPresetId)}
          onCancel={() => {
            setPendingPresetId(null)
            focusStartingPointControl()
          }}
        />
      ) : null}
    </>
  )
}
