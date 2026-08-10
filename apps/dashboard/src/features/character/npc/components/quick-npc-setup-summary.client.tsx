'use client'

import { Button, Eyebrow, Text } from '@rpg/ui'

import {
  quickNpcSetupSummaryCopyVariants,
  quickNpcSetupSummaryVariants,
} from './quick-npc-setup-summary.variants'
import { QUICK_NPC_SETUP_CHANGE_LABEL } from '../lib/quick-npc-create-modal-setup.lib'

export type QuickNpcSetupSummaryEntry = {
  fieldLabel: string
  valueLabel: string
}

export type QuickNpcSetupSummaryProps = {
  entries: readonly QuickNpcSetupSummaryEntry[]
  onChange: () => void
}

const MULTI_SETUP_EYEBROW = 'Setup' as const

/** Compact setup readout on the authoring phase — no radios or large cards. */
export function QuickNpcSetupSummary({ entries, onChange }: QuickNpcSetupSummaryProps) {
  if (entries.length === 0) return null

  const isSingle = entries.length === 1
  const eyebrow = isSingle ? entries[0]!.fieldLabel : MULTI_SETUP_EYEBROW
  const value = isSingle
    ? entries[0]!.valueLabel
    : entries.map((entry) => entry.valueLabel).join(' · ')

  return (
    <div className={quickNpcSetupSummaryVariants()}>
      <div className={quickNpcSetupSummaryCopyVariants()}>
        <Eyebrow size="xs">{eyebrow}</Eyebrow>
        <Text variant="small">{value}</Text>
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={onChange}>
        {QUICK_NPC_SETUP_CHANGE_LABEL}
      </Button>
    </div>
  )
}
