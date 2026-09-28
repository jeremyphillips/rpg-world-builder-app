import { useCallback, useId, useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import {
  ORGANIZATION_AUTHORING_PRESETS,
  ORGANIZATION_AUTHORING_PRESET_IDS,
  type CharacterClass,
  type OrganizationAuthoringPresetId,
} from '@rpg/contracts'
import { Button, ComboboxField, ConfirmDialog, Text } from '@rpg/ui'

import {
  ORGANIZATION_APPLY_FAMILIAR_TYPE_HINT,
  ORGANIZATION_APPLY_FAMILIAR_TYPE_LABEL,
  ORGANIZATION_STARTING_POINT_PLACEHOLDER,
  organizationApplyFamiliarTypeDialogBody,
  organizationApplyFamiliarTypeDialogTitle,
  organizationApplyStartingPointConfirmLabel,
} from '../../lib/presets/organization-form-copy.lib'
import {
  buildOrganizationEditFamiliarTypeFormPatch,
  isOrganizationAuthoringPresetId,
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

export type OrganizationApplyFamiliarTypeFieldProps = {
  prefix?: string
  discoverableClasses: readonly CharacterClass[]
}

export function OrganizationApplyFamiliarTypeField({
  prefix,
  discoverableClasses,
}: OrganizationApplyFamiliarTypeFieldProps) {
  const comboboxId = useId()
  const applyButtonRef = useRef<HTMLButtonElement>(null)
  const form = useFormContext()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pendingPresetId, setPendingPresetId] = useState<OrganizationAuthoringPresetId | null>(null)

  const applyPreset = useCallback(
    (presetId: OrganizationAuthoringPresetId) => {
      const patch = buildOrganizationEditFamiliarTypeFormPatch(
        presetId,
        discoverableClasses,
        prefix,
      )
      for (const [path, value] of Object.entries(patch)) {
        form.setValue(path, value, { shouldDirty: true, shouldValidate: true })
      }
      setPickerOpen(false)
      setPendingPresetId(null)
      applyButtonRef.current?.focus()
    },
    [discoverableClasses, form, prefix],
  )

  const handlePick = useCallback((nextValue: string) => {
    if (!isOrganizationAuthoringPresetId(nextValue)) {
      return
    }
    setPendingPresetId(nextValue)
  }, [])

  return (
    <div className="flex flex-col gap-2">
      <Button
        ref={applyButtonRef}
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setPickerOpen((open) => !open)}
      >
        {ORGANIZATION_APPLY_FAMILIAR_TYPE_LABEL}
      </Button>
      {pickerOpen ? (
        <>
          <Text variant="muted">{ORGANIZATION_APPLY_FAMILIAR_TYPE_HINT}</Text>
          <ComboboxField
            id={comboboxId}
            label={ORGANIZATION_APPLY_FAMILIAR_TYPE_LABEL}
            options={presetOptions}
            multiple={false}
            placeholder={ORGANIZATION_STARTING_POINT_PLACEHOLDER}
            value=""
            onChange={(next) => {
              if (typeof next === 'string') {
                handlePick(next)
              }
            }}
          />
        </>
      ) : null}

      {pendingPresetId ? (
        <ConfirmDialog
          open
          onOpenChange={(open) => {
            if (!open) {
              setPendingPresetId(null)
              applyButtonRef.current?.focus()
            }
          }}
          headline={organizationApplyFamiliarTypeDialogTitle(
            ORGANIZATION_AUTHORING_PRESETS[pendingPresetId].label,
          )}
          description={organizationApplyFamiliarTypeDialogBody(
            ORGANIZATION_AUTHORING_PRESETS[pendingPresetId].label,
          )}
          confirmLabel={organizationApplyStartingPointConfirmLabel(
            ORGANIZATION_AUTHORING_PRESETS[pendingPresetId].label,
          )}
          confirmVariant="warning"
          onConfirm={() => applyPreset(pendingPresetId)}
          onCancel={() => {
            setPendingPresetId(null)
            applyButtonRef.current?.focus()
          }}
        />
      ) : null}
    </div>
  )
}
