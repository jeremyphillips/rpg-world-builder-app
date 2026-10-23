import * as React from 'react'

import { cn } from '../../lib/utils'
import { Icon } from './icon/icon'
import { SPINNER_ICON_SIZES } from './spinner.lib'
import { spinnerVariants, type SpinnerVariantProps } from './spinner.variants'

export interface SpinnerProps extends React.ComponentProps<'span'>, SpinnerVariantProps {}

export function Spinner({ className, variant, size, ...props }: SpinnerProps) {
  const resolvedSize = size ?? 'default'
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(spinnerVariants({ variant, className }))}
      {...props}
    >
      <Icon name="loader-circle" size={SPINNER_ICON_SIZES[resolvedSize]} className="animate-spin" />
    </span>
  )
}
