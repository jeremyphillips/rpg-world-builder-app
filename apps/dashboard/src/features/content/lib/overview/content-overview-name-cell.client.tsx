'use client'

import type { ContentStatus, ResolvedContentCampaignAccess } from '@rpg/contracts'
import { dataTableNameLinkCellVariants } from '@rpg/ui'
import { Link } from 'react-router-dom'

import { ContentStatusNameBadge } from './content-status-name-badge.client'
import { ContentAccessMetadata } from './content-access-metadata.client'
import { ContentOverviewUtilityActions } from './content-overview-utility-actions.client'

export type ContentOverviewNameCellProps = {
  name: string
  status: ContentStatus
  campaignAccess: ResolvedContentCampaignAccess
  nameHref?: string
  editHref?: string
  canManage?: boolean
}

/** Two-line overview name cell — identity on line 1; utility row + metadata on line 2. */
export function ContentOverviewNameCell({
  name,
  status,
  campaignAccess,
  nameHref,
  editHref,
  canManage = false,
}: ContentOverviewNameCellProps) {
  const draftBadge = status === 'draft' ? <ContentStatusNameBadge status="draft" /> : null

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
      </span>

      {canManage ? (
        <div className="flex min-h-4 flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs leading-4">
          <ContentOverviewUtilityActions editHref={editHref} />
          <ContentAccessMetadata campaignAccess={campaignAccess} canManage={canManage} />
        </div>
      ) : null}
    </div>
  )
}
