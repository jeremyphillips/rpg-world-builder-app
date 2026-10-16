/** Eligible single recommendation id for inline field quick-add (product rule). */
export function resolveSingleFieldRecommendation(input: {
  recommendedIds: readonly string[]
  selectedIds: readonly string[]
  availableIds: readonly string[]
}): string | undefined {
  const { recommendedIds, selectedIds, availableIds } = input
  if (selectedIds.length > 0) return undefined
  if (recommendedIds.length !== 1) return undefined

  const recommendedId = recommendedIds[0]
  const available = new Set(availableIds)
  if (!available.has(recommendedId)) return undefined
  return recommendedId
}
