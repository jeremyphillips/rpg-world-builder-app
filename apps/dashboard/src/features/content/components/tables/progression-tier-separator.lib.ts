export function formatProgressionTierSeparatorLabel(
  tierName: string,
  suffixTierLabel = true,
): string {
  const trimmed = tierName.trim()
  if (trimmed === '') return ''
  return suffixTierLabel ? `${trimmed} Tier` : trimmed
}
