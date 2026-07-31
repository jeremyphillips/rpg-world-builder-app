'use client'

import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button, ComboboxField, Text } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { IndexPageEmptyState } from '@/components/layout/index-page-intro'

import type { DirectConversationRecipient } from '@rpg/contracts'

import {
  MESSAGES_ACTION_COPY,
  MESSAGES_EMPTY_COPY,
  MESSAGES_ERROR_COPY,
  MESSAGES_FORM_COPY,
  MESSAGES_STATUS_COPY,
} from '../lib/messages-copy'

type NewMessageFormProps = {
  recipients: DirectConversationRecipient[]
  recipientUserId: string
  onRecipientChange: (value: string) => void
  onSubmit: (event: FormEvent) => void
  onCancel: () => void
  isSubmitting: boolean
}

export function NewMessageForm({
  recipients,
  recipientUserId,
  onRecipientChange,
  onSubmit,
  onCancel,
  isSubmitting,
}: NewMessageFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <ComboboxField
        id="recipient"
        label={MESSAGES_FORM_COPY.recipientLabel}
        multiple={false}
        placeholder={MESSAGES_FORM_COPY.recipientPlaceholder}
        value={recipientUserId}
        onChange={(value) => onRecipientChange(typeof value === 'string' ? value : '')}
        options={recipients.map((recipient) => ({
          value: recipient.userId,
          label: recipient.displayName,
        }))}
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={!recipientUserId || isSubmitting}>
          {MESSAGES_ACTION_COPY.startConversation}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          {MESSAGES_ACTION_COPY.cancel}
        </Button>
      </div>
    </form>
  )
}

type NewMessageRecipientsBodyProps = {
  isPending: boolean
  isError: boolean
  recipients: DirectConversationRecipient[]
  formProps: Omit<NewMessageFormProps, 'recipients'>
}

export function NewMessageRecipientsBody({
  isPending,
  isError,
  recipients,
  formProps,
}: NewMessageRecipientsBodyProps) {
  if (isPending) return <Text variant="muted">{MESSAGES_STATUS_COPY.loadingRecipients}</Text>
  if (isError) {
    return (
      <Text variant="destructive" role="alert">
        {MESSAGES_ERROR_COPY.loadRecipients}
      </Text>
    )
  }

  if (recipients.length === 0) {
    return (
      <IndexPageEmptyState
        heading={MESSAGES_EMPTY_COPY.globalRecipientHeading}
        body={MESSAGES_EMPTY_COPY.globalRecipientBody}
      />
    )
  }

  return <NewMessageForm recipients={recipients} {...formProps} />
}

export function NewMessageCancelLink() {
  return (
    <Link to={ROUTES.messages.list} className="text-sm text-muted-foreground hover:text-foreground">
      {MESSAGES_ACTION_COPY.backToMessages}
    </Link>
  )
}
