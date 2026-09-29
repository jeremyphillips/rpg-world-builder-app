import { cloneElement, isValidElement, type ComponentProps, type ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { FieldMessageRegion } from './field-anatomy-regions'
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
  hint?: string
  hintPosition?: FieldHintPosition
  hintId?: string
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
  const isSrOnly =
    typeof legendClassName === 'string' &&
    legendClassName.split(/\s+/).some((token) => token === 'sr-only')

  if (isSrOnly) {
    return (
      <>
        {cloneElement(legend, {
          ...legendRest,
          className: cn('sr-only', legendClassName),
          children: labelContent,
        })}
        {options.belowLabelHint}
      </>
    )
  }

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
  hintId,
  legend,
  children,
}: Omit<FieldsetChromeAnatomyProps, 'errorId' | 'error'>) {
  const belowLabelHint =
    hintPosition === 'below-label' && hint ? (
      <FieldHintBelowLabel hint={hint} hintId={hintId} />
    ) : null
  return (
    <>
      {wrapLegendCluster(legend, { size, belowLabelHint })}
      {children}
    </>
  )
}

function FieldsetBelowControlHint({
  hint,
  hintId,
  hintPosition = 'below-label',
  error,
  size = 'md',
}: Pick<FieldsetChromeFrameProps, 'hint' | 'hintId' | 'hintPosition' | 'error' | 'size'>) {
  if (hintPosition !== 'below-control' || !hint || !hintId || error) return null

  return (
    <FieldMessageRegion size={size}>
      <FieldHintText id={hintId}>{hint}</FieldHintText>
    </FieldMessageRegion>
  )
}

/** Leaf fieldset + chrome shell; error is a sibling of the fieldset inside the shell. */
export function FieldsetChromeFrame({
  chrome,
  size = 'md',
  hint,
  hintPosition,
  hintId,
  error,
  errorId,
  fieldsetProps,
  children,
}: FieldsetChromeFrameProps) {
  const { className: fieldsetClassName, ...restFieldsetProps } = fieldsetProps
  const anatomyStack = fieldAnatomyStackVariants({ size })

  return (
    <FieldChromeShell chrome={chrome} size={size} className={anatomyStack}>
      <div className="flex min-w-0 flex-col">
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
        <FieldsetBelowControlHint
          hint={hint}
          hintId={hintId}
          hintPosition={hintPosition}
          error={error}
          size={size}
        />
      </div>
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
