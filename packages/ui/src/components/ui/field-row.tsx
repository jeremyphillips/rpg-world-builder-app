import type { HTMLAttributes } from 'react'

import { cn } from '../../lib/utils'
import { fieldRowLayoutClasses } from './field.variants'

export interface FieldRowProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * Lays fields out side by side. Fields keep their `width`: fixed tokens
 * (`xs`–`xl`/`auto`) stay their intrinsic size, while `full`/fractional fields
 * share the remaining space (equal split by default). Wraps on narrow widths.
 */
export function FieldRow({ className, ...props }: FieldRowProps) {
  return <div data-field-row="" className={cn(fieldRowLayoutClasses, className)} {...props} />
}
