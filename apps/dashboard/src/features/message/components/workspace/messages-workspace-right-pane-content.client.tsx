'use client'

import {
  MessagesDirectEmptyRightPane,
  MessagesNewNeutralRightPane,
} from './messages-workspace-empty-states.client'
import {
  MessagesWorkspaceActiveThread,
  MessagesWorkspaceDraftThread,
  MessagesWorkspacePreviewThread,
} from './messages-workspace-thread-section.client'
import type { MessagesWorkspaceRightPaneProps } from './messages-workspace-right-pane.client'
import { resolveMessagesWorkspaceRightPaneVariant } from '../../lib/resolve-messages-workspace-right-pane-variant.lib'

const RIGHT_PANE_VARIANT_RENDERERS = {
  'active-thread': (props: MessagesWorkspaceRightPaneProps) =>
    props.routeConversationId ? (
      <MessagesWorkspaceActiveThread
        conversationId={props.routeConversationId}
        campaignId={props.campaignId}
        isPaneVisible={props.showRightOnMobile}
      />
    ) : null,
  'draft-thread': (props: MessagesWorkspaceRightPaneProps) =>
    props.toRecipientUserId ? (
      <MessagesWorkspaceDraftThread
        toRecipientUserId={props.toRecipientUserId}
        campaignId={props.campaignId}
      />
    ) : null,
  'preview-thread': (props: MessagesWorkspaceRightPaneProps) =>
    props.fromConversationId ? (
      <MessagesWorkspacePreviewThread
        conversationId={props.fromConversationId}
        campaignId={props.campaignId}
      />
    ) : null,
  'new-neutral': () => (
    <div className="hidden md:flex md:flex-1 md:flex-col">
      <MessagesNewNeutralRightPane />
    </div>
  ),
  'direct-empty': (props: MessagesWorkspaceRightPaneProps) => (
    <div className="hidden md:flex md:flex-1 md:flex-col">
      <MessagesDirectEmptyRightPane campaignId={props.campaignId} />
    </div>
  ),
  none: () => null,
} as const

export function MessagesWorkspaceRightPaneContent(props: MessagesWorkspaceRightPaneProps) {
  const variant = resolveMessagesWorkspaceRightPaneVariant(props)
  return RIGHT_PANE_VARIANT_RENDERERS[variant](props)
}
