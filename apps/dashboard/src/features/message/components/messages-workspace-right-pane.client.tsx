'use client'

import { MESSAGES_A11Y_COPY } from '../lib/messages-copy'
import type { MessagesWorkspaceRouteState } from '../lib/resolve-messages-workspace-route-state.lib'
import { MessagesWorkspaceRightPaneContent } from './messages-workspace-right-pane-content.client'
import {
  messagesWorkspaceRightPaneClasses,
  messagesWorkspaceRightPaneMobileHiddenClasses,
  messagesWorkspaceRightPaneMobileVisibleClasses,
} from './messages-workspace.variants'

export type MessagesWorkspaceRightPaneProps = Pick<
  MessagesWorkspaceRouteState,
  | 'isNewRoute'
  | 'isThreadRoute'
  | 'routeConversationId'
  | 'fromConversationId'
  | 'toRecipientUserId'
  | 'campaignId'
  | 'showDirectEmptyRight'
  | 'showNewNeutralRight'
  | 'showRightOnMobile'
  | 'showDraftThreadRight'
>

export function MessagesWorkspaceRightPane(props: MessagesWorkspaceRightPaneProps) {
  const rightPaneClasses = [
    messagesWorkspaceRightPaneClasses,
    props.showRightOnMobile
      ? messagesWorkspaceRightPaneMobileVisibleClasses
      : messagesWorkspaceRightPaneMobileHiddenClasses,
  ].join(' ')

  return (
    <section className={rightPaneClasses} aria-label={MESSAGES_A11Y_COPY.conversation}>
      <MessagesWorkspaceRightPaneContent {...props} />
    </section>
  )
}
