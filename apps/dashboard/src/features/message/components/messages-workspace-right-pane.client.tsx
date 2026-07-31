'use client'

import { MESSAGES_A11Y_COPY } from '../lib/messages-copy'
import type { MessagesWorkspaceRouteState } from '../lib/resolve-messages-workspace-route-state.lib'
import {
  MessagesDirectEmptyRightPane,
  MessagesNewNeutralRightPane,
} from './messages-workspace-empty-states.client'
import {
  MessagesWorkspaceActiveThread,
  MessagesWorkspacePreviewThread,
} from './messages-workspace-thread-section.client'
import {
  messagesWorkspaceRightPaneClasses,
  messagesWorkspaceRightPaneMobileHiddenClasses,
  messagesWorkspaceRightPaneMobileVisibleClasses,
} from './messages-workspace.variants'

type MessagesWorkspaceRightPaneProps = Pick<
  MessagesWorkspaceRouteState,
  | 'isNewRoute'
  | 'isThreadRoute'
  | 'routeConversationId'
  | 'fromConversationId'
  | 'campaignId'
  | 'showDirectEmptyRight'
  | 'showNewNeutralRight'
  | 'showRightOnMobile'
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
      {props.isThreadRoute && props.routeConversationId ? (
        <MessagesWorkspaceActiveThread
          conversationId={props.routeConversationId}
          campaignId={props.campaignId}
        />
      ) : null}

      {!props.isThreadRoute && props.isNewRoute && props.fromConversationId ? (
        <MessagesWorkspacePreviewThread
          conversationId={props.fromConversationId}
          campaignId={props.campaignId}
        />
      ) : null}

      {!props.isThreadRoute && props.showNewNeutralRight ? (
        <div className="hidden md:flex md:flex-1 md:flex-col">
          <MessagesNewNeutralRightPane />
        </div>
      ) : null}

      {props.showDirectEmptyRight ? (
        <div className="hidden md:flex md:flex-1 md:flex-col">
          <MessagesDirectEmptyRightPane />
        </div>
      ) : null}
    </section>
  )
}
