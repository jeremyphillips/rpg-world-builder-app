import { cva } from 'class-variance-authority'

export const equipmentStartingPackageHeaderClasses =
  'flex items-center justify-between gap-3 px-4 py-3'

export const equipmentStartingPackageHeaderCopyClasses = 'min-w-0 flex-1 text-left'

export const equipmentStartingPackageHeaderActionsClasses = 'flex shrink-0 items-center gap-1'

// TODO(disclosure): consolidate with shared collapsible caret CVA in @rpg/ui.
export const equipmentStartingPackageChevronVariants = cva('size-4 shrink-0 transition-transform', {
  variants: {
    open: {
      true: 'rotate-180',
      false: '',
    },
  },
  defaultVariants: {
    open: false,
  },
})

export const equipmentStartingPackageCategoryClasses = 'space-y-1 px-4 py-3 first:pt-4 last:pb-4'
