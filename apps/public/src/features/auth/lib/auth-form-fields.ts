import { loginInputSchema, registerInputSchema } from '@rpg/contracts'
import type { FormItem, GroupConfig } from '@rpg/ui/form'

export const AUTH_CREDENTIALS_GROUP_ID = 'auth-credentials'

function authCredentialsGroup(fields: FormItem[]): FormItem[] {
  return [
    {
      kind: 'group',
      id: AUTH_CREDENTIALS_GROUP_ID,
      fieldChrome: { variant: 'none' },
      fields,
    },
  ]
}

export const loginFields: FormItem[] = authCredentialsGroup([
  { type: 'text', name: 'email', label: 'Email', inputType: 'email', autoComplete: 'email' },
  {
    type: 'text',
    name: 'password',
    label: 'Password',
    inputType: 'password',
    autoComplete: 'current-password',
  },
])

export const signupFields: FormItem[] = authCredentialsGroup([
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
])

export const loginFormSchema = loginInputSchema
export const signupFormSchema = registerInputSchema

/** Locks the signup email field when the address is pre-filled from an invite. */
export function signupFieldsWithLockedEmail(lockedEmail?: string): FormItem[] {
  if (!lockedEmail) return signupFields

  return signupFields.map((item) => {
    if (!('kind' in item) || item.kind !== 'group' || item.id !== AUTH_CREDENTIALS_GROUP_ID) {
      return item
    }

    const group = item as GroupConfig
    return {
      ...group,
      fields: group.fields.map((field) => {
        if ('name' in field && field.name === 'email') {
          return { ...field, disabled: true }
        }
        return field
      }),
    }
  })
}
