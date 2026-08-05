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
  expanded?: boolean
  defaultExpanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
}

export function CollapsibleRadioCardField({
  summaryEyebrow,
  changeLabel,
  expanded: expandedProp,
  defaultExpanded,
  onExpandedChange,
  value,
  options,
  onValueChange,
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

  const handleValueChange = (nextValue: string) => {
    onValueChange?.(nextValue)
    setExpanded(false)
  }

  if (showSummary && selectedOption) {
    return (
      <ChooserSummaryCard
        eyebrow={summaryEyebrow}
        changeLabel={changeLabel}
        title={selectedOption.label}
        description={selectedOption.description}
        onChange={() => setExpanded(true)}
      />
    )
  }

  return (
    <RadioCardField
      {...radioFieldProps}
      value={value}
      options={options}
      onValueChange={handleValueChange}
    />
  )
}
