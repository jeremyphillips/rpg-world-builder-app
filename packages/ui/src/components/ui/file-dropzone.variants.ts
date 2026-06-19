import { cva } from 'class-variance-authority'

export const dropzoneVariants = cva(
  [
    'relative flex flex-col items-center justify-center gap-2',
    'rounded-md border-2 border-dashed',
    'px-6 py-8 text-center',
    'transition-colors duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'cursor-pointer',
  ],
  {
    variants: {
      state: {
        idle: 'border-border bg-background text-muted-foreground hover:border-ring hover:bg-accent',
        dragover: 'border-primary bg-primary/5 text-primary',
        disabled:
          'pointer-events-none cursor-not-allowed border-border bg-muted text-muted-foreground opacity-50',
      },
    },
    defaultVariants: {
      state: 'idle',
    },
  },
)

export const dropzoneIconVariants = cva('mb-1', {
  variants: {
    state: {
      idle: 'text-muted-foreground',
      dragover: 'text-primary',
      disabled: 'text-muted-foreground',
    },
  },
  defaultVariants: {
    state: 'idle',
  },
})

export const fileListVariants = cva('mt-4 w-full space-y-2')

export const fileItemVariants = cva(
  'flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2 text-sm',
)

export const fileThumbnailVariants = cva('size-10 shrink-0 rounded object-cover')

export const fileIconVariants = cva(
  'size-10 shrink-0 flex items-center justify-center rounded bg-muted text-muted-foreground',
)

export const removeButtonVariants = cva([
  'ml-auto shrink-0 rounded-sm p-1',
  'text-muted-foreground opacity-70 transition-opacity',
  'hover:opacity-100 hover:text-destructive',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
])

export const dropzonePromptVariants = cva('text-sm font-medium')

export const dropzoneHintVariants = cva('text-xs text-muted-foreground')

export const fileNameVariants = cva('truncate text-sm font-medium')

export const fileMetaVariants = cva('text-xs text-muted-foreground')
