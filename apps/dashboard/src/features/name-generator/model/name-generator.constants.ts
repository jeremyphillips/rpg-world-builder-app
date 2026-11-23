import type { NameSubjectKind } from '@rpg/contracts/name-generator'
import { DEFAULT_SYSTEM_RULESET_ID } from '@rpg/contracts'

/** @deprecated Prefer `DEFAULT_SYSTEM_RULESET_ID` from `@rpg/contracts`. */
export const DEFAULT_RULESET_ID = DEFAULT_SYSTEM_RULESET_ID

export const GENERATE_COUNT = 10

export const DEFAULT_FILTERS = {
  subjectKind: 'person',
} as const satisfies { subjectKind: NameSubjectKind }

export const PERSON_GENDER_STYLES = ['masculine', 'feminine', 'neutral', 'shared'] as const

export const SUBJECTS_WITH_SPECIES_FILTER = new Set<NameSubjectKind>(['person'])

export const SUBJECTS_WITH_GENDER_FILTER = new Set<NameSubjectKind>(['person'])

export const SUBJECTS_WITH_LANGUAGE_CULTURE_FILTER = new Set<NameSubjectKind>([
  'person',
  'family',
  'settlement',
  'landmark',
  'clan',
  'faction',
  'organization',
])

export const GENDER_STYLE_LABELS = {
  masculine: 'Masculine',
  feminine: 'Feminine',
  neutral: 'Neutral',
  shared: 'Shared',
  'not-applicable': 'Not applicable',
} as const
