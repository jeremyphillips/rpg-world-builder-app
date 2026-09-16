import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { iconGlyphDirectChildClasses } from './icon-glyph.variants'

export const iconBoxVariants = cva(
  cn(
    'flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground',
    iconGlyphDirectChildClasses.lg,
  ),
)

/** @deprecated Icon glyphs are sized on the box via direct-child selectors. */
export const iconBoxGlyphClasses = iconGlyphDirectChildClasses.lg
