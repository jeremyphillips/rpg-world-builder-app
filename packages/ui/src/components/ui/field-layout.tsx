import type { ReactElement, ReactNode } from 'react'

import { Field, type FieldSize } from './field.client'
import type { FieldChrome } from './field-chrome.variants'
import { FieldChromeShell } from './field-chrome-shell'
import { hasActiveFieldChrome } from './field-chrome.variants'
import type { FieldControlBand } from './field-control-band.variants'
import { resolveFieldPresentation } from './field-row-presentation.lib'
import { fieldLabelHintStackClasses, type FieldHintPosition } from './field.variants'

export interface FieldLayoutProps {
  hintPosition?: FieldHintPosition
  label: ReactNode
  control: ReactElement | ReactNode
  /**
   * When false, `control` is rendered as-is (e.g. Select with an internal
   * `Field.Control`, or a grouped shell that wires aria manually). Default true.
   */
  wrapControl?: boolean
  chrome?: FieldChrome
  size?: FieldSize
  /** Default `single-line`. Use `content-sized` for multiline / compound shells. */
  controlBand?: FieldControlBand
}

/**
 * Standard label / hint / control / error ordering for `Field.Root` children.
 * Default hint placement is below the label with a tighter label→hint gap.
 *
 * Alignment anchor (`data-field-align`) wraps label + control band so row
 * `items-end` aligns control edges; `Field.Error` and below-control hints stay outside.
 */
export function FieldLayout({
  hintPosition = 'below-label',
  label,
  control,
  wrapControl = true,
  chrome,
  size = 'md',
  controlBand = 'single-line',
}: FieldLayoutProps) {
  const presentation = resolveFieldPresentation({
    size,
    labelLayout: label ? 'stacked' : 'hidden',
    controlBand,
  })

  const controlNode = wrapControl ? (
    <Field.Control>{control as ReactElement}</Field.Control>
  ) : (
    control
  )

  const bandedControl = <div className={presentation.controlBandClassName}>{controlNode}</div>

  const fieldBody =
    hintPosition === 'below-label' ? (
      <div data-field-align="" className={presentation.alignmentAnchorClassName}>
        {label ? (
          <div className={fieldLabelHintStackClasses}>
            {label}
            <Field.Hint />
          </div>
        ) : (
          <Field.Hint />
        )}
        {bandedControl}
      </div>
    ) : (
      <>
        <div data-field-align="" className={presentation.alignmentAnchorClassName}>
          {label}
          {bandedControl}
        </div>
        <Field.Hint />
      </>
    )

  const chromedBody = hasActiveFieldChrome(chrome) ? (
    <FieldChromeShell chrome={chrome} size={size}>
      {fieldBody}
    </FieldChromeShell>
  ) : (
    fieldBody
  )

  return (
    <>
      {chromedBody}
      <Field.Error />
    </>
  )
}
