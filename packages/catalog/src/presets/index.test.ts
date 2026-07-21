import { describe, expect, it } from 'vitest'

import {
  getCampaignTemplateById,
  getWorldSeedPackById,
  loadCampaignPresetCatalog,
  loadCampaignTemplates,
  loadWorldSeedPacks,
} from './index'

describe('campaign preset catalog', () => {
  it('loads validated campaign templates independently from SRD rules content', () => {
    const templates = loadCampaignTemplates()

    expect(templates).toHaveLength(1)
    expect(templates[0]).toMatchObject({
      metadata: { id: 'classic-adventure', version: '1.0.0' },
      rulesetId: 'srd-cc-5.2.1',
      worldSeedPackIds: [],
    })
    expect(getCampaignTemplateById('classic-adventure')).toBe(templates[0])
  })

  it('keeps world seed packs as an empty pipeline stub', () => {
    expect(loadWorldSeedPacks()).toEqual([])
    expect(() => getWorldSeedPackById('missing')).toThrow(/World seed pack not found/)
  })

  it('exposes the validated aggregate used by future campaign creation', () => {
    expect(loadCampaignPresetCatalog()).toEqual({
      campaignTemplates: loadCampaignTemplates(),
      worldSeedPacks: [],
    })
  })

  it('fails clearly for an unknown campaign template', () => {
    expect(() => getCampaignTemplateById('missing')).toThrow(/Campaign template not found/)
  })
})
