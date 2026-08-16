import { describe, expect, it } from 'vitest'

import type { FormItem } from '@rpg/ui/form'

import { assertNavigationIdsMatchDomIds, collectFormNavigationAnchors } from './form-navigation.lib'

describe('collectFormNavigationAnchors', () => {
  it('collects navigation anchors in DOM walk order', () => {
    const items: FormItem[] = [
      {
        kind: 'group',
        id: 'creation-starting-level',
        navigation: { id: 'creation-starting-level', label: 'Starting level' },
        fields: [{ type: 'number', name: 'startingLevel', label: 'Starting level' }],
      },
      {
        kind: 'row',
        id: 'creation-standard-array',
        navigation: { id: 'creation-standard-array' },
        heading: { label: 'Standard array' },
        fields: [{ type: 'number', name: 'standardArray.0', label: 'Score 1' }],
      },
    ]

    expect(collectFormNavigationAnchors(items, { sectionId: 'creation' })).toEqual([
      {
        id: 'creation-starting-level',
        label: 'Starting level',
        sectionId: 'creation',
        depth: 0,
      },
      {
        id: 'creation-standard-array',
        label: 'Standard array',
        sectionId: 'creation',
        depth: 0,
      },
    ])
  })

  it('skips arrays, slots, and bare leaf fields', () => {
    const items: FormItem[] = [
      { type: 'text', name: 'name', label: 'Name' },
      {
        kind: 'array',
        name: 'items',
        legend: 'Items',
        fields: [{ type: 'text', name: 'label', label: 'Label' }],
      },
      {
        kind: 'slot',
        name: '_slot',
        render: () => null,
      },
    ]

    expect(collectFormNavigationAnchors(items)).toEqual([])
  })

  it('walks nested containers depth-first', () => {
    const items: FormItem[] = [
      {
        kind: 'group',
        legend: 'Outer',
        fields: [
          {
            kind: 'group',
            id: 'nested',
            navigation: { id: 'nested', label: 'Nested' },
            fields: [],
          },
        ],
      },
    ]

    expect(collectFormNavigationAnchors(items)).toEqual([
      { id: 'nested', label: 'Nested', sectionId: undefined, depth: 1 },
    ])
  })
})

describe('assertNavigationIdsMatchDomIds', () => {
  it('passes when navigation ids match container ids', () => {
    const items: FormItem[] = [
      {
        kind: 'group',
        id: 'creation-languages',
        navigation: { id: 'creation-languages', label: 'Languages' },
        fields: [],
      },
    ]

    expect(() => assertNavigationIdsMatchDomIds(items)).not.toThrow()
  })

  it('throws when navigation id does not match container id', () => {
    const items: FormItem[] = [
      {
        kind: 'group',
        id: 'wrong-id',
        navigation: { id: 'creation-languages', label: 'Languages' },
        fields: [],
      },
    ]

    expect(() => assertNavigationIdsMatchDomIds(items)).toThrow(
      /Form navigation ids must match container ids/,
    )
  })
})
