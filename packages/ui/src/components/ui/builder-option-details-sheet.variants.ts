import { cva } from 'class-variance-authority'

export type BuilderOptionPrimaryActionPlacement = 'header' | 'footer'

/** Full-bleed hero slot above padded sheet header/body. */
export const builderOptionDetailsHeroImageVariants = cva('shrink-0 w-full overflow-hidden')

export const builderOptionDetailsMetadataListVariants = cva('space-y-2')

export const builderOptionDetailsSectionVariants = cva('space-y-2')
