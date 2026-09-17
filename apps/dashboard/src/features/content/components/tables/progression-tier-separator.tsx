import { TableCell, TableRow } from '@rpg/ui'

import {
  progressionTierSeparatorGridBandClasses,
  progressionTierSeparatorLabelVariants,
} from './progression-tier-separator.variants'

export type ProgressionTierSeparatorProps = {
  tierName: string
  /** Appends " Tier" when true (class detail convention). Default true. */
  suffixTierLabel?: boolean
  /** `preview` matches class progression; `values` is the subtle values-grid band. */
  variant: 'preview' | 'values'
}

export function formatProgressionTierSeparatorLabel(
  tierName: string,
  suffixTierLabel = true,
): string {
  const trimmed = tierName.trim()
  if (trimmed === '') return ''
  return suffixTierLabel ? `${trimmed} Tier` : trimmed
}

export type ProgressionTierSeparatorTableRowProps = {
  colSpan: number
  label: string
  variant?: 'preview' | 'values'
}

export function ProgressionTierSeparatorTableRow({
  colSpan,
  label,
  variant = 'preview',
}: ProgressionTierSeparatorTableRowProps) {
  if (label.trim() === '') return null

  return (
    <TableRow>
      <TableCell colSpan={colSpan} className={progressionTierSeparatorLabelVariants({ variant })}>
        {label}
      </TableCell>
    </TableRow>
  )
}

export type ProgressionTierSeparatorGridBandProps = {
  tierName: string
}

export function ProgressionTierSeparatorGridBand({
  tierName,
}: ProgressionTierSeparatorGridBandProps) {
  const label = formatProgressionTierSeparatorLabel(tierName, false)
  if (label === '') return null

  return (
    <div className={progressionTierSeparatorGridBandClasses} style={{ gridColumn: '1 / -1' }}>
      {label}
    </div>
  )
}
