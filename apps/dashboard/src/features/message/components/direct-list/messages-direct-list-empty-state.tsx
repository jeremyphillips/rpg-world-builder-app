import { IndexPageEmptyState } from '@/components/layout/page/index-page-intro'

import { MessagesStartConversationLink } from './messages-start-conversation-link'
import { directListChromeInsetClasses } from './direct-list.variants'
import { MESSAGES_EMPTY_COPY } from '../../lib/messages-copy'

export function MessagesDirectListEmptyState({
  campaignId,
  isScopedEmpty,
}: {
  campaignId?: string
  isScopedEmpty: boolean
}) {
  const insetClassName = directListChromeInsetClasses

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
