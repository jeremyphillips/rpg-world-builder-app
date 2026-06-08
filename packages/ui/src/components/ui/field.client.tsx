'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import {
  fieldWidthVariants,
  type FieldControlVariantProps,
  type FieldWidth,
} from './field-control.variants'

type FieldSize = NonNullable<FieldControlVariantProps['size']>

interface FieldContextValue {
  controlId: string
  hintId: string
  errorId: string
  hasError: boolean
  hasHint: boolean
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
    const hasError = Boolean(error)
    const hasHint = Boolean(hint)
    const describedBy = hasError ? errorId : hasHint ? hintId : undefined

    const value = React.useMemo<FieldContextValue>(
      () => ({
        controlId,
        hintId,
        errorId,
        hasError,
        hasHint,
        describedBy,
        size,
        required,
        error,
        hint,
      }),
      [controlId, hintId, errorId, hasError, hasHint, describedBy, size, required, error, hint],
    )

    return (
      <FieldContext.Provider value={value}>
        <div
          ref={ref}
          data-field={name}
          className={cn('space-y-2', fieldWidthVariants({ width }), className)}
          {...props}
        >
          {children}
        </div>
      </FieldContext.Provider>
    )
  },
)
FieldRoot.displayName = 'Field.Root'

const labelSizeClasses: Record<FieldSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}

export type FieldLabelProps = React.LabelHTMLAttributes<HTMLLabelElement>

const FieldLabel = React.forwardRef<HTMLLabelElement, FieldLabelProps>(
  ({ className, children, ...props }, ref) => {
    const { controlId, size, required } = useFieldContext('Field.Label')
    return (
      <label
        ref={ref}
        htmlFor={controlId}
        className={cn(
          'flex items-center gap-1.5 font-medium leading-none',
          labelSizeClasses[size],
          className,
        )}
        {...props}
      >
        {children}
        {required ? (
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        ) : null}
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
  const { controlId, describedBy, hasError } = useFieldContext('Field.Control')
  const child = React.Children.only(children) as React.ReactElement<Record<string, unknown>>
  return React.cloneElement(child, {
    id: child.props.id ?? controlId,
    'aria-describedby': child.props['aria-describedby'] ?? describedBy,
    'aria-invalid': child.props['aria-invalid'] ?? (hasError || undefined),
  })
}
FieldControl.displayName = 'Field.Control'

export type FieldHintProps = React.HTMLAttributes<HTMLParagraphElement>

function FieldHint({ className, children, ...props }: FieldHintProps) {
  const { hintId, hasError, hasHint, hint } = useFieldContext('Field.Hint')
  if (hasError || !hasHint) return null
  return (
    <p id={hintId} className={cn('text-sm text-muted-foreground', className)} {...props}>
      {children ?? hint}
    </p>
  )
}
FieldHint.displayName = 'Field.Hint'

export type FieldErrorProps = React.HTMLAttributes<HTMLParagraphElement>

function FieldError({ className, children, ...props }: FieldErrorProps) {
  const { errorId, hasError, error } = useFieldContext('Field.Error')
  if (!hasError) return null
  return (
    <p
      id={errorId}
      role="alert"
      aria-live="polite"
      className={cn('text-sm text-destructive', className)}
      {...props}
    >
      {children ?? error}
    </p>
  )
}
FieldError.displayName = 'Field.Error'

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
  Error: FieldError,
}

export type { FieldSize }
