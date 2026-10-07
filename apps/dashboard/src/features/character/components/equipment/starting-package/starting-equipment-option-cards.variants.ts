import { cva } from 'class-variance-authority'

/** Domain spacing inside RadioCard embedded/footer slots — chrome owned by `@rpg/ui`. */
export const startingEquipmentOptionNestedFieldsClasses = 'space-y-4'

/** 12px base and total wealth, 4px under the package description, badge after the total. */
export const startingEquipmentTierContributionRowVariants = cva(
  'mt-1 flex flex-wrap items-center gap-1.5 text-xs',
)

export const startingEquipmentTierContributionBaseVariants = cva(
  'font-normal text-muted-foreground',
)

export const startingEquipmentTierContributionTotalVariants = cva('font-medium text-foreground')

export const startingEquipmentOptionReasonsClasses = 'space-y-1'

/** 11px eyebrow (`eyebrow-style-sm`) with a 2px gap before the tool control. */
export const startingEquipmentIncludedToolHeadingClasses = 'mb-0.5'

export const startingEquipmentIncludedToolGuidanceClasses = 'text-xs'
