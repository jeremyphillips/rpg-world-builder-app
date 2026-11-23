import { describe, expect, it } from 'vitest'

import { contentTraitSchema, grantContentTraitSchema } from './grants'
import { resolveTraitDisplay, resolveTraitFacingParts } from './trait-display'
import { defineSenseTemplate } from '../../creature/traits/sense-templates'

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
        grantGroups: [
          { grants: [{ id: 'resistances-1', kind: 'resistances', damageTypes: ['poison'] }] },
        ],
      }),
    )
    expect(display.name).toBe('Damage Resistance')
    expect(display.descriptionHtml).toBe('<p>You have Resistance to poison damage.</p>')
  })

  it('derives movement bonus display from grantGroups', () => {
    const display = resolveTraitDisplay(
      grantContentTraitSchema.parse({
        kind: 'grant',
        id: 'speed',
        grantGroups: [
          {
            grants: [
              { id: 'movement-2', kind: 'movement', mode: 'walk', operation: 'increase', feet: 5 },
            ],
          },
        ],
      }),
    )
    expect(display.name).toBe('Movement')
    expect(display.descriptionHtml).toBe('<p>Your walking speed increases by 5 ft.</p>')
  })

  it('splits sense template rules and supplemental details for facing', () => {
    const trait = contentTraitSchema.parse({
      kind: 'template',
      id: 'darkvision',
      templateId: defineSenseTemplate('darkvision'),
      config: { range: 120 },
      details: '<p>Dim light appears as bright light.</p>',
    })
    expect(resolveTraitFacingParts(trait, { host: 'species' })).toEqual({
      title: 'Darkvision',
      rulesProse: 'You have Darkvision with a range of 120 feet.',
      supplementalHtml: '<p>Dim light appears as bright light.</p>',
    })
    expect(resolveTraitDisplay(trait).descriptionHtml).toBe(
      '<p>You have Darkvision with a range of 120 feet.</p><p>Dim light appears as bright light.</p>',
    )
  })

  it('omits empty sense template details from facing', () => {
    const trait = contentTraitSchema.parse({
      kind: 'template',
      id: 'darkvision',
      templateId: defineSenseTemplate('darkvision'),
      config: { range: 60 },
      details: '',
    })
    expect(resolveTraitFacingParts(trait, { host: 'species' })).toEqual({
      title: 'Darkvision',
      rulesProse: 'You have Darkvision with a range of 60 feet.',
    })
  })

  it('derives language display from grantGroups', () => {
    const display = resolveTraitDisplay(
      grantContentTraitSchema.parse({
        kind: 'grant',
        id: 'common',
        grantGroups: [
          { grants: [{ id: 'languages-3', kind: 'languages', languageIds: ['common'] }] },
        ],
      }),
    )
    expect(display.name).toBe('Language')
    expect(display.descriptionHtml).toBe('<p>You know Common.</p>')
  })
})
