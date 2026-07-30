import { cva, type VariantProps } from 'class-variance-authority'

export type CampaignDisplaySurface = 'topbar' | 'card' | 'inlineMuted'

export const campaignDisplayNameVariants = cva('inline-flex min-w-0 items-center gap-2', {
  variants: {
    surface: {
      topbar: 'font-medium',
      card: 'font-medium',
      inlineMuted: 'text-sm text-muted-foreground',
    },
  },
  defaultVariants: {
    surface: 'card',
  },
})

export const campaignDisplayNameTextVariants = cva('min-w-0 truncate', {
  variants: {
    surface: {
      topbar: 'max-w-xs sm:max-w-sm md:max-w-md',
      card: '',
      inlineMuted: '',
    },
  },
  defaultVariants: {
    surface: 'card',
  },
})

export const campaignDisplayNameIconVariants = cva('shrink-0 text-muted-foreground', {
  variants: {
    surface: {
      topbar: 'size-4',
      card: 'size-4',
      inlineMuted: 'size-3.5',
    },
  },
  defaultVariants: {
    surface: 'card',
  },
})

export type CampaignDisplayNameVariantProps = VariantProps<typeof campaignDisplayNameVariants>
