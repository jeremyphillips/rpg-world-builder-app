'use client'

import * as React from 'react'
import type { DirectMessage } from '@rpg/contracts'
import { Button, Text, TextareaField, toast } from '@rpg/ui'

import { formatRelativeRecency } from '@/lib/datetime/format-datetime'

import type { useConversationActions } from '../hooks/use-conversation-actions'
import {
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

  const handleLoadOlderMessages = () => {
    void fetchNextPage().catch(() => {
      toast.error('Could not load older messages.')
    })
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
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
        toast.error('Could not send message.')
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
          {isFetchingNextPage ? 'Loading older messages…' : 'Load older messages'}
        </Button>
      ) : null}
      {isFetchNextPageError ? (
        <Text variant="destructive" role="alert">
          Could not load older messages.
        </Text>
      ) : null}

      <ul
        className="flex flex-col gap-3"
        aria-label="Messages"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.map((message) => {
          const isOwn = message.senderUserId === currentUserId
          return (
            <li
              key={message.id}
              className={isOwn ? 'self-end text-right' : 'self-start text-left'}
              aria-label={isOwn ? 'Your message' : `Message from ${peerDisplayName ?? 'peer'}`}
            >
              <div className="inline-block max-w-[85%] rounded-lg bg-muted px-3 py-2 text-left">
                <Text>{message.content.text}</Text>
                <Text variant="small" as="time" dateTime={message.createdAt}>
                  {formatRelativeRecency(message.createdAt)}
                </Text>
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )

  const composer = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <TextareaField
        id="message-draft"
        label="Message"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        rows={3}
      />
      <Button type="submit" disabled={!draft.trim() || sendMessage.isPending}>
        Send
      </Button>
    </form>
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
