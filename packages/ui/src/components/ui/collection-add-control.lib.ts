/** Shared disabled-state props for collection add controls (array fields, relationship fields). */
export function resolveCollectionAddDisabledProps(
  enabled: boolean,
  disabledReason?: string,
  disabledReasonId?: string,
): {
  disabled?: true
  title?: string
  'aria-disabled'?: true
  'aria-describedby'?: string
} {
  if (enabled) return {}

  return {
    disabled: true,
    title: disabledReason,
    'aria-disabled': true,
    'aria-describedby': disabledReason ? disabledReasonId : undefined,
  }
}
