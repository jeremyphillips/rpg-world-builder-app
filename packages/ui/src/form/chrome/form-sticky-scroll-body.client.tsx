import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import {
  formStickyScrollBodyClipClasses,
  formStickyScrollBodyScrollerClasses,
  formStickyScrollBodyUnboundedClasses,
} from './form-chrome.variants'
import { FormScrollBodyTopInset } from './form-viewport-scroll-top-inset.client'

export type FormStickyScrollBodyProps = {
  children: ReactNode
  scrollBodyClassName?: string
  className?: string
  /**
   * Viewport-bound docked-footer column — overflow-hidden clip + inner scroller so
   * sticky panels cannot paint into the footer. Page-scroll routes keep this false.
   */
  boundedScroll?: boolean
}

/**
 * Docked-footer scroll slot. Viewport-bound forms use clip + scroller; page-scroll
 * forms use a single growing scroller so fields are not collapsed by `overflow-hidden`.
 */
export function FormStickyScrollBody({
  children,
  scrollBodyClassName,
  className,
  boundedScroll = false,
}: FormStickyScrollBodyProps) {
  const inset = scrollBodyClassName ? (
    <FormScrollBodyTopInset className={scrollBodyClassName} />
  ) : null

  if (!boundedScroll) {
    if (!inset && !className) {
      return children
    }

    return (
      <div className={cn(formStickyScrollBodyUnboundedClasses, className)}>
        {inset}
        {children}
      </div>
    )
  }

  return (
    <div className={cn(formStickyScrollBodyClipClasses, className)}>
      <div className={formStickyScrollBodyScrollerClasses}>
        {inset}
        {children}
      </div>
    </div>
  )
}
