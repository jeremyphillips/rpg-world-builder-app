import type { MatchTier, SearchField, SearchFieldRole } from './types'

const DEFAULT_FIELD_ROLE: SearchFieldRole = 'primary'

const DEFAULT_ROLE_WEIGHT: Record<SearchFieldRole, number> = {
  primary: 1,
  secondary: 1,
  keyword: 1,
}

/** Tier base scores keyed by field role — reproduces legacy @rpg/ui label/alias/keyword/description/group tiers. */
const ROLE_TIER_SCORES: Record<SearchFieldRole, Partial<Record<MatchTier, number>>> = {
  primary: { exact: 100, prefix: 100, substring: 80 },
  keyword: { exact: 70, prefix: 70, substring: 55 },
  secondary: { substring: 10 },
}

function resolveFieldRole(field: SearchField): SearchFieldRole {
  return field.role ?? DEFAULT_FIELD_ROLE
}

function resolveFieldWeight(field: SearchField): number {
  return field.weight ?? DEFAULT_ROLE_WEIGHT[resolveFieldRole(field)]
}

/** Classifies how normalized `text` matches a normalized query string. */
export function classifyMatchTier(text: string, normalizedQuery: string): MatchTier {
  if (!normalizedQuery) return 'none'

  const normalizedText = text.trim().toLowerCase()
  if (!normalizedText) return 'none'
  if (normalizedText === normalizedQuery) return 'exact'
  if (normalizedText.startsWith(normalizedQuery)) return 'prefix'
  if (normalizedText.includes(normalizedQuery)) return 'substring'
  return 'none'
}

/** Scores one field against a match tier. */
export function scoreFieldMatch(field: SearchField, tier: MatchTier): number {
  if (tier === 'none') return 0

  const role = resolveFieldRole(field)
  const roleScores = ROLE_TIER_SCORES[role]
  const baseScore = roleScores[tier] ?? (tier === 'substring' ? undefined : roleScores.substring)
  if (baseScore === undefined) return 0

  return baseScore * resolveFieldWeight(field)
}

/** Returns the highest field score for a document field list. */
export function scoreSearchFields(
  fields: readonly SearchField[],
  normalizedQuery: string,
): { score: number; tier?: MatchTier } {
  if (!normalizedQuery) return { score: 0 }

  let maxScore = 0
  let bestTier: MatchTier | undefined

  for (const field of fields) {
    const text = field.text.trim()
    if (!text) continue

    const tier = classifyMatchTier(text, normalizedQuery)
    if (tier === 'none') continue

    const score = scoreFieldMatch(field, tier)
    if (score > maxScore) {
      maxScore = score
      bestTier = tier
    }
  }

  return { score: maxScore, tier: bestTier }
}
