import { cva, type VariantProps } from 'class-variance-authority'

export const equipmentStartingPackageCardVariants = cva(
  'overflow-hidden rounded-card border border-border shadow-sm',
  {
    variants: {
      surface: {
        subtle: 'bg-surface-subtle',
        card: 'bg-card',
      },
    },
    defaultVariants: {
      surface: 'subtle',
    },
  },
)

export type EquipmentStartingPackageCardSurface = NonNullable<
  VariantProps<typeof equipmentStartingPackageCardVariants>['surface']
>

export const equipmentStartingPackageCardBodyClasses = 'divide-y divide-border'

export const equipmentStartingPackageCategoryClasses = 'space-y-1 px-4 py-3 first:pt-4 last:pb-4'

export const equipmentStartingPackageFooterClasses =
  'border-t border-border px-4 py-3 text-sm text-muted-foreground'

export const equipmentStartingPackageCustomizeReasonClasses = 'text-sm text-muted-foreground'

export const equipmentPackageConversionEditorClasses =
  'mt-4 overflow-hidden rounded-card border border-border bg-card shadow-sm'

export const equipmentPackageConversionEditorEmbeddedClasses = 'flex flex-col'

export const equipmentPackageConversionEditorHeaderClasses = 'border-b border-border px-4 py-3'

export const equipmentPackageConversionEditorHeadingClasses = 'mb-2'

export const equipmentPackageConversionEditorDescriptionClasses = 'text-sm text-muted-foreground'

export const equipmentPackageConversionEditorBodyClasses = 'space-y-4 px-4 py-4'

export const equipmentPackageConversionEditorListClasses = 'space-y-2'

export const equipmentPackageConversionEditorActionsClasses =
  'flex flex-wrap items-center justify-end gap-2 border-t border-border px-4 py-3'

export const equipmentPackageConversionStatusClasses = 'px-4 py-2 text-sm text-foreground'
