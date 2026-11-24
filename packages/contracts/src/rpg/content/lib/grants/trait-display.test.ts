import { describe, expect, it } from 'vitest'

import { contentTraitSchema, grantContentTraitSchema } from './grants'
import {
  renderTraitFacingBodyHtml,
  resolveTraitFacingParts,
  resolveTraitName,
} from './trait-display'
import { defineSenseTemplate } from '../../creature/traits/sense-templates'

const speciesHost = { host: 'species' as const }

describe('resolveTraitName', () => {
  it('returns stored name for custom traits', () => {
    expect(
      resolveTraitName({
        kind: 'custom',
        id: 'fey-ancestry',
        name: 'Fey Ancestry',
        description: '<p>Advantage on Charm saves.</p>',
      }),
    ).toBe('Fey Ancestry')
  })
})

describe('resolveTraitFacingParts (species host)', () => {
  it('returns stored description for custom traits', () => {
    expect(
      resolveTraitFacingParts(
        {
          kind: 'custom',
          id: 'fey-ancestry',
          name: 'Fey Ancestry',
          description: '<p>Advantage on Charm saves.</p>',
        },
        speciesHost,
      ),
    ).toMatchObject({
      title: 'Fey Ancestry',
      supplementalHtml: '<p>Advantage on Charm saves.</p>',
    })
  })

  it('derives resistance display from grantGroups', () => {
    const parts = resolveTraitFacingParts(
      grantContentTraitSchema.parse({
        kind: 'grant',
        id: 'poison-resistance',
        grantGroups: [
          { grants: [{ id: 'resistances-1', kind: 'resistances', damageTypes: ['poison'] }] },
        ],
      }),
      speciesHost,
    )
    expect(parts.title).toBe('Damage Resistance')
    expect(renderTraitFacingBodyHtml(parts)).toBe('<p>You have Resistance to poison damage.</p>')
  })

  it('preserves authored detail in place of generated prose for a published grant trait', () => {
    const details = '<p>Move farther on foot.</p>'
    const trait = grantContentTraitSchema.parse({
      kind: 'grant',
      id: 'speed-bonus',
      details,
      grantGroups: [
        {
          grants: [{ id: 'move', kind: 'movement', mode: 'walk', operation: 'increase', feet: 5 }],
        },
      ],
    })
    const parts = resolveTraitFacingParts(trait, speciesHost)
    expect(parts.title).toBe('Movement')
    expect(renderTraitFacingBodyHtml(parts)).toBe(details)
  })

  it('derives movement bonus display from grantGroups', () => {
    const parts = resolveTraitFacingParts(
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
      speciesHost,
    )
    expect(parts.title).toBe('Movement')
    expect(renderTraitFacingBodyHtml(parts)).toBe('<p>Your walking speed increases by 5 ft.</p>')
  })

  it('splits sense template rules and supplemental details for facing', () => {
    const trait = contentTraitSchema.parse({
      kind: 'template',
      id: 'darkvision',
      templateId: defineSenseTemplate('darkvision'),
      config: { range: 120 },
      details: '<p>Dim light appears as bright light.</p>',
    })
    expect(resolveTraitFacingParts(trait, speciesHost)).toEqual({
      title: 'Darkvision',
      rulesProse: 'You have Darkvision with a range of 120 feet.',
      supplementalHtml: '<p>Dim light appears as bright light.</p>',
    })
    expect(renderTraitFacingBodyHtml(resolveTraitFacingParts(trait, speciesHost))).toBe(
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
    expect(resolveTraitFacingParts(trait, speciesHost)).toEqual({
      title: 'Darkvision',
      rulesProse: 'You have Darkvision with a range of 60 feet.',
    })
  })

  it('derives language display from grantGroups', () => {
    const parts = resolveTraitFacingParts(
      grantContentTraitSchema.parse({
        kind: 'grant',
        id: 'common',
        grantGroups: [
          { grants: [{ id: 'languages-3', kind: 'languages', languageIds: ['common'] }] },
        ],
      }),
      speciesHost,
    )
    expect(parts.title).toBe('Language')
    expect(renderTraitFacingBodyHtml(parts)).toBe('<p>You know Common.</p>')
  })
})
