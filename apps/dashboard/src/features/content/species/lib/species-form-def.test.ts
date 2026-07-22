/**
 * Species form def — round-trip and type-level drift guard.
 *
 * For each SRD species fixture, verifies that
 *   `toFormValues(entity) → toInput → createSpeciesInputSchema.parse`
 * succeeds without throwing. This catches:
 * - Missing required schema fields with no corresponding form field
 * - `toInput` producing values that don't satisfy the contract schema
 * - Accidental type widening in `toInput`'s return type
 */
import { describe, expect, expectTypeOf, it } from 'vitest'
import { loadSeedSpecies } from '@rpg/catalog/species'
import {
  createSpeciesInputSchema,
  deriveContentKey,
  resolveTraitName,
  type CreateSpeciesInput,
} from '@rpg/contracts'

import { speciesFormDef, speciesDraftFormSchema, type SpeciesFormValues } from './species-form-def'

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

    it(`${species.slug}: creatureType, sizes, and movement are preserved`, () => {
      const formValues = speciesFormDef.toFormValues(species) as SpeciesFormValues
      const input = speciesFormDef.toInput(formValues)
      expect(input.creatureType).toBe(species.creatureType)
      expect(input.sizes).toEqual(species.sizes)
      expect(input.movement).toEqual(species.movement)
    })

    it(`${species.slug}: trait count is preserved`, () => {
      const formValues = speciesFormDef.toFormValues(species) as SpeciesFormValues
      const input = speciesFormDef.toInput(formValues)
      expect(input.traits).toHaveLength(species.traits.length)
    })

    it(`${species.slug}: trait ids and resolved names are preserved`, () => {
      const formValues = speciesFormDef.toFormValues(species) as SpeciesFormValues
      const input = speciesFormDef.toInput(formValues, { entity: species })
      for (let i = 0; i < species.traits.length; i++) {
        expect(input.traits[i]?.id).toBe(species.traits[i]?.id)
        expect(resolveTraitName(input.traits[i]!)).toBe(resolveTraitName(species.traits[i]!))
      }
    })
  }

  it('dragonborn: draconic ancestry heritage is preserved', () => {
    const dragonborn = SRD_SPECIES.find((s) => s.slug === 'dragonborn')!
    const formValues = speciesFormDef.toFormValues(dragonborn) as SpeciesFormValues
    const input = speciesFormDef.toInput(formValues)
    expect(input.heritage?.id).toBe('draconic-ancestry')
    expect(input.heritage?.name).toBe('Draconic Ancestry')
    expect(input.heritage?.options.length).toBeGreaterThan(0)
  })

  it('dragonborn: ancestry option resistances are preserved (grantGroups)', () => {
    const dragonborn = SRD_SPECIES.find((s) => s.slug === 'dragonborn')!
    const formValues = speciesFormDef.toFormValues(dragonborn) as SpeciesFormValues
    const input = speciesFormDef.toInput(formValues)
    const firstOption = input.heritage?.options[0]
    const defaultGrants = firstOption?.grantGroups?.[0]?.grants ?? []
    expect(
      defaultGrants.some((g) => g.kind === 'resistances' && g.damageTypes.includes('acid')),
    ).toBe(true)
    expect(
      defaultGrants.some((g) => g.kind === 'damageType' && g.damageTypes.includes('acid')),
    ).toBe(true)
  })

  it('dwarf: languageAffinities round-trip through form values', () => {
    const dwarf = SRD_SPECIES.find((s) => s.slug === 'dwarf')!
    const formValues = speciesFormDef.toFormValues(dwarf) as SpeciesFormValues
    expect(formValues.languageAffinities).toEqual(['dwarvish'])

    const input = speciesFormDef.toInput(formValues)
    expect(input.languageAffinities).toEqual(['dwarvish'])
  })

  it('human: omits languageAffinities when empty on save', () => {
    const human = SRD_SPECIES.find((s) => s.slug === 'human')!
    const formValues = speciesFormDef.toFormValues(human) as SpeciesFormValues
    expect(formValues.languageAffinities).toEqual([])

    const input = speciesFormDef.toInput(formValues)
    expect(input.languageAffinities).toBeUndefined()
  })

  it('elf: darkvision sense grant is preserved (grantGroups)', () => {
    const elf = SRD_SPECIES.find((s) => s.slug === 'elf')!
    const formValues = speciesFormDef.toFormValues(elf) as SpeciesFormValues
    const input = speciesFormDef.toInput(formValues)
    // Find the grant trait with a darkvision sense grant
    const darkvisionTrait = input.traits.find(
      (t) =>
        t.kind === 'grant' &&
        t.grantGroups[0]?.grants.some((g) => g.kind === 'sense' && g.type === 'darkvision'),
    )
    expect(darkvisionTrait).toBeDefined()
    expect(darkvisionTrait?.kind).toBe('grant')
    const senseGrant =
      darkvisionTrait?.kind === 'grant'
        ? darkvisionTrait.grantGroups[0]?.grants.find((g) => g.kind === 'sense')
        : undefined
    expect(senseGrant?.kind === 'sense' && senseGrant.type).toBe('darkvision')
    expect(senseGrant?.kind === 'sense' && senseGrant.range).toBe(60)
  })
})

describe('speciesFormDef create vs update modes', () => {
  it('create: derives slug and assigns trait ids for new rows', () => {
    const formValues = {
      ...speciesFormDef.createDefaultValues,
      name: 'Custom Species',
      traits: [{ kind: 'custom', name: 'Darkvision', overrideDisplay: false, grants: [] }],
    } as SpeciesFormValues
    const input = speciesFormDef.toInput(formValues)
    expect(input.slug).toBe(deriveContentKey('Custom Species'))
    expect(input.traits[0]?.id).toBe('darkvision')
  })

  it('update: omits slug and preserves trait ids when names change', () => {
    const elf = SRD_SPECIES.find((s) => s.slug === 'elf')!
    const formValues = speciesFormDef.toFormValues(elf) as SpeciesFormValues
    formValues.name = 'Renamed Elf'
    const customTrait = formValues.traits.find((t) => t.kind === 'custom')
    const customTraitId = elf.traits.find((t) => t.kind === 'custom')!.id
    customTrait!.name = 'Renamed Trait'
    const input = speciesFormDef.toInput(formValues, { entity: elf })
    expect(input).not.toHaveProperty('slug')
    expect(input.traits.find((t) => t.id === customTraitId)?.id).toBe(customTraitId)
  })

  it('update: preserves heritage option ids when names change', () => {
    const dragonborn = SRD_SPECIES.find((s) => s.slug === 'dragonborn')!
    const formValues = speciesFormDef.toFormValues(dragonborn) as SpeciesFormValues
    const optionId = dragonborn.heritage?.options[0]?.id
    formValues.heritage!.options[0]!.name = 'Renamed Ancestry'
    const input = speciesFormDef.toInput(formValues, { entity: dragonborn })
    expect(input.heritage?.options[0]?.id).toBe(optionId)
  })

  it('grant trait with overrides sets overrideDisplay on load', () => {
    const elf = SRD_SPECIES.find((s) => s.slug === 'elf')!
    const formValues = speciesFormDef.toFormValues(elf) as SpeciesFormValues
    const darkvision = formValues.traits.find((t) => t.id === 'darkvision')
    expect(darkvision?.kind).toBe('grant')
    expect(darkvision?.overrideDisplay).toBe(false)
  })

  it('round-trips grant trait display overrides when overrideDisplay is enabled', () => {
    const elf = SRD_SPECIES.find((s) => s.slug === 'elf')!
    const formValues = speciesFormDef.toFormValues(elf) as SpeciesFormValues
    const darkvision = formValues.traits.find((t) => t.id === 'darkvision')!
    darkvision.overrideDisplay = true
    darkvision.nameOverride = 'Superior Darkvision'
    darkvision.descriptionOverride = '<p>Custom homebrew wording.</p>'
    const input = speciesFormDef.toInput(formValues, { entity: elf })
    const trait = input.traits.find((t) => t.id === 'darkvision')
    expect(trait?.kind).toBe('grant')
    expect(trait?.kind === 'grant' && trait.nameOverride).toBe('Superior Darkvision')
    expect(trait?.kind === 'grant' && trait.descriptionOverride).toBe(
      '<p>Custom homebrew wording.</p>',
    )
  })

  it('draft: accepts name and creature type only', () => {
    const input = speciesFormDef.toInput(
      {
        name: '',
        creatureType: 'humanoid',
        sizes: [],
        movement: [],
        traits: [],
      } as SpeciesFormValues,
      undefined,
      'draft',
    )
    expect(input.name).toBe('Untitled Species')
    expect(input.creatureType).toBe('humanoid')
    expect(input.sizes).toEqual([])
    expect(input.movement).toEqual({})
    expect(input.traits).toEqual([])
  })

  it('draft form schema: allows heritage options with empty grant rows', () => {
    expect(() =>
      speciesDraftFormSchema.parse({
        name: 'Custom Species',
        creatureType: 'humanoid',
        sizes: [],
        movement: [],
        traits: [],
        heritage: {
          name: 'Lineage',
          choose: 1,
          options: [{ kind: 'grant', overrideDisplay: false, grants: [] }],
        },
      }),
    ).not.toThrow()
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

describe('speciesFormDef.buildTabs', () => {
  it('returns four tabs with expected ids', () => {
    const tabs = speciesFormDef.buildTabs!({})
    expect(tabs).toHaveLength(4)
    expect(tabs.map((tab) => tab.id)).toEqual(['basics', 'traits', 'heritage', 'rules'])
  })
})
