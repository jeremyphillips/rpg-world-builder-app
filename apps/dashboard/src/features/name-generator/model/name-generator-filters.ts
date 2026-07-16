import type { GeneratedName, NameGenderStyle, NameSubjectKind } from '@rpg/contracts/name-generator'
import type { LanguageId } from '@rpg/contracts'

export type NameGeneratorFilters = {
  subjectKind: NameSubjectKind
  speciesId?: string
  languageId?: LanguageId
  cultureId?: string
  genderStyle?: NameGenderStyle
}

export type NameGeneratorPageError =
  | { kind: 'collection-load'; title: string; description: string }
  | { kind: 'invalid-collection'; title: string; description: string }
  | { kind: 'generation'; title: string; description: string }
  | { kind: 'no-matches'; title: string; description: string }

export type NameGeneratorStatus = 'idle' | 'loading' | 'success' | 'error'

export type NameGeneratorViewState = {
  filters: NameGeneratorFilters
  seed?: string
  results: GeneratedName[]
  status: NameGeneratorStatus
  error?: NameGeneratorPageError
  partialCount?: { generated: number; requested: number }
}

export type FilterOption = {
  id: string
  label: string
}

export type NameGeneratorFilterOptions = {
  subjectKinds: FilterOption[]
  speciesIds: FilterOption[]
  languageIds: FilterOption[]
  cultureIds: FilterOption[]
  genderStyles: FilterOption[]
}

export type NameGeneratorVisibleFilters = {
  species: boolean
  language: boolean
  culture: boolean
  genderStyle: boolean
}

export type NameGeneratorResultsSummary = {
  title: string
  subtitle?: string
  tone?: 'default' | 'warning'
}
