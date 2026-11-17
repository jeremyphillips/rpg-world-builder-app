'use client'

import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import type { FieldSize } from './field.client'
import { fieldLabelContentClusterClasses, fieldLabelVariants } from './field.variants'
import { InfoTooltip } from './tooltip.client'
import type { FieldLabelVisibility } from '../../form/form-heading.lib'
import { useOwnedLabelVisibility } from './owned-label-visibility.lib'
import { resolveOwnedLabelPolicy } from './field-required.lib'
import { RequiredIndicator } from './required-indicator'

/** Visible info control. Stays outside the naming element so it remains focusable. */
export function FieldLabelInfoAction({ label, info }: { label: string; info: ReactNode }) {
  return <InfoTooltip aria-label={`About ${label}`}>{info}</InfoTooltip>
}

export interface FieldLabelContentProps {
  label: string
  /** Defaults to false — pass from {@link resolveOwnedLabelPolicy} when the field is required. */
  showRequiredMarker?: boolean
}

/** Label text and optional required marker only — no info action (use {@link FieldLabelLine}). */
export function FieldLabelContent({ label, showRequiredMarker = false }: FieldLabelContentProps) {
  return (
    <>
      {label}
      {showRequiredMarker ? <RequiredIndicator /> : null}
    </>
  )
}

export function FieldLabelLine({
  label,
  info,
  children,
}: {
  label: string
  info?: ReactNode
  children: ReactNode
}): ReactNode {
  return (
    <span className={fieldLabelContentClusterClasses}>
      {children}
      {info ? <FieldLabelInfoAction label={label} info={info} /> : null}
    </span>
  )
}

export interface FieldRadiogroupLabelProps {
  id: string
  label: string
  labelVisibility?: FieldLabelVisibility
  required?: boolean
  info?: ReactNode
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
  const { showRequiredMarker, nameClassName } = resolveOwnedLabelPolicy(required, visibility)

  return (
    <FieldLabelLine label={label} info={info}>
      <span id={id} className={cn(fieldLabelVariants({ size }), nameClassName, className)}>
        <FieldLabelContent label={label} showRequiredMarker={showRequiredMarker} />
      </span>
    </FieldLabelLine>
  )
}

export interface FieldLegendLabelProps {
  legendId?: string
  label: string
  labelVisibility?: FieldLabelVisibility
  required?: boolean
  info?: ReactNode
  legendClassName?: string
}

/** Fieldset legend name cluster — info renders as a sibling via {@link FieldLegendInfoSibling}. */
export function FieldLegendLabel({
  legendId,
  label,
  labelVisibility = 'visible',
  required,
  legendClassName,
}: Omit<FieldLegendLabelProps, 'info'>): ReactNode {
  const { showRequiredMarker, nameClassName } = resolveOwnedLabelPolicy(required, labelVisibility)

  return (
    <legend id={legendId} className={cn(nameClassName, legendClassName)}>
      <FieldLabelContent label={label} showRequiredMarker={showRequiredMarker} />
    </legend>
  )
}

/** Placed as the fieldset sibling immediately after the legend. */
export function FieldLegendInfoSibling({ label, info }: { label: string; info: ReactNode }) {
  return (
    <span data-field-legend-info className="shrink-0">
      <FieldLabelInfoAction label={label} info={info} />
    </span>
  )
}
