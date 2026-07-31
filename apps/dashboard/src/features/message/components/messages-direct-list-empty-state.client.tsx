import { IndexPageEmptyState } from '@/components/layout/index-page-intro'

import { NewMessageLink } from './conversation-list.client'
import { MESSAGES_EMPTY_COPY } from '../lib/messages-copy'

export function MessagesDirectListEmptyState({
  campaignId,
  isScopedEmpty,
}: {
  campaignId?: string
  isScopedEmpty: boolean
}) {
  if (isScopedEmpty) {
    return (
      <IndexPageEmptyState
        heading={MESSAGES_EMPTY_COPY.scopedListHeading}
        body={MESSAGES_EMPTY_COPY.scopedListBody}
        actions={<NewMessageLink campaignId={campaignId} />}
      />
    )
  }

  return (
    <IndexPageEmptyState
      heading={MESSAGES_EMPTY_COPY.globalListHeading}
      body={MESSAGES_EMPTY_COPY.globalListBody}
      actions={<NewMessageLink campaignId={campaignId} />}
    />
  )
}
