import { useCallback, useId, useRef, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import {
  ORGANIZATION_AUTHORING_PRESETS,
  ORGANIZATION_AUTHORING_PRESET_IDS,
  type CharacterClass,
  type OrganizationAuthoringPresetId,
} from '@rpg/contracts'
import { Button, ComboboxField, ConfirmDialog, Text } from '@rpg/ui'

import {
  ORGANIZATION_STARTING_POINT_CHANGE_LABEL,
  ORGANIZATION_STARTING_POINT_CUSTOMIZED_LABEL,
  ORGANIZATION_STARTING_POINT_HINT,
  ORGANIZATION_STARTING_POINT_LEGEND,
  ORGANIZATION_STARTING_POINT_PLACEHOLDER,
  ORGANIZATION_STARTING_POINT_REMOVE_HELP,
  ORGANIZATION_STARTING_POINT_REMOVE_LABEL,
  organizationApplyStartingPointConfirmLabel,
  organizationChangeStartingPointDialogBody,
  organizationChangeStartingPointDialogTitle,
} from '../../lib/presets/organization-form-copy.lib'
import {
  isOrganizationAuthoringPresetId,
  organizationStartingPointFieldPath,
  organizationStartingPointIsCustomized,
} from '../../lib/presets/organization-starting-point.lib'

const presetOptions = ORGANIZATION_AUTHORING_PRESET_IDS.map((id) => {
  const preset = ORGANIZATION_AUTHORING_PRESETS[id]
  return {
    value: id,
    label: preset.label,
    metadata: preset.description,
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
  const changeButtonRef = useRef<HTMLButtonElement>(null)
  const form = useFormContext()
  const startingPointId = useWatch({ name: fieldPath })
  const values = useWatch() as Record<string, unknown>

  const [pickerOpen, setPickerOpen] = useState(false)
  const [pendingPresetId, setPendingPresetId] = useState<OrganizationAuthoringPresetId | null>(null)

  const applied = isOrganizationAuthoringPresetId(startingPointId)
  const customized = applied
    ? organizationStartingPointIsCustomized(values, { prefix, discoverableClasses })
    : false
  const appliedLabel = applied ? ORGANIZATION_AUTHORING_PRESETS[startingPointId].label : ''

  const applyPreset = useCallback(
    (presetId: OrganizationAuthoringPresetId) => {
      form.setValue(fieldPath, presetId, { shouldDirty: true, shouldValidate: true })
      setPickerOpen(false)
      setPendingPresetId(null)
    },
    [fieldPath, form],
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
      if (nextValue === startingPointId && !customized) {
        setPickerOpen(false)
        return
      }
      if (customized || nextValue !== startingPointId) {
        setPendingPresetId(nextValue)
        return
      }
      applyPreset(nextValue)
    },
    [applied, applyPreset, customized, startingPointId],
  )

  const handleRemove = useCallback(() => {
    form.setValue(fieldPath, undefined, { shouldDirty: true })
    setPickerOpen(true)
  }, [fieldPath, form])

  const showPicker = !applied || pickerOpen

  return (
    <div className="flex flex-col gap-2">
      {applied && !pickerOpen ? (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Text variant="small" as="span">
            <span className="font-body-emphasis">{appliedLabel}</span>
            {customized ? (
              <Text variant="muted" as="span">
                {' '}
                · {ORGANIZATION_STARTING_POINT_CUSTOMIZED_LABEL}
              </Text>
            ) : null}
          </Text>
          <Button
            ref={changeButtonRef}
            type="button"
            variant="text"
            size="sm"
            density="compact"
            onClick={() => setPickerOpen(true)}
          >
            {ORGANIZATION_STARTING_POINT_CHANGE_LABEL}
          </Button>
          <Button
            type="button"
            variant="text"
            size="sm"
            density="compact"
            title={ORGANIZATION_STARTING_POINT_REMOVE_HELP}
            onClick={handleRemove}
          >
            {ORGANIZATION_STARTING_POINT_REMOVE_LABEL}
          </Button>
        </div>
      ) : null}

      {showPicker ? (
        <ComboboxField
          id={comboboxId}
          label={ORGANIZATION_STARTING_POINT_LEGEND}
          hint={ORGANIZATION_STARTING_POINT_HINT}
          hintPosition="below-control"
          options={presetOptions}
          multiple={false}
          placeholder={ORGANIZATION_STARTING_POINT_PLACEHOLDER}
          value={applied ? startingPointId : ''}
          onChange={(next) => {
            if (typeof next === 'string') {
              handlePick(next)
            }
          }}
        />
      ) : null}

      {pendingPresetId ? (
        <ConfirmDialog
          open
          onOpenChange={(open) => {
            if (!open) {
              setPendingPresetId(null)
              changeButtonRef.current?.focus()
            }
          }}
          headline={organizationChangeStartingPointDialogTitle()}
          description={organizationChangeStartingPointDialogBody(
            ORGANIZATION_AUTHORING_PRESETS[pendingPresetId].label,
          )}
          confirmLabel={organizationApplyStartingPointConfirmLabel(
            ORGANIZATION_AUTHORING_PRESETS[pendingPresetId].label,
          )}
          confirmVariant="warning"
          onConfirm={() => applyPreset(pendingPresetId)}
          onCancel={() => {
            setPendingPresetId(null)
            changeButtonRef.current?.focus()
          }}
        />
      ) : null}
    </div>
  )
}
