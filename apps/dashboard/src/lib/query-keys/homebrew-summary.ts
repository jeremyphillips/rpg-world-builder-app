/** Shared TanStack Query key for campaign homebrew summary — used by content writes and the hub. */
export function homebrewSummaryQueryKey(campaignId: string) {
  return ['campaigns', campaignId, 'homebrew', 'summary'] as const
}
