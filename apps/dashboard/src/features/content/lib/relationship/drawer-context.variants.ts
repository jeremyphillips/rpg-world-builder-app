import { cva } from 'class-variance-authority'

export const drawerContextVariants = cva('space-y-2')

export const drawerContextEntityVariants = cva('space-y-0.5')

export const drawerContextEntityHeadingVariants = cva('flex min-w-0 items-baseline gap-x-1 text-sm')

export const drawerContextEntityHeadingNameVariants = cva(
  'inline-block min-w-0 max-w-[60%] shrink-0 truncate font-medium text-foreground',
)

export const drawerContextEntityHeadingSeparatorVariants = cva(
  'shrink-0 font-normal text-muted-foreground',
)

export const drawerContextEntityHeadingSuffixVariants = cva(
  'min-w-0 flex-1 truncate font-normal text-muted-foreground',
)

export const drawerContextEntitySupportingTextVariants = cva('text-sm italic text-muted-foreground')
