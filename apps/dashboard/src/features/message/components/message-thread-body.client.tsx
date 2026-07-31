'use client'

import * as React from 'react'
import type { DirectMessage } from '@rpg/contracts'
import { Button, Text, toast } from '@rpg/ui'

import {
  formatConversationDateSeparator,
  formatFullDateTime,
  formatMessageGroupTime,
} from '@/lib/datetime/format-datetime'
import { useRelativeTimeNow } from '@/lib/react/use-relative-time-now'

import type { useConversationActions } from '../hooks/use-conversation-actions'
import { buildMessageThreadSegments } from '../lib/build-message-thread-segments.lib'
import {
  MESSAGES_ACTION_COPY,
  MESSAGES_A11Y_COPY,
  MESSAGES_ERROR_COPY,
  MESSAGES_STATUS_COPY,
  formatMessageBubbleAriaLabel,
  formatMessageGroupAriaLabel,
} from '../lib/messages-copy'
import { MessageComposer } from './message-composer.client'
import { MessagesMetadataTime } from './messages-metadata.client'
import {
  messagesWorkspaceDateSeparatorClasses,
  messagesWorkspaceMessageBubbleClasses,
  messagesWorkspaceMessageGroupClasses,
  messagesWorkspaceMessageGroupTimestampClasses,
  messagesWorkspaceMessageThreadClasses,
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
  showComposer?: boolean
}

function MessageGroupTimestamp({
  timestamp,
  isOwn,
  now,
}: {
  timestamp: string
  isOwn: boolean
  now: Date
}) {
  return (
    <MessagesMetadataTime
      dateTime={timestamp}
      title={formatFullDateTime(timestamp)}
      className={[
        messagesWorkspaceMessageGroupTimestampClasses,
        isOwn ? 'text-right' : 'text-left',
      ].join(' ')}
    >
      {formatMessageGroupTime(timestamp, now)}
    </MessagesMetadataTime>
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
  showComposer = true,
}: MessageThreadBodyProps) {
  const [draft, setDraft] = React.useState('')
  const clientMessageIdRef = React.useRef<string | null>(null)
  const now = useRelativeTimeNow()
  const threadSegments = React.useMemo(() => buildMessageThreadSegments(messages), [messages])

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
        className={messagesWorkspaceMessageThreadClasses}
        aria-label={MESSAGES_A11Y_COPY.messages}
        aria-live="polite"
        aria-relevant="additions"
      >
        {threadSegments.map((segment, index) => {
          if (segment.type === 'date-separator') {
            return (
              <li
                key={`date-${segment.timestamp}-${index}`}
                className={messagesWorkspaceDateSeparatorClasses}
              >
                <MessagesMetadataTime
                  dateTime={segment.timestamp}
                  title={formatFullDateTime(segment.timestamp)}
                >
                  {formatConversationDateSeparator(segment.timestamp, now)}
                </MessagesMetadataTime>
              </li>
            )
          }

          const { group } = segment
          const isOwn = group.senderUserId === currentUserId
          return (
            <li
              key={group.messages[0]?.id}
              className={isOwn ? 'self-end text-right' : 'self-start text-left'}
              aria-label={formatMessageGroupAriaLabel(isOwn, peerDisplayName, group.timestamp)}
            >
              <div className={messagesWorkspaceMessageGroupClasses}>
                {group.messages.map((message) => (
                  <div
                    key={message.id}
                    aria-label={formatMessageBubbleAriaLabel(isOwn, peerDisplayName)}
                  >
                    <div className={messagesWorkspaceMessageBubbleClasses}>
                      <Text>{message.content.text}</Text>
                    </div>
                  </div>
                ))}
              </div>
              <MessageGroupTimestamp timestamp={group.timestamp} isOwn={isOwn} now={now} />
            </li>
          )
        })}
      </ul>
    </>
  )

  const composer = showComposer ? (
    <MessageComposer
      draft={draft}
      onDraftChange={setDraft}
      onSubmit={handleSend}
      isSubmitting={sendMessage.isPending}
    />
  ) : null

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
      {composer ? <div className={messagesWorkspaceRightFooterClasses}>{composer}</div> : null}
    </div>
  )
}
