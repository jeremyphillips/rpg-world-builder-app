'use client'

import * as React from 'react'

import {
  resolveDefaultChooserExpanded,
  shouldShowChooserSummary,
} from '../../lib/collapsed-chooser.lib'
import { ChooserSummaryCard } from './chooser-summary-card'
import { RadioCardField, type RadioCardFieldProps } from './radio-card-field'

export type CollapsibleRadioCardFieldProps = RadioCardFieldProps & {
  summaryEyebrow: string
  changeLabel: string
  /**
   * Collapsed summary description. `undefined` uses the selected option description;
   * `false` omits it; a string overrides.
   */
  summaryDescription?: string | false
  /** When true (default), selecting a value collapses to the summary. */
  collapseAfterSelect?: boolean
  expanded?: boolean
  defaultExpanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
}

export function CollapsibleRadioCardField({
  summaryEyebrow,
  changeLabel,
  summaryDescription,
  collapseAfterSelect = true,
  expanded: expandedProp,
  defaultExpanded,
  onExpandedChange,
  value,
  options,
  onValueChange,
  density,
  ...radioFieldProps
}: CollapsibleRadioCardFieldProps) {
  const [uncontrolledExpanded, setUncontrolledExpanded] = React.useState(
    () => defaultExpanded ?? resolveDefaultChooserExpanded(value),
  )

  const expanded = expandedProp ?? uncontrolledExpanded

  const setExpanded = React.useCallback(
    (nextExpanded: boolean) => {
      onExpandedChange?.(nextExpanded)
      if (expandedProp === undefined) {
        setUncontrolledExpanded(nextExpanded)
      }
    },
    [expandedProp, onExpandedChange],
  )

  const selectedOption = React.useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  )

  const showSummary = shouldShowChooserSummary({ value, expanded }) && selectedOption

  const resolvedSummaryDescription =
    summaryDescription === false
      ? undefined
      : summaryDescription !== undefined
        ? summaryDescription
        : selectedOption?.description

  const handleValueChange = (nextValue: string) => {
    if (nextValue === value) {
      if (expanded) {
        setExpanded(false)
      }
      return
    }
    onValueChange?.(nextValue)
    if (collapseAfterSelect) {
      setExpanded(false)
    }
  }

  if (showSummary && selectedOption) {
    return (
      <ChooserSummaryCard
        density={density}
        eyebrow={summaryEyebrow}
        changeLabel={changeLabel}
        title={selectedOption.label}
        description={resolvedSummaryDescription}
        onChange={() => setExpanded(true)}
      />
    )
  }

  return (
    <RadioCardField
      {...radioFieldProps}
      density={density}
      value={value}
      options={options}
      onValueChange={handleValueChange}
    />
  )
}
