'use client'

import type { ReactElement, ReactNode } from 'react'

import type { FieldLabelVisibility } from '../../form/form-heading.lib'
import { Field, type FieldSize } from './field.client'
import type { FieldChrome } from './field-chrome.variants'
import { FieldChromeShell } from './field-chrome-shell'
import { hasActiveFieldChrome } from './field-chrome.variants'
import type { FieldControlBand } from './field-control-band.variants'
import { FieldControlRegion, FieldLabelRegion, FieldMessageRegion } from './field-anatomy-regions'
import { resolveFieldPresentation } from './field-row-presentation.lib'
import type { FieldHintPosition } from './field.variants'
import { cn } from '../../lib/utils'
import { FieldLayoutLabelRegionContent } from './field-layout-label-region.client'
import { useOwnedLabelVisibility } from './owned-label-visibility.lib'
import { resolveFieldLayoutRecommendation } from './field-recommendation.lib'
import type { FieldLayoutRecommendation } from './field-recommendation.types'

export interface FieldLayoutProps {
  hintPosition?: FieldHintPosition
  label: ReactNode
  recommendation?: FieldLayoutRecommendation | null
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
  /**
   * Explicit override for the owned label. Omitted values read `Field.Root`.
   * Do not default this to `'visible'` — that would shadow the root.
   */
  labelVisibility?: FieldLabelVisibility
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
  recommendation,
  control,
  wrapControl = true,
  chrome,
  size = 'md',
  controlBand = 'single-line',
  labelVisibility,
}: FieldLayoutProps) {
  const visibility = useOwnedLabelVisibility(labelVisibility)
  const resolvedRecommendation = resolveFieldLayoutRecommendation(hintPosition, recommendation)
  const showVisibleLabel = Boolean(label) && visibility !== 'srOnly'
  const accessibleLabel = visibility === 'srOnly' ? label : null
  const presentation = resolveFieldPresentation({
    size,
    labelLayout: showVisibleLabel ? 'stacked' : 'hidden',
    controlBand,
  })

  const controlNode = wrapControl ? (
    <Field.Control>{control as ReactElement}</Field.Control>
  ) : (
    control
  )

  const bandedControl = (
    <div className={presentation.controlBandClassName}>
      {accessibleLabel}
      {controlNode}
    </div>
  )

  const regions = (
    <>
      <FieldLabelRegion size={size}>
        <FieldLayoutLabelRegionContent
          hintPosition={hintPosition}
          showVisibleLabel={showVisibleLabel}
          label={showVisibleLabel ? label : null}
          recommendation={resolvedRecommendation}
        />
      </FieldLabelRegion>
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
