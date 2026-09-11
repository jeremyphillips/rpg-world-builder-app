import { cloneElement, isValidElement, type ComponentProps, type ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { FieldErrorText, FieldHintBelowLabel, FieldHintText, type FieldSize } from './field.client'
import type { FieldChrome } from './field-chrome.variants'
import { FieldChromeShell } from './field-chrome-shell'
import {
  fieldAnatomyStackVariants,
  fieldLabelHintStackClasses,
  fieldLabelVariants,
  fieldSetChromeContainClasses,
  fieldSetInFlowLegendClasses,
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

function wrapLegendCluster(
  legend: ReactNode,
  options: {
    size: FieldSize
    belowLabelHint: ReactNode
  },
): ReactNode {
  if (!isValidElement<{ className?: string; children?: ReactNode }>(legend)) {
    return (
      <>
        {legend}
        {options.belowLabelHint}
      </>
    )
  }

  const { className: legendClassName, children: labelContent, ...legendRest } = legend.props

  const labelLine = <div className={fieldLabelVariants({ size: options.size })}>{labelContent}</div>

  const cluster = options.belowLabelHint ? (
    <div className={fieldLabelHintStackClasses}>
      {labelLine}
      {options.belowLabelHint}
    </div>
  ) : (
    labelLine
  )

  return cloneElement(legend, {
    ...legendRest,
    className: cn(fieldSetInFlowLegendClasses, legendClassName),
    children: cluster,
  })
}

/**
 * Border/padding for leaf fieldsets live on {@link FieldChromeShell} around a reset
 * `<fieldset>`, so UA `<legend>` cannot sit on the visible container border. Keep
 * `<legend>` a direct fieldset child. Render {@link FieldsetChromeError} via
 * {@link FieldsetChromeFrame}.
 */
export function FieldsetChromeAnatomy({
  size = 'md',
  hintPosition = 'below-label',
  hint,
  error,
  hintId,
  legend,
  children,
}: Omit<FieldsetChromeAnatomyProps, 'errorId'>) {
  const belowLabelHint =
    hintPosition === 'below-label' && hint ? (
      <FieldHintBelowLabel hint={hint} hintId={hintId} />
    ) : null
  const belowControlHint =
    hintPosition === 'below-control' && hint && !error ? (
      <FieldHintText id={hintId}>{hint}</FieldHintText>
    ) : null

  return (
    <>
      {wrapLegendCluster(legend, { size, belowLabelHint })}
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
  const anatomyStack = fieldAnatomyStackVariants({ size })

  return (
    <FieldChromeShell chrome={chrome} size={size} className={anatomyStack}>
      <fieldset
        {...restFieldsetProps}
        className={cn(
          fieldSetResetClasses,
          fieldSetChromeContainClasses,
          anatomyStack,
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
