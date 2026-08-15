import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import type { FieldSize } from './field.client'
import { fieldLabelVariants } from './field.variants'
import { InfoTooltip } from './tooltip.client'
import type { FieldLabelVisibility } from '../../form/form-heading.lib'
import { shouldShowVisibleRequiredMarker } from './field-required.lib'
import { RequiredIndicator } from './required-indicator'

export interface FieldLabelContentProps {
  label: string
  required?: boolean
  /**
   * When omitted, a visible marker is shown whenever `required` is true.
   * Canonical field labels pass an explicit value from `labelVisibility`.
   */
  showRequiredMarker?: boolean
  info?: ReactNode
}

/** Label text with optional required marker and info tooltip — shared by field legends and headings. */
export function FieldLabelContent({
  label,
  required,
  showRequiredMarker,
  info,
}: FieldLabelContentProps) {
  const visibleMarker = showRequiredMarker ?? Boolean(required)

  return (
    <>
      {label}
      {visibleMarker ? <RequiredIndicator /> : null}
      {info ? <InfoTooltip aria-label={`About ${label}`}>{info}</InfoTooltip> : null}
    </>
  )
}

export interface FieldRadiogroupLabelProps extends FieldLabelContentProps {
  id: string
  labelVisibility?: FieldLabelVisibility
  size?: FieldSize
  className?: string
}

/**
 * Non-labelable group heading for radiogroups. Use with `aria-labelledby` on the
 * group root — radiogroups cannot use `htmlFor` labelling.
 */
export function FieldRadiogroupLabel({
  id,
  label,
  required,
  info,
  labelVisibility,
  size = 'md',
  className,
}: FieldRadiogroupLabelProps) {
  return (
    <span
      id={id}
      className={cn(
        fieldLabelVariants({ size }),
        labelVisibility === 'srOnly' && 'sr-only',
        className,
      )}
    >
      <FieldLabelContent
        label={label}
        required={required}
        showRequiredMarker={shouldShowVisibleRequiredMarker(required, labelVisibility)}
        info={info}
      />
    </span>
  )
}
