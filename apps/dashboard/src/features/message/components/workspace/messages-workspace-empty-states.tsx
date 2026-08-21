import { Link } from 'react-router-dom'
import { Text } from '@rpg/ui'

import { IndexPageEmptyState } from '@/components/layout/page/index-page-intro'

import { MESSAGES_EMPTY_COPY } from '../../lib/messages-copy'
import {
  messagesWorkspaceEmptyStateClasses,
  messagesWorkspaceMobileBackClasses,
  messagesWorkspaceSelectConversationHeadingClasses,
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

export function MessagesDirectEmptyRightPane(_props: { campaignId?: string }) {
  return (
    <div className={messagesWorkspaceEmptyStateClasses}>
      <div className="space-y-4">
        <div className="space-y-1">
          <Text className={messagesWorkspaceSelectConversationHeadingClasses}>
            {MESSAGES_EMPTY_COPY.selectConversationHeading}
          </Text>
          <Text variant="muted">{MESSAGES_EMPTY_COPY.selectConversationBody}</Text>
        </div>
      </div>
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
