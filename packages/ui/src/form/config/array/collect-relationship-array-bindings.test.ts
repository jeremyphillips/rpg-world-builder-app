import { describe, expect, it, vi } from 'vitest'

import type { FormItem } from '../../field-config'
import { collectRelationshipArrayBindings } from './collect-relationship-array-bindings'

const TEST_VOCABULARY = 'test_relationship'

describe('collectRelationshipArrayBindings', () => {
  it('collects bindings from top-level arrays with default cardinality', () => {
    const fields: FormItem[] = [
      {
        kind: 'array',
        name: 'organizations',
        fields: [],
        addAction: {
          relationship: { vocabulary: TEST_VOCABULARY },
        },
      },
    ]

    expect(collectRelationshipArrayBindings(fields)).toEqual([
      {
        fieldPath: 'organizations',
        vocabulary: TEST_VOCABULARY,
        cardinality: 'many',
      },
    ])
  })

  it('walks group containers without changing the field path', () => {
    const fields: FormItem[] = [
      {
        kind: 'group',
        fields: [
          {
            kind: 'array',
            name: 'organizations',
            fields: [],
            addAction: {
              relationship: { vocabulary: TEST_VOCABULARY },
            },
          },
        ],
      },
    ]

    expect(collectRelationshipArrayBindings(fields)).toEqual([
      {
        fieldPath: 'organizations',
        vocabulary: TEST_VOCABULARY,
        cardinality: 'many',
      },
    ])
  })

  it('walks group and columns containers without changing the field path', () => {
    const fields: FormItem[] = [
      {
        kind: 'group',
        fields: [
          {
            kind: 'columns',
            columns: [
              {
                fields: [
                  {
                    kind: 'array',
                    name: 'locations',
                    fields: [],
                    addAction: {
                      relationship: { vocabulary: TEST_VOCABULARY, cardinality: 'one' },
                    },
                  },
                ],
              },
              { fields: [] },
            ],
          },
        ],
      },
    ]

    expect(collectRelationshipArrayBindings(fields)).toEqual([
      {
        fieldPath: 'locations',
        vocabulary: TEST_VOCABULARY,
        cardinality: 'one',
      },
    ])
  })

  it('skips leaf relationship fields and nested array-item arrays', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    const fields: FormItem[] = [
      {
        type: 'relationship',
        name: 'links',
        label: 'Links',
        vocabulary: TEST_VOCABULARY,
        emptyLabel: 'No links yet.',
        addActionLabel: 'Add link',
      },
      {
        kind: 'array',
        name: 'memberships',
        fields: [
          {
            kind: 'array',
            name: 'nested',
            fields: [],
            addAction: {
              relationship: { vocabulary: 'nested_vocab' },
            },
          },
        ],
        addAction: {
          relationship: { vocabulary: 'memberships_vocab' },
        },
      },
    ]

    expect(collectRelationshipArrayBindings(fields)).toEqual([
      {
        fieldPath: 'memberships',
        vocabulary: 'memberships_vocab',
        cardinality: 'many',
      },
    ])
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Array "nested" under "memberships"'),
    )

    warnSpy.mockRestore()
  })

  it('recurses dependent containers only through dependents.fields', () => {
    const fields: FormItem[] = [
      {
        kind: 'dependent',
        controller: { type: 'switch', name: 'enabled', label: 'Enabled' },
        dependents: {
          fields: [
            {
              kind: 'array',
              name: 'connections.locations',
              fields: [],
              addAction: {
                relationship: { vocabulary: TEST_VOCABULARY, cardinality: 'one' },
              },
            },
          ],
        },
      },
    ]

    expect(collectRelationshipArrayBindings(fields)).toEqual([
      {
        fieldPath: 'connections.locations',
        vocabulary: TEST_VOCABULARY,
        cardinality: 'one',
      },
    ])
  })
})
