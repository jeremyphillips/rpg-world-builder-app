/**
 * Parent: MessagesWorkspaceThreadSection (MessagesWorkspaceDraftThread)
 * Route context: draft thread on /messages/new?to=
 */
import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Text, toast } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { IndexPageEmptyState } from '@/components/layout/page/index-page-intro'
import { useSetBreadcrumbLabel } from '@/components/layout/breadcrumb/use-breadcrumb-label'

import { MessageComposer } from '../thread/message-composer'
import { MessageThreadHeader } from '../thread/message-thread-header'
import { MessagesMobileBackLink } from './messages-workspace-empty-states'
import {
  messagesWorkspaceRightFooterClasses,
  messagesWorkspaceRightPaneClasses,
  messagesWorkspaceRightScrollClasses,
} from './messages-workspace.variants'
import { useConversationActions } from '../../hooks/use-conversation-actions'
import { useConversationRecipients } from '../../hooks/use-conversation-recipients'
import {
  MESSAGES_ACTION_COPY,
  MESSAGES_ERROR_COPY,
  MESSAGES_STALE_RECIPIENT_COPY,
  MESSAGES_STATUS_COPY,
} from '../../lib/messages-copy'
import { resolveRecipientSharedCampaigns } from '../../lib/resolve-recipient-shared-campaigns.lib'

export function MessagesDraftThreadPane({
  toRecipientUserId,
  campaignId,
}: {
  toRecipientUserId: string
  campaignId?: string
}) {
  const navigate = useNavigate()
  const { data, isPending, isError } = useConversationRecipients(campaignId, {
    refetchOnMount: 'always',
  })
  const { sendFirstMessage } = useConversationActions()
  const [draft, setDraft] = React.useState('')
  const clientMessageIdRef = React.useRef<string | null>(null)

  const peer = data?.recipientsByUserId[toRecipientUserId]
  const sharedCampaigns = resolveRecipientSharedCampaigns(data, toRecipientUserId)

  useSetBreadcrumbLabel(peer?.displayName)

  const handleSend = () => {
    const text = draft.trim()
    if (!text) return

    if (!clientMessageIdRef.current) {
      clientMessageIdRef.current = crypto.randomUUID()
    }

    void sendFirstMessage
      .mutateAsync({
        recipientUserId: toRecipientUserId,
        content: { kind: 'text', text },
        clientMessageId: clientMessageIdRef.current,
      })
      .then(({ conversation }) => {
        navigate(ROUTES.messages.detail(conversation.id, { campaignId }), { replace: true })
      })
      .catch(() => {
        toast.error(MESSAGES_ERROR_COPY.sendMessage)
      })
  }

  if (isPending) {
    return (
      <div className={messagesWorkspaceRightScrollClasses}>
        <Text variant="muted">{MESSAGES_STATUS_COPY.loadingRecipients}</Text>
      </div>
    )
  }

  if (isError) {
    return (
      <div className={messagesWorkspaceRightScrollClasses}>
        <Text variant="destructive" role="alert">
          {MESSAGES_ERROR_COPY.loadRecipients}
        </Text>
      </div>
    )
  }

  if (!peer) {
    return (
      <div className={`${messagesWorkspaceRightPaneClasses} min-h-0 flex-1 p-4`}>
        <MessagesMobileBackLink
          to={campaignId ? ROUTES.messages.listScoped(campaignId) : ROUTES.messages.list}
          label={MESSAGES_ACTION_COPY.backToMessages}
        />
        <IndexPageEmptyState
          heading={MESSAGES_STALE_RECIPIENT_COPY.heading}
          body=""
          actions={
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => navigate(ROUTES.messages.new({ campaignId }))}
            >
              {MESSAGES_STALE_RECIPIENT_COPY.action}
            </button>
          }
        />
      </div>
    )
  }

  return (
    <div className={`${messagesWorkspaceRightPaneClasses} min-h-0 flex-1`}>
      <MessageThreadHeader peerDisplayName={peer.displayName} sharedCampaigns={sharedCampaigns} />
      <div className={messagesWorkspaceRightFooterClasses}>
        <MessageComposer
          draft={draft}
          onDraftChange={setDraft}
          onSubmit={handleSend}
          isSubmitting={sendFirstMessage.isPending}
        />
      </div>
    </div>
  )
}
