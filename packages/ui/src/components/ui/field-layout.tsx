import type { ReactElement, ReactNode } from 'react'

import { Field, type FieldSize } from './field.client'
import type { FieldChrome } from './field-chrome.variants'
import { FieldChromeShell } from './field-chrome-shell'
import { hasActiveFieldChrome } from './field-chrome.variants'
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
}

/**
 * Standard label / hint / control / error ordering for `Field.Root` children.
 * Default hint placement is below the label with a tighter label→hint gap.
 */
export function FieldLayout({
  hintPosition = 'below-label',
  label,
  control,
  wrapControl = true,
  chrome,
  size = 'md',
}: FieldLayoutProps) {
  const controlNode = wrapControl ? (
    <Field.Control>{control as ReactElement}</Field.Control>
  ) : (
    control
  )

  const fieldBody =
    hintPosition === 'below-label' ? (
      <>
        {label ? (
          <div className={fieldLabelHintStackClasses}>
            {label}
            <Field.Hint />
          </div>
        ) : (
          <Field.Hint />
        )}
        {controlNode}
      </>
    ) : (
      <>
        {label}
        {controlNode}
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
