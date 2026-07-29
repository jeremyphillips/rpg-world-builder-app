import { describe, expect, it } from 'vitest'

import {
  buildEquipmentPickerSearchText,
  type Equipment,
  DEFAULT_SYSTEM_RULESET_ID,
} from '@rpg/contracts'
import { matchSearchDocumentQuery, scoreSearchDocument } from '@rpg/search'
import { scoreItem } from '@rpg/ui'

import {
  assembleEquipmentPickerSearchDocument,
  getEquipmentPickerSearchText,
} from './equipment-picker-search.lib'

const rope = {
  id: 'srd-cc-5.2.1:rope',
  slug: 'rope',
  rulesetId: DEFAULT_SYSTEM_RULESET_ID,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Rope',
  kind: 'adventuring_gear',
  gearKind: 'consumable',
  cost: { amount: 1, currency: 'gp' },
  weight: { value: 5, unit: 'lb' },
  description: '<p>Hempen rope, 50 feet.</p>',
} as const satisfies Equipment

describe('equipment-picker-search.lib', () => {
  it('assembles a primary combined field from contracts helpers', () => {
    const document = assembleEquipmentPickerSearchDocument(rope)
    expect(document.id).toBe(rope.id)
    expect(document.fields).toEqual([
      {
        key: 'combined',
        text: buildEquipmentPickerSearchText(rope),
        role: 'primary',
      },
    ])
  })

  it('matches legacy @rpg/ui label scoring for representative queries', () => {
    const document = assembleEquipmentPickerSearchDocument(rope)
    const legacyText = buildEquipmentPickerSearchText(rope)

    for (const query of ['', 'rope', 'adventuring', 'hempen', 'nomatch']) {
      const legacyScore = scoreItem(
        { fields: [{ text: legacyText, weight: 1, role: 'label' }] },
        query,
      )
      const nextScore = scoreSearchDocument(document, query)
      const nextMatch = matchSearchDocumentQuery(document, query)

      expect(nextScore).toBe(legacyScore)
      if (query.trim()) {
        expect(nextMatch.matched).toBe(legacyScore > 0)
      } else {
        expect(nextMatch).toEqual({ matched: true })
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
})
