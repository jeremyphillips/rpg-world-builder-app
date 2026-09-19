import type { ConversationSharedCampaign } from '@rpg/contracts'
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { CampaignDisplayNameList } from '@/features/campaign'

import { MESSAGES_A11Y_COPY } from '../../lib/messages-copy'
import {
  buildMessageThreadSharedCampaignDisplay,
  formatMessageThreadSharedCampaignOverflowTooltip,
  formatMessageThreadSharedCampaignOverflowTriggerLabel,
  resolveMessageThreadSharedCampaignsPresentation,
} from '../../lib/message-thread-shared-campaigns-presentation.lib'
import { MessagesMetadata } from '../messages-metadata'

const SHARED_CAMPAIGN_SEPARATOR = ', '

type MessageThreadSharedCampaignsProps = {
  sharedCampaigns: ConversationSharedCampaign[]
}

export function MessageThreadSharedCampaigns({
  sharedCampaigns,
}: MessageThreadSharedCampaignsProps) {
  const { visible, overflow, overflowCount } =
    resolveMessageThreadSharedCampaignsPresentation(sharedCampaigns)

  if (sharedCampaigns.length === 0) return null

  const overflowSuffix =
    overflowCount > 0 ? (
      <>
        {SHARED_CAMPAIGN_SEPARATOR}
        {/* TODO: convert overflow to Popover when an interactive campaign list component is available. */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="text"
                size="sm"
                className="inline"
                aria-label={MESSAGES_A11Y_COPY.showMoreSharedCampaigns(overflowCount)}
              >
                {formatMessageThreadSharedCampaignOverflowTriggerLabel(overflowCount)}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {formatMessageThreadSharedCampaignOverflowTooltip(overflow)}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </>
    ) : null

  return (
    <MessagesMetadata>
      <CampaignDisplayNameList
        surface="inlineMuted"
        displays={visible.map(buildMessageThreadSharedCampaignDisplay)}
        getHref={(display) => ROUTES.campaign.detail(display.id)}
        suffix={overflowSuffix}
      />
    </MessagesMetadata>
  )
}
