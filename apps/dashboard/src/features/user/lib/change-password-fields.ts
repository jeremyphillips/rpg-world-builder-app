import { z } from 'zod'
import { changePasswordInputSchema, defineMessage, passwordSchema } from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

/** Change-password form validation messages (tier 3 form overrides). */
export const changePasswordValidationMessages = {
  passwordsDoNotMatch: defineMessage(
    'validation.changePassword.passwordsDoNotMatch',
    () => 'Passwords do not match',
  ),
}

/**
 * Client-side form schema — extends the API contract with `confirmNewPassword`
 * for a typo guard. The `confirmNewPassword` field is stripped before the
 * request is sent; the server never sees it.
 */
export const changePasswordFormSchema = changePasswordInputSchema
  .extend({ confirmNewPassword: passwordSchema })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmNewPassword) {
      ctx.addIssue({
        code: 'custom',
        message: changePasswordValidationMessages.passwordsDoNotMatch(),
        path: ['confirmNewPassword'],
      })
    }
  })

export type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>

export const changePasswordFields: FormItem[] = [
  {
    type: 'text',
    name: 'currentPassword',
    label: 'Current password',
    inputType: 'password',
    autoComplete: 'current-password',
    required: true,
  },
  {
    type: 'text',
    name: 'newPassword',
    label: 'New password',
    inputType: 'password',
    autoComplete: 'new-password',
    required: true,
    hint: 'At least 8 characters.',
  },
  {
    type: 'text',
    name: 'confirmNewPassword',
    label: 'Confirm new password',
    inputType: 'password',
    autoComplete: 'new-password',
    required: true,
  },
]
