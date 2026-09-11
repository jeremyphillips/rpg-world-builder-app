import { cn } from '../../lib/utils'
import { formViewportScrollBodyTopInsetClasses } from './form-chrome.variants'

type FormScrollBodyTopInsetProps = {
  className: string
}

/**
 * Scroll-away top inset for viewport-bound form scroll bodies. Renders as the first
 * child inside the overflow region so sticky chrome can stick at `top-0` without a
 * permanent padding gap on the scroll container.
 */
export function FormScrollBodyTopInset({ className }: FormScrollBodyTopInsetProps) {
  return <div className={cn(className, 'shrink-0')} aria-hidden="true" />
}

/** Preset scroll-away inset matching dashboard `pageShellInsetTopClasses`. */
export function FormViewportScrollTopInset() {
  return <FormScrollBodyTopInset className={formViewportScrollBodyTopInsetClasses} />
}
