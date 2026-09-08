'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { type FieldSize } from './field.client'
import { fieldWidthVariants, type FieldWidth } from './field-control.variants'
import { resolveFieldAnatomyWidth, type FieldChrome } from './field-chrome.variants'
import { fieldAnatomyIds, fieldDescribedBy } from './choose-count-field.lib'
import {
  fieldLabelVariants,
  fieldSetInFlowLegendClasses,
  type FieldHintPosition,
} from './field.variants'
import { FieldLabelContent } from './field-label-content'
import { FieldsetChromeAnatomy, FieldsetChromeFrame } from './fieldset-chrome-anatomy'
import { shouldShowVisibleRequiredMarker } from './field-required.lib'
import type { FieldLabelVisibility } from '../../form/form-heading.lib'

export interface ChooseCountFieldAnatomy {
  legendId: string
  chooseId: string
  hintId: string
  errorId: string
}

interface ChooseCountFieldShellProps {
  id: string
  label: string
  error?: string
  hint?: string
  hintPosition?: FieldHintPosition
  info?: React.ReactNode
  required?: boolean
  disabled?: boolean
  size?: FieldSize
  width?: FieldWidth
  chrome?: FieldChrome
  labelVisibility?: FieldLabelVisibility
  children: (anatomy: ChooseCountFieldAnatomy) => React.ReactNode
}

/** Shared fieldset + legend wrapper for inline choose-count composite fields. */
export function ChooseCountFieldShell({
  id,
  label,
  error,
  hint,
  hintPosition = 'below-label',
  info,
  required,
  disabled,
  size = 'md',
  width = 'full',
  chrome,
  labelVisibility = 'visible',
  children,
}: ChooseCountFieldShellProps) {
  const { legendId, chooseId, hintId, errorId } = fieldAnatomyIds(id)
  const describedBy = fieldDescribedBy(error, hint, errorId, hintId)
  const rootWidth = resolveFieldAnatomyWidth(width, chrome)

  return (
    <div className={fieldWidthVariants({ width: rootWidth })}>
      <FieldsetChromeFrame
        chrome={chrome}
        size={size}
        error={error}
        errorId={errorId}
        fieldsetProps={{
          id,
          'aria-describedby': describedBy,
          'aria-invalid': error ? true : undefined,
          disabled,
        }}
      >
        <FieldsetChromeAnatomy
          hintPosition={hintPosition}
          hint={hint}
          error={error}
          hintId={hintId}
          legend={
            <legend
              id={legendId}
              className={cn(
                fieldSetInFlowLegendClasses,
                fieldLabelVariants({ size }),
                labelVisibility === 'srOnly' && 'sr-only',
              )}
            >
              <FieldLabelContent
                label={label}
                required={required}
                showRequiredMarker={shouldShowVisibleRequiredMarker(required, labelVisibility)}
                info={info}
              />
            </legend>
          }
        >
          {children({ legendId, chooseId, hintId, errorId })}
        </FieldsetChromeAnatomy>
      </FieldsetChromeFrame>
    </div>
  )
}
