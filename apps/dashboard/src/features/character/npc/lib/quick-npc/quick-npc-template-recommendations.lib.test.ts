import { describe, expect, it } from 'vitest'

import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../../lib/fixtures/character-builder-fixtures'
import { buildQuickNpcAutomaticPreferences } from './quick-npc-template-recommendations.lib'
import { quickNpcStandaloneSetupValues } from './quick-npc-test-fixtures'

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
    expect(preferences.skillSlugs?.[0]).toBe('perception')
  })
})
