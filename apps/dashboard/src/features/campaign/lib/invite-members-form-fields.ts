import { z } from 'zod'
import { campaignInviteRecipientInputSchema } from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

const inviteEmailEntrySchema = z.object({
  email: z.string(),
})

export const inviteMembersSchema = z
  .object({
    inviteEmails: z.array(inviteEmailEntrySchema).max(10).optional(),
  })
  .superRefine((values, ctx) => {
    const filledEntries = (values.inviteEmails ?? [])
      .map((entry, index) => ({ email: entry.email.trim(), index }))
      .filter((entry) => entry.email.length > 0)

    const normalized = filledEntries.map((entry) => entry.email.toLowerCase())
    if (new Set(normalized).size !== normalized.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'Duplicate email addresses are not allowed.',
        path: ['inviteEmails'],
      })
    }

    for (const entry of filledEntries) {
      const parsed = campaignInviteRecipientInputSchema.safeParse({ email: entry.email })
      if (!parsed.success) {
        ctx.addIssue({
          code: 'custom',
          message: 'Enter a valid email address.',
          path: ['inviteEmails', entry.index, 'email'],
        })
      }
    }
  })

export type InviteMembersValues = z.infer<typeof inviteMembersSchema>

export const inviteMembersFields: FormItem[] = [
  {
    kind: 'array',
    name: 'inviteEmails',
    legend: 'Email addresses',
    fields: [
      {
        type: 'text',
        name: 'email',
        label: 'Email address',
        placeholder: 'player@example.com',
        autoComplete: 'email',
      },
    ],
    addAction: { label: 'Add another email' },
    item: {
      header: {
        fallback: (index) => `Email ${index + 1}`,
        primaryField: 'email',
      },
    },
  },
]
