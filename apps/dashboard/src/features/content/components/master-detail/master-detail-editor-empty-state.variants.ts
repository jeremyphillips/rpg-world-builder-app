import {
  cn,
  emptyStateWellIconLgClasses,
  emptyStateWellSupportingLgClasses,
  emptyStateWellSurfaceClasses,
  emptyStateWellTitleLgClasses,
} from '@rpg/ui'

export const masterDetailEditorEmptyStateShellClasses = cn(
  'flex flex-1 flex-col items-center justify-center rounded-lg border px-6 py-10 text-center',
  emptyStateWellSurfaceClasses,
)

export const masterDetailEditorEmptyStateContentClasses = 'flex flex-col items-center gap-3'

export const masterDetailEditorEmptyStateIconClasses = emptyStateWellIconLgClasses

export const masterDetailEditorEmptyStateHeadingClasses = emptyStateWellTitleLgClasses

export const masterDetailEditorEmptyStateSubheadClasses = emptyStateWellSupportingLgClasses
