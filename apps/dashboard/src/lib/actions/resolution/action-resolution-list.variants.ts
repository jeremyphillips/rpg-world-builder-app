import { cva } from 'class-variance-authority'

import { buildActionResolutionIssueRowVariantMap } from './action-resolution-row.lib'

/** Scrollable resolution list inside action dialogs. Rows own their inset. */
export const actionResolutionListVariants =
  'ui-panel ui-panel--subtle ui-border--default ui-panel--comfortable ui-panel--bleed max-h-[min(50vh,18rem)] overflow-y-auto'

export const actionResolutionRowVariants = cva('flex items-start gap-3 px-3 py-2.5 text-sm', {
  variants: {
    state: {
      eligible: 'text-foreground',
      updated: 'text-success',
      ...buildActionResolutionIssueRowVariantMap(),
    },
  },
  defaultVariants: {
    state: 'eligible',
  },
})
