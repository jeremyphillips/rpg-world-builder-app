'use client'

import { Text } from '@rpg/ui'
import type { ConversationSharedCampaign } from '@rpg/contracts'

import { MessageThreadSharedCampaigns } from './message-thread-shared-campaigns.client'
import { messageThreadHeaderClasses } from './message-thread.variants'

type MessageThreadHeaderProps = {
  peerDisplayName: string | undefined
  sharedCampaigns: ConversationSharedCampaign[]
}

export function MessageThreadHeader({
  peerDisplayName,
  sharedCampaigns,
}: MessageThreadHeaderProps) {
  return (
    <header className={messageThreadHeaderClasses}>
      <Text as="h2" className="text-lg text-foreground-subtle">
        {peerDisplayName ?? 'Conversation'}
      </Text>
      <MessageThreadSharedCampaigns sharedCampaigns={sharedCampaigns} />
    </header>
  )
}
