import {
  buildEquipmentPickerSearchText,
  getEquipmentSearchKindLabel,
  type Equipment,
} from '@rpg/contracts'
import { scoreSearchDocument } from '@rpg/search'
import { describe, expect, it } from 'vitest'

import { makeEquipment } from '@/test/fixtures/factories/equipment'
import { pickEquipment } from '@/test/fixtures/pick'

import {
  assembleEquipmentPickerSearchDocument,
  getEquipmentPickerSearchText,
} from './equipment-picker-search.lib'

const rope = pickEquipment('rope')
const chainMail = pickEquipment('chain-mail')

const inclusionQueries = [
  '',
  '   ',
  'ROPE',
  'rope',
  'chain mail',
  'chain-mail',
  'chainmail',
  'CHAIN-MAIL',
  rope.slug,
  chainMail.slug,
  `${chainMail.name} ${getEquipmentSearchKindLabel(chainMail)}`,
  'nomatchxyz',
]

function legacyCombinedScore(equipment: Equipment, query: string): number {
  return scoreSearchDocument(
    {
      id: equipment.id,
      fields: [
        { key: 'combined', text: buildEquipmentPickerSearchText(equipment), role: 'primary' },
      ],
    },
    query,
    { profile: 'literal' },
  )
}

function nextScore(equipment: Equipment, query: string): number {
  return scoreSearchDocument(assembleEquipmentPickerSearchDocument(equipment), query, {
    profile: 'forgiving',
  })
}

describe('equipment-picker-search.lib', () => {
  it('splits fields by role and keeps the slug inside combined only', () => {
    const document = assembleEquipmentPickerSearchDocument(rope)

    expect(document.id).toBe(rope.id)
    expect(document.fields.find((field) => field.key === 'name')).toMatchObject({
      text: rope.name,
      role: 'primary',
    })
    expect(document.fields.find((field) => field.key === 'kind')?.role).toBe('keyword')
    expect(
      document.fields
        .filter((field) => field.key.startsWith('tag:'))
        .every((field) => field.role === 'keyword'),
    ).toBe(true)
    expect(document.fields.find((field) => field.key === 'combined')).toMatchObject({
      text: buildEquipmentPickerSearchText(rope),
      role: 'secondary',
    })
    expect(document.fields.some((field) => field.key === 'slug')).toBe(false)
    expect(
      document.fields.filter((field) => field.role === 'keyword').map((field) => field.text),
    ).not.toContain(rope.slug)
  })

  it('keeps every literal combined-field match', () => {
    for (const equipment of [rope, chainMail]) {
      for (const query of inclusionQueries) {
        const legacy = legacyCombinedScore(equipment, query)
        if (legacy > 0) {
          expect(
            nextScore(equipment, query),
            `${equipment.name} / ${JSON.stringify(query)}`,
          ).toBeGreaterThan(0)
        }
      }
    }
  })

  it('derives plain search text from an enriched item', () => {
    const document = assembleEquipmentPickerSearchDocument(rope)
    expect(
      getEquipmentPickerSearchText({
        equipment: rope,
        searchDocument: document,
        state: {} as never,
      }),
    ).toBe(buildEquipmentPickerSearchText(rope))
  })

  it('ranks a literal name substring above a keyword substring and a description-only hit', () => {
    const nameHit = makeEquipment({
      kind: 'adventuring_gear',
      slug: 'glassember-rope',
      name: 'Glassember Rope',
      description: '<p>Hemp.</p>',
    })
    const keywordHit = makeEquipment({
      kind: 'adventuring_gear',
      slug: 'plain-rope',
      name: 'Plain Rope',
      description: '<p>Hemp.</p>',
      tags: ['glassember'],
    })
    const descriptionHit = makeEquipment({
      kind: 'adventuring_gear',
      slug: 'other-rope',
      name: 'Other Rope',
      description: '<p>The glassember coil.</p>',
    })

    const query = 'ember'
    expect(nextScore(nameHit, query)).toBeGreaterThan(nextScore(keywordHit, query))
    expect(nextScore(keywordHit, query)).toBeGreaterThan(nextScore(descriptionHit, query))
  })

  it('ranks a literal name prefix above a keyword exact match', () => {
    const nameHit = makeEquipment({
      kind: 'adventuring_gear',
      slug: 'ember-coil',
      name: 'Ember Coil',
      description: '<p>Hemp.</p>',
    })
    const keywordHit = makeEquipment({
      kind: 'adventuring_gear',
      slug: 'plain-coil',
      name: 'Plain Coil',
      description: '<p>Hemp.</p>',
      tags: ['ember'],
    })

    expect(nextScore(nameHit, 'ember')).toBeGreaterThan(nextScore(keywordHit, 'ember'))
  })

  it('matches separator-insensitive names and lets a literal keyword exact beat a folded name substring', () => {
    expect(nextScore(chainMail, 'chainmail')).toBeGreaterThan(0)

    const literalName = makeEquipment({
      kind: 'armor',
      slug: 'chainmail-hauberk',
      name: 'Chainmail Hauberk',
      description: '<p>Links.</p>',
    })
    const foldedName = makeEquipment({
      kind: 'armor',
      slug: 'folded-mail',
      name: 'A Chain Mail Relic',
      description: '<p>Links.</p>',
    })
    const keywordExact = makeEquipment({
      kind: 'adventuring_gear',
      slug: 'mail-tag',
      name: 'Plain Kit',
      description: '<p>Links.</p>',
      tags: ['chainmail'],
    })

    expect(nextScore(literalName, 'chainmail')).toBeGreaterThan(nextScore(foldedName, 'chainmail'))
    expect(nextScore(keywordExact, 'chainmail')).toBeGreaterThan(nextScore(foldedName, 'chainmail'))
  })
})
