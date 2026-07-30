import type { CampaignListItem } from '@rpg/contracts'

export type CampaignsOverviewViewState = 'pending' | 'error' | 'empty' | 'populated'

export function resolveCampaignsOverviewViewState(input: {
  isPending: boolean
  isError: boolean
  campaigns: CampaignListItem[] | undefined
}): CampaignsOverviewViewState {
  if (input.isPending) return 'pending'
  if (input.isError) return 'error'
  if (input.campaigns === undefined || input.campaigns.length === 0) return 'empty'
  return 'populated'
}

export function resolveCampaignsOverviewDescription(
  viewState: CampaignsOverviewViewState,
  copy: {
    description: string
    hasCampaignsDescription: string
  },
): string {
  if (viewState === 'populated') return copy.hasCampaignsDescription
  return copy.description
}
