/**
 * Phase 4 validation sweep for every registered content form def.
 */
import { describe, expect, it } from 'vitest'
import { EQUIPMENT_KINDS, MAX_CHARACTER_LEVEL } from '@rpg/contracts'
import {
  assertFieldPathsRegistered,
  assertInvalidSubmitUsesRefinedMessages,
  assertRegistryCoverage,
  collectValidationIssues,
} from '@rpg/ui/form/test-utils'

import {
  contentFormFields,
  contentFormRegistry,
  type ContentFormDef,
} from './content-form-registry'

// Populate the registry.
import '../../species/lib/species-form-def'
import '../../classes/lib/class-form-def'
import '../../skill-proficiencies/lib/skill-proficiency-form-def'
import '../../equipment/lib/equipment-form-def'
import '../../spells/lib/spell-form-def'
import '../../feats/lib/feat-form-def'

import { createClassFormSchema } from '../../classes/lib/class-form-fields'
import {
  buildSubclassFields,
  subclassFormSchema,
} from '../../classes/lib/subclasses/subclass-form-fields'
import {
  heritageFormSchema,
  heritageScalarFields,
} from '../../species/lib/species-heritage-form-fields'
import { traitItemFields, traitRowFormSchema } from '../../species/lib/species-trait-form-fields'
import {
  classFeatureItemFields,
  createFeatureRowFormSchema,
} from '../../classes/lib/class-feature-form-fields'
import {
  startingEquipmentOptionFormSchema,
  startingEquipmentOptionItemFields,
} from '../../classes/lib/character-creation/class-starting-equipment-form-fields'
import {
  speciesLevelLimitsFields,
  speciesLevelLimitsFormSchema,
} from '../../species/lib/species-rules-form-fields'
import { createSpeciesFormSchema, buildSpeciesTabs } from '../../species/lib/species-form-fields'
import { createFeatFormSchema } from '../../feats/lib/feat-form-fields'
import { equipmentFormDef } from '../../equipment/lib/equipment-form-def'
import { resolveEquipmentFormSchema } from '../../equipment/lib/equipment-form-fields'
import { costToFormDefaults } from './fields/content-economy-form-fields'
import { assertHeaderOnlyTabsHaveValidationWiring } from './tabbed-form-validation-test-utils'
import { buildClassTabs } from '../../classes/lib/class-form-fields'

type AnyDef = ContentFormDef<{ id: string; name: string }, Record<string, unknown>, unknown>

const registryEntries = Object.entries(contentFormRegistry) as [string, AnyDef][]

const SLOT_IGNORE = [/^_/] as const

/** Slug is derived on create — optional in schema but not authored in identity fields. */
const SLUG_EXEMPT = ['slug'] as const

/** Server-managed row ids and form-only discriminators not rendered as fields. */
const SERVER_ROW_EXEMPT = ['id', 'kind'] as const

/** Heritage scalar paths not authored as visible fields (optional id, defaulted choose). */
const HERITAGE_FORM_EXEMPT = ['heritage.id', 'heritage.choose'] as const

/** Starting equipment package count is locked to 1 — not authored as a visible field. */
const STARTING_EQUIPMENT_FORM_EXEMPT = ['characterCreation.startingEquipment.choose'] as const

/** Grant union variants explode many schema paths; grant rows are tested at row scope. */
const GRANT_NESTED_EXEMPT = [/\.grants\.\*\./] as const

/** Family routes omit the Kind select — discriminant is fixed by route context. */
const EQUIPMENT_KIND_EXEMPT = ['kind'] as const

const COMMON_SCHEMA_EXEMPT = [
  ...SLOT_IGNORE,
  ...SLUG_EXEMPT,
  ...HERITAGE_FORM_EXEMPT,
  ...STARTING_EQUIPMENT_FORM_EXEMPT,
  ...GRANT_NESTED_EXEMPT,
] as const

const EQUIPMENT_SCHEMA_EXEMPT = [...COMMON_SCHEMA_EXEMPT, ...EQUIPMENT_KIND_EXEMPT] as const

/** Spell root effects tab removed; atomic effects live under resolution. */
const SPELLS_SCHEMA_EXEMPT = [
  ...COMMON_SCHEMA_EXEMPT,
  /^effects\b/,
  'resolution.methodKind',
  'resolution.selectionMode',
  'resolution.proximityKind',
  'resolution.applicationPatternKind',
  'resolution.attackType',
  'resolution.saveAbility',
  /^resolution\.outcomes\b/,
  /^resolution\.progressionBasis\b/,
  /^resolution\.progressionTracks\b/,
] as const

describe.each(registryEntries)('ContentFormDef[%s] validation', (routeKey, def) => {
  const ctx = routeKey === 'equipment' ? { equipmentKind: 'weapon' as const } : {}

  it('registers every configured form field path', () => {
    assertFieldPathsRegistered(contentFormFields(def, ctx))
  })

  it('registers schema leaf paths in the field error map', () => {
    const fields = contentFormFields(def, ctx)
    const schema = def.resolveSchema?.(ctx) ?? def.schema
    const exempt =
      routeKey === 'equipment'
        ? EQUIPMENT_SCHEMA_EXEMPT
        : routeKey === 'spells'
          ? SPELLS_SCHEMA_EXEMPT
          : COMMON_SCHEMA_EXEMPT

    assertRegistryCoverage(schema, fields, { exemptPaths: exempt })
  })

  it('rejects invalid submit without Zod default messages', () => {
    const fields = contentFormFields(def, ctx)
    const schema = def.resolveSchema?.(ctx) ?? def.schema

    assertInvalidSubmitUsesRefinedMessages(schema, fields, {
      invalidValue: invalidValueFor(routeKey),
      unionWhitelist: [/^grant\b/, /^grants\b/, /^features\b/, /^traits\b/, /^heritage\b/],
    })
  })
})

describe.each(EQUIPMENT_KINDS)('equipment form validation — %s', (kind) => {
  const ctx = { equipmentKind: kind }
  const fields = contentFormFields(equipmentFormDef, ctx)
  const schema = resolveEquipmentFormSchema(ctx)

  it('registers every configured form field path', () => {
    assertFieldPathsRegistered(fields)
  })

  it('registers schema leaf paths in the field error map', () => {
    assertRegistryCoverage(schema, fields, { exemptPaths: EQUIPMENT_SCHEMA_EXEMPT })
  })

  it('smoke: rejects empty name without Zod default messages', () => {
    assertInvalidSubmitUsesRefinedMessages(schema, fields, {
      invalidValue: smokeInvalidValueFor(kind),
    })
  })

  if (kind !== 'magic_item') {
    it('kind-specific: rejects invalid required kind field', () => {
      assertInvalidSubmitUsesRefinedMessages(schema, fields, {
        invalidValue: kindFieldInvalidValueFor(kind),
      })
    })
  }
})

describe('resolveEquipmentFormSchema dispatcher', () => {
  it.each(EQUIPMENT_KINDS)('%s schema discriminant matches kind', (kind) => {
    const schema = resolveEquipmentFormSchema({ equipmentKind: kind })
    const result = schema.safeParse(minimalValidEquipmentFor(kind))
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.kind).toBe(kind)
  })
})

function minimalValidEquipmentFor(kind: (typeof EQUIPMENT_KINDS)[number]): Record<string, unknown> {
  const base = { name: 'Test item', cost: costToFormDefaults() }

  switch (kind) {
    case 'weapon':
      return {
        ...base,
        kind,
        category: 'simple',
        mode: 'melee',
        mastery: 'cleave',
      }
    case 'armor':
      return { ...base, kind, armorCategory: 'light' }
    case 'adventuring_gear':
      return { ...base, kind, gearKind: 'general' }
    case 'tool':
      return { ...base, kind, toolCategory: 'artisan', ability: 'str' }
    case 'mount':
      return {
        ...base,
        kind,
        carryingCapacity: { value: 480, unit: 'lb' },
        speed: { value: 40, unit: 'ft' },
      }
    case 'vehicle':
      return { ...base, kind, vehicleCategory: 'water', speed: { value: 4, unit: 'mph' } }
    case 'service':
      return { ...base, kind, serviceCategory: 'lodging' }
    case 'magic_item':
      return { ...base, kind }
    default:
      return { ...base, kind }
  }
}

function smokeInvalidValueFor(kind: (typeof EQUIPMENT_KINDS)[number]): unknown {
  return { ...minimalValidEquipmentFor(kind), name: '' }
}

function kindFieldInvalidValueFor(kind: (typeof EQUIPMENT_KINDS)[number]): Record<string, unknown> {
  const valid = minimalValidEquipmentFor(kind)

  switch (kind) {
    case 'weapon':
      return { ...valid, category: '' }
    case 'armor':
      return { ...valid, armorCategory: '' }
    case 'adventuring_gear':
      return { ...valid, gearKind: '' }
    case 'tool':
      return { ...valid, toolCategory: '' }
    case 'mount':
    case 'vehicle':
      return { ...valid, speed: undefined }
    case 'service':
      return { ...valid, serviceCategory: '' }
    default:
      return valid
  }
}

function invalidValueFor(routeKey: string): unknown {
  switch (routeKey) {
    case 'species':
      return {
        name: '',
        creatureType: 'humanoid',
        sizes: [],
        movement: [{ mode: 'walk', feet: 30 }],
        traits: [],
      }
    case 'classes':
      return {
        name: '',
        primaryAbilities: [],
        hitDie: 8,
        hasSpellcasting: false,
        weaponProficiencyMode: 'categories',
        proficiencies: {
          savingThrows: [],
          armor: [],
          weapons: { categories: [] },
          tools: { categories: [] },
          skills: { choose: 0, from: [] },
        },
        features: [],
      }
    case 'spells':
      return {
        name: '',
        school: 'evocation',
        level: 1,
        classIds: [],
        castingTime: {
          normal: { value: 1, unit: 'action' },
          canBeCastAsRitual: false,
        },
        range: { kind: 'self' },
        duration: { kind: 'instant' },
        components: {},
        areaOfEffect: { shape: 'none' },
      }
    case 'feats':
      return {
        name: '',
        category: 'origin',
        prerequisiteEditor: { mode: 'all', requirements: [] },
        repeatableAllowed: false,
      }
    case 'skill-proficiencies':
      return {
        name: '',
        ability: 'str',
      }
    case 'equipment':
      return smokeInvalidValueFor('weapon')
    default:
      return {}
  }
}

describe('embedded content sub-forms validation', () => {
  const ctx = {}

  it('species trait rows', () => {
    const fields = traitItemFields(ctx)
    assertFieldPathsRegistered(fields)
    assertRegistryCoverage(traitRowFormSchema, fields, {
      exemptPaths: [...SERVER_ROW_EXEMPT, ...GRANT_NESTED_EXEMPT],
    })
    assertInvalidSubmitUsesRefinedMessages(traitRowFormSchema, fields, {
      invalidValue: { kind: 'custom', name: '', grants: [] },
      unionWhitelist: [/^grants\b/],
    })
  })

  it('species heritage scalars', () => {
    const fields = heritageScalarFields(ctx)
    assertFieldPathsRegistered(fields)
    assertRegistryCoverage(heritageFormSchema, fields, {
      exemptPaths: [...SERVER_ROW_EXEMPT, 'choose', /^options\b/, ...GRANT_NESTED_EXEMPT],
    })
    assertInvalidSubmitUsesRefinedMessages(heritageFormSchema, fields, {
      invalidValue: {
        name: '',
        choose: 1,
        options: [{ kind: 'custom', name: 'Option', grants: [] }],
      },
      unionWhitelist: [/^options\b/],
    })
  })

  it('species character-creation rules (level limits)', () => {
    const fields = speciesLevelLimitsFields(ctx)
    assertFieldPathsRegistered(fields)
    assertRegistryCoverage(speciesLevelLimitsFormSchema, fields)
    assertInvalidSubmitUsesRefinedMessages(speciesLevelLimitsFormSchema, fields)
  })

  it('class feature rows', () => {
    const schema = createFeatureRowFormSchema(MAX_CHARACTER_LEVEL)
    const fields = classFeatureItemFields(ctx)
    assertFieldPathsRegistered(fields)
    assertRegistryCoverage(schema, fields, {
      exemptPaths: [...SERVER_ROW_EXEMPT, ...GRANT_NESTED_EXEMPT],
    })
    assertInvalidSubmitUsesRefinedMessages(schema, fields, {
      invalidValue: { name: '', level: 1, grants: [] },
      unionWhitelist: [/^grants\b/],
    })
  })

  it('class starting equipment options', () => {
    const fields = startingEquipmentOptionItemFields(ctx)
    assertFieldPathsRegistered(fields)
    assertRegistryCoverage(startingEquipmentOptionFormSchema, fields, {
      exemptPaths: [...SERVER_ROW_EXEMPT, ...GRANT_NESTED_EXEMPT],
    })
    assertInvalidSubmitUsesRefinedMessages(startingEquipmentOptionFormSchema, fields, {
      invalidValue: { label: '', items: [] },
      unionWhitelist: [/^items\b/],
    })
  })

  it('subclass editor panel', () => {
    const fields = buildSubclassFields(ctx)
    assertFieldPathsRegistered(fields)
    assertRegistryCoverage(subclassFormSchema, fields, { exemptPaths: SLUG_EXEMPT })
    assertInvalidSubmitUsesRefinedMessages(subclassFormSchema, fields, {
      invalidValue: { name: '', features: [] },
    })
  })
})

describe('content form schema factories', () => {
  it('species heritage.name resolves refined copy via resolverFields', () => {
    const fields = contentFormFields(contentFormRegistry.species!, {})
    const schema = createSpeciesFormSchema(['humanoid'])
    const issues = collectValidationIssues(
      schema,
      {
        name: 'Elf',
        creatureType: 'humanoid',
        sizes: ['medium'],
        movement: [{ mode: 'walk', feet: 30 }],
        traits: [],
        heritage: {
          name: '',
          choose: 1,
          options: [{ kind: 'custom', name: 'Option', grants: [] }],
        },
      },
      fields,
    )

    expect(issues.find((issue) => issue.path === 'heritage.name')?.message).toBe(
      'Name is required.',
    )
  })

  it('species and class campaign-aware schemas reject basics without Zod defaults', () => {
    const speciesFields = contentFormFields(contentFormRegistry.species!, {})
    const speciesSchema = createSpeciesFormSchema(['humanoid'])
    assertInvalidSubmitUsesRefinedMessages(speciesSchema, speciesFields, {
      invalidValue: invalidValueFor('species'),
    })

    const classFields = contentFormFields(contentFormRegistry.classes!, {})
    const classSchema = createClassFormSchema(MAX_CHARACTER_LEVEL)
    assertInvalidSubmitUsesRefinedMessages(classSchema, classFields, {
      invalidValue: invalidValueFor('classes'),
      unionWhitelist: [/^features\b/],
    })
  })

  it('feat schema with prerequisite slot', () => {
    const fields = contentFormFields(contentFormRegistry.feats!, {})
    const schema = createFeatFormSchema(MAX_CHARACTER_LEVEL)
    assertInvalidSubmitUsesRefinedMessages(schema, fields, {
      invalidValue: invalidValueFor('feats'),
    })
  })
})

describe('TabbedForm header-only validation wiring', () => {
  it('species tabs wire errorPaths and resolverFields on master-detail tabs', () => {
    assertHeaderOnlyTabsHaveValidationWiring(buildSpeciesTabs({}))
  })

  it('class tabs wire errorPaths and resolverFields on master-detail tabs', () => {
    assertHeaderOnlyTabsHaveValidationWiring(buildClassTabs({}), {
      exemptTabIds: ['subclasses'],
    })
  })
})
