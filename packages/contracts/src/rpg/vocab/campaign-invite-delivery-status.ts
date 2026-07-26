import { z } from 'zod'

import { keysFromEntries, termOptionsFromEntries, vocabEnumFromEntries } from './enum-schema'
import type { GameTermEntry, VocabularyTerm } from './types'

// ---------------------------------------------------------------------------
// Campaign invite delivery status — email transport outcome for an invite row.
// ---------------------------------------------------------------------------

export const CAMPAIGN_INVITE_DELIVERY_STATUS_TERM = {
  label: 'Invite delivery status',
  description: 'Whether the invitation email was sent successfully.',
  sentence: {
    singular: 'invite delivery status',
    plural: 'invite delivery statuses',
  },
} as const satisfies VocabularyTerm

export const CAMPAIGN_INVITE_DELIVERY_STATUS_ENTRIES = {
  pending: {
    label: 'Pending',
    description: 'Delivery has not been attempted or is awaiting retry.',
    sentence: {
      singular: 'pending delivery',
      plural: 'pending deliveries',
    },
  },
  sent: {
    label: 'Sent',
    description: 'The invitation email was delivered to the provider.',
    sentence: {
      singular: 'sent delivery',
      plural: 'sent deliveries',
    },
  },
  failed: {
    label: 'Failed',
    description: 'The invitation email could not be sent.',
    sentence: {
      singular: 'failed delivery',
      plural: 'failed deliveries',
    },
  },
} as const satisfies Record<string, GameTermEntry>

export const CAMPAIGN_INVITE_DELIVERY_STATUSES = keysFromEntries(
  CAMPAIGN_INVITE_DELIVERY_STATUS_ENTRIES,
)

export const campaignInviteDeliveryStatusSchema = vocabEnumFromEntries(
  CAMPAIGN_INVITE_DELIVERY_STATUS_ENTRIES,
)

export type CampaignInviteDeliveryStatus = z.infer<typeof campaignInviteDeliveryStatusSchema>

export const CAMPAIGN_INVITE_DELIVERY_STATUS_OPTIONS = termOptionsFromEntries(
  CAMPAIGN_INVITE_DELIVERY_STATUS_ENTRIES,
)
