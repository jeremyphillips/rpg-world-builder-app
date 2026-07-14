import { describe, expect, it } from 'vitest'
import type { ArrayConfig, FormItem, GroupConfig } from '@rpg/ui/form'

import { formatEffectRowPrimary, formatEffectRowSummary } from '../../../lib/effect-display'
import { resolutionFields } from '../form/resolution-form-fields'

function findResolutionEffectsArray(fields: FormItem[]): ArrayConfig | undefined {
  for (const field of fields) {
    if ('kind' in field && field.kind === 'array' && field.name === 'resolution.effects') {
      return field
    }

    if ('kind' in field && field.kind === 'group') {
      const nested = findResolutionEffectsArray((field as GroupConfig).fields)
      if (nested) return nested
    }
  }

  return undefined
}

describe('resolutionFields effects array', () => {
  it('hides the generic add control in favor of the resolution-specific add slot', () => {
    const arrayField = findResolutionEffectsArray(resolutionFields({}))
    expect(arrayField?.hideAddControl).toBe(true)
    expect(arrayField?.addMenu).toBeUndefined()
  })

  it('does not expose a kind selector; kind is fixed at add time via templates', () => {
    const itemFields = findResolutionEffectsArray(resolutionFields({}))?.fields ?? []
    expect(itemFields.find((field) => !('kind' in field) && field.name === 'kind')).toBeUndefined()
  })

  it('wires grant-style collapsible item headers with parent context summaries', () => {
    const arrayField = findResolutionEffectsArray(resolutionFields({}))
    const itemHeader = arrayField?.itemHeader

    expect(itemHeader).toBeDefined()
    expect(itemHeader?.summaryDependsOn).toContain('resolution.proximityKind')
    expect(itemHeader?.fallback(0)).toBe('Effect 1')
    expect(
      itemHeader?.primary?.(
        {
          id: 'fx-1',
          kind: 'damage',
          roll: { dice: { count: 1, faces: 6 } },
          damageType: 'fire',
        },
        0,
      ),
    ).toBe('Damage')
    expect(
      itemHeader?.summary?.(
        {
          id: 'fx-1',
          kind: 'damage',
          roll: { dice: { count: 1, faces: 6 } },
          damageType: 'fire',
        },
        0,
        {
          'resolution.proximityKind': 'touch',
          'resolution.targetKind': 'creature',
          'resolution.targetCount': 1,
        },
      ),
    ).toBe('Inflicts 1d6 Fire damage.')
    expect(
      itemHeader?.summary?.(
        {
          id: 'fx-2',
          kind: 'healing',
          roll: { dice: { count: 3, faces: 8 } },
        },
        0,
        { 'resolution.proximityKind': 'self' },
      ),
    ).toBe('You heal 3d8 Hit Points.')
  })
})

describe('resolution effect array item headers', () => {
  it('formats grant-style titles and summaries for resolution effect kinds', () => {
    expect(
      formatEffectRowPrimary(
        {
          id: 'fx-1',
          kind: 'damage',
          roll: { dice: { count: 1, faces: 6 } },
          damageType: 'fire',
        },
        0,
      ),
    ).toBe('Damage')

    expect(
      formatEffectRowSummary({
        id: 'fx-1',
        kind: 'damage',
        roll: { dice: { count: 1, faces: 6 } },
        damageType: 'fire',
      }),
    ).toBe('Inflicts 1d6 Fire damage.')

    expect(
      formatEffectRowPrimary(
        {
          id: 'fx-2',
          kind: 'healing',
          roll: { dice: { count: 3, faces: 8 } },
        },
        0,
      ),
    ).toBe('Healing')

    expect(
      formatEffectRowSummary({
        id: 'fx-2',
        kind: 'healing',
        roll: { dice: { count: 3, faces: 8 } },
      }),
    ).toBe('Character heals 3d8 Hit Points.')

    expect(
      formatEffectRowPrimary(
        {
          id: 'fx-3',
          kind: 'temporary-hit-points',
          roll: { dice: { count: 2, faces: 4 }, flat: 4 },
        },
        0,
      ),
    ).toBe('Temporary hit points')

    expect(
      formatEffectRowSummary({
        id: 'fx-3',
        kind: 'temporary-hit-points',
        roll: { dice: { count: 2, faces: 4 }, flat: 4 },
      }),
    ).toBe('Character gains 2d4+4 temporary Hit Points.')
  })

  it('returns empty summary for incomplete rows', () => {
    expect(formatEffectRowSummary({ id: 'fx-1', kind: 'damage' })).toBe('')
    expect(formatEffectRowSummary({ id: 'fx-2', kind: 'healing' })).toBe('')
  })
})
