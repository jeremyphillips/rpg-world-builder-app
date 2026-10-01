import { describe, expect, it } from 'vitest'

import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../../lib/fixtures/character-builder-fixtures'
import { buildQuickNpcAutomaticPreferences } from './quick-npc-template-recommendations.lib'
import { quickNpcMemberSetupValues, quickNpcStandaloneSetupValues } from './quick-npc-test-fixtures'

describe('buildQuickNpcAutomaticPreferences', () => {
  const context = createCampaignNpcBuilderContextFixture({ catalog: populatedBuilderCatalog })

  it('derives scout preferences from the standalone role choice', () => {
    const preferences = buildQuickNpcAutomaticPreferences({
      values: quickNpcStandaloneSetupValues({
        npcTemplateId: 'scout',
        speciesId: populatedBuilderCatalog.species[0]!.id,
        level: 1,
        classId: populatedBuilderCatalog.classes[0]!.id,
      }),
      context,
      titles: [],
    })

    expect(preferences.abilityPriority?.[0]).toBe('dex')
    expect(preferences.skills?.[0]).toMatchObject({ id: 'perception', sources: ['template'] })
  })

  it('passes title equipment preferences into the automatic preference stream', () => {
    const preferences = buildQuickNpcAutomaticPreferences({
      values: quickNpcMemberSetupValues({
        npcTemplateId: 'guard',
        speciesId: populatedBuilderCatalog.species[0]!.id,
        level: 1,
        classId: populatedBuilderCatalog.classes[0]!.id,
        membershipTitle: 'omt_captain',
      }),
      context,
      titles: [
        {
          id: 'omt_captain',
          label: 'Captain',
          priority: 50,
          npcRecommendation: {
            templateId: 'guard',
            equipmentPreferenceSlugs: ['spear'],
          },
        },
      ],
    })

    expect(preferences.equipmentPreferences?.[0]).toMatchObject({
      slug: 'spear',
      source: 'title',
    })
  })
})
