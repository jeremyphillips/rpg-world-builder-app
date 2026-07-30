import { cn } from '@rpg/ui'

import { CAMPAIGN_UNKNOWN_NAME, CAMPAIGNS_QUERY_ERROR_MESSAGE } from '../lib/campaign-display'
import { CampaignDisplayName } from './campaign-display-name'
import {
  campaignTopbarTitleErrorClasses,
  campaignTopbarTitleLinkClasses,
  campaignTopbarTitleSkeletonClasses,
} from './campaign-topbar-title.variants'

export type CampaignTopbarTitleProps = {
  name: string
  href: string
  campaignId: string
}

/** Linked campaign title for the dashboard topbar. */
export function CampaignTopbarTitle({ name, href, campaignId }: CampaignTopbarTitleProps) {
  return (
    <CampaignDisplayName
      display={{ id: campaignId, name, imageUrl: null }}
      surface="topbar"
      href={href}
      asLink
      className={campaignTopbarTitleLinkClasses}
    />
  )
}

export type CampaignTopbarTitleMissingProps = {
  href: string
  campaignId: string
}

/** Fallback title when the route campaign id is absent from the loaded list. */
export function CampaignTopbarTitleMissing({ href, campaignId }: CampaignTopbarTitleMissingProps) {
  return <CampaignTopbarTitle name={CAMPAIGN_UNKNOWN_NAME} href={href} campaignId={campaignId} />
}

/** Error copy when the campaigns query fails on a campaign route. */
export function CampaignTopbarTitleError() {
  return <span className={campaignTopbarTitleErrorClasses}>{CAMPAIGNS_QUERY_ERROR_MESSAGE}</span>
}

/** Fixed-width loading placeholder for the topbar campaign title. */
export function CampaignTopbarTitleSkeleton() {
  return (
    <div
      className={cn('flex items-center gap-2', campaignTopbarTitleSkeletonClasses.root)}
      aria-hidden
    >
      <div className={campaignTopbarTitleSkeletonClasses.icon} />
      <div className={campaignTopbarTitleSkeletonClasses.label} />
    </div>
  )
}
