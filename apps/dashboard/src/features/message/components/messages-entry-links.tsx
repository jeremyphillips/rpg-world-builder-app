import { Link } from 'react-router-dom'
import { ButtonLink, cn } from '@rpg/ui'

import { ROUTES } from '@/app/routes'

import { MESSAGES_ACTION_COPY } from '../lib/messages-copy'

type MessagesEntryLinksTone = 'nav' | 'overview'
type MessagesEntryLinksLayout = 'inline' | 'stacked'

type MessagesEntryLinksProps = {
  campaignId?: string
  tone?: MessagesEntryLinksTone
  layout?: MessagesEntryLinksLayout
}

function stackedLayoutClassName(layout: MessagesEntryLinksLayout): string | undefined {
  return layout === 'stacked' ? 'w-full justify-start' : undefined
}

/** Campaign-scoped and global message entry links for nav chrome, overview, and bell footer. */
export function MessagesEntryLinks({
  campaignId,
  tone = 'nav',
  layout = 'inline',
}: MessagesEntryLinksProps) {
  const containerClassName =
    layout === 'stacked' ? 'flex flex-col gap-1' : 'flex flex-wrap items-center gap-2'
  const layoutClassName = stackedLayoutClassName(layout)
  const primaryVariant = tone === 'overview' ? 'outline' : 'ghost'

  if (!campaignId) {
    return (
      <ButtonLink
        link={<Link to={ROUTES.messages.list} />}
        variant={primaryVariant}
        size="sm"
        className={cn(layoutClassName)}
      >
        {MESSAGES_ACTION_COPY.viewAll}
      </ButtonLink>
    )
  }

  return (
    <div className={containerClassName}>
      <ButtonLink
        link={<Link to={ROUTES.messages.listScoped(campaignId)} />}
        variant={primaryVariant}
        size="sm"
        className={cn(layoutClassName)}
      >
        {MESSAGES_ACTION_COPY.viewForCampaign}
      </ButtonLink>
      <ButtonLink
        link={<Link to={ROUTES.messages.list} />}
        variant="ghost"
        size="sm"
        className={cn(layoutClassName)}
      >
        {MESSAGES_ACTION_COPY.viewAll}
      </ButtonLink>
    </div>
  )
}

/** @deprecated Use `MessagesEntryLinks` with `campaignId`. */
export function MessagesCampaignEntryLinks({
  campaignId,
  layout = 'inline',
}: {
  campaignId: string
  layout?: MessagesEntryLinksLayout
}) {
  return <MessagesEntryLinks campaignId={campaignId} layout={layout} />
}

/** @deprecated Use `MessagesEntryLinks` without `campaignId`. */
export function MessagesGlobalEntryLink({
  layout = 'inline',
}: {
  layout?: MessagesEntryLinksLayout
}) {
  return <MessagesEntryLinks layout={layout} />
}

/** @deprecated Use `MessagesEntryLinks` with `tone="overview"`. */
export function MessagesOverviewEntryActions({ campaignId }: { campaignId: string }) {
  return <MessagesEntryLinks campaignId={campaignId} tone="overview" />
}
