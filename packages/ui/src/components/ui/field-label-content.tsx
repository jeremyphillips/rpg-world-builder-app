import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import type { FieldSize } from './field.client'
import { fieldLabelVariants } from './field.variants'
import { InfoTooltip } from './tooltip.client'

export interface FieldLabelContentProps {
  label: string
  required?: boolean
  info?: ReactNode
}

/** Label text with optional required asterisk and info tooltip — shared by field legends and headings. */
export function FieldLabelContent({ label, required, info }: FieldLabelContentProps) {
  return (
    <>
      {label}
      {required ? (
        <span aria-hidden="true" className="text-destructive">
          *
        </span>
      ) : null}
      {info ? <InfoTooltip aria-label={`About ${label}`}>{info}</InfoTooltip> : null}
    </>
  )
}

export interface FieldRadiogroupLabelProps extends FieldLabelContentProps {
  id: string
  labelHidden?: boolean
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
  labelHidden,
  size = 'md',
  className,
}: FieldRadiogroupLabelProps) {
  return (
    <span id={id} className={cn(fieldLabelVariants({ size }), labelHidden && 'sr-only', className)}>
      <FieldLabelContent label={label} required={required} info={info} />
    </span>
  )
}
