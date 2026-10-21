import { cva } from 'class-variance-authority'

/** Fixed-width column for one leading utility control. */
export const entityLeadingRailColumnVariants = cva('dash-entity-leading__column')

/** Horizontal row of equal-width leading utility columns plus content-end gap. */
export const entityLeadingRailVariants = cva('dash-entity-leading', {
  variants: {
    density: {
      compact: 'dash-entity-leading--compact',
      comfortable: 'dash-entity-leading--comfortable',
      spacious: 'dash-entity-leading--comfortable',
    },
  },
})
