import {
  CREATURE_TRAIT_TEMPLATE_IDS,
  contentTraitSchema,
  defaultCreatureTraitTemplateConfig,
  getCreatureTraitTemplate,
  resolveTraitFacingParts,
} from '@rpg/contracts'
import { flattenFields } from '@rpg/ui/form'
import { describe, expect, it } from 'vitest'

import { assembleCreatureTraitTemplateFields } from './creature-trait-template-field-assembler'
import { creatureTraitTemplateFields } from './creature-trait-template-fields'
import { monsterTraitTemplateFields } from '../../monsters/lib/traits/monster-trait-form-fields'

function collectFormStrings(value: unknown, strings: string[] = []): string[] {
  if (typeof value === 'string') {
    strings.push(value)
    return strings
  }
  if (Array.isArray(value)) {
    for (const entry of value) collectFormStrings(entry, strings)
    return strings
  }
  if (value && typeof value === 'object') {
    for (const entry of Object.values(value as Record<string, unknown>)) {
      collectFormStrings(entry, strings)
    }
  }
  return strings
}

function rulesProseForTemplate(
  templateId: string,
  host: 'species' | 'monster',
): { player?: string; statBlock?: string } {
  const config = defaultCreatureTraitTemplateConfig(templateId) ?? {}
  const trait = contentTraitSchema.parse({
    kind: 'template',
    id: templateId,
    templateId,
    config,
  })
  const player = resolveTraitFacingParts(trait, { host: 'species' }).rulesProse
  const statBlock =
    host === 'monster'
      ? resolveTraitFacingParts(trait, {
          host: 'monster',
          subject: 'the creature',
          lairEnabled: false,
        }).rulesProse
      : undefined
  return { player, statBlock }
}

const SHARED_TEMPLATE_IDS = [
  'legendary-resistance',
  'magic-resistance',
  'pack-tactics',
  'sunlight-sensitivity',
] as const

describe('creature trait template form fields', () => {
  it('does not place generated rules prose on species template field groups', () => {
    const serialized = JSON.stringify(creatureTraitTemplateFields())
    for (const templateId of CREATURE_TRAIT_TEMPLATE_IDS) {
      const { player, statBlock } = rulesProseForTemplate(templateId, 'species')
      for (const prose of [player, statBlock].filter(Boolean)) {
        expect(serialized, templateId).not.toContain(prose)
      }
    }
    expect(serialized).not.toContain('this creature')
  })

  it('does not repeat generated rules prose on monster assembler fields', () => {
    for (const templateId of SHARED_TEMPLATE_IDS) {
      const serialized = JSON.stringify(
        assembleCreatureTraitTemplateFields({ templateId, host: 'monster' }),
      )
      const { player, statBlock } = rulesProseForTemplate(templateId, 'monster')
      for (const prose of [player, statBlock].filter(Boolean)) {
        expect(serialized, templateId).not.toContain(prose)
      }
    }
  })

  it('uses recovery authoring hint for legendary resistance uses', () => {
    const usesField = flattenFields(
      assembleCreatureTraitTemplateFields({ templateId: 'legendary-resistance', host: 'species' }),
    ).find((field) => 'name' in field && field.name === 'config.uses.normal')
    expect(usesField?.hint).toBe('You regain all expended uses when you finish a long rest.')
    expect(usesField?.hint).not.toMatch(/per day/i)
  })

  it('omits heading hints on species template groups', () => {
    for (const item of creatureTraitTemplateFields()) {
      if (!('kind' in item) || item.kind !== 'group') continue
      const group = item as Extract<typeof item, { kind: 'group' }>
      expect(group.heading?.hint).toBeUndefined()
    }
  })
})

describe('shared template facing grammar', () => {
  for (const templateId of SHARED_TEMPLATE_IDS) {
    it(`${templateId} uses player agreement in species preview`, () => {
      const { player } = rulesProseForTemplate(templateId, 'species')
      expect(player?.length).toBeGreaterThan(0)
      expect(player).toMatch(/\b(you|your)\b/i)
      expect(player).not.toMatch(/this creature/i)
    })

    it(`${templateId} uses stat-block agreement in monster preview`, () => {
      const { statBlock } = rulesProseForTemplate(templateId, 'monster')
      expect(statBlock?.length).toBeGreaterThan(0)
      expect(statBlock).toMatch(/\b(the creature|it|its)\b/i)
    })
  }

  it('generates sense template rules once per host voice', () => {
    const template = getCreatureTraitTemplate('sense-darkvision')
    expect(template).toBeDefined()
    const player = rulesProseForTemplate('sense-darkvision', 'species').player
    expect(player).toBe('You have Darkvision with a range of 60 feet.')
    const strings = collectFormStrings(creatureTraitTemplateFields())
    expect(strings.join('\n')).not.toContain(player)
  })
})

describe('monsterTraitTemplateFields', () => {
  it('does not embed generated rules in template detail fields', () => {
    for (const templateId of SHARED_TEMPLATE_IDS) {
      const serialized = JSON.stringify(monsterTraitTemplateFields(templateId))
      const { statBlock } = rulesProseForTemplate(templateId, 'monster')
      if (statBlock) expect(serialized).not.toContain(statBlock)
    }
  })
})
