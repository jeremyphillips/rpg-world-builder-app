import { cva } from 'class-variance-authority'

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
