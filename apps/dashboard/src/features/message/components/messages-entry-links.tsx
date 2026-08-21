import { Link } from 'react-router-dom'
import { buttonVariants, cn } from '@rpg/ui'

import { ROUTES } from '@/app/routes'

import { MESSAGES_ACTION_COPY } from '../lib/messages-copy'

type MessagesEntryLinksTone = 'nav' | 'overview'
type MessagesEntryLinksLayout = 'inline' | 'stacked'

type MessagesEntryLinksProps = {
  campaignId?: string
  tone?: MessagesEntryLinksTone
  layout?: MessagesEntryLinksLayout
}

function entryLinkClassName(
  tone: MessagesEntryLinksTone,
  layout: MessagesEntryLinksLayout,
): string {
  const variant = tone === 'overview' ? 'outline' : 'ghost'
  const base = buttonVariants({ variant, size: 'sm' })
  return layout === 'stacked' ? cn(base, 'w-full justify-start') : base
}

function secondaryLinkClassName(layout: MessagesEntryLinksLayout): string {
  const base = buttonVariants({ variant: 'ghost', size: 'sm' })
  return layout === 'stacked' ? cn(base, 'w-full justify-start') : base
}

/** Campaign-scoped and global message entry links for nav chrome, overview, and bell footer. */
export function MessagesEntryLinks({
  campaignId,
  tone = 'nav',
  layout = 'inline',
}: MessagesEntryLinksProps) {
  const containerClassName =
    layout === 'stacked' ? 'flex flex-col gap-1' : 'flex flex-wrap items-center gap-2'

  if (!campaignId) {
    return (
      <Link to={ROUTES.messages.list} className={entryLinkClassName(tone, layout)}>
        {MESSAGES_ACTION_COPY.viewAll}
      </Link>
    )
  }

  return (
    <div className={containerClassName}>
      <Link
        to={ROUTES.messages.listScoped(campaignId)}
        className={entryLinkClassName(tone, layout)}
      >
        {MESSAGES_ACTION_COPY.viewForCampaign}
      </Link>
      <Link to={ROUTES.messages.list} className={secondaryLinkClassName(layout)}>
        {MESSAGES_ACTION_COPY.viewAll}
      </Link>
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
