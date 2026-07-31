'use client'

import * as React from 'react'
import type { DirectMessage } from '@rpg/contracts'
import { Button, Text, toast } from '@rpg/ui'

import { formatDateTime, formatRelativeRecency } from '@/lib/datetime/format-datetime'

import type { useConversationActions } from '../hooks/use-conversation-actions'
import { groupMessagesByTime } from '../lib/group-messages-by-time.lib'
import {
  MESSAGES_ACTION_COPY,
  MESSAGES_A11Y_COPY,
  MESSAGES_ERROR_COPY,
  MESSAGES_STATUS_COPY,
  formatMessageBubbleAriaLabel,
} from '../lib/messages-copy'
import { MessageComposer } from './message-composer.client'
import {
  messagesWorkspaceMessageBubbleClasses,
  messagesWorkspaceMessageGroupClasses,
  messagesWorkspaceMessageGroupTimestampClasses,
  messagesWorkspaceRightFooterClasses,
  messagesWorkspaceRightScrollClasses,
} from './messages-workspace.variants'

type MessageThreadBodyProps = {
  currentUserId: string | undefined
  peerDisplayName: string | undefined
  messages: DirectMessage[]
  hasNextPage: boolean
  isFetchingNextPage: boolean
  isFetchNextPageError: boolean
  fetchNextPage: () => Promise<unknown>
  sendMessage: ReturnType<typeof useConversationActions>['sendMessage']
  layout?: 'page' | 'workspace'
}

function MessageGroupTimestamp({ timestamp }: { timestamp: string }) {
  return (
    <Text
      variant="small"
      as="time"
      dateTime={timestamp}
      className={messagesWorkspaceMessageGroupTimestampClasses}
    >
      <span>{formatDateTime(timestamp)}</span>
      <span className="text-muted-foreground">{formatRelativeRecency(timestamp)}</span>
    </Text>
  )
}

export function MessageThreadBody({
  currentUserId,
  peerDisplayName,
  messages,
  hasNextPage,
  isFetchingNextPage,
  isFetchNextPageError,
  fetchNextPage,
  sendMessage,
  layout = 'workspace',
}: MessageThreadBodyProps) {
  const [draft, setDraft] = React.useState('')
  const clientMessageIdRef = React.useRef<string | null>(null)
  const messageGroups = React.useMemo(() => groupMessagesByTime(messages), [messages])

  const handleLoadOlderMessages = () => {
    void fetchNextPage().catch(() => {
      toast.error(MESSAGES_ERROR_COPY.loadOlderMessages)
    })
  }

  const handleSend = () => {
    const text = draft.trim()
    if (!text) return

    if (!clientMessageIdRef.current) {
      clientMessageIdRef.current = crypto.randomUUID()
    }

    void sendMessage
      .mutateAsync({
        content: { kind: 'text', text },
        clientMessageId: clientMessageIdRef.current,
      })
      .then(() => {
        setDraft('')
        clientMessageIdRef.current = null
      })
      .catch(() => {
        toast.error(MESSAGES_ERROR_COPY.sendMessage)
      })
  }

  const history = (
    <>
      {hasNextPage ? (
        <Button
          type="button"
          variant="outline"
          onClick={handleLoadOlderMessages}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage
            ? MESSAGES_STATUS_COPY.loadingOlderMessages
            : MESSAGES_ACTION_COPY.loadOlderMessages}
        </Button>
      ) : null}
      {isFetchNextPageError ? (
        <Text variant="destructive" role="alert">
          {MESSAGES_ERROR_COPY.loadOlderMessages}
        </Text>
      ) : null}

      <ul
        className="flex flex-col gap-4"
        aria-label={MESSAGES_A11Y_COPY.messages}
        aria-live="polite"
        aria-relevant="additions"
      >
        {messageGroups.map((group) => {
          const isOwn = group.senderUserId === currentUserId
          return (
            <li
              key={group.messages[0]?.id}
              className={isOwn ? 'self-end text-right' : 'self-start text-left'}
            >
              <ul className={messagesWorkspaceMessageGroupClasses}>
                {group.messages.map((message) => (
                  <li
                    key={message.id}
                    aria-label={formatMessageBubbleAriaLabel(isOwn, peerDisplayName)}
                  >
                    <div className={messagesWorkspaceMessageBubbleClasses}>
                      <Text>{message.content.text}</Text>
                    </div>
                  </li>
                ))}
              </ul>
              <MessageGroupTimestamp timestamp={group.timestamp} />
            </li>
          )
        })}
      </ul>
    </>
  )

  const composer = (
    <MessageComposer
      draft={draft}
      onDraftChange={setDraft}
      onSubmit={handleSend}
      isSubmitting={sendMessage.isPending}
    />
  )

  if (layout === 'page') {
    return (
      <div className="flex flex-col gap-4">
        {history}
        {composer}
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className={messagesWorkspaceRightScrollClasses}>{history}</div>
      <div className={messagesWorkspaceRightFooterClasses}>{composer}</div>
    </div>
  )
}
