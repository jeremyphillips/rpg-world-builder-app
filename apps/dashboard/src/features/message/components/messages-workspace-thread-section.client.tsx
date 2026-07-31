'use client'

import { ROUTES } from '@/app/routes'

import { MessagesMobileBackLink } from './messages-workspace-empty-states.client'
import { MessagesThreadPane } from './messages-workspace-panes.client'

export function MessagesWorkspaceActiveThread({
  conversationId,
  campaignId,
}: {
  conversationId: string
  campaignId?: string
}) {
  return (
    <>
      <MessagesMobileBackLink
        to={campaignId ? ROUTES.messages.listScoped(campaignId) : ROUTES.messages.list}
        label="Back to messages"
      />
      <MessagesThreadPane conversationId={conversationId} campaignId={campaignId} />
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
      <MessagesThreadPane conversationId={conversationId} campaignId={campaignId} />
    </div>
  )
}
