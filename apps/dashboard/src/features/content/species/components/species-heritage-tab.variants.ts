import { cn, establishSurfaceCurrent } from '@rpg/ui'

import { masterDetailRailBorderClasses } from '../../components/master-detail/master-detail-rail.variants'

export const speciesHeritageEmptyStateShellClasses = cn(
  'flex flex-col items-center justify-center rounded-lg border bg-field-container px-6 py-10 text-center text-foreground',
  masterDetailRailBorderClasses,
  establishSurfaceCurrent('field-container'),
)

export const speciesHeritageEmptyStateContentClasses = 'flex max-w-md flex-col items-center gap-3'

export const speciesHeritageEmptyStateTitleClasses = 'text-lg font-medium text-foreground'

export const speciesHeritageEmptyStateDescriptionClasses = 'text-sm text-muted-foreground'
