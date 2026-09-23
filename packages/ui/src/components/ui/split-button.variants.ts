import { cva } from 'class-variance-authority'

import { iconGlyphRootClasses } from './icon-glyph.variants'

export const splitButtonRootVariants = cva('inline-flex items-stretch')

export const splitButtonPrimaryVariants = cva('rounded-r-none border-r-0')

export const splitButtonChevronVariants = cva('rounded-l-none border-l border-border px-2')

export const splitButtonChevronIconClasses = `${iconGlyphRootClasses.sm} opacity-80`
