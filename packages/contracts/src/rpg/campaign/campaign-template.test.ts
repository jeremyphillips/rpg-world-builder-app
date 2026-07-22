import { describe, expect, it } from 'vitest'

import {
  campaignPresetCatalogSchema,
  campaignTemplateSchema,
  worldSeedPackSchema,
} from './campaign-template'

const template = {
  metadata: {
    id: 'classic-adventure',
    slug: 'classic-adventure',
    version: '1.0.0',
    name: 'Classic Adventure',
  },
  rulesetId: 'srd-cc-5.2.1',
  defaults: {
    configuration: {
      flavor: { mood: ['heroic'], magicLevel: 'standard_fantasy' },
    },
  },
}

describe('campaignTemplateSchema', () => {
  it('accepts sparse campaign defaults and supplies an empty seed-pack list', () => {
    expect(campaignTemplateSchema.parse(template)).toMatchObject({
      worldSeedPackIds: [],
      defaults: template.defaults,
    })
  })

  it('keeps campaign naming outside template defaults', () => {
    expect(() =>
      campaignTemplateSchema.parse({
        ...template,
        defaults: { identity: { name: 'Template-owned name' } },
      }),
    ).toThrow()
  })
})

describe('worldSeedPackSchema', () => {
  it('remains a metadata-only descriptor', () => {
    expect(
      worldSeedPackSchema.parse({
        metadata: {
          id: 'generic-organizations',
          slug: 'generic-organizations',
          version: '1.0.0',
          name: 'Generic Organizations',
        },
        rulesetId: 'srd-cc-5.2.1',
      }),
    ).not.toHaveProperty('contents')
  })
})

describe('campaignPresetCatalogSchema', () => {
  it('rejects template references to an unavailable world seed pack', () => {
    expect(() =>
      campaignPresetCatalogSchema.parse({
        campaignTemplates: [{ ...template, worldSeedPackIds: ['missing-pack'] }],
        worldSeedPacks: [],
      }),
    ).toThrow(/Unknown world seed pack id/)
  })

  it('rejects duplicate template ids', () => {
    expect(() =>
      campaignPresetCatalogSchema.parse({
        campaignTemplates: [template, template],
        worldSeedPacks: [],
      }),
    ).toThrow(/Duplicate id/)
  })
})
