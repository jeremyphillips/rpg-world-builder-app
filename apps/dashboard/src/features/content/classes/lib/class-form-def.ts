import { z } from 'zod'
import { createElement } from 'react'
import {
  ABILITY_ENTRIES,
  ABILITY_IDS,
  ARMOR_CATEGORIES,
  ARMOR_CATEGORY_ENTRIES,
  CLASS_HIT_DICE,
  campaignLevelSchema,
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
  skillSchema,
  slugSchema,
  weaponCategorySchema,
  type CharacterClass,
  type ClassProficiencies,
  type ClassProficienciesWrite,
  type ClassResource,
  type CreateClassInput,
  type Spellcasting,
} from '@rpg/contracts'
import {
  toOptions,
  type FieldOption,
  type FieldVisibility,
  type FormItem,
  type TabbedFormTab,
} from '@rpg/ui/form'

import {
  contentFormRegistry,
  contentFormFields,
  type ContentFormCtx,
  type ContentFormDef,
  type ContentFormInputCtx,
} from '../../lib/content-form-registry'
import { identityFields } from '../../lib/content-form-field-helpers'
import { envelopeSlugFields, finalizeContentInput } from '../../lib/content-form-key-helpers'
import {
  getLevelFieldOptions,
  getFlatLevelFieldOptions,
  effectiveMaxFromCtx,
} from '../../lib/level-field-options'
import { titleCase } from '../../lib/title-case'
import { CANTRIPS_KNOWN_PROFILES } from './cantrips-profiles'
import {
  emptyProgressionTable,
  progressionTableFromFormValues,
  progressionTableToFormValues,
  type ProgressionTableFormValue,
} from './progression-table-helpers'
import { classesQueryKey, useClasses } from '../hooks/use-classes'
import { normalizeClassWeaponProficiencies } from './class-weapon-proficiency-helpers'
import { ClassFeaturesTab } from '../components/class-features-tab.client'
import { ClassSubclassesTab } from '../components/class-subclasses-tab.client'
import {
  SUBCLASS_CHOICE_LEVEL_NONE,
  WEAPON_PROFICIENCY_MODES,
  WEAPON_PROFICIENCY_MODE_LABELS,
} from './class-form-constants'
import {
  createFeatureRowFormSchema,
  featuresFromFormValues,
  featureToFormRow,
} from './class-feature-form-fields'
import { deriveAsiLevels, syncAsiFeatures } from './class-asi-features'

const SAVING_THROWS_HINT = 'Select up to 2 abilities.'

const CLASS_SKILL_OPTIONS_HINT =
  'Skill options are shared with each skill’s suggested classes. Changes here update those skill records.'

const INDIVIDUAL_WEAPONS_TOGGLE_HINT =
  'Choose named weapons instead of categories. Most classes use categories; limited lists (e.g. Sorcerer) use this mode.'

const WEAPON_PROFICIENCIES_HINT =
  'Each selected category grants proficiency with every weapon in it.'

// ---------------------------------------------------------------------------
// Vocab option lists
// ---------------------------------------------------------------------------

const abilityOptions = toOptions(
  ABILITY_IDS,
  Object.fromEntries(ABILITY_IDS.map((id) => [id, ABILITY_ENTRIES[id].label])) as Record<
    (typeof ABILITY_IDS)[number],
    string
  >,
)

const hitDieOptions: FieldOption[] = CLASS_HIT_DICE.map((face) => ({
  value: String(face),
  label: formatHitDie(face),
}))

const subclassChoiceLevelOptions = (ctx: ContentFormCtx) => [
  { value: SUBCLASS_CHOICE_LEVEL_NONE, label: 'None' },
  ...getLevelFieldOptions(ctx),
]

function maxLevelFromCtx(ctx: ContentFormCtx): number {
  return effectiveMaxFromCtx(ctx)
}

const armorCategoryOptions = toOptions(
  ARMOR_CATEGORIES,
  Object.fromEntries(ARMOR_CATEGORIES.map((c) => [c, ARMOR_CATEGORY_ENTRIES[c].label])) as Record<
    (typeof ARMOR_CATEGORIES)[number],
    string
  >,
)

const WEAPON_PROFICIENCY_MODE_OPTIONS = toOptions(
  WEAPON_PROFICIENCY_MODES,
  WEAPON_PROFICIENCY_MODE_LABELS,
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

const proficienciesFormSchema = z.object({
  savingThrows: z.array(abilitySchema).min(1).max(2),
  armor: z.array(armorCategorySchema),
  weapons: z.object({
    categories: z.array(weaponCategorySchema),
    items: z.array(z.string()).optional(),
  }),
  tools: z.array(z.string()).optional(),
  skills: z.object({
    choose: z.coerce.number().int().min(0).max(SKILL_IDS.length),
    from: z.array(skillSchema),
  }),
})

function campaignLevelField(maxLevel: number) {
  return z.coerce.number().pipe(campaignLevelSchema(maxLevel))
}

function createSpellcastingFormSchema(maxLevel: number) {
  const levelField = campaignLevelField(maxLevel)
  return z.object({
    level: levelField.optional(),
    description: z.string().optional(),
    progression: z.enum(SPELLCASTING_PROGRESSIONS).optional(),
    ability: abilitySchema.optional(),
    preparation: z.enum(SPELL_PREPARATION_MODES).optional(),
    progressionTable: progressionTableFormSchema.optional(),
  })
}

function createClassFormSchema(maxLevel: number = MAX_CHARACTER_LEVEL) {
  const levelField = campaignLevelField(maxLevel)
  const resourceEntryFormSchema = z.object({
    level: levelField,
    value: z.coerce.number().int().min(0),
  })
  const resourceRowFormSchema = z.object({
    name: z.string().min(1),
    entries: z.array(resourceEntryFormSchema).min(1),
  })

  return z.object({
    name: z.string().min(1),
    slug: slugSchema.optional(),
    description: z.string().optional(),
    primaryAbilities: z.array(abilitySchema).min(1).max(2),
    hitDie: z.coerce.number().pipe(hitDieSchema),
    asiLevels: z.array(levelField),
    subclassChoiceLevel: z.union([z.literal(SUBCLASS_CHOICE_LEVEL_NONE), z.string()]),
    hasSpellcasting: z.boolean(),
    weaponProficiencyMode: z.enum(WEAPON_PROFICIENCY_MODES),
    spellcasting: createSpellcastingFormSchema(maxLevel).optional(),
    proficiencies: proficienciesFormSchema,
    features: z.array(createFeatureRowFormSchema(maxLevel)),
    resources: z.array(resourceRowFormSchema).optional(),
  })
}

const classFormSchema = createClassFormSchema()

type ClassFormValues = z.infer<typeof classFormSchema>
type ResourceRowForm = {
  name: string
  entries: { level: number; value: number }[]
}

// ---------------------------------------------------------------------------
// Conditional visibility
// ---------------------------------------------------------------------------

function visibleWhenSpellcasting(): FieldVisibility {
  return {
    dependsOn: ['hasSpellcasting'],
    visibleWhen: (watched) => watched['hasSpellcasting'] === true,
  }
}

function visibleWhenWeaponCategories(): FieldVisibility {
  return {
    dependsOn: ['weaponProficiencyMode'],
    visibleWhen: (watched) => watched['weaponProficiencyMode'] === 'categories',
  }
}

function visibleWhenIndividualWeapons(): FieldVisibility {
  return {
    dependsOn: ['weaponProficiencyMode'],
    visibleWhen: (watched) => watched['weaponProficiencyMode'] === 'individual',
  }
}

function buildSpellProgressionGridField(rowCount: number): FormItem {
  return {
    type: 'editableGrid',
    name: 'spellcasting.progressionTable',
    label: 'Spell progression',
    rowCount,
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
}

// ---------------------------------------------------------------------------
// Field builders
// ---------------------------------------------------------------------------

function resourceItemFields(ctx: ContentFormCtx): FormItem[] {
  const levelOptions = getLevelFieldOptions(ctx)
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
          kind: 'row',
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
              width: 'sm',
            },
          ],
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
): ClassProficienciesWrite {
  const tools = proficiencies.tools ?? []
  const weapons = normalizeClassWeaponProficiencies({
    categories: proficiencies.weapons.categories,
    items: proficiencies.weapons.items,
    hasSpecificWeapons,
  })

  return {
    savingThrows: proficiencies.savingThrows,
    armor: proficiencies.armor,
    weapons,
    ...(tools.length ? { tools } : {}),
    skills: { choose: proficiencies.skills.choose },
  }
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

function progressionRowCount(spellcasting?: Spellcasting): number {
  const levels = [
    ...(spellcasting?.cantrips?.map((entry) => entry.level) ?? []),
    ...(spellcasting?.spellsAvailable?.map((entry) => entry.level) ?? []),
  ]
  const maxInData = levels.length > 0 ? Math.max(...levels) : 0
  return Math.max(MAX_CHARACTER_LEVEL, maxInData)
}

function spellcastingToFormValues(spellcasting: Spellcasting | undefined) {
  const rowCount = progressionRowCount(spellcasting)
  if (!spellcasting) {
    return {
      level: 1,
      description: undefined,
      progression: undefined,
      ability: undefined,
      preparation: undefined,
      progressionTable: emptyProgressionTable(rowCount),
    }
  }

  return {
    level: spellcasting.level,
    description: spellcasting.description,
    progression: spellcasting.progression,
    ability: spellcasting.ability,
    preparation: spellcasting.preparation,
    progressionTable: progressionTableToFormValues(
      spellcasting.cantrips,
      spellcasting.spellsAvailable,
      rowCount,
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
    level: spellcasting.level ?? 1,
    progression: spellcasting.progression!,
    ability: spellcasting.ability!,
    preparation: spellcasting.preparation!,
  }
  if (spellcasting.description?.trim()) {
    result.description = spellcasting.description.trim()
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
  subclassChoiceLevel: '3',
  hasSpellcasting: false,
  weaponProficiencyMode: 'categories',
  spellcasting: {
    level: 1,
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
// Tab field builders
// ---------------------------------------------------------------------------

function coreAttributesFields(ctx: ContentFormCtx): FormItem[] {
  const flatLevelOptions = getFlatLevelFieldOptions(ctx)
  return [
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
          hint: 'Select up to 2 abilities',
        },
        {
          type: 'select',
          name: 'hitDie',
          label: 'Hit die',
          options: hitDieOptions,
          required: true,
          width: 'sm',
        },
      ],
    },
    {
      type: 'chips',
      name: 'asiLevels',
      label: 'ASI levels',
      options: flatLevelOptions,
      hint: 'Levels that grant an ability score improvement',
    },
    {
      type: 'select',
      name: 'subclassChoiceLevel',
      label: 'Subclass choice level',
      options: subclassChoiceLevelOptions(ctx),
      hint: 'Level at which a character chooses their subclass',
      width: 'sm-md',
    },
  ]
}

function spellcastingFields(ctx: ContentFormCtx): FormItem[] {
  const levelOptions = getLevelFieldOptions(ctx)
  return [
    {
      type: 'switch',
      name: 'hasSpellcasting',
      label: 'Has spellcasting',
    },
    {
      type: 'select',
      name: 'spellcasting.level',
      label: 'Spellcasting level',
      options: levelOptions,
      visibility: visibleWhenSpellcasting(),
      required: true,
      hint: 'First class level at which this class gains spellcasting',
      width: 'sm-md',
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
    {
      type: 'richtext',
      name: 'spellcasting.description',
      label: 'Rules description',
      visibility: visibleWhenSpellcasting(),
      hint: 'SRD spellcasting feature prose (shown on the class detail view)',
    },
    buildSpellProgressionGridField(effectiveMaxFromCtx(ctx)),
  ]
}

function proficienciesFields(ctx: ContentFormCtx): FormItem[] {
  return [
    {
      kind: 'group',
      legend: 'Defenses',
      fields: [
        {
          type: 'chips',
          name: 'proficiencies.savingThrows',
          label: 'Saving throws',
          options: abilityOptions,
          max: 2,
          required: true,
          hint: SAVING_THROWS_HINT,
        },
        {
          type: 'chips',
          name: 'proficiencies.armor',
          label: 'Armor training',
          options: armorCategoryOptions,
        },
      ],
    },
    {
      kind: 'group',
      legend: 'Weapons',
      fields: [
        {
          type: 'radio',
          name: 'weaponProficiencyMode',
          label: 'Weapon proficiency mode',
          labelHidden: true,
          orientation: 'horizontal',
          options: WEAPON_PROFICIENCY_MODE_OPTIONS,
          hint: INDIVIDUAL_WEAPONS_TOGGLE_HINT,
        },
        {
          type: 'chips',
          name: 'proficiencies.weapons.categories',
          label: 'Weapon proficiencies',
          options: weaponCategoryOptions,
          hint: WEAPON_PROFICIENCIES_HINT,
          visibility: visibleWhenWeaponCategories(),
        },
        {
          type: 'combobox',
          name: 'proficiencies.weapons.items',
          label: 'Weapon choices',
          multiple: true,
          options: ctx.options?.weapons ?? [],
          placeholder: 'Choose weapons…',
          visibility: visibleWhenIndividualWeapons(),
        },
      ],
    },
    {
      type: 'combobox',
      name: 'proficiencies.tools',
      label: 'Tool proficiencies',
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
          max: SKILL_IDS.length,
          width: 'xs',
          required: true,
        },
        {
          type: 'chips',
          name: 'proficiencies.skills.from',
          label: 'Skill options',
          options: skillOptions,
          hint: CLASS_SKILL_OPTIONS_HINT,
        },
      ],
    },
  ]
}

function resourcesArrayField(ctx: ContentFormCtx): FormItem {
  return {
    kind: 'array',
    name: 'resources',
    legend: 'Resources',
    addLabel: 'Add resource',
    itemTitle: (values, index) => (values['name'] as string) || `Resource ${index + 1}`,
    fields: resourceItemFields(ctx),
  }
}

function buildClassTabs(ctx: ContentFormCtx): TabbedFormTab[] {
  return [
    {
      id: 'basics',
      label: 'Basics',
      fields: [...identityFields(), ...coreAttributesFields(ctx)],
    },
    {
      id: 'proficiencies',
      label: 'Proficiencies',
      fields: proficienciesFields(ctx),
    },
    {
      id: 'spellcasting',
      label: 'Spellcasting',
      fields: spellcastingFields(ctx),
    },
    {
      id: 'features',
      label: 'Features',
      fields: [resourcesArrayField(ctx)],
      header: createElement(ClassFeaturesTab, { formCtx: ctx }),
    },
    {
      id: 'subclasses',
      label: 'Subclasses',
      fields: [],
      header: createElement(ClassSubclassesTab, {
        campaignId: ctx.campaignId,
        classId: ctx.entityId,
        mode: ctx.mode,
        formCtx: ctx,
      }),
    },
  ]
}

// ---------------------------------------------------------------------------
// Class ContentFormDef
// ---------------------------------------------------------------------------

const classFormDef: ContentFormDef<CharacterClass, ClassFormValues, CreateClassInput> = {
  routeKey: 'classes',

  schema: classFormSchema,
  resolveSchema: (ctx) => createClassFormSchema(maxLevelFromCtx(ctx)),
  createDefaultValues: classCreateDefaultValues,

  buildTabs: buildClassTabs,
  buildFields: (ctx) => contentFormFields(classFormDef, ctx),

  toFormValues: (entity) => ({
    name: entity.name,
    slug: entity.slug,
    description: entity.description,
    primaryAbilities: entity.primaryAbilities,
    hitDie: entity.hitDie,
    asiLevels: deriveAsiLevels(entity.features),
    subclassChoiceLevel:
      entity.subclassChoiceLevel !== undefined
        ? String(entity.subclassChoiceLevel)
        : SUBCLASS_CHOICE_LEVEL_NONE,
    hasSpellcasting: entity.spellcasting !== undefined,
    weaponProficiencyMode:
      (entity.proficiencies.weapons.items?.length ?? 0) > 0 ? 'individual' : 'categories',
    spellcasting: spellcastingToFormValues(entity.spellcasting),
    proficiencies: proficienciesToFormValues(entity.proficiencies),
    features: entity.features.map(featureToFormRow),
    resources: entity.resources?.map(resourceToFormRow) ?? [],
  }),

  toInput: (values, ctx?: ContentFormInputCtx<CharacterClass>) => {
    const maxLevel = ctx?.campaignRules?.maxCharacterLevel ?? MAX_CHARACTER_LEVEL
    return finalizeContentInput(
      {
        ...envelopeSlugFields(values.name, ctx),
        name: values.name,
        description: values.description || undefined,
        primaryAbilities: values.primaryAbilities,
        hitDie: values.hitDie,
        subclassChoiceLevel:
          values.subclassChoiceLevel === SUBCLASS_CHOICE_LEVEL_NONE
            ? undefined
            : campaignLevelSchema(maxLevel).parse(Number(values.subclassChoiceLevel)),
        spellcasting: spellcastingFromFormValues(values.hasSpellcasting, values.spellcasting),
        proficiencies: {
          ...proficienciesFromFormValues(
            values.proficiencies,
            values.weaponProficiencyMode === 'individual',
          ),
          skills: {
            choose: values.proficiencies.skills.choose,
            from: values.proficiencies.skills.from,
          },
        },
        features: syncAsiFeatures(
          values.asiLevels,
          featuresFromFormValues(values.features, ctx?.entity?.features),
        ),
        resources: values.resources?.length ? values.resources.map(resourceFromFormRow) : undefined,
      },
      ctx,
    ) as CreateClassInput
  },

  useListQuery: useClasses,
  queryKey: classesQueryKey,
}

contentFormRegistry['classes'] = classFormDef

export { classFormDef, createClassFormSchema }
export type { ClassFormValues }
export { SUBCLASS_CHOICE_LEVEL_NONE } from './class-form-constants'
