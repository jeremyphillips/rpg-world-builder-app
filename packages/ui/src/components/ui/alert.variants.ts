import { cva, type VariantProps } from 'class-variance-authority'

export const ALERT_VARIANTS = ['default', 'info', 'success', 'warning', 'destructive'] as const

export type AlertVariant = (typeof ALERT_VARIANTS)[number]

export const alertVariants = cva(
  'flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-start',
  {
    variants: {
      variant: {
        default: 'border-border bg-muted text-foreground',
        info: 'border-info-muted bg-info-subtle text-foreground',
        success: 'border-success-muted bg-success-subtle text-foreground',
        warning: 'border-warning-muted bg-warning-subtle text-foreground',
        destructive: 'border-destructive-muted bg-destructive-subtle text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export const alertTitleVariants = cva('heading-style-alert', {
  variants: {
    variant: {
      default: 'text-foreground',
      info: 'text-info',
      success: 'text-success',
      warning: 'text-warning',
      destructive: 'text-destructive',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export const alertDescriptionVariants = cva('text-sm text-muted-foreground', {
  variants: {
    variant: {
      default: '',
      info: '',
      success: '',
      warning: '',
      destructive: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export type AlertVariantProps = VariantProps<typeof alertVariants>
