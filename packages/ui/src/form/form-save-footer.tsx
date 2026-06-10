import { cn } from '../lib/utils'
import { SubmitButton } from '../components/ui/submit-button'

export interface FormSaveFooterProps {
  /** Disables the submit button and swaps in `pendingLabel` while truthy. */
  pending?: boolean
  /** When true, renders `successMessage` beside the submit button. */
  isSuccess?: boolean
  /** Submit button label, e.g. "Save profile". */
  submitLabel: string
  /** Label shown while `pending`. Defaults to `"Saving…"`. */
  pendingLabel?: string
  /** Confirmation text announced (role="status") after a successful save. */
  successMessage?: string
  className?: string
}

/**
 * The standard actions row for a save-style form: an optional success
 * confirmation plus a pending-aware submit button. Designed for the `footer`
 * render prop of `<Form>` / `<TabbedForm>`:
 *
 * ```tsx
 * footer={(form) => (
 *   <FormSaveFooter
 *     pending={isPending || form.formState.isSubmitting}
 *     isSuccess={isSuccess}
 *     submitLabel="Save changes"
 *     successMessage="Changes saved."
 *   />
 * )}
 * ```
 */
export function FormSaveFooter({
  pending = false,
  isSuccess = false,
  submitLabel,
  pendingLabel = 'Saving…',
  successMessage,
  className,
}: FormSaveFooterProps) {
  return (
    <div className={cn('flex items-center justify-end gap-3 pt-2', className)}>
      {isSuccess && successMessage ? (
        <p role="status" className="text-sm text-muted-foreground">
          {successMessage}
        </p>
      ) : null}
      <SubmitButton pending={pending} pendingLabel={pendingLabel}>
        {submitLabel}
      </SubmitButton>
    </div>
  )
}
