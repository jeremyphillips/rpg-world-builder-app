import { cva } from 'class-variance-authority'

import { cn, identityFrameVariants } from '@rpg/ui'

export type ContentMediaImageFrame =
  | 'intrinsic'
  | 'primary'
  | 'builderSheetHero'
  | 'builderCard'
  | 'square'
  | 'insetSm'
  | 'anatomyFill'
  | 'emblem'
  | 'emblemHero'

/** Matches inherited radio-card / shell `--surface-current` for blend knockouts. */
export const contentMediaImageSurfaceBackdropClasses =
  'bg-[var(--surface-current,var(--background))]'

export const contentMediaImageFrameVariants = cva('relative overflow-hidden', {
  variants: {
    frame: {
      intrinsic: 'isolate min-h-0 w-full',
      primary: 'isolate aspect-[4/3] w-full min-h-0',
      builderSheetHero: 'isolate aspect-[4/3] w-full min-h-0',
      builderCard: cn('aspect-[4/2] w-full min-h-0', contentMediaImageSurfaceBackdropClasses),
      square: cn(identityFrameVariants({ shape: 'box', size: 'xs' }), 'isolate'),
      insetSm: cn(identityFrameVariants({ shape: 'box', size: 'sm' }), 'isolate'),
      /** Fills a parent-owned `.ui-anatomy-leading-media` shell — no intrinsic frame size. */
      anatomyFill: 'isolate size-full min-h-0 min-w-0 overflow-hidden',
      emblem: cn(identityFrameVariants({ shape: 'box', size: 'xs' }), 'isolate aspect-square'),
      emblemHero:
        'isolate aspect-square size-full max-h-hero-emblem max-w-hero-emblem overflow-hidden',
    },
  },
  defaultVariants: {
    frame: 'intrinsic',
  },
})

export const contentMediaImageBaseClasses = 'block max-w-none select-none'

export const contentMediaImageCoverClasses = cn(
  contentMediaImageBaseClasses,
  'size-full object-cover',
)

export const contentMediaImageCropClasses = cn(
  contentMediaImageBaseClasses,
  'absolute object-fill object-left-top',
)

export const contentMediaImageEmblemClasses = cn(
  contentMediaImageBaseClasses,
  'size-full object-contain',
)

export const contentMediaImageMonoGlyphInvertClasses = 'dark:invert'

/** White-paper line art on a light surface; dark mode renders the original artwork. */
export const contentMediaImageWhitePaperKnockoutClasses = 'mix-blend-multiply dark:mix-blend-normal'

/** Empty-state well — matches {@link identityFrameFallbackVariants} tone inside aspect frames. */
export const contentMediaImageFallbackWellClasses =
  'flex size-full items-center justify-center bg-surface-strong text-muted-foreground'

/** Fallback glyph step for each media frame. */
export const CONTENT_MEDIA_IMAGE_FALLBACK_ICON_SIZES = {
  square: 'xs',
  insetSm: 'sm',
  anatomyFill: 'sm',
  builderCard: 'lg',
  primary: '3xl',
  builderSheetHero: '3xl',
  intrinsic: '3xl',
  emblem: '3xl',
  emblemHero: '3xl',
} as const satisfies Record<ContentMediaImageFrame, 'xs' | 'sm' | 'lg' | '3xl'>
