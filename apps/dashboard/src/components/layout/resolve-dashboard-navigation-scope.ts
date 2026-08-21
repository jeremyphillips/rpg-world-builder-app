export type DashboardNavigationScope = { kind: 'global' } | { kind: 'campaign'; campaignId: string }

/** Mirrors the route tree: campaign scope only under `/campaigns/:campaignId/*`. */
export function resolveDashboardNavigationScope(input: {
  campaignId?: string | null
}): DashboardNavigationScope {
  if (!input.campaignId) {
    return { kind: 'global' }
  }

  return { kind: 'campaign', campaignId: input.campaignId }
}
