import * as React from 'react'

import { cn } from '../../lib/utils'
import { headingVariants, type HeadingVariantProps } from './heading.variants'

type HeadingOwnProps = HeadingVariantProps & {
  className?: string
}

export type HeadingProps<T extends React.ElementType = 'h2'> = HeadingOwnProps &
  Omit<React.ComponentPropsWithoutRef<T>, keyof HeadingOwnProps | 'as'> & {
    as?: T
  }

export function Heading<T extends React.ElementType = 'h2'>({
  as,
  variant,
  className,
  ...props
}: HeadingProps<T>) {
  const Comp = as ?? 'h2'
  return <Comp className={cn(className, headingVariants({ variant }))} {...props} />
}
