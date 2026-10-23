import { cva } from 'class-variance-authority'

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
