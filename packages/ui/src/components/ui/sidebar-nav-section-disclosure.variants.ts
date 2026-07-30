import { cva } from 'class-variance-authority'

export const sidebarNavSectionDisclosureTriggerClasses =
  'flex w-full items-center gap-2 rounded-md px-3 pb-1 pt-3 text-left transition-colors hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

export const sidebarNavSectionDisclosureStaticHeaderClasses =
  'flex w-full items-center gap-2 px-3 pb-1 pt-3 text-left'

export const sidebarNavSectionDisclosureCaretVariants = cva(
  'ml-auto size-4 shrink-0 text-muted-foreground transition-transform',
  {
    variants: {
      expanded: {
        true: 'rotate-180',
        false: 'rotate-0',
      },
    },
    defaultVariants: {
      expanded: false,
    },
  },
)

export const sidebarNavSectionDisclosureRootClasses = 'mb-2.5 flex flex-col gap-1'

export const sidebarNavSectionDisclosureContentClasses = 'flex flex-col gap-1'
