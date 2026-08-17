import { describe, expect, it } from 'vitest'

import { buildEquipmentPickerSearchText } from '@rpg/contracts'
import { matchSearchDocumentQuery, scoreSearchDocument } from '@rpg/search'
import { scoreItem } from '@rpg/ui'

import { pickEquipment } from '@/test/fixtures/pick'

import {
  assembleEquipmentPickerSearchDocument,
  getEquipmentPickerSearchText,
} from './equipment-picker-search.lib'

const rope = pickEquipment('rope')

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
