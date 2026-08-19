export type LocationSetupSummaryRow = {
  label: string
  value: string
}

/** Authoring-phase setup summary rows for location create modals. */
export function resolveLocationSetupSummaryRows(
  entries: readonly { fieldLabel: string; valueLabel: string }[],
): LocationSetupSummaryRow[] {
  return entries.flatMap((entry) =>
    entry.valueLabel.trim() ? [{ label: entry.fieldLabel, value: entry.valueLabel }] : [],
  )
}
