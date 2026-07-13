import { describe, expect, it } from 'vitest'
import type { ArrayConfig, FormItem } from '@rpg/ui/form'

import { effectArrayFields } from './effect-form-fields'
import { formatEffectRowPrimary, formatEffectRowSummary } from './effect-display'

function findEffectsArray(fields: FormItem[]): ArrayConfig | undefined {
  return fields.find(
    (field): field is ArrayConfig =>
      'kind' in field && field.kind === 'array' && field.name === 'effects',
  )
}

describe('effectArrayFields', () => {
  it('registers a searchable add menu with four templates', () => {
    const arrayField = findEffectsArray(effectArrayFields({}))
    expect(arrayField?.addMenu?.items).toHaveLength(4)
    expect(arrayField?.addMenu?.items.map((item) => item.id)).toEqual([
      'damage',
      'healing',
      'temporary-hit-points',
      'projectile-count',
    ])
  })

  it('does not expose a kind selector; kind is fixed at add time via templates', () => {
    const arrayField = findEffectsArray(effectArrayFields({}))
    const itemFields = arrayField?.fields ?? []

    expect(itemFields.find((field) => !('kind' in field) && field.name === 'kind')).toBeUndefined()

    const damageRow = itemFields.find(
      (field): field is Extract<(typeof itemFields)[number], { kind: 'row' }> =>
        'kind' in field &&
        field.kind === 'row' &&
        Boolean(field.visibility?.dependsOn?.includes('kind')),
    )
    expect(damageRow).toBeDefined()
  })

  it('shows effect label only for roll-bearing kinds and projectile label for projectile count', () => {
    const itemFields = findEffectsArray(effectArrayFields({}))?.fields ?? []

    expect(itemFields.find((field) => !('kind' in field) && field.name === 'label')).toMatchObject({
      label: 'Effect label',
    })
    expect(
      itemFields.find((field) => !('kind' in field) && field.name === 'unitLabel'),
    ).toMatchObject({
      label: 'Projectile label',
    })
  })
})

describe('effect array item headers', () => {
  it('formats grant-style titles and summaries', () => {
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
          kind: 'damage',
          label: 'Clenched Fist',
          roll: { dice: { count: 5, faces: 8 } },
          damageType: 'force',
        },
        0,
      ),
    ).toBe('Damage — Clenched Fist')

    expect(
      formatEffectRowSummary({
        id: 'fx-3',
        kind: 'healing',
        label: 'Mass restoration',
        roll: { dice: { count: 3, faces: 8 } },
      }),
    ).toBe('Character heals 3d8 Hit Points.')

    expect(
      formatEffectRowPrimary(
        {
          id: 'fx-4',
          kind: 'projectile-count',
          count: 3,
          unitLabel: 'darts',
        },
        0,
      ),
    ).toBe('Projectile count — darts')

    expect(
      formatEffectRowSummary({
        id: 'fx-5',
        kind: 'projectile-count',
        count: 3,
        unitLabel: 'darts',
      }),
    ).toBe('Creates 3 darts.')
  })

  it('returns empty summary for incomplete rows', () => {
    expect(formatEffectRowSummary({ id: 'fx-1', kind: 'damage' })).toBe('')
    expect(formatEffectRowSummary({ id: 'fx-2', kind: 'projectile-count', count: 3 })).toBe('')
  })
})
