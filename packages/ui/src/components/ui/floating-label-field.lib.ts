/** Appends the visible label to select/combobox sizing ghosts. Width stays owned by the slot. */
export function withFloatingLabelSizingLabel(
  label: string,
  sizingLabels: readonly string[],
): string[] {
  return [...sizingLabels, label]
}
