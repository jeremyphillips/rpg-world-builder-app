import type { CampaignRole } from '@rpg/contracts'
import { ApiError } from '@rpg/contracts'

export const CAMPAIGN_OVERVIEW_SECTION_LABELS = {
  members: 'Members',
  invitations: 'Invitations',
  party: 'Party',
} as const

export const CAMPAIGN_OVERVIEW_EMPTY_TEXT = {
  members: 'No players have joined this campaign yet.',
  invitations: 'No pending invitations.',
  party: 'No player characters have joined the party yet.',
} as const

export const CAMPAIGN_OVERVIEW_MEMBER_ONBOARDING_LABELS = {
  character_added: 'Character added',
  onboarding_incomplete: 'Onboarding incomplete',
} as const

export const CAMPAIGN_ROLE_LABELS = {
  owner: 'Owner',
  'co-owner': 'Co-owner',
  pc: 'Player',
  observer: 'Observer',
} as const satisfies Record<CampaignRole, string>

export const INVITE_MEMBER_DIALOG_COPY = {
  headline: 'Invite member',
  description: 'Send a player an invitation to join this campaign and add a character.',
  submitLabel: 'Send invitation',
  cancelLabel: 'Cancel',
  closeLabel: 'Close',
  fallbackError: 'Could not send invitation.',
  deliveryFailureHeadline: 'Invitation saved, but the email could not be sent.',
  deliveryFailureDescription: 'The failed delivery will appear under Invitations.',
} as const

export const INVITE_MEMBER_DOMAIN_ERROR_COPY = {
  already_member: 'This person is already a campaign member.',
  invite_already_accepted:
    'This person has already accepted an invitation and still needs to finish character setup.',
  cooldown: 'An invitation was sent recently. Try again in a minute.',
} as const

export const INVITE_DELIVERY_STATUS_COPY = {
  pending: 'Pending',
  failed: 'Email not sent · Invitation pending',
} as const

export function formatCampaignRoleLabel(role: CampaignRole): string {
  return CAMPAIGN_ROLE_LABELS[role]
}

export function formatInviteExpiryLabel(expiresAt: string): string {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(
    new Date(expiresAt),
  )
}

export function formatInvitationStatusLine(
  deliveryStatus: 'pending' | 'sent' | 'failed',
  expiresAt: string,
): string {
  if (deliveryStatus === 'failed') {
    return INVITE_DELIVERY_STATUS_COPY.failed
  }

  return `${INVITE_DELIVERY_STATUS_COPY.pending} · Expires ${formatInviteExpiryLabel(expiresAt)}`
}

export function mapInviteSendError(error: unknown): string | undefined {
  if (!(error instanceof ApiError)) return undefined
  return INVITE_MEMBER_DOMAIN_ERROR_COPY[error.code as keyof typeof INVITE_MEMBER_DOMAIN_ERROR_COPY]
}
