import { cva } from 'class-variance-authority'

export const dropzoneVariants = cva(
  [
    'relative flex flex-col items-center justify-center text-center',
    'rounded-md border-2 border-dashed border-border',
    'transition-colors duration-150',
  ],
  {
    variants: {
      density: {
        compact: 'gap-2 px-6 py-8',
        comfortable: 'min-h-48 gap-3 bg-sunken px-6 py-10',
      },
      state: {
        idle: 'text-muted-foreground',
        dragover: 'border-drop-target-border bg-drop-target text-primary',
        disabled: 'pointer-events-none opacity-50',
      },
    },
    defaultVariants: {
      density: 'compact',
      state: 'idle',
    },
  },
)

export const dropzoneIconVariants = cva('', {
  variants: {
    density: {
      compact: 'size-8',
      comfortable: 'size-10',
    },
    state: {
      idle: 'text-muted-foreground',
      dragover: 'text-primary',
      disabled: 'text-muted-foreground',
    },
  },
  defaultVariants: {
    density: 'compact',
    state: 'idle',
  },
})

export const dropzoneTitleVariants = cva('font-semibold text-foreground', {
  variants: {
    density: {
      compact: 'text-sm',
      comfortable: 'text-base',
    },
  },
  defaultVariants: {
    density: 'compact',
  },
})

export const dropzoneDescriptionVariants = cva('text-sm text-muted-foreground')

export const dropzoneRequirementsVariants = cva('text-xs text-muted-foreground')

export const dropzoneActionsVariants = cva('flex flex-col items-center gap-2')

export const fileListVariants = cva('mt-4 w-full space-y-2')

export const fileItemVariants = cva(
  'flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2 text-sm',
)

export const fileThumbnailVariants = cva('size-10 shrink-0 rounded object-cover')

export const fileIconVariants = cva(
  'size-10 shrink-0 flex items-center justify-center rounded bg-surface-muted text-muted-foreground',
)

export const removeButtonVariants = cva([
  'ml-auto shrink-0 rounded-sm p-1',
  'text-muted-foreground opacity-70 transition-opacity',
  'hover:opacity-100 hover:text-destructive',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
])

export const fileNameVariants = cva('truncate text-sm font-medium')

export const fileMetaVariants = cva('text-xs text-muted-foreground')
