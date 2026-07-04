import { loginInputSchema, registerInputSchema } from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

export const loginFields: FormItem[] = [
  { type: 'text', name: 'email', label: 'Email', inputType: 'email', autoComplete: 'email' },
  {
    type: 'text',
    name: 'password',
    label: 'Password',
    inputType: 'password',
    autoComplete: 'current-password',
  },
]

export const signupFields: FormItem[] = [
  { type: 'text', name: 'displayName', label: 'Display name', autoComplete: 'nickname' },
  { type: 'text', name: 'email', label: 'Email', inputType: 'email', autoComplete: 'email' },
  {
    type: 'text',
    name: 'password',
    label: 'Password',
    inputType: 'password',
    autoComplete: 'new-password',
    hint: 'At least 8 characters.',
  },
]

export const loginFormSchema = loginInputSchema
export const signupFormSchema = registerInputSchema
