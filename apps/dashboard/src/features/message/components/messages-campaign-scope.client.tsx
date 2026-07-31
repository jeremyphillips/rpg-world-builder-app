'use client'

import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Alert, Button, Chip, Text, buttonVariants } from '@rpg/ui'
import type { ConversationListResponse } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

import { resolveMessagesClearScopePath } from '../lib/messages-campaign-scope-navigation.lib'
import {
  MESSAGES_SCOPE_CHIP_REMOVE_LABEL,
  MESSAGES_SCOPE_INVALID_BODY,
  MESSAGES_SCOPE_INVALID_HEADING,
  MESSAGES_SCOPE_SHOW_ALL_LABEL,
} from '../lib/messages-workspace-routing.lib'
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
      <Text variant="small">
        {scopedCount ?? 0} {scopedCount === 1 ? 'conversation shown' : 'conversations shown'} ·{' '}
        {hiddenCount}{' '}
        {hiddenCount === 1 ? 'outside this campaign hidden' : 'outside this campaign hidden'}
      </Text>
      <Link to={ROUTES.messages.list} className={buttonVariants({ variant: 'link', size: 'sm' })}>
        {MESSAGES_SCOPE_SHOW_ALL_LABEL}
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
          title={MESSAGES_SCOPE_INVALID_HEADING}
          description={MESSAGES_SCOPE_INVALID_BODY}
          actions={
            <Button type="button" variant="ghost" size="sm" onClick={onDismissInvalidScopeNotice}>
              Dismiss
            </Button>
          }
        />
      ) : null}

      {scope ? (
        <div className="flex flex-wrap items-center gap-2">
          <Chip
            mode="removable"
            size="md"
            removeLabel={MESSAGES_SCOPE_CHIP_REMOVE_LABEL}
            onRemove={clearCampaignScope}
          >
            Campaign: {scope.campaignName}
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
        Current conversation
      </Text>
      <Link
        to={ROUTES.messages.detail(conversationId, { campaignId })}
        className={`mt-1 block rounded-md px-2 py-2 hover:bg-muted ${isActive ? 'bg-row-selected' : ''}`}
        aria-current={isActive ? 'page' : undefined}
      >
        <Text variant="emphasis">{peerDisplayName}</Text>
        <Text variant="small">Not included in the {campaignName} filter.</Text>
      </Link>
    </div>
  )
}
