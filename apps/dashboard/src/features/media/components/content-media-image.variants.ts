import { cva } from 'class-variance-authority'

import { cn, identityFrameVariants } from '@rpg/ui'

export type ContentMediaImageFrame =
  | 'intrinsic'
  | 'primary'
  | 'builderSheetHero'
  | 'builderCard'
  | 'square'
  | 'insetSm'

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
    },
  },
  defaultVariants: {
    frame: 'intrinsic',
  },
})

export const contentMediaImageClasses = 'block size-full max-w-none select-none object-cover'

/** White-paper line art on a light surface; dark mode renders the original artwork. */
export const contentMediaImageWhitePaperKnockoutClasses = 'mix-blend-multiply dark:mix-blend-normal'

/** Empty-state well — matches {@link identityFrameFallbackVariants} tone inside aspect frames. */
export const contentMediaImageFallbackWellClasses =
  'flex size-full items-center justify-center bg-surface-strong text-muted-foreground'

/** Lucide root sizing for semantic fallback icons — keyed to {@link ContentMediaImageFrame}. */
export const contentMediaImageFallbackIconClasses: Record<ContentMediaImageFrame, string> = {
  square: 'size-icon-glyph-xs',
  insetSm: 'size-icon-glyph-sm',
  builderCard: 'size-icon-glyph-lg',
  primary: 'size-icon-glyph-xl',
  builderSheetHero: 'size-icon-glyph-xl',
  intrinsic: 'size-icon-glyph-xl',
}
