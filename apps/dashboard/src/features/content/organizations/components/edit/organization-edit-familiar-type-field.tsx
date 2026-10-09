import { useCallback, useId, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import {
  ORGANIZATION_AUTHORING_PRESETS,
  ORGANIZATION_AUTHORING_PRESET_IDS,
  type CharacterClass,
  type OrganizationAuthoringPresetId,
} from '@rpg/contracts'
import { ComboboxField, ConfirmDialog } from '@rpg/ui'

import { useOrganizationAuthoringContext } from '../authoring/use-organization-authoring-context'
import {
  ORGANIZATION_FAMILIAR_TYPE_HINT,
  ORGANIZATION_FAMILIAR_TYPE_LEGEND,
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

export type OrganizationEditFamiliarTypeFieldProps = {
  prefix?: string
  discoverableClasses: readonly CharacterClass[]
}

export function OrganizationEditFamiliarTypeField({
  prefix,
  discoverableClasses,
}: OrganizationEditFamiliarTypeFieldProps) {
  const comboboxId = useId()
  const form = useFormContext()
  const { editFamiliarTypeOpen, closeEditFamiliarType } = useOrganizationAuthoringContext()
  const [pendingPresetId, setPendingPresetId] = useState<OrganizationAuthoringPresetId | null>(null)

  const close = useCallback(() => {
    setPendingPresetId(null)
    closeEditFamiliarType()
  }, [closeEditFamiliarType])

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
      close()
    },
    [close, discoverableClasses, form, prefix],
  )

  if (!editFamiliarTypeOpen) {
    return null
  }

  return (
    <>
      <ComboboxField
        id={comboboxId}
        label={ORGANIZATION_FAMILIAR_TYPE_LEGEND}
        hint={ORGANIZATION_FAMILIAR_TYPE_HINT}
        hintPosition="below-control"
        options={presetOptions}
        multiple={false}
        placeholder={ORGANIZATION_STARTING_POINT_PLACEHOLDER}
        value=""
        onChange={(nextValue) => {
          if (typeof nextValue === 'string' && isOrganizationAuthoringPresetId(nextValue)) {
            setPendingPresetId(nextValue)
          }
        }}
      />

      {pendingPresetId ? (
        <ConfirmDialog
          open
          onOpenChange={(open) => {
            if (!open) close()
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
          onCancel={close}
        />
      ) : null}
    </>
  )
}
