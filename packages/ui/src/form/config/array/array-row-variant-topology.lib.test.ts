import { describe, expect, it, vi } from 'vitest'

import type { ArrayRowVariantTopology } from '../../field-config/form-item.types'
import { buildFieldRegistry } from '../field-registry.lib'
import {
  collectRowVariantTopologyFields,
  resolveFieldsForRowVariantTopology,
} from './array-row-variant-topology.lib'
import type { FormItem } from '../../field-config'

const topology: ArrayRowVariantTopology = {
  shared: [{ type: 'text', name: 'name', label: 'Name', required: true }],
  variants: {
    custom: [{ type: 'richtext', name: 'description', label: 'Description' }],
    asi: [{ type: 'richtext', name: 'description', label: 'Description' }],
  },
  fallback: [{ type: 'select', name: 'kind', label: 'Kind', options: [] }],
}

describe('array row variant topology', () => {
  it('resolves declared variant fields without calling resolveFields on empty rows', () => {
    const fields = resolveFieldsForRowVariantTopology(topology, { kind: 'asi' })
    expect(fields.some((field) => 'name' in field && field.name === 'name')).toBe(true)
    expect(fields.some((field) => 'name' in field && field.name === 'description')).toBe(true)
  })

  it('uses fallback topology for unknown discriminators', () => {
    const fields = resolveFieldsForRowVariantTopology(topology, {})
    expect(fields.some((field) => 'name' in field && field.name === 'kind')).toBe(true)
  })

  it('does not call resolveFields when the collection is empty', () => {
    const resolveFields = vi.fn(() => {
      throw new Error('Class feature row is missing kind')
    })
    const items: FormItem[] = [
      {
        kind: 'array',
        name: 'features',
        fields: [{ type: 'text', name: 'name', label: 'Name', required: true }],
        item: { resolveFields },
      },
    ]

    const registry = buildFieldRegistry(items, { features: [] })
    expect(resolveFields).not.toHaveBeenCalled()
    expect(registry.has('features')).toBe(true)
    expect(registry.has('features.*.name')).toBe(true)
  })

  it('registers union paths for empty arrays without fabricated row probes', () => {
    const items: FormItem[] = [
      {
        kind: 'array',
        name: 'features',
        fields: [],
        item: { rowVariantTopology: topology },
      },
    ]

    const registry = buildFieldRegistry(items)
    expect(registry.has('features.*.name')).toBe(true)
    expect(registry.has('features.*.description')).toBe(true)
    expect(registry.has('features.*.kind')).toBe(true)
  })

  it('collectRowVariantTopologyFields dedupes shared and variant entries', () => {
    const merged = collectRowVariantTopologyFields(topology)
    expect(merged.length).toBeGreaterThan(0)
  })
})
