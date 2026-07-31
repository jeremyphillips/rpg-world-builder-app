'use client'

import { ROUTES } from '@/app/routes'

import type { MessagesWorkspaceRouteState } from '../lib/resolve-messages-workspace-route-state.lib'
import {
  MessagesCampaignsPlaceholder,
  MessagesDirectEmptyRightPane,
  MessagesMobileBackLink,
  MessagesNewNeutralRightPane,
} from './messages-workspace-empty-states.client'
import { MessagesThreadPane } from './messages-workspace-panes.client'
import {
  messagesWorkspaceRightPaneClasses,
  messagesWorkspaceRightPaneMobileHiddenClasses,
  messagesWorkspaceRightPaneMobileVisibleClasses,
} from './messages-workspace.variants'

type MessagesWorkspaceRightPaneProps = Pick<
  MessagesWorkspaceRouteState,
  | 'isCampaignsMode'
  | 'isNewRoute'
  | 'isThreadRoute'
  | 'routeConversationId'
  | 'fromConversationId'
  | 'showDirectEmptyRight'
  | 'showNewNeutralRight'
  | 'showRightOnMobile'
>

export function MessagesWorkspaceRightPane({
  isCampaignsMode,
  isNewRoute,
  isThreadRoute,
  routeConversationId,
  fromConversationId,
  showDirectEmptyRight,
  showNewNeutralRight,
  showRightOnMobile,
}: MessagesWorkspaceRightPaneProps) {
  const rightPaneClasses = [
    messagesWorkspaceRightPaneClasses,
    showRightOnMobile
      ? messagesWorkspaceRightPaneMobileVisibleClasses
      : messagesWorkspaceRightPaneMobileHiddenClasses,
  ].join(' ')

  return (
    <section className={rightPaneClasses} aria-label="Conversation">
      {isThreadRoute && routeConversationId ? (
        <>
          <MessagesMobileBackLink to={ROUTES.messages.list} label="Back to messages" />
          <MessagesThreadPane conversationId={routeConversationId} />
        </>
      ) : null}

      {!isThreadRoute && isNewRoute && fromConversationId ? (
        <div className="hidden md:contents">
          <MessagesThreadPane conversationId={fromConversationId} />
        </div>
      ) : null}

      {!isThreadRoute && showNewNeutralRight ? (
        <div className="hidden md:flex md:flex-1 md:flex-col">
          <MessagesNewNeutralRightPane />
        </div>
      ) : null}

      {showDirectEmptyRight ? (
        <div className="hidden md:flex md:flex-1 md:flex-col">
          <MessagesDirectEmptyRightPane />
        </div>
      ) : null}

      {isCampaignsMode ? <MessagesCampaignsPlaceholder /> : null}
    </section>
  )
}
