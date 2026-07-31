import { cva, type VariantProps } from 'class-variance-authority'

export type CampaignDisplaySurface =
  | 'topbar'
  | 'card'
  | 'inlineMuted'
  | 'switcherTrigger'
  | 'menuItem'
  | 'page'

export const campaignDisplayNameVariants = cva('inline-flex min-w-0 items-center gap-2', {
  variants: {
    surface: {
      topbar: 'font-medium text-foreground-subtle hover:text-foreground',
      card: 'font-medium',
      inlineMuted: 'text-sm text-muted-foreground',
      switcherTrigger: 'text-sm font-semibold',
      menuItem: 'text-sm',
      page: 'heading-style-page',
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
      page: '',
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
      page: 'size-5 text-muted-foreground',
    },
  },
  defaultVariants: {
    surface: 'card',
  },
})

export type CampaignDisplayNameVariantProps = VariantProps<typeof campaignDisplayNameVariants>

/** One leading icon with comma-separated linked names (e.g. thread header shared campaigns). */
export const campaignDisplayNameListVariants = cva('inline-flex min-w-0 items-center gap-2', {
  variants: {
    surface: {
      inlineMuted: 'text-sm text-muted-foreground',
    },
  },
  defaultVariants: {
    surface: 'inlineMuted',
  },
})

export const campaignDisplayNameListLinkVariants = cva(
  'inline text-primary underline-offset-4 hover:underline',
  {
    variants: {
      surface: {
        inlineMuted: '',
      },
    },
    defaultVariants: {
      surface: 'inlineMuted',
    },
  },
)

export type CampaignDisplayListSurface = NonNullable<
  VariantProps<typeof campaignDisplayNameListVariants>['surface']
>
