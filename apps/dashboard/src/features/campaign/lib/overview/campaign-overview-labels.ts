import type { CampaignInviteAdminListItem } from '@rpg/contracts'
import type { CampaignRole } from '@rpg/contracts'
import { ApiError } from '@rpg/contracts'

import { formatRelativeOrDate, formatShortDate } from '@/lib/datetime/format-datetime'

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
  failed: 'Email not sent',
  sent: 'Sent',
} as const

export const CAMPAIGN_INVITE_ROW_ACTION_COPY = {
  shareLink: 'Share new invite link',
  revokePending: 'Revoke invitation',
  shareConfirmHeadline: 'Share new invite link?',
  shareConfirmDescription:
    'This generates a fresh invite link, sends a new email, and invalidates the previous link.',
  shareConfirmLabel: 'Share link',
  revokePendingConfirmHeadline: 'Revoke invitation?',
  revokePendingConfirmDescription:
    'The invite link stops working immediately. You can send a new invitation later.',
  revokeConfirmLabel: 'Revoke',
} as const

export const CAMPAIGN_MEMBER_ROW_ACTION_COPY = {
  removeIncomplete: 'Remove member',
  removeIncompleteConfirmHeadline: 'Remove member?',
  removeIncompleteConfirmDescription:
    'This removes their campaign membership and clears their accepted invitation so you can invite them again.',
  removeIncompleteConfirmLabel: 'Remove member',
} as const

export function formatCampaignRoleLabel(role: CampaignRole): string {
  return CAMPAIGN_ROLE_LABELS[role]
}

export function formatInviteExpiryLabel(expiresAt: string): string {
  return formatShortDate(expiresAt)
}

export function formatInvitationStatusLine(
  invite: Pick<CampaignInviteAdminListItem, 'deliveryStatus' | 'expiresAt' | 'sentAt'>,
): string {
  const expiryLabel = formatInviteExpiryLabel(invite.expiresAt)

  if (invite.deliveryStatus === 'failed') {
    return `${INVITE_DELIVERY_STATUS_COPY.failed} · Expires ${expiryLabel}`
  }

  if (invite.deliveryStatus === 'sent' && invite.sentAt) {
    return `${INVITE_DELIVERY_STATUS_COPY.sent} ${formatRelativeOrDate(invite.sentAt)} · Expires ${expiryLabel}`
  }

  return `Pending · Expires ${expiryLabel}`
}

export function formatMemberInviteAcceptedLine(inviteAcceptedAt: string): string {
  return `Accepted ${formatRelativeOrDate(inviteAcceptedAt)}`
}

export function mapInviteSendError(error: unknown): string | undefined {
  if (!(error instanceof ApiError)) return undefined
  return INVITE_MEMBER_DOMAIN_ERROR_COPY[error.code as keyof typeof INVITE_MEMBER_DOMAIN_ERROR_COPY]
}
