'use client'

import * as React from 'react'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { useCampaigns } from '@/features/campaign/hooks/use-campaigns'
import { useFilterUrlState } from '@/lib/filters'

import { MessagesCampaignScopeChrome } from './messages-campaign-scope.client'
import {
  messagesWorkspaceBodyClasses,
  messagesWorkspaceHeaderSectionClasses,
  messagesWorkspaceLeftPaneClasses,
  messagesWorkspaceLeftPaneMobileHiddenClasses,
  messagesWorkspaceLeftPaneMobileVisibleClasses,
  messagesWorkspaceRootClasses,
  messagesWorkspaceScopeChromeMobileHiddenOnNewClasses,
} from './messages-workspace.variants'
import {
  MessagesDirectListPane,
  MessagesRecipientPickerPane,
} from './messages-workspace-panes.client'
import { MessagesWorkspaceHeader } from './messages-workspace-header.client'
import { MessagesWorkspaceRightPane } from './messages-workspace-right-pane.client'
import { useMessagesCampaignScopeEffects } from '../hooks/use-messages-campaign-scope-effects'
import { useStripLegacyMessagesMode } from '../hooks/use-strip-legacy-messages-mode'
import { createMessagesFilterSchema } from '../lib/messages-filter-schema'
import { MESSAGES_A11Y_COPY } from '../lib/messages-copy'
import {
  isMessagesNewRoute,
  resolveMessagesNewCancelTarget,
} from '../lib/messages-workspace-routing.lib'
import { resolveMessagesWorkspaceChromeVisibility } from '../lib/messages-workspace-chrome.lib'
import { resolveMessagesWorkspaceRouteState } from '../lib/resolve-messages-workspace-route-state.lib'

export function MessagesWorkspaceShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const { conversationId } = useParams<{ conversationId?: string }>()
  const isNewRoute = isMessagesNewRoute(location.pathname)
  const { data: campaigns = [] } = useCampaigns()

  useStripLegacyMessagesMode()

  const routeState = resolveMessagesWorkspaceRouteState({
    search: location.search,
    isNewRoute,
    conversationId,
  })

  const campaignOptions = React.useMemo(
    () => campaigns.map((campaign) => ({ value: campaign.id, label: campaign.identity.name })),
    [campaigns],
  )

  const schema = React.useMemo(() => createMessagesFilterSchema(campaignOptions), [campaignOptions])

  const { filters, setFilterValue, clearFilterField, resetFilters } = useFilterUrlState({ schema })

  const campaignScope = useMessagesCampaignScopeEffects({
    ...routeState,
    accessibleCampaignIds: campaigns.map((campaign) => campaign.id),
  })
  const chromeVisibility = resolveMessagesWorkspaceChromeVisibility(routeState)

  const scopeChromeClasses = chromeVisibility.hideScopeChromeOnMobile
    ? messagesWorkspaceScopeChromeMobileHiddenOnNewClasses
    : undefined

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
        campaignId: filters.campaignId ?? routeState.campaignId,
      }),
    )
  }

  const handleCancelNewMessage = () => {
    navigate(
      resolveMessagesNewCancelTarget({
        fromConversationId: routeState.fromConversationId,
        campaignId: filters.campaignId ?? routeState.campaignId,
      }),
    )
  }

  const activeCampaignId = filters.campaignId ?? routeState.campaignId

  return (
    <div className={messagesWorkspaceRootClasses}>
      <div className={messagesWorkspaceHeaderSectionClasses}>
        <MessagesWorkspaceHeader
          isNewRoute={routeState.isNewRoute}
          onNewMessage={handleNewMessage}
          onCancel={handleCancelNewMessage}
        />

        <div className={scopeChromeClasses}>
          <MessagesCampaignScopeChrome
            schema={schema}
            filters={filters}
            onFilterChange={setFilterValue}
            clearFilterField={clearFilterField}
            resetFilters={resetFilters}
            scopedCount={campaignScope.scopedCount}
            hiddenCount={campaignScope.hiddenCount}
            showInvalidScopeNotice={campaignScope.showInvalidScopeNotice}
            onDismissInvalidScopeNotice={campaignScope.dismissInvalidScopeNotice}
          />
        </div>
      </div>

      <div className={messagesWorkspaceBodyClasses}>
        <aside className={leftPaneClasses} aria-label={MESSAGES_A11Y_COPY.conversations}>
          {routeState.isNewRoute ? (
            <MessagesRecipientPickerPane campaignId={activeCampaignId} />
          ) : (
            <MessagesDirectListPane
              activeConversationId={routeState.activeConversationId}
              campaignId={activeCampaignId}
              scope={campaignScope.scope}
              loadedCount={campaignScope.loadedCount}
              scopedCount={campaignScope.scopedCount}
              hasMoreConversations={campaignScope.hasMoreConversations}
            />
          )}
        </aside>

        <MessagesWorkspaceRightPane {...routeState} campaignId={activeCampaignId} />
      </div>
      <Outlet />
    </div>
  )
}
