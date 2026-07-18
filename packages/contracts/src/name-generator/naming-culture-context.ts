// ---------------------------------------------------------------------------
// Naming culture context — resolved catalog metadata for convention injection.
// ---------------------------------------------------------------------------

export type NamingCultureContext = {
  cultureId: string
  cultureLabel: string
  languageIds: readonly string[]
}
