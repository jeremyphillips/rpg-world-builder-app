import type { NameSubjectKind } from '@rpg/contracts/name-generator'

export const DEFAULT_RULESET_ID = 'srd-cc-5.2.1'

export const GENERATE_COUNT = 10

export const DEFAULT_FILTERS = {
  subjectKind: 'person',
} as const satisfies { subjectKind: NameSubjectKind }

export const PERSON_GENDER_STYLES = ['masculine', 'feminine', 'neutral', 'shared'] as const

export const SUBJECTS_WITH_SPECIES_FILTER = new Set<NameSubjectKind>(['person'])

export const SUBJECTS_WITH_GENDER_FILTER = new Set<NameSubjectKind>(['person'])

export const SUBJECTS_WITH_LANGUAGE_CULTURE_FILTER = new Set<NameSubjectKind>([
  'person',
  'settlement',
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
