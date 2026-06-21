import { z } from 'zod'
import {
  ABILITIES,
  ABILITY_IDS,
  ARMOR_CATEGORIES,
  ARMOR_CATEGORY_ENTRIES,
  CLASS_HIT_DICE,
  MAX_CHARACTER_LEVEL,
  SKILL_IDS,
  SKILLS,
  SPELLCASTING_PROGRESSIONS,
  SPELL_PREPARATION_MODES,
  SPELL_PREPARATION_MODE_LABELS,
  WEAPON_CATEGORIES,
  WEAPON_CATEGORY_ENTRIES,
  abilitySchema,
  armorCategorySchema,
  formatHitDie,
  hitDieSchema,
  levelSchema,
  skillSchema,
  slugSchema,
  weaponCategorySchema,
  type CharacterClass,
  type ClassFeature,
  type ClassProficiencies,
  type ClassResource,
  type CreateClassInput,
  type Spellcasting,
} from '@rpg/contracts'
import { toOptions, type FieldOption, type FieldVisibility, type FormItem } from '@rpg/ui/form'

import {
  CLASS_GRANT_TYPES,
  CLASS_GRANT_TYPE_LABELS,
  formRowsToGrants,
  grantArrayFields,
  grantRowFormSchema,
  grantsToFormRows,
} from '../../lib/grant-form-helpers'
import {
  contentFormRegistry,
  type ContentFormCtx,
  type ContentFormDef,
  type ContentFormInputCtx,
} from '../../lib/content-form-registry'
import { identityFields } from '../../lib/content-form-field-helpers'
import {
  applyStableIdsForUpdate,
  envelopeSlugFields,
  finalizeContentInput,
} from '../../lib/content-form-key-helpers'
import { titleCase } from '../../lib/title-case'
import { CANTRIPS_KNOWN_PROFILES } from './cantrips-profiles'
import {
  emptyProgressionTable,
  progressionTableFromFormValues,
  progressionTableToFormValues,
  type ProgressionTableFormValue,
} from './progression-table-helpers'
import { classesQueryKey, useClasses } from '../hooks/use-classes'
import {
  normalizeClassWeaponProficiencies,
  specificWeaponFieldsAllowed,
} from './class-weapon-proficiency-helpers'

const SPECIFIC_WEAPONS_TOGGLE_HINT =
  'Grant individual weapon proficiencies instead of (or when not using) whole categories — e.g. Sorcerer (dagger, dart, sling).'

const WEAPON_CATEGORIES_HINT =
  'Selecting a category grants all weapons in it. Use specific weapons only for picks outside those categories.'

// ---------------------------------------------------------------------------
// Vocab option lists
// ---------------------------------------------------------------------------

const abilityOptions = toOptions(ABILITY_IDS, ABILITIES)

const hitDieOptions: FieldOption[] = CLASS_HIT_DICE.map((face) => ({
  value: String(face),
  label: formatHitDie(face),
}))

const levelOptions: FieldOption[] = Array.from({ length: MAX_CHARACTER_LEVEL }, (_, index) => {
  const level = index + 1
  return { value: String(level), label: `Level ${level}` }
})

const armorCategoryOptions = toOptions(
  ARMOR_CATEGORIES,
  Object.fromEntries(ARMOR_CATEGORIES.map((c) => [c, ARMOR_CATEGORY_ENTRIES[c].label])) as Record<
    (typeof ARMOR_CATEGORIES)[number],
    string
  >,
)

const weaponCategoryOptions = toOptions(
  WEAPON_CATEGORIES,
  Object.fromEntries(WEAPON_CATEGORIES.map((c) => [c, WEAPON_CATEGORY_ENTRIES[c].label])) as Record<
    (typeof WEAPON_CATEGORIES)[number],
    string
  >,
)

const skillOptions = toOptions(SKILL_IDS, SKILLS as Record<(typeof SKILL_IDS)[number], string>)

const spellcastingProgressionOptions = toOptions(
  SPELLCASTING_PROGRESSIONS,
  Object.fromEntries(SPELLCASTING_PROGRESSIONS.map((p) => [p, `${titleCase(p)} caster`])) as Record<
    (typeof SPELLCASTING_PROGRESSIONS)[number],
    string
  >,
)

const spellPreparationOptions = toOptions(SPELL_PREPARATION_MODES, SPELL_PREPARATION_MODE_LABELS)

// ---------------------------------------------------------------------------
// Form schema
// ---------------------------------------------------------------------------

const progressionTableFormSchema = z.object({
  cantrips: z.array(z.number().int().min(0).nullable()),
  spellsAvailable: z.array(z.number().int().min(0).nullable()),
})

const spellcastingFormSchema = z.object({
  progression: z.enum(SPELLCASTING_PROGRESSIONS).optional(),
  ability: abilitySchema.optional(),
  preparation: z.enum(SPELL_PREPARATION_MODES).optional(),
  progressionTable: progressionTableFormSchema.optional(),
})

const proficienciesFormSchema = z.object({
  savingThrows: z.array(abilitySchema).min(1).max(2),
  armor: z.array(armorCategorySchema),
  weapons: z.object({
    categories: z.array(weaponCategorySchema),
    items: z.array(z.string()).optional(),
  }),
  tools: z.array(z.string()).optional(),
  skills: z.object({
    choose: z.coerce.number().int().min(0),
    from: z.array(skillSchema),
  }),
})

const featureRowFormSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  level: z.coerce.number().pipe(levelSchema),
  grants: z.array(grantRowFormSchema),
})

const resourceEntryFormSchema = z.object({
  level: z.coerce.number().pipe(levelSchema),
  value: z.coerce.number().int().min(0),
})

const resourceRowFormSchema = z.object({
  name: z.string().min(1),
  entries: z.array(resourceEntryFormSchema).min(1),
})

const classFormSchema = z.object({
  name: z.string().min(1),
  slug: slugSchema.optional(),
  description: z.string().optional(),
  primaryAbilities: z.array(abilitySchema).min(1).max(2),
  hitDie: z.coerce.number().pipe(hitDieSchema),
  asiLevels: z.array(z.coerce.number().pipe(levelSchema)),
  subclassLevels: z.array(z.coerce.number().pipe(levelSchema)).min(1),
  hasSpellcasting: z.boolean(),
  hasSpecificWeapons: z.boolean(),
  spellcasting: spellcastingFormSchema.optional(),
  proficiencies: proficienciesFormSchema,
  features: z.array(featureRowFormSchema),
  resources: z.array(resourceRowFormSchema).optional(),
})

type ClassFormValues = z.infer<typeof classFormSchema>
type FeatureRowForm = z.infer<typeof featureRowFormSchema>
type ResourceRowForm = z.infer<typeof resourceRowFormSchema>

// ---------------------------------------------------------------------------
// Conditional visibility
// ---------------------------------------------------------------------------

function visibleWhenSpellcasting(): FieldVisibility {
  return {
    dependsOn: ['hasSpellcasting'],
    visibleWhen: (watched) => watched['hasSpellcasting'] === true,
  }
}

function visibleWhenSpecificWeaponsToggle(): FieldVisibility {
  return {
    dependsOn: ['proficiencies.weapons.categories'],
    visibleWhen: (watched) =>
      specificWeaponFieldsAllowed(watched['proficiencies.weapons.categories']),
  }
}

function visibleWhenSpecificWeaponsCombobox(): FieldVisibility {
  return {
    dependsOn: ['hasSpecificWeapons', 'proficiencies.weapons.categories'],
    visibleWhen: (watched) =>
      watched['hasSpecificWeapons'] === true &&
      specificWeaponFieldsAllowed(watched['proficiencies.weapons.categories']),
  }
}

const spellProgressionGridField: FormItem = {
  type: 'editableGrid',
  name: 'spellcasting.progressionTable',
  label: 'Spell progression',
  rowCount: MAX_CHARACTER_LEVEL,
  visibility: visibleWhenSpellcasting(),
  columns: [
    {
      key: 'cantrips',
      label: 'Cantrips known',
      control: 'select',
      min: 1,
      max: 6,
    },
    {
      key: 'spellsAvailable',
      label: (watched) =>
        watched['spellcasting.preparation'] === 'known' ? 'Spells known' : 'Spells prepared',
      control: 'number',
      min: 0,
      labelDependsOn: ['spellcasting.preparation'],
      visibility: {
        dependsOn: ['spellcasting.preparation'],
        visibleWhen: (watched) => {
          const mode = watched['spellcasting.preparation']
          return mode === 'prepared' || mode === 'known'
        },
      },
    },
  ],
  templates: {
    cantrips: CANTRIPS_KNOWN_PROFILES,
  },
}

// ---------------------------------------------------------------------------
// Field builders
// ---------------------------------------------------------------------------

function featureItemFields(ctx: ContentFormCtx): FormItem[] {
  return [
    {
      kind: 'row',
      fields: [
        {
          type: 'select',
          name: 'level',
          label: 'Level',
          options: levelOptions,
          required: true,
        },
        { type: 'text', name: 'name', label: 'Name', required: true },
      ],
    },
    { type: 'richtext', name: 'description', label: 'Description' },
    ...grantArrayFields(CLASS_GRANT_TYPES, CLASS_GRANT_TYPE_LABELS, ctx),
  ]
}

function resourceItemFields(): FormItem[] {
  return [
    { type: 'text', name: 'name', label: 'Name', required: true },
    {
      kind: 'array',
      name: 'entries',
      legend: 'Level values',
      addLabel: 'Add level value',
      min: 1,
      itemTitle: (values, index) =>
        values['level'] ? `Level ${values['level']}` : `Entry ${index + 1}`,
      fields: [
        {
          type: 'select',
          name: 'level',
          label: 'Character level',
          options: levelOptions,
          required: true,
        },
        {
          type: 'number',
          name: 'value',
          label: 'Value',
          min: 0,
          required: true,
        },
      ],
    },
  ]
}

// ---------------------------------------------------------------------------
// Conversion helpers
// ---------------------------------------------------------------------------

function proficienciesToFormValues(proficiencies: ClassProficiencies) {
  return {
    savingThrows: proficiencies.savingThrows,
    armor: proficiencies.armor,
    weapons: {
      categories: proficiencies.weapons.categories,
      items: proficiencies.weapons.items ?? [],
    },
    tools: proficiencies.tools ?? [],
    skills: proficiencies.skills,
  }
}

function proficienciesFromFormValues(
  proficiencies: ClassFormValues['proficiencies'],
  hasSpecificWeapons: boolean,
  weaponCategoryBySlug?: ContentFormInputCtx<CharacterClass>['weaponCategoryBySlug'],
): ClassProficiencies {
  const tools = proficiencies.tools ?? []
  const weapons = normalizeClassWeaponProficiencies({
    categories: proficiencies.weapons.categories,
    items: proficiencies.weapons.items,
    hasSpecificWeapons,
    categoryBySlug: weaponCategoryBySlug,
  })

  return {
    savingThrows: proficiencies.savingThrows,
    armor: proficiencies.armor,
    weapons,
    ...(tools.length ? { tools } : {}),
    skills: proficiencies.skills,
  }
}

function featureToFormRow(feature: ClassFeature): FeatureRowForm {
  return {
    id: feature.id,
    name: feature.name,
    description: feature.description,
    level: feature.level,
    grants: grantsToFormRows(feature.grants),
  }
}

function featureFromFormRow(row: FeatureRowForm & { id: string }): ClassFeature {
  return {
    kind: 'custom',
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    level: row.level,
    grants: formRowsToGrants(row.grants),
  }
}

function featuresFromFormValues(
  rows: FeatureRowForm[],
  existing?: readonly ClassFeature[],
): ClassFeature[] {
  return applyStableIdsForUpdate(rows, existing).map(featureFromFormRow)
}

function resourceToFormRow(resource: ClassResource): ResourceRowForm {
  return {
    name: resource.name,
    entries: resource.entries,
  }
}

function resourceFromFormRow(row: ResourceRowForm): ClassResource {
  return {
    name: row.name,
    entries: row.entries,
  }
}

function spellcastingToFormValues(spellcasting: Spellcasting | undefined) {
  if (!spellcasting) {
    return {
      progression: undefined,
      ability: undefined,
      preparation: undefined,
      progressionTable: emptyProgressionTable(),
    }
  }

  return {
    progression: spellcasting.progression,
    ability: spellcasting.ability,
    preparation: spellcasting.preparation,
    progressionTable: progressionTableToFormValues(
      spellcasting.cantrips,
      spellcasting.spellsAvailable,
    ),
  }
}

function hasCompleteSpellcastingCore(
  hasSpellcasting: boolean,
  spellcasting: ClassFormValues['spellcasting'],
): boolean {
  return Boolean(
    hasSpellcasting &&
    spellcasting?.progression &&
    spellcasting?.ability &&
    spellcasting?.preparation,
  )
}

function appendOptionalProgressionTables(
  result: Spellcasting,
  progressionTable: ProgressionTableFormValue | undefined,
): void {
  const { cantrips, spellsAvailable } = progressionTableFromFormValues(progressionTable)
  if (cantrips) result.cantrips = cantrips
  if (spellsAvailable) result.spellsAvailable = spellsAvailable
}

function spellcastingFromFormValues(
  hasSpellcasting: boolean,
  spellcasting: ClassFormValues['spellcasting'],
): Spellcasting | undefined {
  if (!hasCompleteSpellcastingCore(hasSpellcasting, spellcasting) || !spellcasting) {
    return undefined
  }

  const result: Spellcasting = {
    progression: spellcasting.progression!,
    ability: spellcasting.ability!,
    preparation: spellcasting.preparation!,
  }
  appendOptionalProgressionTables(result, spellcasting.progressionTable)
  return result
}

// ---------------------------------------------------------------------------
// Create-form defaults
// ---------------------------------------------------------------------------

const classCreateDefaultValues: Partial<ClassFormValues> = {
  primaryAbilities: ['str'],
  hitDie: 8,
  asiLevels: [4, 8, 12, 16, 19],
  subclassLevels: [3],
  hasSpellcasting: false,
  hasSpecificWeapons: false,
  spellcasting: {
    progression: 'full',
    ability: 'int',
    preparation: 'prepared',
    progressionTable: emptyProgressionTable(),
  },
  proficiencies: {
    savingThrows: ['str'],
    armor: [],
    weapons: { categories: [], items: [] },
    tools: [],
    skills: { choose: 2, from: [] },
  },
  features: [],
  resources: [],
}

// ---------------------------------------------------------------------------
// Class ContentFormDef
// ---------------------------------------------------------------------------

const classFormDef: ContentFormDef<CharacterClass, ClassFormValues, CreateClassInput> = {
  routeKey: 'classes',

  schema: classFormSchema,
  createDefaultValues: classCreateDefaultValues,

  buildFields: (ctx) => [
    {
      kind: 'group',
      legend: 'Identity',
      fields: identityFields(),
    },
    {
      kind: 'group',
      legend: 'Core attributes',
      fields: [
        {
          kind: 'row',
          fields: [
            {
              type: 'chips',
              name: 'primaryAbilities',
              label: 'Primary abilities',
              options: abilityOptions,
              max: 2,
              required: true,
            },
            {
              type: 'select',
              name: 'hitDie',
              label: 'Hit die',
              options: hitDieOptions,
              required: true,
            },
          ],
        },
        {
          type: 'chips',
          name: 'asiLevels',
          label: 'ASI levels',
          options: levelOptions,
          hint: 'Levels that grant an ability score improvement',
        },
        {
          type: 'chips',
          name: 'subclassLevels',
          label: 'Subclass levels',
          options: levelOptions,
          required: true,
          hint: 'Levels that grant a subclass feature',
        },
      ],
    },
    {
      kind: 'group',
      legend: 'Spellcasting',
      fields: [
        {
          type: 'switch',
          name: 'hasSpellcasting',
          label: 'Has spellcasting',
        },
        {
          kind: 'row',
          fields: [
            {
              type: 'select',
              name: 'spellcasting.progression',
              label: 'Progression',
              options: spellcastingProgressionOptions,
              visibility: visibleWhenSpellcasting(),
              required: true,
            },
            {
              type: 'select',
              name: 'spellcasting.ability',
              label: 'Spellcasting ability',
              options: abilityOptions,
              visibility: visibleWhenSpellcasting(),
              required: true,
            },
            {
              type: 'select',
              name: 'spellcasting.preparation',
              label: 'Preparation',
              options: spellPreparationOptions,
              visibility: visibleWhenSpellcasting(),
              required: true,
            },
          ],
        },
        spellProgressionGridField,
      ],
    },
    {
      kind: 'group',
      legend: 'Proficiencies',
      fields: [
        {
          type: 'chips',
          name: 'proficiencies.savingThrows',
          label: 'Saving throws',
          options: abilityOptions,
          max: 2,
          required: true,
        },
        {
          type: 'chips',
          name: 'proficiencies.armor',
          label: 'Armor',
          options: armorCategoryOptions,
        },
        {
          type: 'chips',
          name: 'proficiencies.weapons.categories',
          label: 'Weapon categories',
          options: weaponCategoryOptions,
          hint: WEAPON_CATEGORIES_HINT,
        },
        {
          type: 'switch',
          name: 'hasSpecificWeapons',
          label: 'Specific weapons',
          hint: SPECIFIC_WEAPONS_TOGGLE_HINT,
          visibility: visibleWhenSpecificWeaponsToggle(),
        },
        {
          type: 'combobox',
          name: 'proficiencies.weapons.items',
          label: 'Weapon choices',
          multiple: true,
          options: ctx.options?.weapons ?? [],
          placeholder: 'Choose weapons…',
          visibility: visibleWhenSpecificWeaponsCombobox(),
        },
        {
          type: 'combobox',
          name: 'proficiencies.tools',
          label: 'Tools',
          multiple: true,
          options: ctx.options?.tools ?? [],
          placeholder: 'Choose tools…',
        },
        {
          kind: 'row',
          fields: [
            {
              type: 'number',
              name: 'proficiencies.skills.choose',
              label: 'Skill choices',
              min: 0,
              required: true,
            },
            {
              type: 'chips',
              name: 'proficiencies.skills.from',
              label: 'Skill options',
              options: skillOptions,
            },
          ],
        },
      ],
    },
    {
      kind: 'array',
      name: 'features',
      legend: 'Features',
      addLabel: 'Add feature',
      itemTitle: (values, index) => (values['name'] as string) || `Feature ${index + 1}`,
      fields: featureItemFields(ctx),
    },
    {
      kind: 'array',
      name: 'resources',
      legend: 'Resources',
      addLabel: 'Add resource',
      itemTitle: (values, index) => (values['name'] as string) || `Resource ${index + 1}`,
      fields: resourceItemFields(),
    },
  ],

  toFormValues: (entity) => ({
    name: entity.name,
    slug: entity.slug,
    description: entity.description,
    primaryAbilities: entity.primaryAbilities,
    hitDie: entity.hitDie,
    asiLevels: entity.asiLevels,
    subclassLevels: entity.subclassLevels,
    hasSpellcasting: entity.spellcasting !== undefined,
    hasSpecificWeapons: (entity.proficiencies.weapons.items?.length ?? 0) > 0,
    spellcasting: spellcastingToFormValues(entity.spellcasting),
    proficiencies: proficienciesToFormValues(entity.proficiencies),
    features: entity.features.map(featureToFormRow),
    resources: entity.resources?.map(resourceToFormRow) ?? [],
  }),

  toInput: (values, ctx?: ContentFormInputCtx<CharacterClass>) =>
    finalizeContentInput(
      {
        ...envelopeSlugFields(values.name, ctx),
        name: values.name,
        description: values.description || undefined,
        primaryAbilities: values.primaryAbilities,
        hitDie: values.hitDie,
        asiLevels: values.asiLevels,
        subclassLevels: values.subclassLevels,
        spellcasting: spellcastingFromFormValues(values.hasSpellcasting, values.spellcasting),
        proficiencies: proficienciesFromFormValues(
          values.proficiencies,
          values.hasSpecificWeapons ?? false,
          ctx?.weaponCategoryBySlug,
        ),
        features: featuresFromFormValues(values.features, ctx?.entity?.features),
        resources: values.resources?.length ? values.resources.map(resourceFromFormRow) : undefined,
      },
      ctx,
    ) as CreateClassInput,

  useListQuery: useClasses,
  queryKey: classesQueryKey,
}

contentFormRegistry['classes'] = classFormDef

export { classFormDef }
export type { ClassFormValues }
