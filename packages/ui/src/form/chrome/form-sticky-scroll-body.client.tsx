import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import {
  formStickyScrollBodyClipClasses,
  formStickyScrollBodyScrollerClasses,
} from './form-chrome.variants'
import { FormScrollBodyTopInset } from './form-viewport-scroll-top-inset.client'

export type FormStickyScrollBodyProps = {
  children: ReactNode
  scrollBodyClassName?: string
  className?: string
}

/**
 * Docked-footer scroll slot — overflow-hidden clip (size container) wrapping an inner
 * scroller so sticky descendants cannot paint into the footer sibling.
 */
export function FormStickyScrollBody({
  children,
  scrollBodyClassName,
  className,
}: FormStickyScrollBodyProps) {
  return (
    <div className={cn(formStickyScrollBodyClipClasses, className)}>
      <div className={formStickyScrollBodyScrollerClasses}>
        {scrollBodyClassName ? <FormScrollBodyTopInset className={scrollBodyClassName} /> : null}
        {children}
      </div>
    </div>
  )
}
