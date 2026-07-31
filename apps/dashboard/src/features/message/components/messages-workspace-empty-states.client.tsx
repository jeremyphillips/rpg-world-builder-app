'use client'

import { Link } from 'react-router-dom'

import { IndexPageEmptyState } from '@/components/layout/index-page-intro'

import { NewMessageLink } from './conversation-list.client'
import { MESSAGES_EMPTY_COPY } from '../lib/messages-copy'
import {
  messagesWorkspaceEmptyStateClasses,
  messagesWorkspaceMobileBackClasses,
} from './messages-workspace.variants'

export function MessagesMobileBackLink({ to, label }: { to: string; label: string }) {
  return (
    <div className={messagesWorkspaceMobileBackClasses}>
      <Link to={to} className="text-sm text-muted-foreground hover:text-foreground">
        {label}
      </Link>
    </div>
  )
}

export function MessagesDirectEmptyRightPane() {
  return (
    <div className={messagesWorkspaceEmptyStateClasses}>
      <IndexPageEmptyState
        heading={MESSAGES_EMPTY_COPY.selectConversationHeading}
        body={MESSAGES_EMPTY_COPY.selectConversationBody}
        actions={<NewMessageLink />}
      />
    </div>
  )
}

export function MessagesNewNeutralRightPane() {
  return (
    <div className={messagesWorkspaceEmptyStateClasses}>
      <IndexPageEmptyState
        heading={MESSAGES_EMPTY_COPY.chooseRecipientHeading}
        body={MESSAGES_EMPTY_COPY.chooseRecipientBody}
      />
    </div>
  )
}
