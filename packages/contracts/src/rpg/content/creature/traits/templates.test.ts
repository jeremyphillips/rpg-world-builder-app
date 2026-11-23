import { describe, expect, it } from 'vitest'

import { contentTraitSchema } from '../../lib/grants/grants'
import {
  renderTraitFacingBodyHtml,
  resolveTraitFacingParts,
  resolveTraitName,
} from '../../lib/grants/trait-display'
import { defineSenseTemplate } from './sense-templates'
import {
  CREATURE_TRAIT_TEMPLATE_ENTRIES,
  CREATURE_TRAIT_TEMPLATE_IDS,
  getCreatureTraitTemplate,
  isCreatureTraitTemplateEligibleForHost,
  listCreatureTraitTemplatesForRuleset,
} from './templates'
import { collectCreatureTraitTemplateIssues } from './validate'

describe('creature trait templates', () => {
  it('covers the initial registry for the default ruleset', () => {
    expect(listCreatureTraitTemplatesForRuleset('srd-cc-5.2.1', 'monster')).toEqual([
      'magic-resistance',
      'pack-tactics',
      'sunlight-sensitivity',
      'legendary-resistance',
    ])
    expect(listCreatureTraitTemplatesForRuleset('srd-cc-5.2.1', 'species')).toEqual(
      expect.arrayContaining([
        'magic-resistance',
        'pack-tactics',
        'sunlight-sensitivity',
        'legendary-resistance',
        'sense-darkvision',
      ]),
    )
    expect(listCreatureTraitTemplatesForRuleset('other-ruleset', 'monster')).toEqual([])
    expect(CREATURE_TRAIT_TEMPLATE_IDS).toHaveLength(8)
  })

  it('declares explicit hosts on every registry entry', () => {
    for (const templateId of CREATURE_TRAIT_TEMPLATE_IDS) {
      const entry = CREATURE_TRAIT_TEMPLATE_ENTRIES[templateId]
      expect(entry.hosts.length, templateId).toBeGreaterThan(0)
    }
    expect(
      isCreatureTraitTemplateEligibleForHost(defineSenseTemplate('darkvision'), 'species'),
    ).toBe(true)
    expect(
      isCreatureTraitTemplateEligibleForHost(defineSenseTemplate('darkvision'), 'monster'),
    ).toBe(false)
    expect(isCreatureTraitTemplateEligibleForHost('pack-tactics', 'monster')).toBe(true)
  })

  it('rejects species-only sense templates for monster host validation', () => {
    expect(
      collectCreatureTraitTemplateIssues(
        [
          {
            kind: 'template',
            id: 'dv',
            templateId: defineSenseTemplate('darkvision'),
            config: { range: 60 },
          },
        ],
        { host: 'monster' },
      ),
    ).toEqual([
      {
        path: [0, 'templateId'],
        message: 'This creature trait template cannot be assigned on this host.',
      },
    ])
  })

  it('decorates legendary resistance list titles from configured uses', () => {
    const template = getCreatureTraitTemplate('legendary-resistance')
    expect(template?.formatName?.({ uses: { normal: 3 } })).toBe('Legendary Resistance')
    expect(template?.formatDescription({ uses: { normal: 3 } })).toBe(
      'If this creature fails a saving throw, it can choose to succeed instead.',
    )
    const trait = contentTraitSchema.parse({
      kind: 'template',
      id: 'legendary-resistance',
      templateId: 'legendary-resistance',
      config: { uses: { normal: 3 } },
    })
    expect(resolveTraitName(trait)).toBe('Legendary Resistance (3/Day)')
    const parts = resolveTraitFacingParts(trait, { host: 'species' })
    expect(renderTraitFacingBodyHtml(parts)).toContain(
      'If you fail a saving throw, you can choose to succeed instead.',
    )
  })

  it('rejects an unknown template id and an invalid config', () => {
    expect(
      collectCreatureTraitTemplateIssues([
        { kind: 'template', id: 'row', templateId: 'not-a-trait' },
      ]),
    ).toEqual([{ path: [0, 'templateId'], message: 'Unknown creature trait template.' }])

    expect(
      contentTraitSchema.safeParse({
        kind: 'template',
        id: 'legendary-resistance',
        templateId: 'legendary-resistance',
        config: { uses: { normal: 0 } },
      }).success,
    ).toBe(false)
  })

  it('strips legacy descriptionOverride on parse', () => {
    const parsed = contentTraitSchema.parse({
      kind: 'template',
      id: 'pack-tactics',
      templateId: 'pack-tactics',
      descriptionOverride: '<p>Cited prose.</p>',
    })
    expect(parsed).not.toHaveProperty('descriptionOverride')
  })
})
