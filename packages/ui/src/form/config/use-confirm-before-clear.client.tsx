'use client'

import { useCallback, useState } from 'react'
import { useFormContext } from 'react-hook-form'

import { ConfirmDialog } from '../../components/ui/confirm-dialog.client'
import {
  resolveFieldConfigPrimaryName,
  type ConfirmBeforeClearConfig,
  type FieldConfig,
} from '../field-config'
import {
  resolveConfirmBeforeClearDialog,
  shouldConfirmBeforeClear,
} from './confirm-before-clear.lib'

type UseConfirmBeforeClearOptions = {
  confirmBeforeClear?: ConfirmBeforeClearConfig
  clearingFields: readonly FieldConfig[]
  namePrefix?: string
  onClear: () => void
}

/** Shared confirm-before-clear flow for dependent switches and optional disclosure. */
export function useConfirmBeforeClear({
  confirmBeforeClear,
  clearingFields,
  namePrefix,
  onClear,
}: UseConfirmBeforeClearOptions) {
  const { getValues } = useFormContext()
  const [open, setOpen] = useState(false)
  const clearingFieldNames = clearingFields.map((field) => resolveFieldConfigPrimaryName(field))

  const attemptClear = useCallback(() => {
    if (!confirmBeforeClear) {
      onClear()
      return
    }

    const values = getValues() as Record<string, unknown>
    if (
      !shouldConfirmBeforeClear(
        confirmBeforeClear,
        values,
        { namePrefix, clearingFieldNames },
        clearingFields,
      )
    ) {
      onClear()
      return
    }

    setOpen(true)
  }, [clearingFieldNames, clearingFields, confirmBeforeClear, getValues, namePrefix, onClear])

  const handleConfirm = useCallback(() => {
    setOpen(false)
    onClear()
  }, [onClear])

  const dialogProps = confirmBeforeClear
    ? resolveConfirmBeforeClearDialog(confirmBeforeClear)
    : null

  const confirmDialog =
    dialogProps == null ? null : (
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        headline={dialogProps.headline}
        description={dialogProps.description}
        confirmLabel={dialogProps.confirmLabel}
        cancelLabel={dialogProps.cancelLabel}
        confirmVariant={dialogProps.confirmVariant}
        onConfirm={handleConfirm}
      />
    )

  return { attemptClear, confirmDialog }
}
