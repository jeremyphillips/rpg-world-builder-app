'use client'

import { Link } from 'react-router-dom'
import { Badge, Text, buttonVariants } from '@rpg/ui'
import type { Conversation } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import { formatRelativeRecency } from '@/lib/datetime/format-datetime'

type ConversationListProps = {
  conversations: Conversation[]
}

export function ConversationList({ conversations }: ConversationListProps) {
  return (
    <ul className="divide-y divide-border">
      {conversations.map((conversation) => (
        <li key={conversation.id}>
          <Link
            to={ROUTES.messages.detail(conversation.id)}
            className="flex items-start gap-3 px-1 py-3 hover:bg-muted"
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
                <Text variant="small">No messages yet</Text>
              )}
            </div>
            {conversation.unreadCount > 0 ? (
              <Badge tone="info" className="shrink-0">
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </Badge>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function NewMessageLink() {
  return (
    <Link to={ROUTES.messages.new} className={buttonVariants({ variant: 'default' })}>
      New message
    </Link>
  )
}
