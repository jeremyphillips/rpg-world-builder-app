import { CONTENT_ACCESS_SPECIFIC_PLAYERS_ENABLED } from '@rpg/contracts'
import type { FieldOptionAvailability } from '@rpg/ui/form'

import {
  CAMPAIGN_ACCESS_PLAYER_ACCESS_HINT,
  CAMPAIGN_ACCESS_PLAYER_ACCESS_PRESERVED_HINT,
  CAMPAIGN_ACCESS_SPECIFIC_PLAYERS_DISABLED_HINT,
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

  if (!CONTENT_ACCESS_SPECIFIC_PLAYERS_ENABLED) {
    return CAMPAIGN_ACCESS_SPECIFIC_PLAYERS_DISABLED_HINT
  }

  return CAMPAIGN_ACCESS_PLAYER_ACCESS_HINT
}

/** Disables visibility options when unavailable or when specific_players is gated off. */
export function campaignAccessVisibilityOptionAvailability(): FieldOptionAvailability {
  return {
    dependsOn: ['available'],
    enabledWhen: (values, optionValue) => {
      if (!values.available) return false
      if (optionValue === 'specific_players' && !CONTENT_ACCESS_SPECIFIC_PLAYERS_ENABLED) {
        return false
      }
      return true
    },
  }
}
