'use client'

import { Outlet, useLocation, useMatch, useNavigate } from 'react-router-dom'
import { Button, Tabs, TabsList, TabsTrigger } from '@rpg/ui'

import { ROUTES } from '@/app/routes'

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
import { resolveMessagesWorkspaceRouteState } from '../lib/resolve-messages-workspace-route-state.lib'

export function MessagesWorkspaceShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const newRouteMatch = useMatch({ path: 'new', end: true })
  const threadRouteMatch = useMatch({ path: ':conversationId', end: true })

  const routeState = resolveMessagesWorkspaceRouteState({
    search: location.search,
    newRouteMatch,
    threadRouteMatch,
  })

  const leftPaneClasses = [
    messagesWorkspaceLeftPaneClasses,
    routeState.showLeftOnMobile
      ? messagesWorkspaceLeftPaneMobileVisibleClasses
      : messagesWorkspaceLeftPaneMobileHiddenClasses,
  ].join(' ')

  const handleModeChange = (mode: 'direct' | 'campaigns') => {
    navigate(mode === 'campaigns' ? ROUTES.messages.campaigns : ROUTES.messages.list)
  }

  const handleNewMessage = () => {
    navigate(
      routeState.routeConversationId
        ? ROUTES.messages.new({ from: routeState.routeConversationId })
        : ROUTES.messages.new(),
    )
  }

  return (
    <div className={messagesWorkspaceRootClasses}>
      <div className={messagesWorkspaceHeaderClasses}>
        <Tabs
          value={routeState.isCampaignsMode ? 'campaigns' : 'direct'}
          onValueChange={(value) => handleModeChange(value as 'direct' | 'campaigns')}
        >
          <TabsList aria-label="Message mode">
            <TabsTrigger value="direct">Direct</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          </TabsList>
        </Tabs>

        {!routeState.isCampaignsMode ? (
          <div className={messagesWorkspaceHeaderActionsClasses}>
            <Button type="button" onClick={handleNewMessage}>
              New message
            </Button>
          </div>
        ) : null}
      </div>

      <div className={messagesWorkspaceBodyClasses}>
        <aside className={leftPaneClasses} aria-label="Conversations">
          {routeState.isCampaignsMode ? null : routeState.isNewRoute ? (
            <MessagesRecipientPickerPane />
          ) : (
            <MessagesDirectListPane activeConversationId={routeState.activeConversationId} />
          )}
        </aside>

        <MessagesWorkspaceRightPane {...routeState} />
      </div>
      <Outlet />
    </div>
  )
}
