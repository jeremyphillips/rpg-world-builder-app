import * as React from 'react'

import { cn } from '../../lib/utils'
import { eyebrowVariants, type EyebrowVariantProps } from './eyebrow.variants'

type EyebrowOwnProps = EyebrowVariantProps & {
  className?: string
  children: React.ReactNode
}

export type EyebrowProps<T extends React.ElementType = 'p'> = EyebrowOwnProps &
  Omit<React.ComponentPropsWithoutRef<T>, keyof EyebrowOwnProps | 'as'> & {
    as?: T
  }

export function Eyebrow<T extends React.ElementType = 'p'>({
  as,
  children,
  className,
  size,
  tone,
  ...props
}: EyebrowProps<T>) {
  const Comp = as ?? 'p'
  return (
    <Comp className={cn(eyebrowVariants({ size, tone }), className)} {...props}>
      {children}
    </Comp>
  )
}
