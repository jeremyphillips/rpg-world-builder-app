import * as React from 'react'
import type { FieldValues, UseFormReturn } from 'react-hook-form'
import { ConfirmDialog } from '@rpg/ui'

export interface AdvisorySubmitItem {
  message: string
}

export interface AdvisoryFormSubmitOptions<TValues extends FieldValues> {
  /** When false, `onSubmit` is passed through unchanged. Default true. */
  enabled?: boolean
  /** Hard validation — return true to block submit (set field errors on `form` first). */
  blockSubmit?: (form: UseFormReturn<TValues>, values: TValues) => boolean
  /** Soft advisories that require confirm before save proceeds. */
  getAdvisories?: (values: TValues) => readonly AdvisorySubmitItem[]
  formatConfirmDescription?: (advisories: readonly AdvisorySubmitItem[]) => string
  confirmHeadline?: string
  confirmLabel?: string
}

export interface UseAdvisoryFormSubmitResult<TValues extends FieldValues> {
  onSubmit: (values: TValues, form: UseFormReturn<TValues>) => Promise<void>
  confirmDialog: React.ReactNode
}

/**
 * Wraps a form submit handler with optional hard blocks and a confirm dialog for
 * soft advisories. Use with `ContentFormLayout` — pass
 * `onSubmit` and render `confirmDialog` as a sibling of the form.
 */
export function useAdvisoryFormSubmit<TValues extends FieldValues>(
  onSubmit: (values: TValues, form: UseFormReturn<TValues>) => Promise<void>,
  {
    enabled = true,
    blockSubmit,
    getAdvisories,
    formatConfirmDescription,
    confirmHeadline = 'Save anyway?',
    confirmLabel = 'Save',
  }: AdvisoryFormSubmitOptions<TValues> = {},
): UseAdvisoryFormSubmitResult<TValues> {
  const [pending, setPending] = React.useState<{
    values: TValues
    form: UseFormReturn<TValues>
    description: string
  } | null>(null)

  const wrappedOnSubmit = React.useCallback(
    async (values: TValues, form: UseFormReturn<TValues>) => {
      if (!enabled) {
        await onSubmit(values, form)
        return
      }

      if (blockSubmit?.(form, values)) {
        return
      }

      const advisories = getAdvisories?.(values) ?? []
      if (advisories.length > 0) {
        setPending({
          values,
          form,
          description:
            formatConfirmDescription?.(advisories) ??
            advisories.map((advisory) => advisory.message).join(' '),
        })
        return
      }

      await onSubmit(values, form)
    },
    [blockSubmit, enabled, formatConfirmDescription, getAdvisories, onSubmit],
  )

  const handleConfirm = React.useCallback(async () => {
    if (!pending) return
    const { values, form } = pending
    setPending(null)
    await onSubmit(values, form)
  }, [onSubmit, pending])

  const handleCancel = React.useCallback(() => {
    setPending(null)
  }, [])

  const confirmDialog = (
    <ConfirmDialog
      open={pending != null}
      onOpenChange={(open) => {
        if (!open) handleCancel()
      }}
      headline={confirmHeadline}
      description={pending?.description}
      confirmLabel={confirmLabel}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  )

  return { onSubmit: wrappedOnSubmit, confirmDialog }
}
