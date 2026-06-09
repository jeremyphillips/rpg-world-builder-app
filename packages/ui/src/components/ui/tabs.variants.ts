import { cva } from 'class-variance-authority'

export const tabsListVariants = cva('inline-flex items-center text-muted-foreground', {
  variants: {
    variant: {
      line: 'w-full border-b border-border gap-0',
      pill: 'h-9 rounded-lg bg-muted p-1 gap-1',
    },
  },
  defaultVariants: {
    variant: 'line',
  },
})

export const tabsTriggerVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        line: 'relative h-9 px-4 pb-2 pt-1 text-muted-foreground hover:text-foreground data-[state=active]:text-foreground data-[state=active]:after:absolute data-[state=active]:after:inset-x-0 data-[state=active]:after:-bottom-px data-[state=active]:after:h-0.5 data-[state=active]:after:rounded-full data-[state=active]:after:bg-foreground',
        pill: 'h-7 rounded-md px-3 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
      },
    },
    defaultVariants: {
      variant: 'line',
    },
  },
)

export type TabsVariant = 'line' | 'pill'
