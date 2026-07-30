import { cva, type VariantProps } from 'class-variance-authority'

export type CampaignDisplaySurface =
  | 'topbar'
  | 'card'
  | 'inlineMuted'
  | 'switcherTrigger'
  | 'menuItem'

export const campaignDisplayNameVariants = cva('inline-flex min-w-0 items-center gap-2', {
  variants: {
    surface: {
      topbar: 'font-medium text-foreground-subtle',
      card: 'font-medium',
      inlineMuted: 'text-sm text-muted-foreground',
      switcherTrigger: 'text-sm font-semibold',
      menuItem: 'text-sm',
    },
  },
  defaultVariants: {
    surface: 'card',
  },
})

export const campaignDisplayNameTextVariants = cva('min-w-0', {
  variants: {
    surface: {
      topbar: 'truncate max-w-xs sm:max-w-sm md:max-w-md',
      card: 'truncate',
      inlineMuted: 'truncate',
      switcherTrigger: 'truncate',
      menuItem: '',
    },
  },
  defaultVariants: {
    surface: 'card',
  },
})

export const campaignDisplayNameIconVariants = cva('shrink-0', {
  variants: {
    surface: {
      topbar: 'size-4 text-foreground-subtle',
      card: 'size-4 text-muted-foreground',
      inlineMuted: 'size-3.5 text-muted-foreground',
      switcherTrigger: 'size-4 text-muted-foreground',
      menuItem: 'size-4 text-muted-foreground',
    },
  },
  defaultVariants: {
    surface: 'card',
  },
})

export type CampaignDisplayNameVariantProps = VariantProps<typeof campaignDisplayNameVariants>
