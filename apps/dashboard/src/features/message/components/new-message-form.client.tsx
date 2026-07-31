'use client'

import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button, ComboboxField, Text } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { IndexPageEmptyState } from '@/components/layout/index-page-intro'

import type { DirectConversationRecipient } from '@rpg/contracts'

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
        label="Recipient"
        multiple={false}
        placeholder="Search campaign members"
        value={recipientUserId}
        onChange={(value) => onRecipientChange(typeof value === 'string' ? value : '')}
        options={recipients.map((recipient) => ({
          value: recipient.userId,
          label: recipient.displayName,
        }))}
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={!recipientUserId || isSubmitting}>
          Start conversation
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
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
  if (isPending) return <Text variant="muted">Loading recipients…</Text>
  if (isError) {
    return (
      <Text variant="destructive" role="alert">
        Could not load recipients.
      </Text>
    )
  }

  if (recipients.length === 0) {
    return (
      <IndexPageEmptyState
        heading="No eligible recipients"
        body="You can message people who share a current campaign membership with you."
      />
    )
  }

  return <NewMessageForm recipients={recipients} {...formProps} />
}

export function NewMessageCancelLink() {
  return (
    <Link to={ROUTES.messages.list} className="text-sm text-muted-foreground hover:text-foreground">
      Back to messages
    </Link>
  )
}
