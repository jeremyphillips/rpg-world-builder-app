'use client'

import type { ReactNode } from 'react'

import type { FieldLabelVisibility } from '../../form/form-heading.lib'
import { FormFieldLabel } from '../../form/presentation/form-field-label.client'
import type { FieldControlBand } from './field-control-band.variants'
import { resolveFieldAnatomyWidth, type FieldChrome } from './field-chrome.variants'
import { Field, type FieldSize } from './field.client'
import type { FieldWidth } from './field-control.variants'
import { FieldLayout } from './field-layout'
import type { FieldHintPosition } from './field.variants'

export type FieldAnatomyRowControlProps = {
  labelId: string | undefined
}

export interface FieldAnatomyRowShellProps {
  id: string
  label: string
  error?: string
  invalid?: boolean
  describedBy?: string
  hint?: string
  hintPosition?: FieldHintPosition
  info?: ReactNode
  required?: boolean
  size?: FieldSize
  width?: FieldWidth
  chrome?: FieldChrome
  labelVisibility?: FieldLabelVisibility
  /** Default `content-sized` — use `single-line` for compact controls (select trigger, toggles). */
  controlBand?: FieldControlBand
  children: (props: FieldAnatomyRowControlProps) => ReactNode
}

/**
 * Stacked three-region anatomy for fields participating in a schema anatomy-grid row.
 * Replaces fieldset/legend shells so label / control / message tracks align with siblings.
 */
export function FieldAnatomyRowShell({
  id,
  label,
  error,
  invalid,
  describedBy,
  hint,
  hintPosition,
  info,
  required,
  size = 'md',
  width,
  chrome,
  labelVisibility = 'visible',
  controlBand = 'content-sized',
  children,
}: FieldAnatomyRowShellProps) {
  const rootWidth = resolveFieldAnatomyWidth(width, chrome)
  const labelId = `${id}-label`
  const showFieldLabel = labelVisibility !== 'srOnly' && label.trim().length > 0

  return (
    <Field.Root
      id={id}
      error={error}
      invalid={invalid}
      describedBy={describedBy}
      hint={hint}
      hintPosition={hintPosition}
      required={required}
      width={rootWidth}
      size={size}
      anatomy
    >
      <FieldLayout
        hintPosition={hintPosition}
        wrapControl={false}
        chrome={chrome}
        size={size}
        controlBand={controlBand}
        label={
          showFieldLabel ? (
            <span id={labelId}>
              <FormFieldLabel
                label={label}
                labelVisibility={labelVisibility}
                required={required}
                info={info}
              />
            </span>
          ) : null
        }
        control={
          <div
            role="group"
            aria-labelledby={showFieldLabel ? labelId : undefined}
            aria-label={showFieldLabel ? undefined : label}
          >
            {children({ labelId: showFieldLabel ? labelId : undefined })}
          </div>
        }
      />
    </Field.Root>
  )
}
