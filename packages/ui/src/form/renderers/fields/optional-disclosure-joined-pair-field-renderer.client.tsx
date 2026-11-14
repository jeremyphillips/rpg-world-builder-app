'use client'

import { useMemo, useState } from 'react'
import { useController, useFormContext, useWatch } from 'react-hook-form'

import { OptionalFieldDisclosure } from '../../../components/ui/optional-field-disclosure.client'
import { useFieldRowParticipation } from '../../../components/ui/field-row-anatomy.context'
import { useFieldControlSize } from '../../context/form-section.context'
import type { JoinedPairFieldConfig, OptionalDisclosureConfig } from '../../field-config'
import { useDependsOnValues } from '../../config/form-depends-on.client'
import { useConfirmBeforeClear } from '../../config/use-confirm-before-clear.client'
import { JoinedPairFieldRenderer } from './joined-pair-field-renderer.client'
import { JoinedPairDisclosureRowMessage } from './joined-pair-disclosure-row-message.client'
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
  const { control } = useFormContext()
  const inAnatomyRow = useFieldRowParticipation()
  const { startPath } = resolveJoinedPairBoundPaths(config, namePrefix)
  const watchedAmount = useWatch({ control, name: startPath })
  const { field } = useController({ control, name: startPath })
  const [manualOpen, setManualOpen] = useState(false)
  const expandWhenPopulated = disclosure.expandWhenPopulated !== false
  const open = manualOpen || (expandWhenPopulated && hasAmount(watchedAmount))
  const controlSize = useFieldControlSize(config.controlSizeOverride)
  const disclosureConfig = useMemo(
    () => ({ ...config, labelVisibility: 'srOnly' as const }),
    [config],
  )
  const hoistRowMessage = inAnatomyRow && open
  const rowMessage = hoistRowMessage ? (
    <JoinedPairDisclosureRowMessage config={disclosureConfig} id={id} namePrefix={namePrefix} />
  ) : undefined
  const clearValue = () => {
    setManualOpen(false)
    field.onChange(undefined)
  }
  const { attemptClear, confirmDialog } = useConfirmBeforeClear({
    confirmBeforeClear: disclosure.confirmBeforeClear,
    clearingFields: [config],
    onClear: clearValue,
  })
  const gateValues = useDependsOnValues(disclosure.addGate?.dependsOn ?? [], namePrefix)
  const addDisabled = useMemo(() => {
    if (disclosure.addDisabled) return true
    const gate = disclosure.addGate
    if (!gate) return false
    return gate.disabledWhen(gateValues)
  }, [disclosure.addDisabled, disclosure.addGate, gateValues])
  const collapsedSummary = useMemo(() => {
    const gate = disclosure.addGate
    if (!gate?.disabledReasonWhen) return undefined
    const reason = gate.disabledReasonWhen(gateValues)
    return reason && addDisabled ? reason : undefined
  }, [addDisabled, disclosure.addGate, gateValues])
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen && addDisabled) return
    setManualOpen(nextOpen)
  }

  return (
    <>
      <OptionalFieldDisclosure
        controlId={id}
        fieldLabel={config.label}
        addLabel={disclosure.addLabel}
        removeLabel={disclosure.removeLabel}
        open={open}
        onOpenChange={handleOpenChange}
        onRemove={attemptClear}
        size={controlSize}
        addDisabled={addDisabled}
        summary={collapsedSummary}
        message={rowMessage}
      >
        <JoinedPairFieldRenderer
          config={disclosureConfig}
          id={id}
          namePrefix={namePrefix}
          showLayoutMessage={!hoistRowMessage}
          rowAwareHints={hoistRowMessage}
        />
      </OptionalFieldDisclosure>
      {confirmDialog}
    </>
  )
}
