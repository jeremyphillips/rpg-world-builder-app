'use client'

import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Alert, Button, Text, buttonVariants } from '@rpg/ui'
import { FilterBar, type FilterSchema } from '@rpg/ui/filters'
import type { Notification } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import { INVALID_CAMPAIGN_SCOPE_COPY } from '@/lib/filters'

import { resolveMessagesClearScopePath } from '../lib/messages-campaign-scope-navigation.lib'
import {
  MESSAGES_SCOPE_COPY,
  formatMessagesOutOfScopeSupporting,
  formatMessagesScopeSummary,
} from '../lib/messages-copy'
import type { MessagesFilterState } from '../lib/messages-filter-schema'
import {
  messagesWorkspaceListChromeInsetClasses,
  messagesWorkspaceScopeUtilityClasses,
} from './messages-workspace.variants'

type MessagesCampaignScopeChromeProps = {
  schema: FilterSchema<Notification, MessagesFilterState>
  filters: MessagesFilterState
  onFilterChange: (
    id: keyof MessagesFilterState,
    value: MessagesFilterState[keyof MessagesFilterState] | undefined,
  ) => void
  scopedCount?: number
  hiddenCount?: number
  showInvalidScopeNotice: boolean
  onDismissInvalidScopeNotice: () => void
}

function MessagesCampaignScopeUtility({
  scopedCount,
  hiddenCount,
  onShowAll,
}: {
  scopedCount?: number
  hiddenCount?: number
  onShowAll: () => void
}) {
  if (hiddenCount === undefined || hiddenCount <= 0) {
    return null
  }

  return (
    <div className={messagesWorkspaceScopeUtilityClasses}>
      <Text variant="small">{formatMessagesScopeSummary(scopedCount ?? 0, hiddenCount)}</Text>
      <button
        type="button"
        className={buttonVariants({ variant: 'link', size: 'sm' })}
        onClick={onShowAll}
      >
        {MESSAGES_SCOPE_COPY.showAllLabel}
      </button>
    </div>
  )
}

export function MessagesCampaignScopeChrome({
  schema,
  filters,
  onFilterChange,
  scopedCount,
  hiddenCount,
  showInvalidScopeNotice,
  onDismissInvalidScopeNotice,
}: MessagesCampaignScopeChromeProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const clearCampaignScope = () => {
    navigate(resolveMessagesClearScopePath(location))
  }

  const hasScopeSummary = (hiddenCount ?? 0) > 0
  const hasFilters = schema.fields.length > 0

  if (!hasFilters && !showInvalidScopeNotice && !hasScopeSummary) {
    return null
  }

  return (
    <div className="flex shrink-0 flex-col gap-2">
      {showInvalidScopeNotice ? (
        <Alert
          variant="warning"
          title={INVALID_CAMPAIGN_SCOPE_COPY.invalidHeading}
          description={INVALID_CAMPAIGN_SCOPE_COPY.invalidBody}
          actions={
            <Button type="button" variant="ghost" size="sm" onClick={onDismissInvalidScopeNotice}>
              {INVALID_CAMPAIGN_SCOPE_COPY.invalidDismissLabel}
            </Button>
          }
        />
      ) : null}

      {hasFilters ? (
        <FilterBar schema={schema} state={filters} onValueChange={onFilterChange} />
      ) : null}

      {hasScopeSummary ? (
        <MessagesCampaignScopeUtility
          scopedCount={scopedCount}
          hiddenCount={hiddenCount}
          onShowAll={clearCampaignScope}
        />
      ) : null}
    </div>
  )
}

type MessagesOutOfScopePinProps = {
  campaignName: string
  conversationId: string
  peerDisplayName: string
  isActive: boolean
  campaignId: string
}

export function MessagesOutOfScopePin({
  campaignName,
  conversationId,
  peerDisplayName,
  isActive,
  campaignId,
}: MessagesOutOfScopePinProps) {
  return (
    <div className={`border-b border-border py-3 ${messagesWorkspaceListChromeInsetClasses}`}>
      <Text variant="small" className="uppercase tracking-wide">
        {MESSAGES_SCOPE_COPY.outOfScopeEyebrow}
      </Text>
      <Link
        to={ROUTES.messages.detail(conversationId, { campaignId })}
        className={`mt-1 block rounded-md px-2 py-2 hover:bg-muted ${isActive ? 'bg-row-selected' : ''}`}
        aria-current={isActive ? 'page' : undefined}
      >
        <Text variant="emphasis">{peerDisplayName}</Text>
        <Text variant="small">{formatMessagesOutOfScopeSupporting(campaignName)}</Text>
      </Link>
    </div>
  )
}
