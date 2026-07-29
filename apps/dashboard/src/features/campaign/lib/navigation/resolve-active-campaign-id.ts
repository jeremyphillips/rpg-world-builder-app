/**
 * Resolve which campaign id drives the switcher and sidebar on agnostic routes.
 * Route context wins when the user is on a campaign-scoped URL.
 */
export function resolveActiveCampaignId(input: {
  routeCampaignId?: string | null
  preferredCampaignId?: string | null
}): string | null {
  return input.routeCampaignId ?? input.preferredCampaignId ?? null
}
