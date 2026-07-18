import { z } from 'zod'

import { keysFromEntries, vocabEnumFromEntries } from '../rpg/vocab/enum-schema'
import type { GameTermEntry } from '../rpg/vocab/types'

// ---------------------------------------------------------------------------
// Personal name components — optional parts beyond implicit given names.
// ---------------------------------------------------------------------------

export const PERSONAL_NAME_COMPONENT_ENTRIES = {
  family: {
    label: 'Family name',
    description: 'A hereditary surname shared by a family line.',
  },
  clan: {
    label: 'Clan name',
    description: 'A clan or hold name carried alongside the given name.',
  },
  house: {
    label: 'House name',
    description: 'A noble or ancestral house name.',
  },
  virtue: {
    label: 'Virtue name',
    description: 'A chosen virtue or ideal adopted as a personal surname.',
  },
  title: {
    label: 'Title',
    description: 'An honorific or rank used as part of the personal name.',
  },
  epithet: {
    label: 'Epithet',
    description: 'An earned nickname or deed-name appended to the given name.',
  },
} as const satisfies Record<string, GameTermEntry>

export const PERSONAL_NAME_COMPONENTS = keysFromEntries(PERSONAL_NAME_COMPONENT_ENTRIES)

export const personalNameComponentSchema = vocabEnumFromEntries(PERSONAL_NAME_COMPONENT_ENTRIES)

export type PersonalNameComponent = z.infer<typeof personalNameComponentSchema>
