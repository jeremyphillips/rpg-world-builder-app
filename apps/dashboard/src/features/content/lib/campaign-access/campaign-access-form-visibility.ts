import type { FieldOptionAvailability } from '@rpg/ui/form'

import {
  CAMPAIGN_ACCESS_PLAYER_ACCESS_HINT,
  CAMPAIGN_ACCESS_PLAYER_ACCESS_PRESERVED_HINT,
} from './campaign-access-labels'

export type CampaignAccessPlayerAccessHintCtx = {
  available: boolean
}

/** Resolves the player-access select hint for the current availability state. */
export function resolveCampaignAccessPlayerAccessHint(
  ctx: CampaignAccessPlayerAccessHintCtx,
): string {
  if (!ctx.available) {
    return CAMPAIGN_ACCESS_PLAYER_ACCESS_PRESERVED_HINT
  }

  return CAMPAIGN_ACCESS_PLAYER_ACCESS_HINT
}

/** Disables visibility options when availability is off. */
export function campaignAccessVisibilityOptionAvailability(): FieldOptionAvailability {
  return {
    dependsOn: ['available'],
    enabledWhen: (values) => Boolean(values.available),
  }
}
