'use client'

import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Text, toast } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { NarrowPage } from '@/components/layout/narrow-page'

import {
  NewMessageRecipientsBody,
  NewMessageCancelLink,
} from '../components/new-message-form.client'
import { useConversationActions } from '../hooks/use-conversation-actions'
import { useConversationRecipients } from '../hooks/use-conversation-recipients'

export function NewMessagePage() {
  const navigate = useNavigate()
  const { data, isPending, isError } = useConversationRecipients()
  const { createConversation } = useConversationActions()
  const [recipientUserId, setRecipientUserId] = React.useState('')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!recipientUserId) return

    void createConversation
      .mutateAsync(recipientUserId)
      .then(({ conversation }) => {
        navigate(ROUTES.messages.detail(conversation.id))
      })
      .catch(() => {
        toast.error('Could not start conversation.')
      })
  }

  return (
    <NarrowPage spacing="relaxed">
      <div className="flex items-center gap-3">
        <NewMessageCancelLink />
        <Text as="h1" variant="lead">
          New message
        </Text>
      </div>

      <NewMessageRecipientsBody
        isPending={isPending}
        isError={isError}
        recipients={data?.items ?? []}
        formProps={{
          recipientUserId,
          onRecipientChange: setRecipientUserId,
          onSubmit: handleSubmit,
          onCancel: () => navigate(ROUTES.messages.list),
          isSubmitting: createConversation.isPending,
        }}
      />
    </NarrowPage>
  )
}
