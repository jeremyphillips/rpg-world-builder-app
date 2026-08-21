import type { BuildingFunctionFamily } from '../building-function-family'

export type BuildingArchetypeShardEntry = {
  readonly label: string
  readonly description: string
  readonly functions: readonly [BuildingFunctionFamily, BuildingFunctionFamily?]
  readonly manifestationOf?: string
  readonly aliases?: readonly string[]
  readonly searchTerms?: readonly string[]
  /**
   * Optional curated specialization suggestions (lowercase, normalized).
   * Instance-level refinements only — not cultural manifestations (those use
   * `manifestationOf`) and not conditions/affiliations/quality axes.
   */
  readonly specializationTerms?: readonly string[]
}
