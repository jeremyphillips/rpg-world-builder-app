import { describe, expect, it } from 'vitest'

import { NPC_TEMPLATE_ENTRIES } from '@rpg/contracts'

import { buildNpcTemplateRadioOptions } from './quick-npc-npc-template-option.lib'

describe('buildNpcTemplateRadioOptions', () => {
  it('returns all catalog templates with labels and descriptions in catalog order', () => {
    const options = buildNpcTemplateRadioOptions()

    expect(options).toHaveLength(Object.keys(NPC_TEMPLATE_ENTRIES).length)
    expect(options).toEqual(
      Object.entries(NPC_TEMPLATE_ENTRIES).map(([value, entry]) => ({
        value,
        label: entry.label,
        description: entry.description,
      })),
    )
  })
})
