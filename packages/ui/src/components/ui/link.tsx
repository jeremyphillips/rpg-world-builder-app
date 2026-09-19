import * as React from 'react'

import { cn } from '../../lib/utils'
import { interactiveFocusVariants } from './interactive-focus.variants'
import {
  resolveTextActionTone,
  textActionVariants,
  type TextActionContext,
  type TextActionTone,
} from './text-action.variants'

export type LinkProps = React.ComponentPropsWithoutRef<'a'> & {
  context?: TextActionContext
  tone?: TextActionTone
}

/**
 * Design-system anchor — defaults to a recognizable inline accent link.
 * Use `context="standalone"` for hover-underline text actions outside prose.
 */
export function Link({ context = 'inline', tone, className, ...props }: LinkProps) {
  const resolvedTone = resolveTextActionTone(context, tone)

  return (
    <a
      className={cn(
        textActionVariants({ context, tone: resolvedTone }),
        interactiveFocusVariants({ context: context === 'inline' ? 'embedded' : 'standalone' }),
        className,
      )}
      {...props}
    />
  )
}
