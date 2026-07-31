'use client'

import { Outlet, useLocation, useMatch, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@rpg/ui'

import { ROUTES } from '@/app/routes'

import { MessagesCampaignScopeChrome } from './messages-campaign-scope.client'
import {
  messagesWorkspaceBodyClasses,
  messagesWorkspaceHeaderActionsClasses,
  messagesWorkspaceHeaderClasses,
  messagesWorkspaceLeftPaneClasses,
  messagesWorkspaceLeftPaneMobileHiddenClasses,
  messagesWorkspaceLeftPaneMobileVisibleClasses,
  messagesWorkspaceRootClasses,
} from './messages-workspace.variants'
import {
  MessagesDirectListPane,
  MessagesRecipientPickerPane,
} from './messages-workspace-panes.client'
import { MessagesWorkspaceRightPane } from './messages-workspace-right-pane.client'
import { useMessagesCampaignScopeEffects } from '../hooks/use-messages-campaign-scope-effects'
import { useStripLegacyMessagesMode } from '../hooks/use-strip-legacy-messages-mode'
import { MESSAGES_ACTION_COPY, MESSAGES_A11Y_COPY } from '../lib/messages-copy'
import { resolveMessagesWorkspaceRouteState } from '../lib/resolve-messages-workspace-route-state.lib'

export function MessagesWorkspaceShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const { conversationId } = useParams<{ conversationId?: string }>()
  const isNewRoute = useMatch({ path: 'new', end: true }) !== null

  useStripLegacyMessagesMode()

  const routeState = resolveMessagesWorkspaceRouteState({
    search: location.search,
    isNewRoute,
    conversationId,
  })

  const campaignScope = useMessagesCampaignScopeEffects(routeState)

  const leftPaneClasses = [
    messagesWorkspaceLeftPaneClasses,
    routeState.showLeftOnMobile
      ? messagesWorkspaceLeftPaneMobileVisibleClasses
      : messagesWorkspaceLeftPaneMobileHiddenClasses,
  ].join(' ')

  const handleNewMessage = () => {
    navigate(
      ROUTES.messages.new({
        from: routeState.routeConversationId,
        campaignId: routeState.campaignId,
      }),
    )
  }

  return (
    <div className={messagesWorkspaceRootClasses}>
      <div className={messagesWorkspaceHeaderClasses}>
        <div className="hidden md:block" aria-hidden="true" />
        <div className={messagesWorkspaceHeaderActionsClasses}>
          <Button type="button" onClick={handleNewMessage}>
            {MESSAGES_ACTION_COPY.newMessage}
          </Button>
        </div>
      </div>

      <MessagesCampaignScopeChrome
        scope={campaignScope.scope}
        scopedCount={campaignScope.scopedCount}
        hiddenCount={campaignScope.hiddenCount}
        showInvalidScopeNotice={campaignScope.showInvalidScopeNotice}
        onDismissInvalidScopeNotice={campaignScope.dismissInvalidScopeNotice}
      />

      <div className={messagesWorkspaceBodyClasses}>
        <aside className={leftPaneClasses} aria-label={MESSAGES_A11Y_COPY.conversations}>
          {routeState.isNewRoute ? (
            <MessagesRecipientPickerPane campaignId={routeState.campaignId} />
          ) : (
            <MessagesDirectListPane
              activeConversationId={routeState.activeConversationId}
              campaignId={routeState.campaignId}
              scope={campaignScope.scope}
            />
          )}
        </aside>

        <MessagesWorkspaceRightPane {...routeState} />
      </div>
      <Outlet />
    </div>
  )
}
