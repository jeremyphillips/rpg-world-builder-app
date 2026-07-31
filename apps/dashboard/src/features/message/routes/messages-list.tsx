import { Text } from '@rpg/ui'

import { IndexPageIntro } from '@/components/layout/index-page-intro'
import { IndexPageEmptyState } from '@/components/layout/index-page-intro'
import { NarrowPage } from '@/components/layout/narrow-page'

import { ConversationList, NewMessageLink } from '../components/conversation-list.client'
import { useConversations } from '../hooks/use-conversations'

export function MessagesList() {
  const { data, isPending, isError } = useConversations()
  const conversations = data?.items ?? []

  return (
    <NarrowPage spacing="relaxed">
      <IndexPageIntro
        title="Messages"
        description="Direct messages with people in your campaigns."
        actions={<NewMessageLink />}
        showActionsInHeader={conversations.length > 0}
      />

      {isPending ? <Text variant="muted">Loading conversations…</Text> : null}
      {isError ? (
        <Text variant="muted" role="alert">
          Could not load conversations.
        </Text>
      ) : null}

      {!isPending && !isError && conversations.length === 0 ? (
        <IndexPageEmptyState
          heading="No conversations yet"
          body="Start a direct message with someone from your campaigns."
          actions={<NewMessageLink />}
        />
      ) : null}

      {!isPending && !isError && conversations.length > 0 ? (
        <ConversationList conversations={conversations} />
      ) : null}
    </NarrowPage>
  )
}
