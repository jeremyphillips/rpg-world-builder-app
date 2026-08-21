'use client'

import { Link } from 'react-router-dom'
import { Alert, Button, Text, buttonVariants } from '@rpg/ui'
import type { FilterSchema } from '@rpg/ui/filters'

import { ROUTES } from '@/app/routes'
import { CAMPAIGN_SCOPE_FILTER_ID, INVALID_CAMPAIGN_SCOPE_COPY } from '@/lib/filters'
import { PrimaryFilterPanel } from '@/lib/data-table/primary-filter-bar-region'
import {
  MESSAGES_SCOPE_COPY,
  formatMessagesOutOfScopeSupporting,
  formatMessagesScopeSummary,
} from '../lib/messages-copy'
import type { MessagesFilterState } from '../lib/messages-filter-schema'
import { directListChromeInsetClasses } from './direct-list/direct-list.variants'

const messagesCampaignScopeUtilityClasses =
  'flex flex-wrap items-center justify-between gap-2 text-muted-foreground'

type MessagesCampaignScopeChromeProps = {
  schema: FilterSchema<unknown, MessagesFilterState>
  filters: MessagesFilterState
  onFilterChange: (
    id: keyof MessagesFilterState,
    value: MessagesFilterState[keyof MessagesFilterState] | undefined,
  ) => void
  clearFilterField: (id: keyof MessagesFilterState) => void
  resetFilters: () => void
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
    <div className={messagesCampaignScopeUtilityClasses}>
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
  clearFilterField,
  resetFilters,
  scopedCount,
  hiddenCount,
  showInvalidScopeNotice,
  onDismissInvalidScopeNotice,
}: MessagesCampaignScopeChromeProps) {
  const clearCampaignScope = () => {
    clearFilterField(CAMPAIGN_SCOPE_FILTER_ID)
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
        <PrimaryFilterPanel
          filterSchema={schema}
          filterState={filters}
          onValueChange={onFilterChange}
          clearFilterField={clearFilterField}
          resetFilters={resetFilters}
        />
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
    <div className={`border-b border-border py-3 ${directListChromeInsetClasses}`}>
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
