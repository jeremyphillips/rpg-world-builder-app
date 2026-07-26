import { campaignInviteRecipientInputSchema } from '@rpg/contracts'
import type { z } from 'zod'
import type { FormItem } from '@rpg/ui/form'

export const inviteMemberSchema = campaignInviteRecipientInputSchema

export type InviteMemberValues = z.infer<typeof inviteMemberSchema>

export const inviteMemberFields: FormItem[] = [
  {
    type: 'text',
    name: 'email',
    label: 'Email address',
    placeholder: 'player@example.com',
    autoComplete: 'email',
  },
]

export const inviteMemberDefaultValues: InviteMemberValues = {
  email: '',
}
