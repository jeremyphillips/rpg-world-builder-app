import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { establishSurfaceCurrent } from './surface-current.lib'

export const ALERT_VARIANTS = ['default', 'info', 'success', 'warning', 'destructive'] as const

export type AlertVariant = (typeof ALERT_VARIANTS)[number]

export const ALERT_DENSITIES = ['comfortable', 'compact'] as const

export type AlertDensity = (typeof ALERT_DENSITIES)[number]

export const alertVariants = cva('flex flex-col rounded-lg border sm:flex-row sm:items-start', {
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
    density: {
      comfortable: 'gap-3 p-4',
      compact: 'gap-2 px-3 py-[10px]',
    },
  },
  defaultVariants: {
    variant: 'default',
    density: 'comfortable',
  },
})

export const alertTitleVariants = cva('', {
  variants: {
    variant: {
      default: 'text-foreground',
      info: 'text-foreground',
      success: 'text-foreground',
      warning: 'text-foreground',
      destructive: 'text-foreground',
    },
    density: {
      comfortable: 'heading-style-alert',
      compact: 'text-sm font-body-emphasis',
    },
  },
  defaultVariants: {
    variant: 'default',
    density: 'comfortable',
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
    density: {
      comfortable: '',
      compact: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    density: 'comfortable',
  },
})

export type AlertVariantProps = VariantProps<typeof alertVariants>
