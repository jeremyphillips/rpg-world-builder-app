import { describe, expect, it } from 'vitest'

import {
  extractEquipmentIdsFromCharacter,
  extractIdsFromCharacterDescriptor,
  type CharacterContentUsageHit,
} from './characters-extract'
import {
  CLASS_CHARACTER_REFERENCE,
  ORGANIZATION_CHARACTER_REFERENCE,
  SKILL_PROFICIENCY_CHARACTER_REFERENCE,
  SUBCLASS_CHARACTER_REFERENCE,
} from '@rpg/contracts'
import { indexRecordsByContentId, mergeBlockerIndexes } from './index-by-content-id'
import { characterHitToUsageBlocker } from './characters-extract'

describe('characters-extract', () => {
  const hit: CharacterContentUsageHit = {
    _id: 'char-1',
    name: 'Aria',
    characterType: 'pc',
    classes: [{ classId: 'class-1', subclassId: 'sc-1' }],
    species: { id: 'species-1' },
    spells: [{ spellId: 'spell-1' }],
    feats: [{ featId: 'feat-1' }],
    equipment: {
      weapons: [{ equipmentId: 'eq-weapon' }],
      gear: [{ equipmentId: 'eq-gear' }],
    },
    connections: {
      organizations: [{ organizationId: 'org-1' }],
    },
    proficiencies: {
      skills: [{ skill: 'athletics' }],
    },
  }

  it('extracts descriptor paths', () => {
    expect(extractIdsFromCharacterDescriptor(hit, CLASS_CHARACTER_REFERENCE)).toEqual(['class-1'])
    expect(extractIdsFromCharacterDescriptor(hit, SUBCLASS_CHARACTER_REFERENCE)).toEqual(['sc-1'])
    expect(extractIdsFromCharacterDescriptor(hit, ORGANIZATION_CHARACTER_REFERENCE)).toEqual([
      'org-1',
    ])
    expect(extractIdsFromCharacterDescriptor(hit, SKILL_PROFICIENCY_CHARACTER_REFERENCE)).toEqual([
      'athletics',
    ])
  })

  it('extracts equipment ids across inventory buckets', () => {
    expect(extractEquipmentIdsFromCharacter(hit)).toEqual(['eq-weapon', 'eq-gear'])
  })
})

describe('index-by-content-id', () => {
  it('indexes and merges blockers by content id', () => {
    const hits: CharacterContentUsageHit[] = [
      {
        _id: 'char-1',
        name: 'Aria',
        characterType: 'pc',
        classes: [{ classId: 'class-1' }],
      },
      {
        _id: 'char-2',
        name: 'Borin',
        characterType: 'npc',
        classes: [{ classId: 'class-1' }, { classId: 'class-2' }],
      },
    ]

    const index = indexRecordsByContentId(
      hits,
      (record) => extractIdsFromCharacterDescriptor(record, CLASS_CHARACTER_REFERENCE),
      (record) => characterHitToUsageBlocker(record, 'camp_1'),
    )

    expect(index.get('class-1')).toHaveLength(2)
    expect(index.get('class-2')).toHaveLength(1)

    const merged = mergeBlockerIndexes([index, index])
    expect(merged.get('class-1')).toHaveLength(2)
  })
})
