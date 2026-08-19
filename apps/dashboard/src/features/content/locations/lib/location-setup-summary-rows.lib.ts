import type { SetupSummaryRowModel } from '@/lib/create-setup'

export type LocationSetupSummaryEntry = {
  setId: string
  fieldLabel: string
  valueLabel: string
}

export type LocationSetupSummaryRow = SetupSummaryRowModel

/** Authoring-phase setup summary rows for location create modals. */
export function resolveLocationSetupSummaryRows(
  entries: readonly LocationSetupSummaryEntry[],
): LocationSetupSummaryRow[] {
  return entries.flatMap((entry) =>
    entry.valueLabel.trim()
      ? [
          {
            id: entry.setId,
            label: entry.fieldLabel,
            value: entry.valueLabel,
            editTarget: { type: 'set', id: entry.setId },
          },
        ]
      : [],
  )
}
