'use client'

import { Text } from '@rpg/ui'

import { formatMessagesSharedCampaignCount } from '../lib/messages-copy'
import { messagesWorkspaceThreadHeaderClasses } from './messages-workspace.variants'

type MessageThreadHeaderProps = {
  peerDisplayName: string | undefined
  sharedCampaignCount: number
}

export function MessageThreadHeader({
  peerDisplayName,
  sharedCampaignCount,
}: MessageThreadHeaderProps) {
  return (
    <header className={messagesWorkspaceThreadHeaderClasses}>
      <Text as="h2" variant="lead">
        {peerDisplayName ?? 'Conversation'}
      </Text>
      {sharedCampaignCount > 0 ? (
        <Text variant="small">{formatMessagesSharedCampaignCount(sharedCampaignCount)}</Text>
      ) : null}
    </header>
  )
}
