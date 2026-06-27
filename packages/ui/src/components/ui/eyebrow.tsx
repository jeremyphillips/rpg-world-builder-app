import * as React from 'react'

import { cn } from '../../lib/utils'
import { eyebrowVariants, type EyebrowVariantProps } from './eyebrow.variants'

export interface EyebrowProps
  extends React.HTMLAttributes<HTMLParagraphElement>, EyebrowVariantProps {
  children: React.ReactNode
}

export function Eyebrow({ children, className, size, ...props }: EyebrowProps) {
  return (
    <p className={cn(className, eyebrowVariants({ size }))} {...props}>
      {children}
    </p>
  )
}
