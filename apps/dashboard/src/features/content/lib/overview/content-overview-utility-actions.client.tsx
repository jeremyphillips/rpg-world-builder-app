'use client'

import { Link } from 'react-router-dom'

export type ContentOverviewUtilityActionsProps = {
  editHref?: string
}

/** Manager-only inline actions on overview name cell line 2. */
export function ContentOverviewUtilityActions({ editHref }: ContentOverviewUtilityActionsProps) {
  if (!editHref) {
    return null
  }

  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground">
      <Link
        to={editHref}
        className="hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:underline"
      >
        Edit
      </Link>
      {/* Duplicate action — Track C3 */}
    </span>
  )
}
