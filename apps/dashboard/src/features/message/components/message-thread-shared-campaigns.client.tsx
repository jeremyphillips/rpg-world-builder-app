'use client'

import { Link } from 'react-router-dom'
import type { ConversationSharedCampaign } from '@rpg/contracts'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, buttonVariants } from '@rpg/ui'

import { ROUTES } from '@/app/routes'

import { MESSAGES_A11Y_COPY } from '../lib/messages-copy'
import {
  formatMessageThreadSharedCampaignOverflowTooltip,
  formatMessageThreadSharedCampaignOverflowTriggerLabel,
  resolveMessageThreadSharedCampaignsPresentation,
} from '../lib/message-thread-shared-campaigns-presentation.lib'
import { MessagesMetadata } from './messages-metadata.client'

const SHARED_CAMPAIGN_SEPARATOR = ' · '

type MessageThreadSharedCampaignsProps = {
  sharedCampaigns: ConversationSharedCampaign[]
}

function SharedCampaignLink({ campaign }: { campaign: ConversationSharedCampaign }) {
  return (
    <Link
      to={ROUTES.campaign.detail(campaign.campaignId)}
      className={buttonVariants({ variant: 'link', size: 'sm', className: 'h-auto p-0' })}
    >
      {campaign.campaignName}
    </Link>
  )
}

export function MessageThreadSharedCampaigns({
  sharedCampaigns,
}: MessageThreadSharedCampaignsProps) {
  const { visible, overflow, overflowCount } =
    resolveMessageThreadSharedCampaignsPresentation(sharedCampaigns)

  if (sharedCampaigns.length === 0) return null

  return (
    <MessagesMetadata>
      {visible.map((campaign, index) => (
        <span key={campaign.campaignId}>
          {index > 0 ? SHARED_CAMPAIGN_SEPARATOR : null}
          <SharedCampaignLink campaign={campaign} />
        </span>
      ))}
      {overflowCount > 0 ? (
        <>
          {SHARED_CAMPAIGN_SEPARATOR}
          {/* TODO: convert overflow to Popover when an interactive campaign list component is available. */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className={buttonVariants({
                    variant: 'link',
                    size: 'sm',
                    className: 'h-auto p-0',
                  })}
                  aria-label={MESSAGES_A11Y_COPY.showMoreSharedCampaigns(overflowCount)}
                >
                  {formatMessageThreadSharedCampaignOverflowTriggerLabel(overflowCount)}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {formatMessageThreadSharedCampaignOverflowTooltip(overflow)}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      ) : null}
    </MessagesMetadata>
  )
}
