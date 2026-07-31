'use client'

import { Link } from 'react-router-dom'
import { Badge, Text, buttonVariants } from '@rpg/ui'
import type { Conversation } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import { formatRelativeRecency } from '@/lib/datetime/format-datetime'

import {
  MESSAGES_ACTION_COPY,
  MESSAGES_STATUS_COPY,
  formatMessagesUnreadBadge,
} from '../lib/messages-copy'

type ConversationListProps = {
  conversations: Conversation[]
  activeConversationId?: string
  campaignId?: string
}

export function ConversationList({
  conversations,
  activeConversationId,
  campaignId,
}: ConversationListProps) {
  return (
    <ul className="divide-y divide-border">
      {conversations.map((conversation) => {
        const isActive = conversation.id === activeConversationId
        return (
          <li key={conversation.id}>
            <Link
              to={ROUTES.messages.detail(conversation.id, { campaignId })}
              className={`flex items-start gap-3 px-1 py-3 hover:bg-muted ${isActive ? 'bg-row-selected' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <Text variant="emphasis" className="truncate">
                    {conversation.peer.displayName}
                  </Text>
                  {conversation.latestMessage ? (
                    <Text variant="small" className="shrink-0">
                      {formatRelativeRecency(conversation.latestMessage.createdAt)}
                    </Text>
                  ) : null}
                </div>
                {conversation.latestMessage ? (
                  <Text variant="small" className="truncate">
                    {conversation.latestMessage.preview}
                  </Text>
                ) : (
                  <Text variant="small">{MESSAGES_STATUS_COPY.noMessagesYet}</Text>
                )}
              </div>
              {conversation.unreadCount > 0 ? (
                <Badge tone="info" className="shrink-0">
                  {formatMessagesUnreadBadge(conversation.unreadCount)}
                </Badge>
              ) : null}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export function NewMessageLink({ campaignId }: { campaignId?: string }) {
  return (
    <Link
      to={ROUTES.messages.new({ campaignId })}
      className={buttonVariants({ variant: 'default' })}
    >
      {MESSAGES_ACTION_COPY.newMessage}
    </Link>
  )
}
