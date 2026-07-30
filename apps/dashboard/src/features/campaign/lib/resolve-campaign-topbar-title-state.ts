import type { CampaignListItem } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

import { buildCampaignDisplay, type CampaignDisplayVM } from './campaign-display'

export type CampaignTopbarTitleState =
  | { kind: 'hidden' }
  | { kind: 'loading' }
  | { kind: 'resolved'; campaignId: string; name: string }
  | { kind: 'missing'; campaignId: string }

export type CampaignsQueryState = {
  isPending: boolean
  isError: boolean
  data: CampaignListItem[] | undefined
}

export function resolveCampaignTopbarTitleState(
  campaignId: string | undefined,
  query: CampaignsQueryState,
): CampaignTopbarTitleState {
  if (!campaignId) {
    return { kind: 'hidden' }
  }

  if (query.isError) {
    return { kind: 'hidden' }
  }

  if (query.isPending || query.data === undefined) {
    return { kind: 'loading' }
  }

  const campaign = query.data.find((item) => item.id === campaignId)
  if (!campaign) {
    return { kind: 'missing', campaignId }
  }

  return {
    kind: 'resolved',
    campaignId,
    name: buildCampaignDisplay(campaign).name,
  }
}

export type MappedCampaignTopbarTitleState =
  | { kind: 'hidden' }
  | { kind: 'loading' }
  | { kind: 'resolved'; display: CampaignDisplayVM; href: string }
  | { kind: 'missing'; campaignId: string; href: string }

export function mapCampaignTopbarTitleState(
  state: CampaignTopbarTitleState,
): MappedCampaignTopbarTitleState {
  switch (state.kind) {
    case 'hidden':
    case 'loading':
      return state
    case 'resolved':
      return {
        kind: 'resolved',
        display: buildCampaignDisplay({ id: state.campaignId, name: state.name }),
        href: ROUTES.campaign.detail(state.campaignId),
      }
    case 'missing':
      return {
        kind: 'missing',
        campaignId: state.campaignId,
        href: ROUTES.campaign.detail(state.campaignId),
      }
  }
}
