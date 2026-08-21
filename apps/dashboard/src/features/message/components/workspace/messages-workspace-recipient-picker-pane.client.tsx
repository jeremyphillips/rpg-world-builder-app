'use client'

/**
 * Parent: MessagesWorkspaceShell (left column on /messages/new)
 * Route context: recipient picker for new direct conversations
 */
import * as React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { IndexPageEmptyState } from '@/components/layout/page/index-page-intro'

import { MessagesMetadata } from '../messages-metadata.client'
import { MessagesMobileBackLink } from './messages-workspace-empty-states.client'
import { NewMessageRecipientsBody } from './new-message-form.client'
import { useConversationRecipients } from '../../hooks/use-conversation-recipients'
import {
  MESSAGES_ACTION_COPY,
  MESSAGES_EMPTY_COPY,
  MESSAGES_PREVIEW_COPY,
} from '../../lib/messages-copy'
import {
  flattenDirectConversationRecipients,
  getMessagesFromConversationId,
  resolveMessagesNewCancelTarget,
} from '../../lib/messages-workspace-routing.lib'

export function MessagesRecipientPickerPane({ campaignId }: { campaignId?: string }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { data, isPending, isError } = useConversationRecipients(campaignId)
  const [recipientUserId, setRecipientUserId] = React.useState('')

  const recipients = flattenDirectConversationRecipients(data?.recipientsByUserId ?? {})
  const isScopedEmpty = Boolean(campaignId && !isPending && !isError && recipients.length === 0)
  const fromConversationId = getMessagesFromConversationId(searchParams.toString())
  const cancelTarget = resolveMessagesNewCancelTarget({
    fromConversationId,
    campaignId,
  })

  const handleRecipientChange = (nextRecipientUserId: string) => {
    setRecipientUserId(nextRecipientUserId)
    if (!nextRecipientUserId) return

    const existingConversationId = data?.existingDirectByUserId[nextRecipientUserId]
    if (existingConversationId) {
      navigate(ROUTES.messages.detail(existingConversationId, { campaignId }))
      return
    }

    navigate(
      ROUTES.messages.new({
        to: nextRecipientUserId,
        campaignId,
        ...(fromConversationId ? { from: fromConversationId } : {}),
      }),
    )
  }

  return (
    <div className="p-4">
      <MessagesMobileBackLink to={cancelTarget} label={MESSAGES_ACTION_COPY.backToMessages} />
      {fromConversationId ? (
        <MessagesMetadata className="mb-3">
          {MESSAGES_PREVIEW_COPY.selectRecipientBody}
        </MessagesMetadata>
      ) : null}
      {isScopedEmpty ? (
        <IndexPageEmptyState
          heading={MESSAGES_EMPTY_COPY.scopedRecipientHeading}
          body={MESSAGES_EMPTY_COPY.scopedRecipientBody}
        />
      ) : (
        <NewMessageRecipientsBody
          isPending={isPending}
          isError={isError}
          recipients={recipients}
          formProps={{
            recipientUserId,
            onRecipientChange: handleRecipientChange,
          }}
        />
      )}
    </div>
  )
}
