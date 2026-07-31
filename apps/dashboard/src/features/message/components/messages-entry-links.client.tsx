'use client'

import { Link } from 'react-router-dom'
import { buttonVariants } from '@rpg/ui'

import { ROUTES } from '@/app/routes'

import { MESSAGES_ACTION_COPY } from '../lib/messages-copy'

type MessagesEntryLinksLayout = 'inline' | 'stacked'

type MessagesCampaignEntryLinksProps = {
  campaignId: string
  layout?: MessagesEntryLinksLayout
}

function entryLinkClassName(layout: MessagesEntryLinksLayout): string {
  return layout === 'stacked'
    ? `${buttonVariants({ variant: 'ghost', size: 'sm' })} w-full justify-start`
    : buttonVariants({ variant: 'ghost', size: 'sm' })
}

/** Campaign-scoped and global message entry links for nav chrome and overview surfaces. */
export function MessagesCampaignEntryLinks({
  campaignId,
  layout = 'inline',
}: MessagesCampaignEntryLinksProps) {
  const linkClassName = entryLinkClassName(layout)
  const containerClassName =
    layout === 'stacked' ? 'flex flex-col gap-1' : 'flex flex-wrap items-center gap-2'

  return (
    <div className={containerClassName}>
      <Link to={ROUTES.messages.listScoped(campaignId)} className={linkClassName}>
        {MESSAGES_ACTION_COPY.viewForCampaign}
      </Link>
      <Link to={ROUTES.messages.list} className={linkClassName}>
        {MESSAGES_ACTION_COPY.viewAll}
      </Link>
    </div>
  )
}

type MessagesGlobalEntryLinkProps = {
  layout?: MessagesEntryLinksLayout
}

/** Global messages entry link for surfaces outside campaign context. */
export function MessagesGlobalEntryLink({ layout = 'inline' }: MessagesGlobalEntryLinkProps) {
  return (
    <Link to={ROUTES.messages.list} className={entryLinkClassName(layout)}>
      {MESSAGES_ACTION_COPY.viewAll}
    </Link>
  )
}

type MessagesOverviewEntryActionsProps = {
  campaignId: string
}

/** Compact overview header actions for campaign message discovery. */
export function MessagesOverviewEntryActions({ campaignId }: MessagesOverviewEntryActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        to={ROUTES.messages.listScoped(campaignId)}
        className={buttonVariants({ variant: 'outline', size: 'sm' })}
      >
        {MESSAGES_ACTION_COPY.viewForCampaign}
      </Link>
      <Link to={ROUTES.messages.list} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
        {MESSAGES_ACTION_COPY.viewAll}
      </Link>
    </div>
  )
}
