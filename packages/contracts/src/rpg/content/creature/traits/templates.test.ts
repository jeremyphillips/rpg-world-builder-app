import { describe, expect, it } from 'vitest'

import { contentTraitSchema } from '../../lib/grants/grants'
import { resolveTraitDisplay } from '../../lib/grants/trait-display'
import {
  CREATURE_TRAIT_TEMPLATE_IDS,
  getCreatureTraitTemplate,
  listCreatureTraitTemplatesForRuleset,
} from './templates'
import { collectCreatureTraitTemplateIssues } from './validate'

describe('creature trait templates', () => {
  it('covers the initial registry for the default ruleset', () => {
    expect(listCreatureTraitTemplatesForRuleset('srd-cc-5.2.1')).toEqual([
      'magic-resistance',
      'pack-tactics',
      'sunlight-sensitivity',
      'legendary-resistance',
    ])
    expect(listCreatureTraitTemplatesForRuleset('other-ruleset')).toEqual([])
    expect(CREATURE_TRAIT_TEMPLATE_IDS).toHaveLength(4)
  })

  it('keeps Legendary Resistance as the canonical label without daily notation', () => {
    const template = getCreatureTraitTemplate('legendary-resistance')
    expect(template?.formatName?.({ uses: { normal: 3 } })).toBe('Legendary Resistance')
    expect(template?.formatDescription({ uses: { normal: 3 } })).toBe(
      'If this creature fails a saving throw, it can choose to succeed instead.',
    )
    const display = resolveTraitDisplay(
      contentTraitSchema.parse({
        kind: 'template',
        id: 'legendary-resistance',
        templateId: 'legendary-resistance',
        config: { uses: { normal: 3 } },
      }),
    )
    expect(display.name).toBe('Legendary Resistance')
    expect(display.descriptionHtml).toContain(
      'If this creature fails a saving throw, it can choose to succeed instead.',
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

  it('keeps a description override ahead of the generated sentence', () => {
    const display = resolveTraitDisplay(
      contentTraitSchema.parse({
        kind: 'template',
        id: 'pack-tactics',
        templateId: 'pack-tactics',
        descriptionOverride: '<p>Cited prose.</p>',
      }),
    )
    expect(display.name).toBe('Pack Tactics')
    expect(display.descriptionHtml).toBe('<p>Cited prose.</p>')
  })
})
