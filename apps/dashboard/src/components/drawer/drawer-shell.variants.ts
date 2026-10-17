import { cva } from 'class-variance-authority'

import {
  cn,
  dialogPanelSectionInsetXClasses,
  dialogPanelSectionSeparatorBorderClasses,
} from '@rpg/ui'

export const drawerShellBodyVariants = cva('', {
  variants: {
    mode: {
      scrolling: '',
      managed: '',
    },
  },
  defaultVariants: {
    mode: 'scrolling',
  },
})

/** Title row when a subject band follows — bottom border and padding move to the band. */
export const drawerShellTitleRowWithEntityContextClasses = 'border-b-0 pb-0'

/** Sticky subject identity band below the title row (see DrawerShell `entityContext`). */
export const drawerShellEntityContextBandClasses = cn(
  'shrink-0 bg-surface-subtle border-t',
  dialogPanelSectionSeparatorBorderClasses,
  'border-b',
  dialogPanelSectionInsetXClasses,
  'mt-3 pt-3 pb-4',
)
