import { cva, type VariantProps } from 'class-variance-authority'

/** Sidebar nav link presentation — apps pass `active` from their router wrapper. */
export const sidebarNavItemVariants = cva(
  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
  {
    variants: {
      active: {
        true: 'bg-accent text-accent-foreground',
        false: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
      },
    },
    defaultVariants: {
      active: false,
    },
  },
)

export type SidebarNavItemVariantProps = VariantProps<typeof sidebarNavItemVariants>
