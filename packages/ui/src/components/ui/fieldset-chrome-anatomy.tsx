import type { ComponentProps, ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { FieldErrorText, FieldHintBelowLabel, FieldHintText, type FieldSize } from './field.client'
import type { FieldChrome } from './field-chrome.variants'
import { FieldChromeShell } from './field-chrome-shell'
import {
  fieldAnatomyStackVariants,
  fieldSetChromeContainClasses,
  fieldSetResetClasses,
  type FieldHintPosition,
} from './field.variants'

export interface FieldsetChromeAnatomyProps {
  size?: FieldSize
  hintPosition?: FieldHintPosition
  hint?: string
  error?: string
  hintId: string
  errorId: string
  legend: ReactNode
  children: ReactNode
}

export interface FieldsetChromeFrameProps {
  chrome?: FieldChrome
  size?: FieldSize
  error?: string
  errorId: string
  fieldsetProps: ComponentProps<'fieldset'>
  children: ReactNode
}

/**
 * Border/padding for leaf fieldsets live on {@link FieldChromeShell} around a reset
 * `<fieldset>`, so UA `<legend>` cannot sit on the visible container border. Keep
 * `<legend>` a direct fieldset child. Render {@link FieldsetChromeError} via
 * {@link FieldsetChromeFrame}.
 */
export function FieldsetChromeAnatomy({
  hintPosition = 'below-label',
  hint,
  error,
  hintId,
  legend,
  children,
}: Omit<FieldsetChromeAnatomyProps, 'size' | 'errorId'>) {
  const belowLabelHint =
    hintPosition === 'below-label' ? (
      <FieldHintBelowLabel hint={hint} error={error} hintId={hintId} />
    ) : null
  const belowControlHint =
    hintPosition === 'below-control' && hint && !error ? (
      <FieldHintText id={hintId}>{hint}</FieldHintText>
    ) : null

  return (
    <>
      {legend}
      {belowLabelHint}
      {children}
      {belowControlHint}
    </>
  )
}

/** Leaf fieldset + chrome shell; error is a sibling of the fieldset inside the shell. */
export function FieldsetChromeFrame({
  chrome,
  size = 'md',
  error,
  errorId,
  fieldsetProps,
  children,
}: FieldsetChromeFrameProps) {
  const { className: fieldsetClassName, ...restFieldsetProps } = fieldsetProps

  return (
    <FieldChromeShell chrome={chrome} size={size}>
      <fieldset
        {...restFieldsetProps}
        className={cn(
          fieldSetResetClasses,
          fieldSetChromeContainClasses,
          fieldAnatomyStackVariants({ size }),
          fieldsetClassName,
        )}
      >
        {children}
      </fieldset>
      <FieldsetChromeError error={error} errorId={errorId} size={size} />
    </FieldChromeShell>
  )
}

export function FieldsetChromeError({
  error,
  errorId,
  size = 'md',
}: Pick<FieldsetChromeAnatomyProps, 'error' | 'errorId' | 'size'>) {
  if (!error) return null
  return (
    <FieldErrorText id={errorId} size={size}>
      {error}
    </FieldErrorText>
  )
}
