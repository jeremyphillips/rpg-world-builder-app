import * as React from 'react'

import { cn } from '../../lib/utils'
import { textVariants, type TextVariantProps } from './text.variants'

type TextOwnProps = TextVariantProps & {
  className?: string
}

export type TextProps<T extends React.ElementType = 'p'> = TextOwnProps &
  Omit<React.ComponentPropsWithoutRef<T>, keyof TextOwnProps | 'as'> & {
    as?: T
  }

export function Text<T extends React.ElementType = 'p'>({
  as,
  variant,
  className,
  ...props
}: TextProps<T>) {
  const Comp = as ?? 'p'
  return <Comp className={cn(textVariants({ variant }), className)} {...props} />
}
