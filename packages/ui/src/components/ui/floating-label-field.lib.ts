/**
 * Caption `text-sm` (0.875rem) over resting `text-md` (0.9375rem).
 * Declared as `--floating-label-scale-md` for engines without typed `calc()` division.
 * A unit test parses both type-scale tokens and fails when this ratio drifts.
 */
export const FLOATING_LABEL_COMFORTABLE_SCALE_RATIO = 0.875 / 0.9375

/** Appends the visible label to select/combobox sizing ghosts. Width stays owned by the slot. */
export function withFloatingLabelSizingLabel(
  label: string,
  sizingLabels: readonly string[],
): string[] {
  return [...sizingLabels, label]
}
