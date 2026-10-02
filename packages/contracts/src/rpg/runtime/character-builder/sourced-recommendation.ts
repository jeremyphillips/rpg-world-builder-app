export const NPC_RECOMMENDATION_SOURCES = [
  'user',
  'title',
  'organization',
  'template',
  'species',
  'campaign',
] as const

export type NpcRecommendationSource = (typeof NPC_RECOMMENDATION_SOURCES)[number]

/** One recommended id and every source that named it, in merge order. */
export type SourcedRecommendation = {
  id: string
  sources: NpcRecommendationSource[]
}
