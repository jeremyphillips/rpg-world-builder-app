'use client'

import { Link } from 'react-router-dom'
import { Badge, StatusDot, Text } from '@rpg/ui'
import type { Conversation } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import { formatRelativeRecency } from '@/lib/datetime/format-datetime'

import {
  MESSAGES_STATUS_COPY,
  formatMessagesScopedListFilterLabel,
  formatMessagesUnreadBadge,
} from '../../lib/messages-copy'
import { MessagesMetadata } from '../messages-metadata.client'
import {
  conversationListRowVariants,
  conversationListTitleUnreadClasses,
} from './direct-list.variants'

type ConversationListProps = {
  conversations: Conversation[]
  activeConversationId?: string
  campaignId?: string
  scope?: { campaignId: string; campaignName: string }
}

function ConversationUnreadIndicator({ unreadCount }: { unreadCount: number }) {
  if (unreadCount <= 0) return null
  if (unreadCount === 1) return <StatusDot tone="info" className="mt-1.5 shrink-0" />
  return (
    <Badge tone="info" className="shrink-0">
      {formatMessagesUnreadBadge(unreadCount)}
    </Badge>
  )
}

export function ConversationList({
  conversations,
  activeConversationId,
  campaignId,
  scope,
}: ConversationListProps) {
  const listLabel = scope ? formatMessagesScopedListFilterLabel(scope.campaignName) : undefined

  return (
    <ul className="divide-y divide-border" aria-label={listLabel}>
      {conversations.map((conversation) => {
        const isActive = conversation.id === activeConversationId
        const hasUnread = conversation.unreadCount > 0

        return (
          <li key={conversation.id}>
            <Link
              to={ROUTES.messages.detail(conversation.id, { campaignId })}
              className={conversationListRowVariants({ selected: isActive })}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <Text
                    variant="emphasis"
                    className={[
                      hasUnread ? conversationListTitleUnreadClasses : undefined,
                      'truncate',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {conversation.peer.displayName}
                  </Text>
                  {conversation.latestMessage ? (
                    <MessagesMetadata className="shrink-0">
                      {formatRelativeRecency(conversation.latestMessage.createdAt)}
                    </MessagesMetadata>
                  ) : null}
                </div>
                {conversation.latestMessage ? (
                  <MessagesMetadata className="truncate">
                    {conversation.latestMessage.preview}
                  </MessagesMetadata>
                ) : (
                  <MessagesMetadata>{MESSAGES_STATUS_COPY.noMessagesYet}</MessagesMetadata>
                )}
              </div>
              <ConversationUnreadIndicator unreadCount={conversation.unreadCount} />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
