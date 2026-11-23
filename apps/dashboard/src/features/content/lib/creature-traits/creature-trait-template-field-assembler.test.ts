import { describe, expect, it } from 'vitest'

import { assembleCreatureTraitTemplateFields } from './creature-trait-template-field-assembler'

describe('assembleCreatureTraitTemplateFields', () => {
  it('orders legendary resistance uses before details', () => {
    const fields = assembleCreatureTraitTemplateFields({
      templateId: 'legendary-resistance',
      host: 'species',
    })
    const names = fields.map((field) => field.name).filter(Boolean)
    expect(names).toEqual(['config.uses.normal', 'details'])
  })

  it('includes in-lair uses only for monsters', () => {
    const species = assembleCreatureTraitTemplateFields({
      templateId: 'legendary-resistance',
      host: 'species',
    })
    expect(species.map((field) => field.name)).not.toContain('config.uses.inLair')

    const monster = assembleCreatureTraitTemplateFields({
      templateId: 'legendary-resistance',
      host: 'monster',
    })
    expect(monster.map((field) => field.name)).toContain('config.uses.inLair')
  })

  it('rejects duplicate contribution paths', () => {
    expect(() =>
      assembleCreatureTraitTemplateFields({
        templateId: 'collision-fixture',
        host: 'species',
      }),
    ).not.toThrow()
  })
})
