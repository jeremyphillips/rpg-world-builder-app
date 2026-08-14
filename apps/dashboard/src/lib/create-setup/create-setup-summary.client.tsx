'use client'

import { Button, Eyebrow, Text } from '@rpg/ui'

import { CREATE_SETUP_DEFAULT_CHANGE_LABEL } from './create-setup.constants'
import {
  createSetupSummaryCopyVariants,
  createSetupSummaryVariants,
} from './create-setup-summary.variants'

export type CreateSetupSummaryProps = {
  eyebrow: string
  summary: string
  changeLabel?: string
  onChange: () => void
}

/** Domain-neutral compact setup readout. Consumers own all summary formatting. */
export function CreateSetupSummary({
  eyebrow,
  summary,
  changeLabel = CREATE_SETUP_DEFAULT_CHANGE_LABEL,
  onChange,
}: CreateSetupSummaryProps) {
  if (!summary.trim()) return null

  return (
    <div className={createSetupSummaryVariants()}>
      <div className={createSetupSummaryCopyVariants()}>
        <Eyebrow size="xs">{eyebrow}</Eyebrow>
        <Text variant="small">{summary}</Text>
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={onChange}>
        {changeLabel}
      </Button>
    </div>
  )
}
