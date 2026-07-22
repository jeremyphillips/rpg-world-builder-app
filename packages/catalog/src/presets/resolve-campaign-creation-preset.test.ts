import { describe, expect, it } from 'vitest'

import { resolveCampaignCreationPreset } from './resolve-campaign-creation-preset'

describe('resolveCampaignCreationPreset', () => {
  it('passes through creation input when no template is selected', () => {
    const input = { name: 'Blank Campaign' }

    expect(resolveCampaignCreationPreset(input)).toEqual({
      ok: true,
      input,
      worldSeedPacks: [],
    })
  })

  it('applies template defaults and strips the transient template id', () => {
    const result = resolveCampaignCreationPreset({
      name: 'The Argent Road',
      campaignTemplateId: 'classic-adventure',
    })

    expect(result).toMatchObject({
      ok: true,
      input: {
        name: 'The Argent Road',
        rulesetId: 'srd-cc-5.2.1',
        flavor: {
          playStyle: ['exploration', 'roleplay_driven'],
          mood: ['heroic', 'hopeful'],
          magicLevel: 'standard_fantasy',
          difficulty: 'dangerous',
        },
      },
      template: { metadata: { id: 'classic-adventure', version: '1.0.0' } },
      worldSeedPacks: [],
    })
    expect(result.ok && result.input).not.toHaveProperty('campaignTemplateId')
  })

  it('lets explicit values override individual template defaults', () => {
    const result = resolveCampaignCreationPreset({
      name: 'The Argent Road',
      campaignTemplateId: 'classic-adventure',
      description: 'My campaign.',
      flavor: { mood: ['gritty'] },
    })

    expect(result).toMatchObject({
      ok: true,
      input: {
        description: 'My campaign.',
        flavor: {
          mood: ['gritty'],
          magicLevel: 'standard_fantasy',
          difficulty: 'dangerous',
        },
      },
    })
  })

  it('reports an unknown template without fallback materialization', () => {
    expect(
      resolveCampaignCreationPreset({ name: 'Unknown', campaignTemplateId: 'missing' }),
    ).toEqual({
      ok: false,
      reason: 'template_not_found',
      campaignTemplateId: 'missing',
    })
  })
})
