/** Campaign Homebrew hub and vocabulary management route helpers. */
export const HOMEBREW_ROUTES = {
  hub: (campaignId: string) => `/campaigns/${campaignId}/homebrew`,
  vocabulary: (campaignId: string, setId: string) =>
    `/campaigns/${campaignId}/homebrew/vocabulary/${setId}`,
} as const
