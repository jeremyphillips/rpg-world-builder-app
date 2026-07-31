import { Text } from '@rpg/ui'

import { MESSAGES_ERROR_COPY, MESSAGES_STATUS_COPY } from '../lib/messages-copy'

export function MessagesDirectListStatus({
  isPending,
  isError,
}: {
  isPending: boolean
  isError: boolean
}) {
  if (isPending) {
    return <Text variant="muted">{MESSAGES_STATUS_COPY.loadingConversations}</Text>
  }

  if (isError) {
    return (
      <Text variant="destructive" role="alert">
        {MESSAGES_ERROR_COPY.loadConversations}
      </Text>
    )
  }

  return null
}
