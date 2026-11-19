import type { CreatureFormsDraft } from '@rpg/contracts'

import { createMonsterRowId } from '../monster-row-id'

export type MonsterFormsDraft = CreatureFormsDraft
export type MonsterDefinedFormDraft = MonsterFormsDraft['definedForms'][number]

export function makeEmptyMonsterForms(): MonsterFormsDraft {
  return {
    profileFormId: createMonsterRowId(),
    trueForm: { kind: 'profile' },
    definedForms: [],
  }
}

export function makeEmptyMonsterDefinedForm(): MonsterDefinedFormDraft {
  return {
    id: createMonsterRowId(),
    name: '',
    overrides: {},
  }
}
