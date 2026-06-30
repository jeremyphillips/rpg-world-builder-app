import type { FormFooterActionsProps } from './form-footer-actions'
import { FormFooterActions } from './form-footer-actions'

export type FormSaveFooterProps = Omit<FormFooterActionsProps, 'leading' | 'secondary'>

/**
 * Save-only form actions row. Thin wrapper around {@link FormFooterActions}.
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
export function FormSaveFooter(props: FormSaveFooterProps) {
  return <FormFooterActions {...props} />
}
