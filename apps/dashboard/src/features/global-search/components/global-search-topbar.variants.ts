import { cn, establishSurfaceCurrent } from '@rpg/ui'

export const globalSearchTopbarRootClasses = 'relative shrink-0'

export const globalSearchTopbarInputWrapClasses = 'w-[min(100vw-8rem,20rem)]'

export const globalSearchTopbarPreviewClasses = cn(
  'absolute top-full right-0 z-50 mt-2 max-h-[min(70vh,28rem)] w-[min(100vw-2rem,24rem)] overflow-y-auto rounded-md border border-border bg-surface-subtle p-3 shadow-md outline-none',
  establishSurfaceCurrent('surface-subtle'),
)
