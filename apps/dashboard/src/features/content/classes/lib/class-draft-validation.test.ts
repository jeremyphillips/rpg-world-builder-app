import { describe, expect, it } from 'vitest'
import { createClassDraftInputSchema } from '@rpg/contracts'

import { makeCharacterClass } from '@/test/fixtures/factories/character-class'
import { rageProgressionTableFixture } from '../../components/tables/progression-table-fixtures'
import { classFormDef, type ClassFormValues } from './class-form-def'
import { createClassDraftFormSchema } from './class-form-fields'

describe('class create defaults draft persist path', () => {
  const createDefaults = {
    ...classFormDef.createDefaultValues,
    name: '',
  } as ClassFormValues

  it('draft resolver accepts create defaults', () => {
    const schema = createClassDraftFormSchema()
    expect(schema.safeParse(createDefaults).success).toBe(true)
  })

  it('toInput(draft) accepts create defaults and omits incomplete publish fields', () => {
    const input = classFormDef.toInput(createDefaults, undefined, 'draft')
    expect(createClassDraftInputSchema.safeParse(input).success).toBe(true)
    expect(input.name).toBe('Untitled Class')
    expect(input).not.toHaveProperty('hitDie')
    expect(input).not.toHaveProperty('primaryAbilities')
    expect(input).not.toHaveProperty('proficiencies')
    expect(input.spellcasting).toBeUndefined()
  })

  it('toInput(draft) keeps feature tables after draft schema parse', () => {
    const formValues = {
      ...createDefaults,
      features: [
        {
          kind: 'custom' as const,
          name: 'Rage',
          level: 1,
          grants: [],
          tables: [rageProgressionTableFixture],
          available: true,
        },
      ],
    } satisfies ClassFormValues

    const parsed = createClassDraftFormSchema().parse(formValues)
    expect(parsed.features[0]?.tables).toEqual([rageProgressionTableFixture])

    const input = classFormDef.toInput(parsed as ClassFormValues, undefined, 'draft')

    expect(input.features?.[0]?.kind).toBe('custom')
    if (input.features?.[0]?.kind === 'custom') {
      expect(input.features[0].tables).toEqual([rageProgressionTableFixture])
    }
  })

  it('reload hydrates incomplete stored body back into form values', () => {
    const input = classFormDef.toInput(createDefaults, undefined, 'draft')
    expect(createClassDraftInputSchema.safeParse(input).success).toBe(true)

    const reloaded = classFormDef.toFormValues(
      makeCharacterClass({
        id: 'draft-class',
        slug: input.slug,
        name: input.name,
        primaryAbilities: [],
        hitDie: undefined,
        features: input.features ?? [],
      }),
    )
    expect(reloaded.name).toBe('Untitled Class')
    expect(reloaded.primaryAbilities).toEqual([])
    expect(reloaded.hitDie).toBe('')
    expect(reloaded.hasSpellcasting).toBe(false)
    expect(reloaded.characterCreation?.proficiencies?.skills).toEqual({
      choose: 0,
      from: [],
    })
  })
})
