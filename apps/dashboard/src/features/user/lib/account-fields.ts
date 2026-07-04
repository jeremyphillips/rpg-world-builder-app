import { z } from 'zod'
import type { FormItem } from '@rpg/ui/form'

/**
 * Local form schema for the profile section. Includes an `avatar` file input
 * (`File[]`) in addition to the API contract's string `avatarKey`. On submit,
 * the file is uploaded via `uploadFile` to obtain the key before patching.
 */
export const accountFormSchema = z.object({
  displayName: z.string().min(1).max(80),
  email: z.email(),
  avatar: z.array(z.custom<File>((v: unknown) => v instanceof File)).optional(),
})

export type AccountFormValues = z.infer<typeof accountFormSchema>

export const accountFields: FormItem[] = [
  {
    type: 'text',
    name: 'displayName',
    label: 'Display name',
    autoComplete: 'nickname',
    required: true,
  },
  {
    type: 'text',
    name: 'email',
    label: 'Email',
    inputType: 'email',
    autoComplete: 'email',
    required: true,
    hint: 'Changing your email takes effect immediately.',
  },
  {
    type: 'file',
    name: 'avatar',
    label: 'Avatar',
    hint: 'JPEG, PNG, or WebP.',
    accept: ['image/jpeg', 'image/png', 'image/webp'],
  },
]
