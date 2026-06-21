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

  it('derives resistance display', () => {
    const display = resolveTraitDisplay(
      grantContentTraitSchema.parse({
        kind: 'grant',
        id: 'poison-resistance',
        grants: { resistances: ['poison'] },
      }),
    )
    expect(display.name).toBe('Damage Resistance')
    expect(display.descriptionHtml).toBe('<p>You have Resistance to Poison damage.</p>')
  })

  it('derives walk speed override display', () => {
    const display = resolveTraitDisplay(
      grantContentTraitSchema.parse({
        kind: 'grant',
        id: 'speed',
        grants: { speedOverride: { walk: 35 } },
      }),
    )
    expect(display.name).toBe('Speed')
    expect(display.descriptionHtml).toBe('<p>Your Speed is 35 feet.</p>')
  })

  it('derives language display', () => {
    const display = resolveTraitDisplay(
      grantContentTraitSchema.parse({
        kind: 'grant',
        id: 'common',
        grants: { languages: ['Common'] },
      }),
    )
    expect(display.name).toBe('Language')
    expect(display.descriptionHtml).toBe('<p>You know Common.</p>')
  })
})
