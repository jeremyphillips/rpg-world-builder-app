'use client'

import { Button, Eyebrow, Text } from '@rpg/ui'

import {
  QUICK_NPC_SETUP_CHANGE_LABEL,
  QUICK_NPC_SETUP_SUMMARY_EYEBROW,
} from '../lib/quick-npc-create-modal-setup.lib'
import {
  quickNpcSetupSummaryCopyVariants,
  quickNpcSetupSummaryVariants,
} from './quick-npc-setup-summary.variants'

export type QuickNpcSetupSummaryProps = {
  summaryLine: string
  onChange: () => void
}

/** Compact setup readout on the authoring phase — canonical character summary line. */
export function QuickNpcSetupSummary({ summaryLine, onChange }: QuickNpcSetupSummaryProps) {
  if (!summaryLine.trim()) return null

  return (
    <div className={quickNpcSetupSummaryVariants()}>
      <div className={quickNpcSetupSummaryCopyVariants()}>
        <Eyebrow size="xs">{QUICK_NPC_SETUP_SUMMARY_EYEBROW}</Eyebrow>
        <Text variant="small">{summaryLine}</Text>
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={onChange}>
        {QUICK_NPC_SETUP_CHANGE_LABEL}
      </Button>
    </div>
  )
}
