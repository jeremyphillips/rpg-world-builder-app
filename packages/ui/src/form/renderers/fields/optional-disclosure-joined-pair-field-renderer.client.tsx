'use client'

import { useState } from 'react'
import { useController } from 'react-hook-form'

import { OptionalFieldDisclosure } from '../../../components/ui/optional-field-disclosure.client'
import { useFieldControlSize } from '../../context/form-section.context'
import type { JoinedPairFieldConfig, OptionalDisclosureConfig } from '../../field-config'
import { useConfirmBeforeClear } from '../../config/use-confirm-before-clear.client'
import { JoinedPairFieldRenderer } from './joined-pair-field-renderer.client'
import { resolveJoinedPairBoundPaths } from './joined-pair-field-renderer.lib'

function hasAmount(value: unknown): boolean {
  return typeof value === 'number' && Number.isFinite(value)
}

/** Optional disclosure for a joined pair. The field label stays a normal label when open. */
export function OptionalDisclosureJoinedPairFieldRenderer({
  config,
  disclosure,
  id,
  namePrefix,
}: {
  config: JoinedPairFieldConfig
  disclosure: OptionalDisclosureConfig
  id: string
  namePrefix?: string
}) {
  const { startPath } = resolveJoinedPairBoundPaths(config, namePrefix)
  const { field } = useController({ name: startPath })
  const [manualOpen, setManualOpen] = useState(false)
  const expandWhenPopulated = disclosure.expandWhenPopulated !== false
  const open = manualOpen || (expandWhenPopulated && hasAmount(field.value))
  const controlSize = useFieldControlSize(config.controlSizeOverride)
  const clearValue = () => {
    field.onChange(undefined)
    setManualOpen(false)
  }
  const { attemptClear, confirmDialog } = useConfirmBeforeClear({
    confirmBeforeClear: disclosure.confirmBeforeClear,
    clearingFields: [config],
    onClear: clearValue,
  })

  return (
    <>
      <OptionalFieldDisclosure
        controlId={id}
        fieldLabel={config.label}
        addLabel={disclosure.addLabel}
        removeLabel={disclosure.removeLabel}
        open={open}
        onOpenChange={setManualOpen}
        onRemove={attemptClear}
        size={controlSize}
      >
        <JoinedPairFieldRenderer
          config={{ ...config, labelVisibility: 'srOnly' }}
          id={id}
          namePrefix={namePrefix}
        />
      </OptionalFieldDisclosure>
      {confirmDialog}
    </>
  )
}
