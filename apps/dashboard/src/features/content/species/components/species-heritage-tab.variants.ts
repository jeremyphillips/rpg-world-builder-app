import {
  cn,
  emptyStateWellSupportingClasses,
  emptyStateWellSurfaceClasses,
  emptyStateWellTitleLgClasses,
} from '@rpg/ui'

import { masterDetailRailBorderClasses } from '../../components/master-detail/master-detail-rail.variants'

export const speciesHeritageEmptyStateShellClasses = cn(
  'flex flex-col items-center justify-center rounded-lg border px-6 py-10 text-center',
  masterDetailRailBorderClasses,
  emptyStateWellSurfaceClasses,
)

export const speciesHeritageEmptyStateContentClasses = 'flex max-w-md flex-col items-center gap-3'

export const speciesHeritageEmptyStateTitleClasses = emptyStateWellTitleLgClasses

export const speciesHeritageEmptyStateDescriptionClasses = emptyStateWellSupportingClasses

export const speciesHeritageGroupShellClasses = 'relative'

export const speciesHeritageGroupActionsClasses = 'absolute right-0 top-0 z-10'
