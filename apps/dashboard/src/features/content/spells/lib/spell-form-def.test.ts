import { describe, expect, expectTypeOf, it } from 'vitest'
import { loadSeedSpells } from '@rpg/catalog/spells'
import { createSpellInputSchema, deriveContentKey, type CreateSpellInput } from '@rpg/contracts'

import { spellFormDef, type SpellFormValues } from './spell-form-def'

const SRD_SPELLS = loadSeedSpells('srd-cc-5.2.1')

it('type: toInput return type matches CreateSpellInput', () => {
  expectTypeOf(spellFormDef.toInput).returns.toEqualTypeOf<CreateSpellInput>()
})

describe('spellFormDef round-trips', () => {
  for (const spell of SRD_SPELLS) {
    it(`${spell.slug}: toFormValues → toInput → schema.parse`, () => {
      const formValues = spellFormDef.toFormValues(spell) as SpellFormValues
      const input = spellFormDef.toInput(formValues)
      expect(() => createSpellInputSchema.parse(input)).not.toThrow()
    })

    it(`${spell.slug}: name and school preserved`, () => {
      const formValues = spellFormDef.toFormValues(spell) as SpellFormValues
      const input = spellFormDef.toInput(formValues)
      expect(input.name).toBe(spell.name)
      expect(input.school).toBe(spell.school)
    })
  }
})

describe('spellFormDef create vs update modes', () => {
  it('create: derives slug from name when slug is omitted', () => {
    const formValues = {
      ...spellFormDef.createDefaultValues,
      name: 'Custom Bolt',
      school: 'evocation',
      classIds: ['wizard'],
    } as SpellFormValues
    const input = spellFormDef.toInput(formValues)
    expect(input.slug).toBe(deriveContentKey('Custom Bolt'))
  })

  it('update: omits slug when entity context is present', () => {
    const spell = SRD_SPELLS[0]!
    const formValues = spellFormDef.toFormValues(spell) as SpellFormValues
    formValues.name = 'Renamed Spell'
    const input = spellFormDef.toInput(formValues, { entity: spell })
    expect(input).not.toHaveProperty('slug')
    expect(input.name).toBe('Renamed Spell')
  })
})
