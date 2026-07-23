import { CONTENT_ACCESS_SPECIFIC_PLAYERS_ENABLED } from '@rpg/contracts'
import type { FieldOptionAvailability } from '@rpg/ui/form'

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
