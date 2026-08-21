import type { ReactNode } from 'react'
import { Card, CardContent, Heading } from '@rpg/ui'

import { narrowPageContentClasses } from '@/components/layout/page/page-content.variants'
import { useCanManageCampaign } from '@/features/campaign'

import { ContentDetailEditAction } from './content-detail-edit-action'
import {
  contentDetailHeroCardClasses,
  contentDetailHeroCardContentClasses,
  contentDetailHeroGridClasses,
  contentDetailHeroImageClasses,
  contentDetailHeroMainClasses,
  contentDetailRootClasses,
  contentDetailToolbarClasses,
} from './content-detail-layout.variants'
import { ContentStatRow } from '../metadata/content-stat-row'
import type { ContentStatRowData } from '../metadata/content-stat-rows'

function ContentDetailStatRows({ statRows }: { statRows: ContentStatRowData[] }) {
  return (
    <div className="space-y-3">
      {statRows.map(({ label, value, info, infoPlacement, infoAriaLabel }) => (
        <ContentStatRow
          key={label}
          label={label}
          value={value}
          info={info}
          infoPlacement={infoPlacement}
          infoAriaLabel={infoAriaLabel}
        />
      ))}
    </div>
  )
}

export type ContentDetailLayoutProps = {
  /** Content item display name — rendered as the hero heading. */
  name: string
  /** Optional badge rendered beside the hero heading (e.g. draft status). */
  nameBadge?: ReactNode
  /** Resolved artwork URL for the content item. */
  imageUrl: string
  /** Accessible name for the image (e.g. the content item's name). */
  imageName: string
  /** Campaign context for edit-button gating. */
  campaignId?: string
  /** When set and the user can manage the campaign, renders a standard Edit action. */
  editHref?: string
  /** Optional extra action elements rendered alongside Edit in the top-right toolbar. */
  actions?: ReactNode
  /** Static metadata rows in the hero card. Ignored when `metadata` is set. */
  statRows?: ContentStatRowData[]
  /** Hook-driven or custom metadata in the hero card; takes precedence over `statRows`. */
  metadata?: ReactNode
  /** First block in the narrow body column (rich text or plain). */
  descriptionContent?: ReactNode
  /** Additional sections in the narrow body column below `descriptionContent`. */
  children?: ReactNode
}

/**
 * Catalog content detail layout: toolbar, full-width hero card (name + metadata + image),
 * and a `max-w-narrow-content` body column for prose sections.
 *
 * Wrap in `WidePage`. Render full-width sections (e.g. progression tables) as `WidePage`
 * siblings outside this layout.
 */
export function ContentDetailLayout({
  name,
  nameBadge,
  imageUrl,
  imageName,
  campaignId,
  editHref,
  actions,
  statRows,
  metadata,
  descriptionContent,
  children,
}: ContentDetailLayoutProps) {
  const canManage = useCanManageCampaign(campaignId)
  const showEdit = Boolean(canManage && editHref)
  const toolbar = showEdit || actions
  const heroMetadata =
    metadata ??
    (statRows && statRows.length > 0 ? <ContentDetailStatRows statRows={statRows} /> : null)
  const hasBody = Boolean(descriptionContent || children)

  return (
    <div className={contentDetailRootClasses}>
      {toolbar ? (
        <div className={contentDetailToolbarClasses} role="toolbar" aria-label="Page actions">
          {showEdit && editHref ? <ContentDetailEditAction to={editHref} /> : null}
          {actions}
        </div>
      ) : null}

      <Card className={contentDetailHeroCardClasses}>
        <CardContent className={contentDetailHeroCardContentClasses}>
          <div className={contentDetailHeroGridClasses}>
            <div className={contentDetailHeroMainClasses}>
              <div className="flex flex-wrap items-center gap-3">
                <Heading variant="display" as="h1">
                  {name}
                </Heading>
                {nameBadge}
              </div>
              {heroMetadata}
            </div>
            <div>
              <img src={imageUrl} alt={imageName} className={contentDetailHeroImageClasses} />
            </div>
          </div>
        </CardContent>
      </Card>

      {hasBody ? (
        <div className={narrowPageContentClasses}>
          {descriptionContent}
          {children}
        </div>
      ) : null}
    </div>
  )
}
