'use client'

import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import type { FieldSize } from './field.client'
import { fieldLabelContentClusterClasses, fieldLabelVariants } from './field.variants'
import { InfoTooltip } from './tooltip.client'
import type { FieldLabelVisibility } from '../../form/form-heading.lib'
import { useOwnedLabelVisibility } from './owned-label-visibility.lib'
import { shouldShowVisibleRequiredMarker } from './field-required.lib'
import { RequiredIndicator } from './required-indicator'

/** Visible info control. Stays outside an sr-only label so it remains focusable. */
export function FieldLabelInfoAction({ label, info }: { label: string; info: ReactNode }) {
  return <InfoTooltip aria-label={`About ${label}`}>{info}</InfoTooltip>
}

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
    <span className={fieldLabelContentClusterClasses}>
      {label}
      {visibleMarker ? <RequiredIndicator /> : null}
      {info ? <FieldLabelInfoAction label={label} info={info} /> : null}
    </span>
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
  const visibility = useOwnedLabelVisibility(labelVisibility)
  const caption = (
    <span
      id={id}
      className={cn(fieldLabelVariants({ size }), visibility === 'srOnly' && 'sr-only', className)}
    >
      <FieldLabelContent
        label={label}
        required={required}
        showRequiredMarker={shouldShowVisibleRequiredMarker(required, visibility)}
        info={visibility === 'srOnly' ? undefined : info}
      />
    </span>
  )

  if (visibility !== 'srOnly' || info == null) return caption

  return (
    <>
      {caption}
      <FieldLabelInfoAction label={label} info={info} />
    </>
  )
}
