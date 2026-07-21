import { keysFromEntries } from '../rpg/vocab/enum-schema'
import type { GameTermEntry } from '../rpg/vocab/types'
import { z } from 'zod'

// ---------------------------------------------------------------------------
// Name subject kinds — what entity type a naming convention targets.
// ---------------------------------------------------------------------------

export const NAME_SUBJECT_KIND_TERM = {
  label: 'Name Subject',
  description: 'The entity type a naming convention targets.',
  sentence: {
    singular: 'name subject',
    plural: 'name subjects',
  },
} as const satisfies GameTermEntry

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

export const NAME_SUBJECT_KIND_ENTRIES = {
  person: {
    label: 'Person',
    description: 'Personal names for characters and individuals.',
  },
  settlement: {
    label: 'Settlement',
    description: 'Names for towns, villages, and other settlements.',
  },
  landmark: {
    label: 'Landmark',
    description: 'Names for notable geographic or built landmarks.',
  },
  clan: {
    label: 'Clan',
    description: 'Names for clans, holds, and similar kin groups.',
  },
  family: {
    label: 'Family',
    description: 'Names for family lines and hereditary groups.',
  },
  creature: {
    label: 'Creature',
    description: 'Names for creatures and beasts.',
  },
  faction: {
    label: 'Faction',
    description: 'Names for factions and aligned groups.',
  },
  organization: {
    label: 'Organization',
    description: 'Names for organizations, orders, and institutions.',
  },
} as const satisfies Record<string, GameTermEntry>

export const NAME_SUBJECT_KIND_UI_IDS = keysFromEntries(NAME_SUBJECT_KIND_ENTRIES)
