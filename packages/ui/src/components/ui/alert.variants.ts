import { cva, type VariantProps } from 'class-variance-authority'

export const ALERT_VARIANTS = ['default', 'info', 'success', 'warning', 'destructive'] as const

export type AlertVariant = (typeof ALERT_VARIANTS)[number]

export const ALERT_DENSITIES = ['comfortable', 'compact'] as const

export type AlertDensity = (typeof ALERT_DENSITIES)[number]

/** twMerge group — alert appearance modifiers. */
export const UI_ALERT_APPEARANCE_CLASSES = ALERT_VARIANTS.map(
  (variant) => `ui-alert--${variant}` as const,
) as readonly string[]

/** twMerge group — alert density modifiers. */
export const UI_ALERT_DENSITY_CLASSES = ALERT_DENSITIES.map(
  (density) => `ui-alert--${density}` as const,
) as readonly string[]

export const alertVariants = cva('ui-alert', {
  variants: {
    variant: {
      default: 'ui-alert--default',
      info: 'ui-alert--info',
      success: 'ui-alert--success',
      warning: 'ui-alert--warning',
      destructive: 'ui-alert--destructive',
    },
    density: {
      comfortable: 'ui-alert--comfortable',
      compact: 'ui-alert--compact',
    },
  },
  defaultVariants: {
    variant: 'default',
    density: 'comfortable',
  },
})

export const alertTitleVariants = cva('ui-alert__title', {
  variants: {
    density: {
      comfortable: 'ui-alert__title--comfortable',
      compact: 'ui-alert__title--compact',
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
})

export const alertDescriptionVariants = cva('ui-alert__description')

export const ALERT_CLASS_SPECS = [
  {
    key: 'warning',
    className: alertVariants({ variant: 'warning' }),
    keyValues: 'warning-subtle fill, warning-muted border',
    useCase: 'Guidance that needs attention',
  },
  {
    key: 'compact',
    className: alertVariants({ density: 'compact', variant: 'success' }),
    keyValues: 'padding 10px 12px',
    useCase: 'Compact confirmation',
  },
] as const

export type AlertVariantProps = VariantProps<typeof alertVariants>
