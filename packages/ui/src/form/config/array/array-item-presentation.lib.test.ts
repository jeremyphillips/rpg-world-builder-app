import { describe, expect, it } from 'vitest'

import {
  resolveArrayItemPresentation,
  resolveArrayItemPresentationAnatomy,
} from './array-item-presentation.lib'

describe('resolveArrayItemPresentation', () => {
  const stackedCompactFields = [
    { type: 'text' as const, name: 'name', label: 'Name' },
    { type: 'textarea' as const, name: 'description', label: 'Description' },
  ]

  const inlineRowFields = [
    {
      kind: 'row' as const,
      fields: [
        { type: 'text' as const, name: 'grantType', label: 'Type' },
        { type: 'text' as const, name: 'detail', label: 'Detail' },
      ],
    },
  ]

  const bareInlineTextFields = [{ type: 'text' as const, name: 'value', label: 'Example' }]

  const inlineSentenceFields = [
    {
      type: 'inlineSentence' as const,
      name: 'movementRow',
      label: 'Movement',
      segments: [{ kind: 'text' as const, value: 'ft', tone: 'label' as const }],
    },
  ]

  it('does not infer a visible header from stacked field layout alone', () => {
    const presentation = resolveArrayItemPresentation({
      config: {
        kind: 'array',
        name: 'traits',
        legend: 'Traits',
        item: {
          variant: 'compact',
          header: { fallback: (index) => `Trait ${index + 1}`, srOnly: true },
        },
        fields: stackedCompactFields,
      },
      variant: 'compact',
      reorder: 'dragHandle',
      fieldsLength: 1,
    })

    expect(presentation.contentLayout).toBe('stacked')
    expect(presentation.itemLabel).toBe('none')
    expect(presentation.headerAnatomy).toBe('none')
    expect(resolveArrayItemPresentationAnatomy(presentation)).toBe('flatNoHeader')
  })

  it('supports explicit unlabeled stacked items via headerVisibility hidden', () => {
    const presentation = resolveArrayItemPresentation({
      config: {
        kind: 'array',
        name: 'movement',
        legend: 'Movement',
        item: {
          variant: 'compact',
          headerVisibility: 'hidden',
          header: {
            fallback: (index) => `Movement ${index + 1}`,
            primaryField: 'mode',
          },
        },
        fields: [{ type: 'text' as const, name: 'mode', label: 'Mode' }],
      },
      variant: 'compact',
      reorder: 'dragHandle',
      fieldsLength: 1,
    })

    expect(presentation.contentLayout).toBe('inline')
    expect(presentation.itemLabel).toBe('none')
    expect(presentation.headerAnatomy).toBe('none')
    expect(resolveArrayItemPresentationAnatomy(presentation)).toBe('flatNoHeader')
  })

  it('preserves labeled compact stacked items under auto when identity is visible', () => {
    const presentation = resolveArrayItemPresentation({
      config: {
        kind: 'array',
        name: 'entries',
        legend: 'Entries',
        item: {
          variant: 'compact',
          header: {
            fallback: (index) => `Entry ${index + 1}`,
            primaryField: 'name',
          },
        },
        fields: stackedCompactFields,
      },
      variant: 'compact',
      reorder: 'dragHandle',
      fieldsLength: 1,
    })

    expect(presentation.itemLabel).toBe('visible')
    expect(presentation.headerAnatomy).toBe('present')
    expect(resolveArrayItemPresentationAnatomy(presentation)).toBe('flatWithHeader')
  })

  it('normalizes headerVisibility hidden for collapsible items', () => {
    const presentation = resolveArrayItemPresentation({
      config: {
        kind: 'array',
        name: 'traits',
        legend: 'Traits',
        item: {
          collapsible: true,
          headerVisibility: 'hidden',
          header: { fallback: (index) => `Trait ${index + 1}`, primaryField: 'name' },
        },
        fields: stackedCompactFields,
      },
      variant: 'detailed',
      reorder: 'dragHandle',
      fieldsLength: 1,
      collapsible: true,
    })

    expect(presentation.disclosure).toBe('collapsible')
    expect(presentation.itemLabel).toBe('visible')
    expect(presentation.headerAnatomy).toBe('present')
    expect(resolveArrayItemPresentationAnatomy(presentation)).toBe('disclosure')
  })

  it('honors collapsible on compact variant when renderer passes collapsible override', () => {
    const presentation = resolveArrayItemPresentation({
      config: {
        kind: 'array',
        name: 'examples',
        legend: 'Examples',
        item: {
          variant: 'compact',
          collapsible: true,
          header: { fallback: (index) => `Example ${index + 1}`, primaryField: 'value' },
        },
        fields: bareInlineTextFields,
      },
      variant: 'compact',
      reorder: 'dragHandle',
      fieldsLength: 1,
      collapsible: true,
    })

    expect(presentation.disclosure).toBe('collapsible')
    expect(resolveArrayItemPresentationAnatomy(presentation)).toBe('disclosure')
  })

  it('keeps inline content layout independent from header visibility', () => {
    const presentation = resolveArrayItemPresentation({
      config: {
        kind: 'array',
        name: 'grants',
        legend: 'Grants',
        item: {
          variant: 'compact',
          header: {
            fallback: (index) => `Grant ${index + 1}`,
            primaryField: 'grantType',
          },
        },
        fields: inlineRowFields,
      },
      variant: 'compact',
      reorder: 'dragHandle',
      fieldsLength: 1,
    })

    expect(presentation.contentLayout).toBe('inline')
    expect(presentation.itemLabel).toBe('none')
    expect(resolveArrayItemPresentationAnatomy(presentation)).toBe('flatNoHeader')
  })

  it('produces equivalent inline presentation for bare text, row wrap, and inlineSentence', () => {
    const baseConfig = {
      kind: 'array' as const,
      name: 'rows',
      legend: 'Rows',
      item: {
        variant: 'compact' as const,
        headerVisibility: 'hidden' as const,
        header: { fallback: (index: number) => `Row ${index + 1}` },
      },
    }

    const bareText = resolveArrayItemPresentation({
      config: { ...baseConfig, fields: bareInlineTextFields },
      variant: 'compact',
      reorder: 'dragHandle',
      fieldsLength: 1,
    })
    const rowWrap = resolveArrayItemPresentation({
      config: {
        ...baseConfig,
        fields: [{ kind: 'row' as const, fields: bareInlineTextFields }],
      },
      variant: 'compact',
      reorder: 'dragHandle',
      fieldsLength: 1,
    })
    const inlineSentence = resolveArrayItemPresentation({
      config: { ...baseConfig, fields: inlineSentenceFields },
      variant: 'compact',
      reorder: 'dragHandle',
      fieldsLength: 1,
    })

    for (const presentation of [bareText, rowWrap, inlineSentence]) {
      expect(presentation.contentLayout).toBe('inline')
      expect(presentation.headerAnatomy).toBe('none')
      expect(resolveArrayItemPresentationAnatomy(presentation)).toBe('flatNoHeader')
    }
  })

  it('reserves drag handle geometry before sortable is active', () => {
    const oneItem = resolveArrayItemPresentation({
      config: {
        kind: 'array',
        name: 'tags',
        legend: 'Tags',
        fields: [{ type: 'text' as const, name: 'label', label: 'Label' }],
      },
      variant: 'compact',
      reorder: 'dragHandle',
      fieldsLength: 1,
    })

    expect(oneItem.reserveDragHandleSlot).toBe(true)
    expect(oneItem.sortableEnabled).toBe(false)

    const twoItems = resolveArrayItemPresentation({
      config: {
        kind: 'array',
        name: 'tags',
        legend: 'Tags',
        fields: [{ type: 'text' as const, name: 'label', label: 'Label' }],
      },
      variant: 'compact',
      reorder: 'dragHandle',
      fieldsLength: 2,
    })

    expect(twoItems.reserveDragHandleSlot).toBe(true)
    expect(twoItems.sortableEnabled).toBe(true)
  })

  it('uses merged stack treatment only for flat unlabeled rows', () => {
    const merged = resolveArrayItemPresentation({
      config: {
        kind: 'array',
        name: 'movement',
        legend: 'Movement',
        item: { headerVisibility: 'hidden' },
        fields: [{ type: 'text' as const, name: 'mode', label: 'Mode' }],
      },
      variant: 'compact',
      reorder: 'dragHandle',
      fieldsLength: 2,
    })

    const separated = resolveArrayItemPresentation({
      config: {
        kind: 'array',
        name: 'entries',
        legend: 'Entries',
        item: { header: { fallback: (index) => `Entry ${index + 1}`, primaryField: 'name' } },
        fields: stackedCompactFields,
      },
      variant: 'compact',
      reorder: 'dragHandle',
      fieldsLength: 2,
    })

    expect(merged.stackTreatment).toBe('merged')
    expect(separated.stackTreatment).toBe('separated')
  })

  it('uses disclosure list gap for collapsible arrays', () => {
    const presentation = resolveArrayItemPresentation({
      config: {
        kind: 'array',
        name: 'traits',
        legend: 'Traits',
        item: {
          collapsible: true,
          header: { fallback: (index) => `Trait ${index + 1}`, primaryField: 'name' },
        },
        fields: [{ type: 'text' as const, name: 'name', label: 'Name' }],
      },
      variant: 'detailed',
      reorder: 'dragHandle',
      fieldsLength: 2,
    })

    expect(presentation.chrome).toBe('disclosure')
    expect(presentation.listGap).toBe('disclosure')
  })
})
