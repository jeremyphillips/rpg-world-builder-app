import { Text } from '@rpg/ui'

import { MESSAGES_ERROR_COPY, MESSAGES_STATUS_COPY } from '../lib/messages-copy'
import { messagesWorkspaceListChromeInsetClasses } from './messages-workspace.variants'

export function MessagesDirectListStatus({
  isPending,
  isError,
}: {
  isPending: boolean
  isError: boolean
}) {
  if (isPending) {
    return (
      <Text variant="muted" className={messagesWorkspaceListChromeInsetClasses}>
        {MESSAGES_STATUS_COPY.loadingConversations}
      </Text>
    )
  }

  if (isError) {
    return (
      <Text variant="destructive" role="alert" className={messagesWorkspaceListChromeInsetClasses}>
        {MESSAGES_ERROR_COPY.loadConversations}
      </Text>
    )
  }

  return null
}
