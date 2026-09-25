import type { DashboardContentDisplayResult } from '@/features/content/lib/detail/page/content-display-image'
import { ContentDisplayFallbackIcon, IdentityFrame } from '@rpg/ui'

import { ContentMediaImage } from './content-media-image'

export type ContentDisplayOverviewCellProps = {
  resolved: DashboardContentDisplayResult
  alt?: string
}

/** Overview table image cell — resolved artwork or semantic fallback icon. */
export function ContentDisplayOverviewCell({
  resolved,
  alt = '',
}: ContentDisplayOverviewCellProps) {
  if (resolved.outcome === 'image') {
    return <ContentMediaImage display={resolved.display} alt={alt} frame="square" />
  }

  return (
    <IdentityFrame
      shape="box"
      size="xs"
      fallback={<ContentDisplayFallbackIcon fallback={resolved.fallback} size="xs" />}
    />
  )
}
