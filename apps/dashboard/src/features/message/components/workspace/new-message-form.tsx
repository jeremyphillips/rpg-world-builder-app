import { ComboboxField, Text } from '@rpg/ui'

import { IndexPageEmptyState } from '@/components/layout/page/index-page-intro'

import type { DirectConversationRecipient } from '@rpg/contracts'

import {
  MESSAGES_EMPTY_COPY,
  MESSAGES_ERROR_COPY,
  MESSAGES_FORM_COPY,
  MESSAGES_STATUS_COPY,
} from '../../lib/messages-copy'

type NewMessageFormProps = {
  recipients: DirectConversationRecipient[]
  recipientUserId: string
  onRecipientChange: (value: string) => void
}

export function NewMessageForm({
  recipients,
  recipientUserId,
  onRecipientChange,
}: NewMessageFormProps) {
  return (
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
