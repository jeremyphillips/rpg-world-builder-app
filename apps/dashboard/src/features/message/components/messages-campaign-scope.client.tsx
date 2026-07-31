'use client'

import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Alert, Button, Chip, Text, buttonVariants } from '@rpg/ui'
import type { ConversationListResponse } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

import { resolveMessagesClearScopePath } from '../lib/messages-campaign-scope-navigation.lib'
import {
  MESSAGES_SCOPE_COPY,
  formatMessagesOutOfScopeSupporting,
  formatMessagesScopeChipLabel,
  formatMessagesScopeSummary,
} from '../lib/messages-copy'
import { messagesWorkspaceScopeUtilityClasses } from './messages-workspace.variants'

type MessagesCampaignScopeChromeProps = {
  scope?: ConversationListResponse['scope']
  scopedCount?: number
  hiddenCount?: number
  showInvalidScopeNotice: boolean
  onDismissInvalidScopeNotice: () => void
}

function MessagesCampaignScopeUtility({
  scopedCount,
  hiddenCount,
}: {
  scopedCount?: number
  hiddenCount?: number
}) {
  if (hiddenCount === undefined || hiddenCount <= 0) {
    return null
  }

  return (
    <div className={messagesWorkspaceScopeUtilityClasses}>
      <Text variant="small">{formatMessagesScopeSummary(scopedCount ?? 0, hiddenCount)}</Text>
      <Link to={ROUTES.messages.list} className={buttonVariants({ variant: 'link', size: 'sm' })}>
        {MESSAGES_SCOPE_COPY.showAllLabel}
      </Link>
    </div>
  )
}

export function MessagesCampaignScopeChrome({
  scope,
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

  if (!scope && !showInvalidScopeNotice && (hiddenCount ?? 0) === 0) {
    return null
  }

  return (
    <div className="flex shrink-0 flex-col gap-2">
      {showInvalidScopeNotice ? (
        <Alert
          variant="warning"
          title={MESSAGES_SCOPE_COPY.invalidHeading}
          description={MESSAGES_SCOPE_COPY.invalidBody}
          actions={
            <Button type="button" variant="ghost" size="sm" onClick={onDismissInvalidScopeNotice}>
              {MESSAGES_SCOPE_COPY.invalidDismissLabel}
            </Button>
          }
        />
      ) : null}

      {scope ? (
        <div className="flex flex-wrap items-center gap-2">
          <Chip
            mode="removable"
            size="md"
            removeLabel={MESSAGES_SCOPE_COPY.chipRemoveLabel}
            onRemove={clearCampaignScope}
          >
            {formatMessagesScopeChipLabel(scope.campaignName)}
          </Chip>
        </div>
      ) : null}

      {scope ? (
        <MessagesCampaignScopeUtility scopedCount={scopedCount} hiddenCount={hiddenCount} />
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
    <div className="border-b border-border px-1 py-3">
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
