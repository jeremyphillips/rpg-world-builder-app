import { describe, expect, it } from 'vitest'

import { grantContentTraitSchema } from './grants'
import { resolveTraitDisplay } from './trait-display'

describe('resolveTraitDisplay', () => {
  it('returns stored name and description for custom traits', () => {
    expect(
      resolveTraitDisplay({
        kind: 'custom',
        id: 'fey-ancestry',
        name: 'Fey Ancestry',
        description: '<p>Advantage on Charm saves.</p>',
      }),
    ).toEqual({
      name: 'Fey Ancestry',
      descriptionHtml: '<p>Advantage on Charm saves.</p>',
    })
  })

  it('derives resistance display from grantGroups', () => {
    const display = resolveTraitDisplay(
      grantContentTraitSchema.parse({
        kind: 'grant',
        id: 'poison-resistance',
        grantGroups: [{ grants: [{ kind: 'resistances', damageTypes: ['poison'] }] }],
      }),
    )
    expect(display.name).toBe('Damage Resistance')
    expect(display.descriptionHtml).toBe('<p>You have Resistance to Poison damage.</p>')
  })

  it('derives movement bonus display from grantGroups', () => {
    const display = resolveTraitDisplay(
      grantContentTraitSchema.parse({
        kind: 'grant',
        id: 'speed',
        grantGroups: [
          {
            grants: [
              { kind: 'movement', mode: 'walk', operation: 'bonus', value: 5, unit: 'ft' },
            ],
          },
        ],
      }),
    )
    expect(display.name).toBe('Movement')
    expect(display.descriptionHtml).toBe('<p>Your walking speed increases by 5 feet.</p>')
  })

  it('derives language display from grantGroups', () => {
    const display = resolveTraitDisplay(
      grantContentTraitSchema.parse({
        kind: 'grant',
        id: 'common',
        grantGroups: [{ grants: [{ kind: 'languages', languageIds: ['common'] }] }],
      }),
    )
    expect(display.name).toBe('Language')
    expect(display.descriptionHtml).toBe('<p>You know Common.</p>')
  })
})
