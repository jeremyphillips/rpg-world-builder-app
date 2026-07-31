'use client'

import * as React from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, Text, TextareaField, toast } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { NarrowPage } from '@/components/layout/narrow-page'
import { useSession } from '@/features/auth'
import { formatRelativeRecency } from '@/lib/datetime/format-datetime'

import { useConversationActions } from '../hooks/use-conversation-actions'
import { useConversationMessages } from '../hooks/use-conversation-messages'
import { useConversations } from '../hooks/use-conversations'
import { flattenConversationMessages } from '../lib/sort-messages-chronologically'

export function MessageThread() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const { data: session } = useSession()
  const { data: conversationsData } = useConversations()
  const {
    data: messagesData,
    isPending,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useConversationMessages(conversationId)
  const { sendMessage, markRead } = useConversationActions(conversationId)
  const [draft, setDraft] = React.useState('')
  const clientMessageIdRef = React.useRef<string | null>(null)

  const conversation = conversationsData?.items.find((item) => item.id === conversationId)
  const messages = flattenConversationMessages(messagesData?.pages)
  const latestMessageId = messages.at(-1)?.id
  const lastMarkedReadMessageIdRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (!conversationId || !latestMessageId) return
    if (lastMarkedReadMessageIdRef.current === latestMessageId) return

    lastMarkedReadMessageIdRef.current = latestMessageId
    void markRead.mutateAsync(latestMessageId).catch(() => {
      lastMarkedReadMessageIdRef.current = null
    })
  }, [conversationId, latestMessageId, markRead])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text || !conversationId) return

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

  return (
    <NarrowPage spacing="relaxed">
      <div className="flex items-center gap-3">
        <Link
          to={ROUTES.messages.list}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Back
        </Link>
        <Text as="h1" variant="lead">
          {conversation?.peer.displayName ?? 'Conversation'}
        </Text>
      </div>

      {isPending ? <Text variant="muted">Loading messages…</Text> : null}
      {isError ? (
        <Text variant="muted" role="alert">
          Could not load messages.
        </Text>
      ) : null}

      {!isPending && !isError ? (
        <div className="flex flex-col gap-4">
          {hasNextPage ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void fetchNextPage()
              }}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? 'Loading older messages…' : 'Load older messages'}
            </Button>
          ) : null}

          <ul className="flex flex-col gap-3">
            {messages.map((message) => {
              const isOwn = message.senderUserId === session?.user?.id
              return (
                <li
                  key={message.id}
                  className={isOwn ? 'self-end text-right' : 'self-start text-left'}
                >
                  <div className="inline-block max-w-[85%] rounded-lg bg-muted px-3 py-2 text-left">
                    <Text>{message.content.text}</Text>
                    <Text variant="small">{formatRelativeRecency(message.createdAt)}</Text>
                  </div>
                </li>
              )
            })}
          </ul>

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
        </div>
      ) : null}
    </NarrowPage>
  )
}
