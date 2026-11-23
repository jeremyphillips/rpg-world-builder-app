import { describe, expect, it } from 'vitest'

import { contentTraitSchema } from '../../lib/grants/grants'
import { resolveTraitFacingParts } from '../../lib/grants/trait-facing'
import {
  CREATURE_TRAIT_TEMPLATE_IDS,
  defaultCreatureTraitTemplateConfig,
  getCreatureTraitTemplate,
} from './templates'

const STAT_BLOCK_TEMPLATES = [
  'magic-resistance',
  'pack-tactics',
  'sunlight-sensitivity',
  'legendary-resistance',
] as const

describe('trait template facing separation', () => {
  it('exposes formatRules on every registry template and not formatDescription', () => {
    for (const templateId of CREATURE_TRAIT_TEMPLATE_IDS) {
      const template = getCreatureTraitTemplate(templateId)
      expect(template?.formatRules, templateId).toBeTypeOf('function')
      expect(template).not.toHaveProperty('formatDescription')
    }
  })

  for (const templateId of STAT_BLOCK_TEMPLATES) {
    it(`${templateId} differs between species and monster voice`, () => {
      const config = defaultCreatureTraitTemplateConfig(templateId) ?? {}
      const trait = contentTraitSchema.parse({
        kind: 'template',
        id: templateId,
        templateId,
        config,
      })
      const species = resolveTraitFacingParts(trait, { host: 'species' }).rulesProse
      const monster = resolveTraitFacingParts(trait, {
        host: 'monster',
        subject: 'the lich',
        lairEnabled: false,
      }).rulesProse
      expect(species).not.toBe(monster)
      expect(species).toMatch(/\byou\b/i)
      expect(monster).toMatch(/\bthe lich\b/i)
    })
  }
})
