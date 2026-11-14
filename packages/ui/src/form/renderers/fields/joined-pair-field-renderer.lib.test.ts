import { describe, expect, it } from 'vitest'

import type { JoinedPairFieldConfig } from '../../field-config'
import { resolveJoinedPairStartOccupant } from './joined-pair-field-renderer.lib'

describe('resolveJoinedPairStartOccupant', () => {
  it('resolves start options from optionsResolve', () => {
    const config = {
      type: 'joinedPair',
      label: 'Long',
      start: {
        kind: 'select' as const,
        name: 'range.long',
        options: [{ value: 5, label: '5' }],
        ariaLabel: 'Long value',
        optionsResolve: {
          dependsOn: ['range.normal'],
          optionsWhen: (values: Record<string, unknown>) => {
            const normal = values['range.normal']
            if (typeof normal !== 'number') return []
            return [
              { value: 80, label: '80' },
              { value: 120, label: '120' },
            ].filter((option) => option.value > normal)
          },
        },
      },
      end: { kind: 'label' as const, text: 'ft.', ariaLabel: 'Long unit' },
    } satisfies JoinedPairFieldConfig

    const resolved = resolveJoinedPairStartOccupant(
      config,
      { 'range.normal': 60 },
      undefined,
      undefined,
    )
    expect(resolved.kind).toBe('select')
    if (resolved.kind !== 'select') return
    expect(resolved.options.map((option) => option.value)).toEqual([80, 120])
  })
})
