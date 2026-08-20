'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import {
  fieldWidthVariants,
  type FieldControlVariantProps,
  type FieldWidth,
} from './field-control.variants'
import { FieldDerivedMeta } from './field-derived-meta.client'
import { useFieldDerivedMetaContext } from './field-derived-meta-context.client'
import {
  fieldAnatomyStackVariants,
  fieldErrorTextVariants,
  fieldLabelVariants,
  type FieldLabelPlacement,
} from './field.variants'
import { resolveControlRequiredProps } from './field-required.lib'
import { Text } from './text'

type FieldSize = NonNullable<FieldControlVariantProps['size']>

interface FieldContextValue {
  controlId: string
  hintId: string
  errorId: string
  derivedMetaId: string
  hasError: boolean
  hasHint: boolean
  hasDerivedMeta: boolean
  describedBy: string | undefined
  size: FieldSize
  required: boolean
  error?: string
  hint?: string
}

const FieldContext = React.createContext<FieldContextValue | null>(null)

function useFieldContext(part: string): FieldContextValue {
  const context = React.useContext(FieldContext)
  if (!context) {
    throw new Error(`${part} must be used within <Field.Root>`)
  }
  return context
}

export interface FieldRootProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Override the generated control id (e.g. to match an external schema). */
  id?: string
  /** Field name — surfaced as a `data-field` hook for the schema renderer. */
  name?: string
  size?: FieldSize
  width?: FieldWidth
  required?: boolean
  /** Field-level validation message; presence drives the error state + aria. */
  error?: string
  /**
   * When set, drives invalid chrome and `aria-invalid` even when `error` is
   * omitted (e.g. row-level error placement suppresses visible error text).
   */
  invalid?: boolean
  /** Overrides the auto-computed `aria-describedby` for the control. */
  describedBy?: string
  /** Helper text shown when there is no error. */
  hint?: string
}

const FieldRoot = React.forwardRef<HTMLDivElement, FieldRootProps>(
  (
    {
      id,
      name,
      size = 'md',
      width = 'full',
      required = false,
      error,
      invalid,
      describedBy: describedByOverride,
      hint,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId()
    const controlId = id ?? generatedId
    const hintId = `${controlId}-hint`
    const errorId = `${controlId}-error`
    const derivedMetaId = `${controlId}-derived-meta`
    const { meta: derivedMeta } = useFieldDerivedMetaContext()
    const hasError = invalid ?? Boolean(error)
    const hasHint = Boolean(hint)
    const hasDerivedMeta = Boolean(derivedMeta?.rows.length)
    const autoDescribedBy = hasError
      ? errorId
      : [hasHint && hintId, hasDerivedMeta && derivedMetaId].filter(Boolean).join(' ') || undefined
    const describedBy = describedByOverride ?? autoDescribedBy

    const value = React.useMemo<FieldContextValue>(
      () => ({
        controlId,
        hintId,
        errorId,
        derivedMetaId,
        hasError,
        hasHint,
        hasDerivedMeta,
        describedBy,
        size,
        required,
        error,
        hint,
      }),
      [
        controlId,
        hintId,
        errorId,
        derivedMetaId,
        hasError,
        hasHint,
        hasDerivedMeta,
        describedBy,
        size,
        required,
        error,
        hint,
      ],
    )

    return (
      <FieldContext.Provider value={value}>
        <div
          ref={ref}
          data-field={name}
          className={cn(
            fieldAnatomyStackVariants({ size }),
            fieldWidthVariants({ width }),
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </FieldContext.Provider>
    )
  },
)
FieldRoot.displayName = 'Field.Root'

export type FieldLabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  /** Inline toggle first-line alignment — typography stays on `fieldLabelVariants`. */
  placement?: FieldLabelPlacement
}

const FieldLabel = React.forwardRef<HTMLLabelElement, FieldLabelProps>(
  ({ className, children, placement, ...props }, ref) => {
    const { controlId, size } = useFieldContext('Field.Label')
    return (
      <label
        ref={ref}
        htmlFor={controlId}
        className={cn(fieldLabelVariants({ size, placement }), className)}
        {...props}
      >
        {children}
      </label>
    )
  },
)
FieldLabel.displayName = 'Field.Label'

export interface FieldControlProps {
  /** A single form control element; id + aria attributes are injected into it. */
  children: React.ReactElement
}

/**
 * Injects the shared id and aria wiring (`aria-describedby`, `aria-invalid`)
 * into its single control child, sourced from `Field.Root` context — so every
 * control gets consistent labelling and error semantics without per-field props.
 */
function FieldControl({ children }: FieldControlProps) {
  const { controlId, describedBy, hasError, required } = useFieldContext('Field.Control')
  const child = React.Children.only(children) as React.ReactElement<Record<string, unknown>>
  return React.cloneElement(child, {
    id: child.props.id ?? controlId,
    'aria-describedby': child.props['aria-describedby'] ?? describedBy,
    'aria-invalid': child.props['aria-invalid'] ?? (hasError || undefined),
    ...resolveControlRequiredProps(child, required),
  })
}
FieldControl.displayName = 'Field.Control'

interface FieldMessageIds {
  hintId: string
  errorId: string
}

interface FieldHintErrorContent {
  hint?: string
  error?: string
}

export function FieldHintText({ id, children }: { id: string; children: string }) {
  return (
    <Text id={id} variant="caption">
      {children}
    </Text>
  )
}

export type FieldErrorTextProps = React.HTMLAttributes<HTMLParagraphElement> & {
  id: string
  size?: FieldSize
  children: React.ReactNode
}

export function FieldErrorText({
  id,
  size = 'md',
  className,
  children,
  ...props
}: FieldErrorTextProps) {
  return (
    <Text
      id={id}
      variant="destructive"
      role="alert"
      aria-live="polite"
      className={cn(fieldErrorTextVariants({ size }), className)}
      {...props}
    >
      {children}
    </Text>
  )
}

/** Hint for below-label placement — hidden while an error is present. */
export function FieldHintBelowLabel({
  hint,
  error,
  hintId,
}: FieldHintErrorContent & Pick<FieldMessageIds, 'hintId'>) {
  if (error || !hint) return null
  return <FieldHintText id={hintId}>{hint}</FieldHintText>
}

/** Hint or error after the control. */
export function FieldHintErrorBelowControl({
  hint,
  error,
  hintId,
  errorId,
  size,
}: FieldHintErrorContent & FieldMessageIds & { size?: FieldSize }) {
  if (error) {
    return (
      <FieldErrorText id={errorId} size={size}>
        {error}
      </FieldErrorText>
    )
  }
  if (hint) return <FieldHintText id={hintId}>{hint}</FieldHintText>
  return null
}

export type FieldHintProps = React.HTMLAttributes<HTMLParagraphElement>

function FieldHint({ className, children, ...props }: FieldHintProps) {
  const { hintId, hasError, hasHint, hint } = useFieldContext('Field.Hint')
  if (hasError || !hasHint) return null
  return (
    <Text id={hintId} variant="caption" className={className} {...props}>
      {children ?? hint}
    </Text>
  )
}
FieldHint.displayName = 'Field.Hint'

export type FieldErrorProps = React.HTMLAttributes<HTMLParagraphElement>

function FieldError({ className, children, ...props }: FieldErrorProps) {
  const { errorId, hasError, error, size } = useFieldContext('Field.Error')
  if (!hasError) return null
  const message = children ?? error
  if (message == null || message === '') return null
  return (
    <FieldErrorText id={errorId} size={size} className={className} {...props}>
      {message}
    </FieldErrorText>
  )
}
FieldError.displayName = 'Field.Error'

function FieldDerivedMetaSlot({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { derivedMetaId } = useFieldContext('Field.DerivedMeta')
  return <FieldDerivedMeta id={derivedMetaId} className={className} {...props} />
}
FieldDerivedMetaSlot.displayName = 'Field.DerivedMeta'

/**
 * Compound field primitive. Compose the parts directly for bespoke layouts, or
 * use the prop-based wrappers (`TextField`, `SelectField`, …) which assemble
 * these same parts. State (`error`, `hint`, `size`, `required`) lives on
 * `Field.Root`; structure (label, control, messages) is expressed as children.
 */
export const Field = {
  Root: FieldRoot,
  Label: FieldLabel,
  Control: FieldControl,
  Hint: FieldHint,
  DerivedMeta: FieldDerivedMetaSlot,
  Error: FieldError,
}

export type { FieldSize }
