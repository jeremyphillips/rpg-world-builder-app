import { Form } from '@rpg/ui/form'
import { SubmitButton } from '@rpg/ui'
import type { ChangePasswordInput } from '@rpg/contracts'

import { toFormError } from '@/lib/to-form-error'
import { useChangePassword } from '../hooks/use-change-password'
import {
  changePasswordFormSchema,
  changePasswordFields,
  type ChangePasswordFormValues,
} from '../lib/change-password-fields'

export function ChangePasswordSection() {
  const { mutate, isPending, error, isSuccess } = useChangePassword()

  function onSubmit(values: ChangePasswordFormValues) {
    // confirmNewPassword is client-side only; strip it before the API call.
    const { confirmNewPassword: _confirm, ...input } = values
    mutate(input as ChangePasswordInput)
  }

  return (
    <section aria-labelledby="password-heading" className="space-y-4">
      <div className="space-y-1">
        <h3 id="password-heading" className="text-lg font-semibold">
          Change password
        </h3>
        <p className="text-sm text-muted-foreground">
          You must enter your current password to set a new one.
        </p>
      </div>
      <Form<ChangePasswordFormValues>
        schema={changePasswordFormSchema}
        fields={changePasswordFields}
        onSubmit={onSubmit}
        formError={toFormError(error, 'Could not change password.')}
        footer={(form) => (
          <div className="flex items-center justify-end gap-3 pt-2">
            {isSuccess ? <p className="text-sm text-muted-foreground">Password changed.</p> : null}
            <SubmitButton disabled={isPending || form.formState.isSubmitting}>
              {isPending ? 'Saving…' : 'Change password'}
            </SubmitButton>
          </div>
        )}
      />
    </section>
  )
}
