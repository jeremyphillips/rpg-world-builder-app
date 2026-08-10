'use client'

import { SubmitButton, type SubmitButtonProps } from '../../components/ui/submit-button'
import { useFormShellFooterFormId } from './form-shell-footer.context'

export type FormShellSubmitButtonProps = SubmitButtonProps

/**
 * Submit button for external overlay footers. Associates with the active form via
 * `form={formId}` when rendered outside the `<form>` element.
 */
export function FormShellSubmitButton(props: FormShellSubmitButtonProps) {
  const formId = useFormShellFooterFormId()
  return <SubmitButton form={formId ?? undefined} {...props} />
}
