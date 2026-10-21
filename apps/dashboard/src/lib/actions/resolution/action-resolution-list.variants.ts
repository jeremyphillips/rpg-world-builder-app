import { cva } from 'class-variance-authority'

import { cn, establishSurfaceCurrent } from '@rpg/ui'

import { collectionPanelShellClasses } from '@/lib/collection-panel/collection-panel-shell.variants'

import { buildActionResolutionIssueRowVariantMap } from './action-resolution-row.lib'

/** Scrollable resolution list panel inside action dialogs (collection host, not Card). */
export const actionResolutionListVariants = cva(
  cn(
    collectionPanelShellClasses,
    'max-h-[min(50vh,18rem)] overflow-y-auto bg-surface-subtle',
    establishSurfaceCurrent('surface-subtle'),
  ),
)

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
