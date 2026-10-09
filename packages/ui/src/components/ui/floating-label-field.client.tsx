'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import type { FieldWidth } from './field-control.variants'
import { Field, FieldLabelAssociation, useFieldRootContext } from './field.client'
import { FieldRowParticipationProvider } from './field-row-anatomy.context'
import { FloatingLabelFieldProvider } from './floating-label-field.context'
import type { FloatingLabelFieldSize } from './floating-label-field.variants'
import {
  floatingLabelLayerVariants,
  floatingLabelShellVariants,
  floatingLabelTextClipClass,
  floatingLabelTextVariants,
} from './floating-label-field.variants'

export type FloatingLabelFieldProps = {
  /** Visible label. It is the accessible name of the control. */
  label: string
  /** Compact (`sm`, h-8) or comfortable (`md`, h-9). */
  size: FloatingLabelFieldSize
  /**
   * Canonical populated state. Required so uncontrolled inputs are unsupported.
   * Rendered as `data-populated`. Not inferred from the DOM.
   */
  populated: boolean
  /** Transient example shown only while the field is active and empty. */
  placeholder?: string
  /** Persistent guidance. Always rendered below the control. */
  hint?: string
  /** Validation message. Replaces the hint below the control. */
  error?: string
  /** Drives invalid chrome when `error` is omitted. */
  invalid?: boolean
  width?: FieldWidth
  disabled?: boolean
  /** Override the generated control id. */
  id?: string
  className?: string
  /** Exactly one labelable control (input, select trigger, or combobox trigger). */
  children: React.ReactElement
}

function prepareControlChild(
  children: React.ReactElement,
  options: { placeholder?: string; disabled?: boolean },
): React.ReactElement {
  const extra: Record<string, unknown> = {}
  if (options.placeholder !== undefined) extra.placeholder = options.placeholder
  if (options.disabled !== undefined) extra.disabled = options.disabled
  if (Object.keys(extra).length === 0) return children
  return React.cloneElement(children, extra)
}

function FloatingLabelControlAudit({
  labelId,
  placeholder,
}: {
  labelId: string
  placeholder?: string
}) {
  const { controlId } = useFieldRootContext('FloatingLabelField')

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'production') return
    const control = document.getElementById(controlId)
    if (!control) return

    if (control.getAttribute('aria-label')) {
      console.warn(
        `FloatingLabelField: control "${controlId}" sets aria-label, which overrides the visible label.`,
      )
    }

    const labelledBy = control.getAttribute('aria-labelledby')
    if (labelledBy && !labelledBy.split(/\s+/).includes(labelId)) {
      console.warn(
        `FloatingLabelField: control "${controlId}" aria-labelledby does not reference the floating label.`,
      )
    }

    const renderedPlaceholder = control.getAttribute('placeholder')
    if (renderedPlaceholder != null && renderedPlaceholder !== placeholder) {
      console.warn(
        `FloatingLabelField: control "${controlId}" renders a placeholder the composite did not supply.`,
      )
    }
  }, [controlId, labelId, placeholder])

  return null
}

function FloatingLabelFieldBody({
  label,
  size,
  populated,
  placeholder,
  disabled,
  children,
}: Pick<
  FloatingLabelFieldProps,
  'label' | 'size' | 'populated' | 'placeholder' | 'disabled' | 'children'
>) {
  const { controlId } = useFieldRootContext('FloatingLabelField')
  const labelId = `${controlId}-label`
  const control = prepareControlChild(React.Children.only(children), { placeholder, disabled })

  return (
    <>
      <div
        data-populated={populated ? 'true' : 'false'}
        className={floatingLabelShellVariants({ size })}
      >
        <div className={floatingLabelLayerVariants({ size })}>
          <FieldLabelAssociation
            id={labelId}
            data-floating-label=""
            className={floatingLabelTextVariants({ size })}
          >
            {/* Clip is separate so the mask padding cannot ellipsize the text. */}
            <span className={floatingLabelTextClipClass}>{label}</span>
          </FieldLabelAssociation>
        </div>
        <Field.Control>{control}</Field.Control>
      </div>
      <Field.Hint />
      <Field.Error />
      <FloatingLabelControlAudit labelId={labelId} placeholder={placeholder} />
    </>
  )
}

/**
 * One floating-label composite. Owns label geometry and state. Width and value
 * stay with the control. Hints always render below the control.
 */
export function FloatingLabelField({
  label,
  size,
  populated,
  placeholder,
  hint,
  error,
  invalid,
  width,
  disabled,
  id,
  className,
  children,
}: FloatingLabelFieldProps) {
  return (
    <FloatingLabelFieldProvider>
      <FieldRowParticipationProvider participates={false}>
        <Field.Root
          id={id}
          size={size}
          width={width}
          hint={hint}
          error={error}
          invalid={invalid}
          hintPosition="below-control"
          className={cn(className)}
        >
          <FloatingLabelFieldBody
            label={label}
            size={size}
            populated={populated}
            placeholder={placeholder}
            disabled={disabled}
          >
            {children}
          </FloatingLabelFieldBody>
        </Field.Root>
      </FieldRowParticipationProvider>
    </FloatingLabelFieldProvider>
  )
}
