import { describe, expect, it } from 'vitest'

import {
  CLASS_CHARACTER_REFERENCE,
  ORGANIZATION_CHARACTER_REFERENCE,
  SKILL_PROFICIENCY_CHARACTER_REFERENCE,
  SUBCLASS_CHARACTER_REFERENCE,
} from '@rpg/contracts'

import {
  characterHitToUsageBlocker,
  extractEquipmentIdsFromCharacter,
  extractIdsFromCharacterDescriptor,
  indexFixedRelationshipsByContentId,
  indexSpellRelationshipsByContentId,
  type CharacterContentUsageHit,
} from './characters-extract'
import { indexRecordsByContentId, mergeBlockerIndexes } from './index-by-content-id'

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

describe('viewer character relationship extractors', () => {
  it('indexes fixed class relationships by content id', () => {
    const index = indexFixedRelationshipsByContentId({
      hits: [
        {
          _id: 'char-1',
          name: 'Aric',
          characterType: 'pc',
          classes: [{ classId: 'fighter-id' }],
        },
      ],
      descriptor: CLASS_CHARACTER_REFERENCE,
      kind: 'class',
    })

    expect(index.get('fighter-id')).toEqual([
      { kind: 'class', characterId: 'char-1', characterName: 'Aric' },
    ])
  })

  it('indexes mixed spell relationships by prepared and knows kind', () => {
    const index = indexSpellRelationshipsByContentId([
      {
        _id: 'char-1',
        name: 'Aric',
        characterType: 'pc',
        spells: [{ spellId: 'fireball-id', selection: { prepared: true } }],
      },
      {
        _id: 'char-2',
        name: 'Mira',
        characterType: 'pc',
        spells: [{ spellId: 'fireball-id' }],
      },
    ])

    expect(index.get('fireball-id')).toEqual([
      { kind: 'prepared', characterId: 'char-1', characterName: 'Aric' },
      { kind: 'knows', characterId: 'char-2', characterName: 'Mira' },
    ])
  })
})
