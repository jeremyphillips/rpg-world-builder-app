import { Form, FormSaveFooter } from '@rpg/ui/form'
import type { ChangePasswordInput } from '@rpg/contracts'

import { useSubmitHandler } from '@/lib/use-submit-handler'
import { useChangePassword } from '../hooks/use-change-password'
import {
  changePasswordFormSchema,
  changePasswordFields,
  type ChangePasswordFormValues,
} from '../lib/change-password-fields'

export function ChangePasswordSection() {
  const { mutateAsync, isPending, isSuccess } = useChangePassword()

  const { onSubmit, formError } = useSubmitHandler<ChangePasswordFormValues>(async (values) => {
    // confirmNewPassword is client-side only; strip it before the API call.
    const { confirmNewPassword: _confirm, ...input } = values
    await mutateAsync(input as ChangePasswordInput)
  }, 'Could not change password.')

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
        formError={formError}
        footer={(form) => (
          <FormSaveFooter
            pending={isPending || form.formState.isSubmitting}
            isSuccess={isSuccess}
            submitLabel="Change password"
            successMessage="Password changed."
          />
        )}
      />
    </section>
  )
}
