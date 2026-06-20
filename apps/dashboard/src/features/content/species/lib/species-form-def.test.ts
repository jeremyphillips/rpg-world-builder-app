/**
 * Species form def — round-trip and type-level drift guard.
 *
 * For each SRD species fixture, verifies that
 *   `toFormValues(entity) → toInput → createSpeciesInputSchema.parse`
 * succeeds without throwing. This catches:
 * - Missing required schema fields with no corresponding form field
 * - `toInput` producing values that don't satisfy the contract schema
 * - Accidental type widening in `toInput`'s return type
 *
 * NOTE on `speed.modes`: Phase 3 only authors `speed.walk`; extra movement
 * modes are not surfaced in the form and are therefore not preserved in the
 * round-trip. SRD playable species have only walk speed, so the fixtures pass.
 */
import { describe, expect, expectTypeOf, it } from 'vitest'
import { loadSeedSpecies } from '@rpg/catalog/species'
import { createSpeciesInputSchema, type CreateSpeciesInput } from '@rpg/contracts'

import { speciesFormDef, type SpeciesFormValues } from './species-form-def'

const SRD_SPECIES = loadSeedSpecies('srd-cc-5.2.1')

// ---------------------------------------------------------------------------
// Type-level drift guard (compile-time — runs in the vitest type-checker pass)
// ---------------------------------------------------------------------------

it('type: toInput return type matches CreateSpeciesInput', () => {
  expectTypeOf(speciesFormDef.toInput).returns.toEqualTypeOf<CreateSpeciesInput>()
})

// ---------------------------------------------------------------------------
// Round-trip tests
// ---------------------------------------------------------------------------

describe('speciesFormDef round-trips', () => {
  for (const species of SRD_SPECIES) {
    it(`${species.slug}: toFormValues → toInput → schema.parse`, () => {
      const formValues = speciesFormDef.toFormValues(species) as SpeciesFormValues
      const input = speciesFormDef.toInput(formValues)
      expect(() => createSpeciesInputSchema.parse(input)).not.toThrow()
    })

    it(`${species.slug}: name and slug are preserved`, () => {
      const formValues = speciesFormDef.toFormValues(species) as SpeciesFormValues
      const input = speciesFormDef.toInput(formValues)
      expect(input.name).toBe(species.name)
      expect(input.slug).toBe(species.slug)
    })

    it(`${species.slug}: creatureType, sizes, and walk speed are preserved`, () => {
      const formValues = speciesFormDef.toFormValues(species) as SpeciesFormValues
      const input = speciesFormDef.toInput(formValues)
      expect(input.creatureType).toBe(species.creatureType)
      expect(input.sizes).toEqual(species.sizes)
      expect(input.speed.walk).toBe(species.speed.walk)
    })

    it(`${species.slug}: trait count is preserved`, () => {
      const formValues = speciesFormDef.toFormValues(species) as SpeciesFormValues
      const input = speciesFormDef.toInput(formValues)
      expect(input.traits).toHaveLength(species.traits.length)
    })

    it(`${species.slug}: trait ids and names are preserved`, () => {
      const formValues = speciesFormDef.toFormValues(species) as SpeciesFormValues
      const input = speciesFormDef.toInput(formValues)
      for (let i = 0; i < species.traits.length; i++) {
        expect(input.traits[i]?.id).toBe(species.traits[i]?.id)
        expect(input.traits[i]?.name).toBe(species.traits[i]?.name)
      }
    })
  }

  it('dragonborn: choiceGroup draconic ancestry is preserved', () => {
    const dragonborn = SRD_SPECIES.find((s) => s.slug === 'dragonborn')!
    const formValues = speciesFormDef.toFormValues(dragonborn) as SpeciesFormValues
    const input = speciesFormDef.toInput(formValues)
    const group = input.choiceGroups?.[0]
    expect(group?.id).toBe('draconic-ancestry')
    expect(group?.kind).toBe('ancestry')
    expect(group?.options.length).toBeGreaterThan(0)
  })

  it('dragonborn: ancestry option resistances are preserved', () => {
    const dragonborn = SRD_SPECIES.find((s) => s.slug === 'dragonborn')!
    const formValues = speciesFormDef.toFormValues(dragonborn) as SpeciesFormValues
    const input = speciesFormDef.toInput(formValues)
    // The first ancestry option (Black/Acid) has both damageType and resistances
    const firstOption = input.choiceGroups?.[0]?.options[0]
    expect(firstOption?.grants?.resistances).toEqual(['acid'])
    expect(firstOption?.grants?.damageType).toEqual(['acid'])
  })

  it('elf: darkvision sense grant is preserved', () => {
    const elf = SRD_SPECIES.find((s) => s.slug === 'elf')!
    const formValues = speciesFormDef.toFormValues(elf) as SpeciesFormValues
    const input = speciesFormDef.toInput(formValues)
    // Find the trait with a darkvision grant
    const darkvisionTrait = input.traits.find((t) =>
      t.grants?.senses?.some((s) => s.type === 'darkvision'),
    )
    expect(darkvisionTrait).toBeDefined()
    expect(darkvisionTrait?.grants?.senses?.[0]?.type).toBe('darkvision')
    expect(darkvisionTrait?.grants?.senses?.[0]?.range).toBe(60)
  })
})

// ---------------------------------------------------------------------------
// buildFields smoke test (no rendering needed)
// ---------------------------------------------------------------------------

describe('speciesFormDef.buildFields', () => {
  it('returns a non-empty array', () => {
    const fields = speciesFormDef.buildFields({})
    expect(fields.length).toBeGreaterThan(0)
  })

  it('schema has a parse function', () => {
    expect(speciesFormDef.schema.parse).toBeTypeOf('function')
  })

  it('queryKey returns non-empty array', () => {
    const key = speciesFormDef.queryKey('campaign-123')
    expect(Array.isArray(key)).toBe(true)
    expect(key.length).toBeGreaterThan(0)
  })
})
