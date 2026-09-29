import { useMemo, type ReactNode } from 'react'
import {
  stripHtmlTags,
  type ContentDisplayFallback,
  type ContentDisplayImage,
  type ContentTypeKey,
} from '@rpg/contracts'
import { Card, CardContent, Eyebrow, Heading, Text } from '@rpg/ui'

import { PageShell } from '@/components/layout/page/page-shell'
import type { PageRhythm, PageShellInset } from '@/components/layout/page/page-spacing.variants'

import { ContentDetailBody } from './content-detail-body'
import { useSetPageChromeActions } from '@/components/layout/page-chrome/use-set-page-chrome-actions'
import { useCanManageCampaign } from '@/features/campaign'
import { getContentTypeItemLabel } from '@/features/content/lib/content-type-labels'

import { ContentMediaFallback, ContentMediaImage } from './content-media-image'
import { ContentDetailEditAction } from './content-detail-edit-action'
import { ContentDetailStatRows } from './content-detail-stat-rows'
import { DEFAULT_HERO_STAT_ROW_COLUMN_COUNT } from './partition-hero-stat-row-groups.lib'
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
import {
  DEFAULT_CONTENT_DETAIL_HERO_MEDIA_PRESENTATION,
  type ContentDetailHeroMediaPresentation,
} from './content-detail-layout.types'
import type { ContentMediaImageFrame } from '@/features/media'

export type ContentDetailLayoutProps = {
  /** Catalog content type — default hero classification label when `classificationLabel` is omitted. */
  contentTypeKey: ContentTypeKey
  /** Overrides the hero classification label (e.g. equipment kind: Weapon, Armor). */
  classificationLabel?: string
  /** Content item display name — rendered as the hero heading. */
  name: string
  /** Optional badge rendered beside the hero heading (e.g. draft status). */
  nameBadge?: ReactNode
  /** Hero image framing, placement, and size tokens. */
  mediaPresentation?: ContentDetailHeroMediaPresentation
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
  /**
   * How many side-by-side metadata groups to form once there are more than three rows.
   * Default {@link DEFAULT_HERO_STAT_ROW_COLUMN_COUNT}. Omit on heroes that use the default.
   */
  statRowColumns?: number
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
  /** When false, omits the page shell (modal preview embeds). Default true. */
  pageShell?: boolean
  /** PageShell rhythm when `pageShell` is true. Default `relaxed`. */
  rhythm?: PageRhythm
  /** PageShell vertical inset when `pageShell` is true. Default `page`. */
  spacing?: PageShellInset
}

/**
 * Catalog content detail layout: sticky header actions, hero card (eyebrow, name, metadata, image),
 * optional scroll-spy nav rail, and bordered section panels in the body column.
 *
 * Renders inside `PageShell width="wide"` by default. Wide tables and sections belong in the body as panels.
 */
// fallow-ignore-next-line complexity
export function ContentDetailLayout({
  contentTypeKey,
  classificationLabel,
  name,
  nameBadge,
  mediaPresentation = DEFAULT_CONTENT_DETAIL_HERO_MEDIA_PRESENTATION,
  displayImage,
  displayFallback,
  imageName,
  campaignId,
  editHref,
  actions,
  statRows,
  statRowColumns = DEFAULT_HERO_STAT_ROW_COLUMN_COUNT,
  metadata,
  descriptionHtml,
  heroDescription = true,
  descriptionContent,
  children,
  pageShell = true,
  rhythm = 'relaxed',
  spacing = 'page',
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

  const resolvedClassificationLabel = classificationLabel ?? getContentTypeItemLabel(contentTypeKey)

  const heroMetadata =
    metadata ??
    (statRows && statRows.length > 0 ? (
      <ContentDetailStatRows statRows={statRows} columnCount={statRowColumns} />
    ) : null)
  const showHeroImage = displayImage != null || displayFallback != null
  const heroFrame: ContentMediaImageFrame =
    mediaPresentation.frame === 'emblem' && mediaPresentation.size === 'emblem-lg'
      ? 'emblemHero'
      : mediaPresentation.frame === 'emblem'
        ? 'emblem'
        : 'primary'
  const heroDescriptionText =
    heroDescription && descriptionHtml ? stripHtmlTags(descriptionHtml).trim() : undefined
  const hasBody = Boolean(descriptionContent || children)

  const content = (
    <div className={contentDetailRootClasses}>
      <Card className={contentDetailHeroCardClasses}>
        <CardContent className={contentDetailHeroCardContentClasses}>
          <div className={contentDetailHeroGridClasses(mediaPresentation)}>
            <div className={contentDetailHeroMainClasses}>
              <Eyebrow size="sm" tone="muted" className={contentDetailHeroEyebrowClasses}>
                {resolvedClassificationLabel}
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
              <div className={contentDetailHeroImageShellClasses(mediaPresentation)}>
                {displayImage ? (
                  <ContentMediaImage
                    display={displayImage}
                    alt={imageName}
                    frame={heroFrame}
                    className={contentDetailHeroImageFrameClasses}
                  />
                ) : displayFallback ? (
                  <ContentMediaFallback
                    fallback={displayFallback}
                    frame={heroFrame}
                    className={contentDetailHeroImageFrameClasses}
                  />
                ) : null}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {hasBody ? (
        <ContentDetailBody descriptionContent={descriptionContent}>{children}</ContentDetailBody>
      ) : null}
    </div>
  )

  if (!pageShell) {
    return content
  }

  return (
    <PageShell width="wide" rhythm={rhythm} spacing={spacing}>
      {content}
    </PageShell>
  )
}
