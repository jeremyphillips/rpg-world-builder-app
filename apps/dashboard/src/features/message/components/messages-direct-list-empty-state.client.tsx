import { IndexPageEmptyState } from '@/components/layout/page/index-page-intro'

import { MessagesStartConversationLink } from './messages-start-conversation-link.client'
import { messagesWorkspaceListChromeInsetClasses } from './messages-workspace.variants'
import { MESSAGES_EMPTY_COPY } from '../lib/messages-copy'

export function MessagesDirectListEmptyState({
  campaignId,
  isScopedEmpty,
}: {
  campaignId?: string
  isScopedEmpty: boolean
}) {
  const insetClassName = messagesWorkspaceListChromeInsetClasses

  if (isScopedEmpty) {
    return (
      <div className={insetClassName}>
        <IndexPageEmptyState
          heading={MESSAGES_EMPTY_COPY.scopedListHeading}
          body={MESSAGES_EMPTY_COPY.scopedListBody}
          actions={<MessagesStartConversationLink campaignId={campaignId} />}
        />
      </div>
    )
  }

  return (
    <div className={insetClassName}>
      <IndexPageEmptyState
        heading={MESSAGES_EMPTY_COPY.globalListHeading}
        body={MESSAGES_EMPTY_COPY.globalListBody}
        actions={<MessagesStartConversationLink campaignId={campaignId} />}
      />
    </div>
  )
}
