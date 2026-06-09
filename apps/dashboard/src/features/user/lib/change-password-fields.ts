import type { z } from 'zod'
import { changePasswordInputSchema, passwordSchema } from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

/**
 * Client-side form schema — extends the API contract with `confirmNewPassword`
 * for a typo guard. The `confirmNewPassword` field is stripped before the
 * request is sent; the server never sees it.
 */
export const changePasswordFormSchema = changePasswordInputSchema
  .extend({ confirmNewPassword: passwordSchema })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
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
