/** Campaign Homebrew hub and vocabulary management route helpers. */
export const HOMEBREW_ROUTES = {
  hub: (campaignId: string) => `/campaigns/${campaignId}/homebrew`,
  vocabularyHub: (campaignId: string) => `/campaigns/${campaignId}/homebrew/vocabulary`,
  vocabulary: (campaignId: string, setId: string) =>
    `/campaigns/${campaignId}/homebrew/vocabulary/${setId}`,
  rulesConfig: (campaignId: string, configId: string) =>
    `/campaigns/${campaignId}/homebrew/rules-config/${configId}`,
} as const
