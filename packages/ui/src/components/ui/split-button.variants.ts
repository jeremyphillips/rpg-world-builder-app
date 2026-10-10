import { cva } from 'class-variance-authority'

import { iconGlyphRootClasses } from './icon-glyph.variants'

export const splitButtonRootVariants = cva('ui-split-button')

export const splitButtonPrimaryVariants = cva('ui-split-button__primary')

export const splitButtonChevronVariants = cva('ui-split-button__menu')

export const splitButtonChevronIconClasses = `${iconGlyphRootClasses.sm} opacity-80`
