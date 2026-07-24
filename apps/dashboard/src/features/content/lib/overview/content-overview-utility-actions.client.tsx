'use client'

import { canDuplicateContentType, type ContentTypeKey } from '@rpg/contracts'
import { Link } from 'react-router-dom'

import {
  DuplicateContentDialog,
  type DuplicateContentSource,
} from '../duplication/duplicate-content-dialog.client'

const utilityLinkClassName =
  'hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:underline'

export type ContentOverviewUtilityActionsProps = {
  campaignId: string
  contentTypeKey: ContentTypeKey
  queryKeyFn: (campaignId: string) => readonly unknown[]
  editHref?: string
  source: DuplicateContentSource
}

/** Manager-only inline actions on overview name cell line 2. */
export function ContentOverviewUtilityActions({
  campaignId,
  contentTypeKey,
  queryKeyFn,
  editHref,
  source,
}: ContentOverviewUtilityActionsProps) {
  const canDuplicate = canDuplicateContentType(contentTypeKey)

  if (!editHref && !canDuplicate) {
    return null
  }

  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground">
      {editHref ? (
        <Link to={editHref} className={utilityLinkClassName}>
          Edit
        </Link>
      ) : null}
      {editHref && canDuplicate ? <span aria-hidden>·</span> : null}
      {canDuplicate ? (
        <DuplicateContentDialog
          campaignId={campaignId}
          contentTypeKey={contentTypeKey}
          queryKeyFn={queryKeyFn}
          source={source}
          trigger={
            <button type="button" className={utilityLinkClassName}>
              Duplicate
            </button>
          }
        />
      ) : null}
    </span>
  )
}
