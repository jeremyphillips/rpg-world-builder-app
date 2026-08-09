'use client'

import { Button, Eyebrow, Text } from '@rpg/ui'

import { LOCATION_CREATE_SETUP_CHANGE_LABEL } from '../lib/location-create-setup-chrome.lib'
import {
  locationCreateSetupSummaryCopyVariants,
  locationCreateSetupSummaryVariants,
} from './location-create-setup-summary.variants'

export type LocationCreateSetupSummaryEntry = {
  fieldLabel: string
  valueLabel: string
}

export type LocationCreateSetupSummaryProps = {
  entries: readonly LocationCreateSetupSummaryEntry[]
  onChange: () => void
}

const MULTI_SETUP_EYEBROW = 'Setup' as const

/** Compact setup readout on the details phase — no radios or large cards. */
export function LocationCreateSetupSummary({ entries, onChange }: LocationCreateSetupSummaryProps) {
  if (entries.length === 0) return null

  const isSingle = entries.length === 1
  const eyebrow = isSingle ? entries[0]!.fieldLabel : MULTI_SETUP_EYEBROW
  const value = isSingle
    ? entries[0]!.valueLabel
    : entries.map((entry) => entry.valueLabel).join(' · ')

  return (
    <div className={locationCreateSetupSummaryVariants()}>
      <div className={locationCreateSetupSummaryCopyVariants()}>
        <Eyebrow size="xs">{eyebrow}</Eyebrow>
        <Text variant="small">{value}</Text>
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={onChange}>
        {LOCATION_CREATE_SETUP_CHANGE_LABEL}
      </Button>
    </div>
  )
}
