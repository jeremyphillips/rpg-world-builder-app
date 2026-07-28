import type { CampaignInviteUnavailableReason } from '@rpg/contracts'

export function formatInviteUnavailableMessage(reason: CampaignInviteUnavailableReason): string {
  switch (reason) {
    case 'expired':
      return 'This invitation has expired. Ask the campaign owner to send a new invite.'
    case 'revoked':
      return 'This invitation has been revoked. Ask the campaign owner for a new invite.'
    case 'not_owned':
      return 'This invitation belongs to another account.'
    case 'not_accepted':
      return 'This invitation is not ready for character setup yet.'
    case 'already_completed':
      return 'This invitation has already been completed.'
  }
}
