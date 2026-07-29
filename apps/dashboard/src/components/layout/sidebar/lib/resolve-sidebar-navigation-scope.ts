export type SidebarNavigationScope = { kind: 'global' } | { kind: 'campaign'; campaignId: string }

/**
 * Mirrors route-tree sidebar ownership: `campaignId` is present only under
 * `CampaignLayoutRoute` (`/campaigns/:campaignId/*`). Global AppShell routes omit it.
 */
export function resolveSidebarNavigationScope(input: {
  campaignId?: string | null
}): SidebarNavigationScope {
  const { campaignId } = input
  if (campaignId) {
    return { kind: 'campaign', campaignId }
  }
  return { kind: 'global' }
}
