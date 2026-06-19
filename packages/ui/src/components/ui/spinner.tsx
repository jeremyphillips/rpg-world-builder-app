import * as React from 'react'
import { Loader2Icon } from 'lucide-react'

import { cn } from '../../lib/utils'
import { spinnerVariants, type SpinnerVariantProps } from './spinner.variants'

export interface SpinnerProps extends React.ComponentProps<'svg'>, SpinnerVariantProps {}

export function Spinner({ className, variant, size, ...props }: SpinnerProps) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn(spinnerVariants({ variant, size, className }))}
      {...props}
    />
  )
}
