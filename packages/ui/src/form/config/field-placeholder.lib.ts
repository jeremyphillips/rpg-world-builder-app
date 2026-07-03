const SELECT_PLACEHOLDER_SUFFIX = '…'

/** Default Radix select/combobox placeholder when a field config omits one. */
export function resolveSelectPlaceholder(label: string, placeholder?: string): string {
  return placeholder ?? `Select ${label}${SELECT_PLACEHOLDER_SUFFIX}`
}
