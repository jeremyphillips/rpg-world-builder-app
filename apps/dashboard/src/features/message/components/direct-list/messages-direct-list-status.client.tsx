import { Text } from '@rpg/ui'

import { MESSAGES_ERROR_COPY, MESSAGES_STATUS_COPY } from '../../lib/messages-copy'
import { directListChromeInsetClasses } from './direct-list.variants'

export function MessagesDirectListStatus({
  isPending,
  isError,
  isConversationLookupError = false,
}: {
  isPending: boolean
  isError: boolean
  isConversationLookupError?: boolean
}) {
  if (isPending) {
    return (
      <Text variant="muted" className={directListChromeInsetClasses}>
        {MESSAGES_STATUS_COPY.loadingConversations}
      </Text>
    )
  }

  if (isError || isConversationLookupError) {
    return (
      <Text variant="destructive" role="alert" className={directListChromeInsetClasses}>
        {MESSAGES_ERROR_COPY.loadConversations}
      </Text>
    )
  }

  return null
}
