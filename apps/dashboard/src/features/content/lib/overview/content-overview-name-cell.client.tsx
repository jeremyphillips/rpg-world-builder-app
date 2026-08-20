'use client'

import type {
  ContentStatus,
  ContentTypeKey,
  PlayerContentVisibility,
  ResolvedContentCampaignAccess,
  ViewerCharacterRelationships,
} from '@rpg/contracts'
import { dataTableNameLinkCellVariants } from '@rpg/ui'
import { Link } from 'react-router-dom'

import type { DuplicateContentSource } from '../duplication/duplicate-content-dialog.client'
import { CharacterRelationshipIndicator } from '@/lib/character-relationships/character-relationship-indicator.client'
import { ContentStatusNameBadge } from './content-status-name-badge.client'
import { ContentAccessMetadata } from '../campaign-access/overview/content-access-metadata.client'
import { ContentOverviewUtilityActions } from './content-overview-utility-actions.client'

export type ContentOverviewNameCellProps = {
  name: string
  status: ContentStatus
  campaignAccess: ResolvedContentCampaignAccess
  nameHref?: string
  editHref?: string
  canManage?: boolean
  playerVisibility?: PlayerContentVisibility
  campaignId?: string
  contentTypeKey?: ContentTypeKey
  queryKeyFn?: (campaignId: string) => readonly unknown[]
  duplicateSource?: DuplicateContentSource
  viewerCharacterRelationships?: ViewerCharacterRelationships
}

/** Two-line overview name cell — identity on line 1; utility row + metadata on line 2. */
export function ContentOverviewNameCell({
  name,
  status,
  campaignAccess,
  nameHref,
  editHref,
  canManage = false,
  playerVisibility = { kind: 'ordinary' },
  campaignId,
  contentTypeKey,
  queryKeyFn,
  duplicateSource,
  viewerCharacterRelationships,
}: ContentOverviewNameCellProps) {
  const draftBadge = status === 'draft' ? <ContentStatusNameBadge status="draft" /> : null
  const showManagerLine = canManage
  const showPlayerLine = !canManage && playerVisibility.kind !== 'ordinary'

  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="inline-flex items-center gap-2">
        {nameHref ? (
          <Link to={nameHref} className={dataTableNameLinkCellVariants()}>
            {name}
          </Link>
        ) : (
          <span className="font-medium text-foreground">{name}</span>
        )}
        {draftBadge}
        <CharacterRelationshipIndicator
          viewerCharacterRelationships={viewerCharacterRelationships}
        />
      </span>

      {showManagerLine || showPlayerLine ? (
        <div className="flex min-h-4 flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs leading-4">
          {showManagerLine && campaignId && contentTypeKey && queryKeyFn && duplicateSource ? (
            <ContentOverviewUtilityActions
              campaignId={campaignId}
              contentTypeKey={contentTypeKey}
              queryKeyFn={queryKeyFn}
              editHref={editHref}
              source={duplicateSource}
            />
          ) : null}
          <ContentAccessMetadata
            campaignAccess={campaignAccess}
            canManage={canManage}
            playerVisibility={playerVisibility}
          />
        </div>
      ) : null}
    </div>
  )
}
