/** Game Terms hub, overview, and detail route helpers. */
export const GAME_TERMS_ROUTES = {
  hub: (campaignId: string) => `/campaigns/${campaignId}/game-terms`,
  overview: (campaignId: string, setId: string) => `/campaigns/${campaignId}/game-terms/${setId}`,
  detail: (campaignId: string, setId: string, termId: string) =>
    `/campaigns/${campaignId}/game-terms/${setId}/${termId}`,
} as const
