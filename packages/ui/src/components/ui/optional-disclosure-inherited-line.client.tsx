'use client'

import { optionalDisclosureInheritedSourceLeading } from './optional-disclosure-inherited.lib'
import {
  optionalDisclosureInheritedLeadingVariants,
  optionalDisclosureInheritedTypeScale,
  optionalDisclosureInheritedValueVariants,
} from './optional-disclosure-inherited.variants'

export type OptionalDisclosureInheritedLineProps = {
  id?: string
  leading: string
  value?: string
  /** Open source preview: append `:` when the label omits it. */
  formatSourceLeading?: boolean
}

/** Muted leading + emphasized value on one inline line (colon or middle-dot copy). */
export function OptionalDisclosureInheritedLine({
  id,
  leading,
  value,
  formatSourceLeading = false,
}: OptionalDisclosureInheritedLineProps) {
  const resolvedLeading = formatSourceLeading
    ? optionalDisclosureInheritedSourceLeading(leading)
    : leading

  if (!value) {
    return (
      <p id={id} className={optionalDisclosureInheritedLeadingVariants}>
        {resolvedLeading}
      </p>
    )
  }

  return (
    <p id={id} className={optionalDisclosureInheritedTypeScale}>
      <span className={optionalDisclosureInheritedLeadingVariants}>{resolvedLeading} </span>
      <span className={optionalDisclosureInheritedValueVariants}>{value}</span>
    </p>
  )
}
