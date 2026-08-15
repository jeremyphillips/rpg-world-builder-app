import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import type { FieldSize } from './field.client'
import { fieldLabelVariants } from './field.variants'
import { InfoTooltip } from './tooltip.client'
import type { FieldLabelVisibility } from '../../form/form-heading.lib'
import { resolveFieldLabelVisibility } from '../../form/form-heading.lib'

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
  /** @deprecated Use `labelVisibility: 'srOnly'`. */
  labelHidden?: boolean
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
  labelHidden,
  labelVisibility,
  size = 'md',
  className,
}: FieldRadiogroupLabelProps) {
  const visibility = resolveFieldLabelVisibility({ labelVisibility, labelHidden })
  return (
    <span
      id={id}
      className={cn(fieldLabelVariants({ size }), visibility === 'srOnly' && 'sr-only', className)}
    >
      <FieldLabelContent label={label} required={required} info={info} />
    </span>
  )
}
