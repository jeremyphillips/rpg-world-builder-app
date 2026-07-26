import { z } from 'zod'

import { keysFromEntries, termOptionsFromEntries, vocabEnumFromEntries } from './enum-schema'
import type { GameTermEntry, VocabularyTerm } from './types'

// ---------------------------------------------------------------------------
// Campaign invite status — lifecycle of a campaign player invitation.
// ---------------------------------------------------------------------------

export const CAMPAIGN_INVITE_STATUS_TERM = {
  label: 'Invite status',
  description: 'Where a campaign player invitation is in its lifecycle.',
  sentence: {
    singular: 'invite status',
    plural: 'invite statuses',
  },
} as const satisfies VocabularyTerm

export const CAMPAIGN_INVITE_STATUS_ENTRIES = {
  pending: {
    label: 'Pending',
    description: 'The invitation has been created but not yet accepted.',
    sentence: {
      singular: 'pending invite',
      plural: 'pending invites',
    },
  },
  accepted: {
    label: 'Accepted',
    description: 'The invitee accepted; character onboarding may be in progress.',
    sentence: {
      singular: 'accepted invite',
      plural: 'accepted invites',
    },
  },
  completed: {
    label: 'Completed',
    description: 'The invitee finished onboarding and attached a character.',
    sentence: {
      singular: 'completed invite',
      plural: 'completed invites',
    },
  },
  expired: {
    label: 'Expired',
    description: 'The invitation passed its expiry without completion.',
    sentence: {
      singular: 'expired invite',
      plural: 'expired invites',
    },
  },
} as const satisfies Record<string, GameTermEntry>

export const CAMPAIGN_INVITE_STATUSES = keysFromEntries(CAMPAIGN_INVITE_STATUS_ENTRIES)

export const campaignInviteStatusSchema = vocabEnumFromEntries(CAMPAIGN_INVITE_STATUS_ENTRIES)

export type CampaignInviteStatus = z.infer<typeof campaignInviteStatusSchema>

export const CAMPAIGN_INVITE_STATUS_OPTIONS = termOptionsFromEntries(CAMPAIGN_INVITE_STATUS_ENTRIES)
