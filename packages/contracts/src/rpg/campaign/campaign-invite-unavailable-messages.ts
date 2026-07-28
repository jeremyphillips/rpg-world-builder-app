import { defineMessage, formatFieldMessage } from '../../validation/define-message'

import type { CampaignInviteUnavailableReason } from './campaign-character-assignment-errors'

export const campaignInviteUnavailableMessages = {
  expired: defineMessage(
    'validation.campaignInvite.unavailable.expired',
    () => 'This invitation has expired. Ask the campaign owner to send a new invite.',
  ),
  revoked: defineMessage(
    'validation.campaignInvite.unavailable.revoked',
    () => 'This invitation has been revoked. Ask the campaign owner for a new invite.',
  ),
  not_owned: defineMessage(
    'validation.campaignInvite.unavailable.notOwned',
    () => 'This invitation belongs to another account.',
  ),
  not_accepted: defineMessage(
    'validation.campaignInvite.unavailable.notAccepted',
    () => 'This invitation is not ready for character setup yet.',
  ),
  already_completed: defineMessage(
    'validation.campaignInvite.unavailable.alreadyCompleted',
    () => 'This invitation has already been completed.',
  ),
} as const

export function formatCampaignInviteUnavailableMessage(
  reason: CampaignInviteUnavailableReason,
): string {
  const messageByReason = {
    expired: campaignInviteUnavailableMessages.expired,
    revoked: campaignInviteUnavailableMessages.revoked,
    not_owned: campaignInviteUnavailableMessages.not_owned,
    not_accepted: campaignInviteUnavailableMessages.not_accepted,
    already_completed: campaignInviteUnavailableMessages.already_completed,
  } satisfies Record<CampaignInviteUnavailableReason, () => string>

  return formatFieldMessage(messageByReason[reason]())
}
