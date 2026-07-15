import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import type { FieldSize } from './field.client'
import { resolveFieldChromeClassNames, type FieldChrome } from './field-chrome.variants'

export interface FieldChromeShellProps {
  chrome?: FieldChrome
  size?: FieldSize
  className?: string
  children: ReactNode
}

/** Wraps the control region in panel/outline chrome when configured. */
export function FieldChromeShell({
  chrome,
  size = 'md',
  className,
  children,
}: FieldChromeShellProps) {
  const chromeClasses = resolveFieldChromeClassNames(chrome, size)
  if (!chromeClasses) {
    return className ? <div className={className}>{children}</div> : <>{children}</>
  }

  return <div className={cn(chromeClasses, className)}>{children}</div>
}
