import { z } from 'zod'

// ---------------------------------------------------------------------------
// Name subject kinds — what entity type a naming convention targets.
// ---------------------------------------------------------------------------

export const NAME_SUBJECT_KINDS = [
  'person',
  'creature',
  'settlement',
  'region',
  'landmark',
  'organization',
  'faction',
  'family',
  'clan',
  'deity',
  'ship',
  'item',
  'title',
  'event',
] as const

export const nameSubjectKindSchema = z.enum(NAME_SUBJECT_KINDS)

export type NameSubjectKind = z.infer<typeof nameSubjectKindSchema>
