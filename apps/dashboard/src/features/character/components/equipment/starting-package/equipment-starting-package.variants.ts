import { cva } from 'class-variance-authority'

export const equipmentStartingPackageHeaderClasses =
  'flex items-center justify-between gap-3 px-4 py-3'

export const equipmentStartingPackageHeaderCopyClasses = 'min-w-0 flex-1 text-left'

export const equipmentStartingPackageHeaderActionsClasses = 'flex shrink-0 items-center gap-1'

export const equipmentStartingPackageSubtitleClasses = 'text-sm text-muted-foreground'

/** Gold-path empty line — 8px below the Starting Package heading. */
export const equipmentStartingPackageGoldSubtitleClasses = `${equipmentStartingPackageSubtitleClasses} mt-2`

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

export const equipmentStartingPackageBodyClasses = 'border-t border-border'

export const equipmentStartingPackageCategoryClasses = 'space-y-1 px-4 py-3 first:pt-4 last:pb-4'

export const equipmentStartingPackageFooterClasses =
  'border-t border-border px-4 py-3 text-sm text-muted-foreground'

export const equipmentStartingPackageCustomizeFooterClasses = 'flex justify-end px-4 py-3'

export const equipmentStartingPackageCustomizeReasonClasses =
  'px-4 py-3 text-sm text-muted-foreground'

export const equipmentPackageConversionEditorClasses = 'flex flex-col'

export const equipmentPackageConversionEditorDescriptionClasses =
  'px-4 pt-4 text-sm text-muted-foreground'

export const equipmentPackageConversionEditorBodyClasses = 'space-y-4 px-4 py-4'

export const equipmentPackageConversionBudgetClasses = 'text-xs text-muted-foreground'

export const equipmentPackageConversionEditorListClasses = 'space-y-3'

export const equipmentPackageConversionCategoryClasses = 'space-y-1'

export const equipmentPackageConversionEditorActionsClasses =
  'flex flex-wrap items-center justify-end gap-2 border-t border-border px-4 py-3'

export const equipmentPackageConversionStatusClasses = 'px-4 py-2 text-sm text-foreground'
