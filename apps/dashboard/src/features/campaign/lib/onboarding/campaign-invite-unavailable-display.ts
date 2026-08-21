import type { CampaignInviteUnavailableReason } from '@rpg/contracts'
import { formatCampaignInviteUnavailableMessage } from '@rpg/contracts'

export function formatInviteUnavailableMessage(reason: CampaignInviteUnavailableReason): string {
  return formatCampaignInviteUnavailableMessage(reason)
}
