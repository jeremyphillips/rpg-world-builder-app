import { cva, type VariantProps } from 'class-variance-authority'

/** Domain spacing inside RadioCard embedded/footer slots — chrome owned by `@rpg/ui`. */
export const startingEquipmentOptionNestedFieldsClasses = 'space-y-4'

/** Muted base gold plus the tier-contribution badge, under the package description. */
export const startingEquipmentTierContributionRowVariants = cva(
  'mt-2 flex flex-wrap items-center gap-2',
)

export const startingEquipmentTierContributionBaseVariants = cva('text-muted-foreground', {
  variants: {
    density: {
      default: 'text-sm',
      compact: '',
    },
  },
  defaultVariants: {
    density: 'default',
  },
})

export type StartingEquipmentTierContributionBaseVariantProps = VariantProps<
  typeof startingEquipmentTierContributionBaseVariants
>

export const startingEquipmentOptionReasonsClasses = 'space-y-1'

/** 11px eyebrow (`eyebrow-style-sm`) with a 2px gap before the tool control. */
export const startingEquipmentIncludedToolHeadingClasses = 'mb-0.5'

export const startingEquipmentIncludedToolGuidanceClasses = 'text-xs'
