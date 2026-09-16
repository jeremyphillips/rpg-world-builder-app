import { describe, expect, it } from 'vitest'

import { normalizeArrayItemContent } from './array-item-content-normalizer.lib'

describe('normalizeArrayItemContent', () => {
  it('treats bare leaf fields as inline content', () => {
    const textField = { type: 'text' as const, name: 'value', label: 'Value' }
    expect(normalizeArrayItemContent([textField])).toEqual({
      contentLayout: 'inline',
      inlineFields: [textField],
    })
  })

  it('treats inlineSentence as inline content', () => {
    const inlineSentence = {
      type: 'inlineSentence' as const,
      name: 'movementRow',
      label: 'Movement',
      segments: [{ kind: 'text' as const, value: 'ft', tone: 'label' as const }],
    }
    expect(normalizeArrayItemContent([inlineSentence])).toEqual({
      contentLayout: 'inline',
      inlineFields: [inlineSentence],
    })
  })

  it('treats a single leaf row as inline content', () => {
    const row = {
      kind: 'row' as const,
      fields: [
        { type: 'text' as const, name: 'grantType', label: 'Type' },
        { type: 'text' as const, name: 'detail', label: 'Detail' },
      ],
    }
    expect(normalizeArrayItemContent([row])).toEqual({
      contentLayout: 'inline',
      inlineFields: row.fields,
      inlineRow: row,
    })
  })

  it('treats multiple top-level fields as stacked content', () => {
    const fields = [
      { type: 'text' as const, name: 'name', label: 'Name' },
      { type: 'textarea' as const, name: 'description', label: 'Description' },
    ]
    expect(normalizeArrayItemContent(fields)).toEqual({ contentLayout: 'stacked' })
  })

  it('treats row plus sibling field as stacked content', () => {
    const fields = [
      {
        kind: 'row' as const,
        fields: [{ type: 'text' as const, name: 'a', label: 'A' }],
      },
      {
        kind: 'row' as const,
        fields: [{ type: 'text' as const, name: 'b', label: 'B' }],
      },
    ]
    expect(normalizeArrayItemContent(fields)).toEqual({ contentLayout: 'stacked' })
  })
})
