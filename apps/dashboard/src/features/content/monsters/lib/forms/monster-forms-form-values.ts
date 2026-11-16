import type { CreatureFormsDraft } from '@rpg/contracts'

import { createMonsterRowId } from '../monster-row-id'

export type MonsterFormsDraft = CreatureFormsDraft
export type MonsterAlternateFormDraft = MonsterFormsDraft['alternates'][number]

export function makeEmptyMonsterForms(): MonsterFormsDraft {
  return {
    trueForm: { id: createMonsterRowId(), name: '' },
    alternates: [],
  }
}

export function makeEmptyMonsterAlternateForm(): MonsterAlternateFormDraft {
  return {
    id: createMonsterRowId(),
    name: '',
    overrides: {},
  }
}
