import type { ReactElement, ReactNode } from 'react'

import { Field, type FieldSize } from './field.client'
import type { FieldChrome } from './field-chrome.variants'
import { FieldChromeShell } from './field-chrome-shell'
import { hasActiveFieldChrome } from './field-chrome.variants'
import type { FieldControlBand } from './field-control-band.variants'
import { FieldControlRegion, FieldLabelRegion, FieldMessageRegion } from './field-anatomy-regions'
import { resolveFieldPresentation } from './field-row-presentation.lib'
import { fieldLabelHintStackClasses, type FieldHintPosition } from './field.variants'
import { cn } from '../../lib/utils'

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
 * Standard label / control / message ordering for `Field.Root` children.
 *
 * Emits a flat three-region anatomy (`data-field-label-region`,
 * `data-field-control-region`, `data-field-message-region`) so row subgrid can
 * align sibling fields. Pair with `Field.Root` `anatomy` so Root spacing is
 * region-owned (no stack gap).
 *
 * Default hint placement is below the label (inside the label region) with a
 * tighter label→hint gap. Below-control hints and errors live in the message region.
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

  const labelRegionContent =
    hintPosition === 'below-label' ? (
      label ? (
        <div className={fieldLabelHintStackClasses}>
          {label}
          <Field.Hint />
        </div>
      ) : (
        <Field.Hint />
      )
    ) : (
      label
    )

  const regions = (
    <>
      <FieldLabelRegion size={size}>{labelRegionContent}</FieldLabelRegion>
      <FieldControlRegion>{bandedControl}</FieldControlRegion>
      <FieldMessageRegion size={size}>
        <Field.DerivedMeta />
        {hintPosition === 'below-control' ? <Field.Hint /> : null}
        <Field.Error />
      </FieldMessageRegion>
    </>
  )

  if (hasActiveFieldChrome(chrome)) {
    return (
      <FieldChromeShell chrome={chrome} size={size} className={cn('flex flex-col')}>
        {regions}
      </FieldChromeShell>
    )
  }

  return regions
}
