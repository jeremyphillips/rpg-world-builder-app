import { IndexPageEmptyState } from '@/components/layout/index-page-intro'

import { NewMessageLink } from './conversation-list.client'
import {
  MESSAGES_SCOPED_EMPTY_BODY,
  MESSAGES_SCOPED_EMPTY_HEADING,
} from '../lib/messages-workspace-routing.lib'

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
        heading={MESSAGES_SCOPED_EMPTY_HEADING}
        body={MESSAGES_SCOPED_EMPTY_BODY}
        actions={<NewMessageLink campaignId={campaignId} />}
      />
    )
  }

  return (
    <IndexPageEmptyState
      heading="No conversations yet"
      body="Start a direct message with someone from your campaigns."
      actions={<NewMessageLink campaignId={campaignId} />}
    />
  )
}
