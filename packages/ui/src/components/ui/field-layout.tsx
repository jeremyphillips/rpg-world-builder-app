import type { ReactElement, ReactNode } from 'react'

import { Field } from './field.client'
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
}: FieldLayoutProps) {
  const controlNode = wrapControl ? (
    <Field.Control>{control as ReactElement}</Field.Control>
  ) : (
    control
  )

  if (hintPosition === 'below-label') {
    return (
      <>
        <div className={fieldLabelHintStackClasses}>
          {label}
          <Field.Hint />
        </div>
        {controlNode}
        <Field.Error />
      </>
    )
  }

  return (
    <>
      {label}
      {controlNode}
      <Field.Hint />
      <Field.Error />
    </>
  )
}
