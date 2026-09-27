/** Vertical stack for hero card and body shell — width from {@link PageShell}. */
export const contentDetailRootClasses = 'w-full min-w-0 space-y-6'

/** Nav rail + narrow content column below the hero. */
export const contentDetailBodyShellClasses = 'flex w-full flex-col gap-6 lg:flex-row lg:items-start'

/** Section stack inside the body column. */
export const contentDetailBodyColumnClasses = 'min-w-0 w-full flex-1 space-y-6'

/** Hero card — subtle fill inside standard card chrome. */
export const contentDetailHeroCardClasses = 'overflow-hidden bg-muted'

/** 16px top/right/bottom, 24px left. */
export const contentDetailHeroCardContentClasses = 'py-4 pr-4 pb-4 pl-6'

import type { ContentDetailHeroMediaPresentation } from './content-detail-layout.types'
import { DEFAULT_CONTENT_DETAIL_HERO_MEDIA_PRESENTATION } from './content-detail-layout.types'

export function contentDetailHeroGridClasses(
  presentation: ContentDetailHeroMediaPresentation = DEFAULT_CONTENT_DETAIL_HERO_MEDIA_PRESENTATION,
): string {
  const placement = presentation.placement ?? 'end'
  const base = 'flex flex-col gap-8 md:flex-row md:items-start md:gap-10'
  if (placement === 'start') {
    return `${base} md:flex-row-reverse md:justify-between`
  }
  return `${base} md:justify-between`
}

/** Padded inner wrapper for hero eyebrow, title, description, and metadata. */
export const contentDetailHeroMainClasses = 'flex min-w-0 flex-1 flex-col'

export const contentDetailHeroEyebrowClasses = 'mb-1'

export const contentDetailHeroTitleRowClasses = 'flex flex-wrap items-center gap-3'

export const contentDetailHeroDescriptionClasses =
  'mt-2 line-clamp-3 text-base text-muted-foreground'

export const contentDetailHeroMetadataClasses = 'mt-3 border-t border-border-subtle pt-3'

/** Hero image — fixed 4:3, not stretched to text column height. */
export function contentDetailHeroImageShellClasses(
  presentation: ContentDetailHeroMediaPresentation = DEFAULT_CONTENT_DETAIL_HERO_MEDIA_PRESENTATION,
): string {
  if (presentation.size === 'emblem-lg') {
    return 'mx-auto w-full max-w-hero-emblem shrink-0 md:mx-0'
  }
  return 'mx-auto w-full max-w-sm shrink-0 md:mx-0 md:max-w-xs lg:max-w-sm'
}

export const contentDetailHeroImageFrameClasses =
  'overflow-hidden rounded-card border-2 border-background shadow-sm'
