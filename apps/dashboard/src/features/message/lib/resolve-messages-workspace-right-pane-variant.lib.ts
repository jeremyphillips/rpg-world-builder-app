import type { MessagesWorkspaceRouteState } from './resolve-messages-workspace-route-state.lib'

export type MessagesWorkspaceRightPaneVariant =
  | 'active-thread'
  | 'draft-thread'
  | 'preview-thread'
  | 'new-neutral'
  | 'direct-empty'
  | 'none'

export function resolveMessagesWorkspaceRightPaneVariant(
  props: Pick<
    MessagesWorkspaceRouteState,
    | 'isNewRoute'
    | 'isThreadRoute'
    | 'routeConversationId'
    | 'fromConversationId'
    | 'toRecipientUserId'
    | 'showDirectEmptyRight'
    | 'showNewNeutralRight'
    | 'showDraftThreadRight'
  >,
): MessagesWorkspaceRightPaneVariant {
  if (props.isThreadRoute && props.routeConversationId) return 'active-thread'
  if (props.showDraftThreadRight && props.toRecipientUserId) return 'draft-thread'
  if (props.isNewRoute && props.fromConversationId) return 'preview-thread'
  if (props.showNewNeutralRight) return 'new-neutral'
  if (props.showDirectEmptyRight) return 'direct-empty'
  return 'none'
}
