import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { establishSurfaceCurrent } from './surface-current.lib'

export const ALERT_VARIANTS = ['default', 'info', 'success', 'warning', 'destructive'] as const

export type AlertVariant = (typeof ALERT_VARIANTS)[number]

export const alertVariants = cva(
  'flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-start',
  {
    variants: {
      variant: {
        default: cn(
          'border-border bg-surface-muted text-foreground',
          establishSurfaceCurrent('surface-muted'),
        ),
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
      info: 'text-foreground',
      success: 'text-foreground',
      warning: 'text-foreground',
      destructive: 'text-foreground',
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
