import { foldAlphanumeric, foldSeparators, MIN_FOLDED_QUERY_LENGTH } from './normalize'
import type {
  MatchKind,
  MatchTier,
  NormalizedSearchQuery,
  SearchField,
  SearchFieldRole,
} from './types'

const DEFAULT_FIELD_ROLE: SearchFieldRole = 'primary'

const DEFAULT_ROLE_WEIGHT: Record<SearchFieldRole, number> = {
  primary: 1,
  secondary: 1,
  keyword: 1,
}

/** Tier base scores keyed by field role — reproduces legacy @rpg/ui label/alias/keyword/description/group tiers. */
const LITERAL_ROLE_TIER_SCORES: Record<SearchFieldRole, Partial<Record<MatchTier, number>>> = {
  primary: { exact: 100, prefix: 100, substring: 80 },
  keyword: { exact: 70, prefix: 70, substring: 55 },
  secondary: { substring: 10 },
}

/** Lower base scores for folded matches so literal hits rank higher. */
const FOLDED_ROLE_TIER_SCORES: Record<SearchFieldRole, Partial<Record<MatchTier, number>>> = {
  primary: { exact: 85, prefix: 85, substring: 65 },
  keyword: { exact: 60, prefix: 60, substring: 45 },
  secondary: { substring: 8 },
}

function resolveFieldRole(field: SearchField): SearchFieldRole {
  return field.role ?? DEFAULT_FIELD_ROLE
}

function resolveFieldWeight(field: SearchField): number {
  return field.weight ?? DEFAULT_ROLE_WEIGHT[resolveFieldRole(field)]
}

function roleTierScores(
  kind: MatchKind,
): Record<SearchFieldRole, Partial<Record<MatchTier, number>>> {
  return kind === 'folded' ? FOLDED_ROLE_TIER_SCORES : LITERAL_ROLE_TIER_SCORES
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
export function scoreFieldMatch(
  field: SearchField,
  tier: MatchTier,
  kind: MatchKind = 'literal',
): number {
  if (tier === 'none') return 0

  const role = resolveFieldRole(field)
  const roleScores = roleTierScores(kind)[role]
  const baseScore = roleScores[tier] ?? (tier === 'substring' ? undefined : roleScores.substring)
  if (baseScore === undefined) return 0

  return baseScore * resolveFieldWeight(field)
}

function scoreFieldAgainstQuery(
  field: SearchField,
  normalizedQuery: string,
  kind: MatchKind,
  normalizeFieldText: (text: string) => string,
): { score: number; tier?: MatchTier } {
  const text = field.text.trim()
  if (!text) return { score: 0 }

  const compareText = kind === 'literal' ? text.trim().toLowerCase() : normalizeFieldText(text)
  if (!compareText) return { score: 0 }

  const tier = classifyMatchTier(compareText, normalizedQuery)
  if (tier === 'none') return { score: 0 }

  return { score: scoreFieldMatch(field, tier, kind), tier }
}

function scoreFieldsWithKind(
  fields: readonly SearchField[],
  normalizedQuery: string,
  kind: MatchKind,
  normalizeFieldText: (text: string) => string,
): { score: number; tier?: MatchTier } {
  if (!normalizedQuery) return { score: 0 }

  let maxScore = 0
  let bestTier: MatchTier | undefined

  for (const field of fields) {
    const result = scoreFieldAgainstQuery(field, normalizedQuery, kind, normalizeFieldText)
    if (result.score > maxScore) {
      maxScore = result.score
      bestTier = result.tier
    }
  }

  return { score: maxScore, tier: bestTier }
}

/** Returns the highest field score for a document field list. */
export function scoreSearchFields(
  fields: readonly SearchField[],
  query: NormalizedSearchQuery,
): { score: number; tier?: MatchTier } {
  if (query.profile === 'alphanumeric') {
    if (!query.folded) return { score: 0 }
    return scoreFieldsWithKind(fields, query.folded, 'folded', foldAlphanumeric)
  }

  const literal = scoreFieldsWithKind(fields, query.text, 'literal', (text) =>
    text.trim().toLowerCase(),
  )
  if (literal.score > 0 || !query.folded || query.folded.length < MIN_FOLDED_QUERY_LENGTH) {
    return literal
  }

  return scoreFieldsWithKind(fields, query.folded, 'folded', foldSeparators)
}
