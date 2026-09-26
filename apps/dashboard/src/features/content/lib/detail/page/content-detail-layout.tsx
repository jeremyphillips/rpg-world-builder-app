import { useMemo, type ReactNode } from 'react'
import {
  stripHtmlTags,
  type ContentDisplayFallback,
  type ContentDisplayImage,
  type ContentTypeKey,
} from '@rpg/contracts'
import { Card, CardContent, Eyebrow, Heading, Text } from '@rpg/ui'

import { narrowPageContentClasses } from '@/components/layout/page/page-content.variants'
import { useSetPageChromeActions } from '@/components/layout/page-chrome/use-set-page-chrome-actions'
import { useCanManageCampaign } from '@/features/campaign'
import { getContentTypeItemLabel } from '@/features/content/lib/content-type-labels'

import { ContentMediaFallback, ContentMediaImage } from './content-media-image'
import { ContentDetailEditAction } from './content-detail-edit-action'
import { ContentDetailStatRows } from './content-detail-stat-rows'
import {
  contentDetailHeroCardClasses,
  contentDetailHeroCardContentClasses,
  contentDetailHeroDescriptionClasses,
  contentDetailHeroGridClasses,
  contentDetailHeroEyebrowClasses,
  contentDetailHeroImageFrameClasses,
  contentDetailHeroImageShellClasses,
  contentDetailHeroMainClasses,
  contentDetailHeroMetadataClasses,
  contentDetailHeroTitleRowClasses,
  contentDetailRootClasses,
} from './content-detail-layout.variants'
import type { ContentStatRowData } from '../metadata/content-stat-rows'

export type ContentDetailLayoutProps = {
  /** Catalog content type — rendered as the hero classification eyebrow. */
  contentTypeKey: ContentTypeKey
  /** Content item display name — rendered as the hero heading. */
  name: string
  /** Optional badge rendered beside the hero heading (e.g. draft status). */
  nameBadge?: ReactNode
  /** Crop-aware display image when artwork resolves. */
  displayImage?: ContentDisplayImage
  /** Semantic fallback when no artwork resolves (media domains). */
  displayFallback?: ContentDisplayFallback
  /** Accessible name for the image (e.g. the content item's name). */
  imageName: string
  /** Campaign context for edit-button gating. */
  campaignId?: string
  /** When set and the user can manage the campaign, renders a standard Edit action. */
  editHref?: string
  /** Optional extra action elements rendered alongside Edit in the sticky page header. */
  actions?: ReactNode
  /** Static metadata rows in the hero card. Ignored when `metadata` is set. */
  statRows?: ContentStatRowData[]
  /** Hook-driven or custom metadata in the hero card; takes precedence over `statRows`. */
  metadata?: ReactNode
  /** HTML description source for the hero excerpt (plain text, clamped). Ignored when `heroDescription` is false. */
  descriptionHtml?: string
  /** When false, omits the hero description (e.g. spells keep full prose in the body). Default true. */
  heroDescription?: boolean
  /** First block in the narrow body column (rich text or plain). */
  descriptionContent?: ReactNode
  /** Additional sections in the narrow body column below `descriptionContent`. */
  children?: ReactNode
}

/**
 * Catalog content detail layout: sticky header actions, hero card (eyebrow, name, metadata, image),
 * and a `max-w-narrow-content` body column for prose sections.
 *
 * Wrap in `WidePage`. Render full-width sections (e.g. progression tables) as `WidePage`
 * siblings outside this layout.
 */
// fallow-ignore-next-line complexity
export function ContentDetailLayout({
  contentTypeKey,
  name,
  nameBadge,
  displayImage,
  displayFallback,
  imageName,
  campaignId,
  editHref,
  actions,
  statRows,
  metadata,
  descriptionHtml,
  heroDescription = true,
  descriptionContent,
  children,
}: ContentDetailLayoutProps) {
  const canManage = useCanManageCampaign(campaignId)
  const showEdit = Boolean(canManage && editHref)
  const pageActions = useMemo(() => {
    if (!showEdit && !actions) return null
    return (
      <>
        {showEdit && editHref ? <ContentDetailEditAction to={editHref} /> : null}
        {actions}
      </>
    )
  }, [actions, editHref, showEdit])

  useSetPageChromeActions(pageActions)

  const heroMetadata =
    metadata ??
    (statRows && statRows.length > 0 ? <ContentDetailStatRows statRows={statRows} /> : null)
  const showHeroImage = displayImage != null || displayFallback != null
  const heroDescriptionText =
    heroDescription && descriptionHtml ? stripHtmlTags(descriptionHtml).trim() : undefined
  const hasBody = Boolean(descriptionContent || children)

  return (
    <div className={contentDetailRootClasses}>
      <Card className={contentDetailHeroCardClasses}>
        <CardContent className={contentDetailHeroCardContentClasses}>
          <div className={contentDetailHeroGridClasses}>
            <div className={contentDetailHeroMainClasses}>
              <Eyebrow size="md" tone="muted" className={contentDetailHeroEyebrowClasses}>
                {getContentTypeItemLabel(contentTypeKey)}
              </Eyebrow>
              <div className={contentDetailHeroTitleRowClasses}>
                <Heading variant="page" as="h1">
                  {name}
                </Heading>
                {nameBadge}
              </div>
              {heroDescriptionText ? (
                <Text as="p" className={contentDetailHeroDescriptionClasses}>
                  {heroDescriptionText}
                </Text>
              ) : null}
              {heroMetadata ? (
                <div className={contentDetailHeroMetadataClasses}>{heroMetadata}</div>
              ) : null}
            </div>
            {showHeroImage ? (
              <div className={contentDetailHeroImageShellClasses}>
                {displayImage ? (
                  <ContentMediaImage
                    display={displayImage}
                    alt={imageName}
                    frame="primary"
                    className={contentDetailHeroImageFrameClasses}
                  />
                ) : displayFallback ? (
                  <ContentMediaFallback
                    fallback={displayFallback}
                    frame="primary"
                    className={contentDetailHeroImageFrameClasses}
                  />
                ) : null}
              </div>
            ) : null}
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
