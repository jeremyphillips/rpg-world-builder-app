'use client'

import { Button } from '../../components/ui/button.client'
import { SubmitButton, type SubmitButtonProps } from '../../components/ui/submit-button'
import { useSchemaFormSubmit } from '../shells/schema-form-shell.client'
import {
  useFormShellFooterFormId,
  useFormShellFooterRequestSubmit,
} from './form-shell-footer.context'

export type FormShellSubmitButtonProps = SubmitButtonProps

/**
 * Submit button for overlay footers. Uses the canonical `requestSubmit` pipeline
 * when available (inline context or external footer model); falls back to native
 * `form={formId}` association when not.
 */
export function FormShellSubmitButton(props: FormShellSubmitButtonProps) {
  const schemaFormSubmit = useSchemaFormSubmit()
  const footerRequestSubmit = useFormShellFooterRequestSubmit()
  const requestSubmit = schemaFormSubmit?.requestSubmit ?? footerRequestSubmit
  const formId = useFormShellFooterFormId()

  if (requestSubmit) {
    const { pending = false, pendingLabel, children, disabled, ...buttonProps } = props
    return (
      <Button
        type="button"
        disabled={disabled || pending}
        onClick={() => {
          requestSubmit()
        }}
        {...buttonProps}
      >
        {pending && pendingLabel ? pendingLabel : children}
      </Button>
    )
  }

  return <SubmitButton form={formId ?? undefined} {...props} />
}
