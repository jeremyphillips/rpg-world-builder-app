import * as React from 'react'

import { cn } from '../../lib/utils'

export interface EyebrowProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
}

export function Eyebrow({ children, className, ...props }: EyebrowProps) {
  return (
    <p
      className={cn(
        'text-xs font-semibold uppercase tracking-wider text-muted-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </p>
  )
}
