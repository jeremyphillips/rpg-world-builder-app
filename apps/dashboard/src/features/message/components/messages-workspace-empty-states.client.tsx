'use client'

import { Link } from 'react-router-dom'

import { IndexPageEmptyState } from '@/components/layout/index-page-intro'

import { NewMessageLink } from './conversation-list.client'
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
        heading="Select a conversation"
        body="Choose a conversation from the list or start a new message."
        actions={<NewMessageLink />}
      />
    </div>
  )
}

export function MessagesNewNeutralRightPane() {
  return (
    <div className={messagesWorkspaceEmptyStateClasses}>
      <IndexPageEmptyState
        heading="Choose a recipient"
        body="Select someone from the list to start a direct message."
      />
    </div>
  )
}

export function MessagesCampaignsPlaceholder() {
  return (
    <div className={messagesWorkspaceEmptyStateClasses}>
      <IndexPageEmptyState
        heading="Campaign channels coming soon"
        body="Campaign-wide messaging will live here. Direct messages are available in the Direct tab."
      />
    </div>
  )
}
