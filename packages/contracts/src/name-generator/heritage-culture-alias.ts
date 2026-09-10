// ---------------------------------------------------------------------------
// Heritage naming cultures — species heritage picks that route to their own
// naming culture (and therefore their own pools).
//
// Keyed by species slug: heritage routing is authored against catalog species,
// not campaign-scoped ids.
// ---------------------------------------------------------------------------

export type HeritageNamingCulture = {
  /** Naming culture id — must have `CULTURE_CONVENTION_BINDINGS` entries. */
  id: string
  label: string
  speciesSlug: string
  /** Heritage option ids that resolve to this culture. */
  heritageIds: readonly string[]
  /** Overrides the species language affinity for conventions of this culture. */
  languageIds?: readonly string[]
}

/** One (species, heritage) → culture routing row, derived from the registry. */
export type HeritageCultureAlias = {
  speciesSlug: string
  heritageId: string
  targetCultureId: string
}
