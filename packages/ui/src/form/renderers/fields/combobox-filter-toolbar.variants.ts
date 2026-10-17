import { cva } from 'class-variance-authority'

import { cn } from '../../../lib/utils'
import { catalogFilterControlsVariants } from '../../../filters/catalog-filter-controls.variants'

/** Combobox panel filter row — same gap/wrap as catalog filters, full toolbar width. */
export const comboboxFilterToolbarRowVariants = cva(cn(catalogFilterControlsVariants(), 'w-full'))

/** Equal-width column so trigger-fill selects share the row instead of each claiming 100%. */
export const comboboxFilterToolbarItemVariants = cva('min-w-0 flex-1 basis-0')
