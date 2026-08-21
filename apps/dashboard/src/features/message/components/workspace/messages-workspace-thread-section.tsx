import { ROUTES } from '@/app/routes'

import { MESSAGES_ACTION_COPY } from '../../lib/messages-copy'

import { MessagesMobileBackLink } from './messages-workspace-empty-states'
import { MessagesDraftThreadPane } from './messages-workspace-draft-thread-pane'
import { MessagesThreadPane } from './messages-workspace-thread-pane'

export function MessagesWorkspaceActiveThread({
  conversationId,
  campaignId,
  isPaneVisible = true,
}: {
  conversationId: string
  campaignId?: string
  isPaneVisible?: boolean
}) {
  return (
    <>
      <MessagesMobileBackLink
        to={campaignId ? ROUTES.messages.listScoped(campaignId) : ROUTES.messages.list}
        label={MESSAGES_ACTION_COPY.backToMessages}
      />
      <MessagesThreadPane
        conversationId={conversationId}
        campaignId={campaignId}
        isPaneVisible={isPaneVisible}
      />
    </>
  )
}

export function MessagesWorkspaceDraftThread({
  toRecipientUserId,
  campaignId,
}: {
  toRecipientUserId: string
  campaignId?: string
}) {
  return (
    <>
      <MessagesMobileBackLink
        to={campaignId ? ROUTES.messages.listScoped(campaignId) : ROUTES.messages.list}
        label={MESSAGES_ACTION_COPY.backToMessages}
      />
      <MessagesDraftThreadPane toRecipientUserId={toRecipientUserId} campaignId={campaignId} />
    </>
  )
}

export function MessagesWorkspacePreviewThread({
  conversationId,
  campaignId,
}: {
  conversationId: string
  campaignId?: string
}) {
  return (
    <div className="hidden md:contents">
      <MessagesThreadPane
        conversationId={conversationId}
        campaignId={campaignId}
        threadMode="preview"
      />
    </div>
  )
}
