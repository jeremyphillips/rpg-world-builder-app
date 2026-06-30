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
  TOOL_CATEGORIES,
  TOOL_CATEGORY_ENTRIES,
  WEAPON_CATEGORIES,
  WEAPON_CATEGORY_ENTRIES,
  abilitySchema,
  armorCategorySchema,
  toolCategorySchema,
  formatHitDie,
  hitDieSchema,
  skillSchema,
  slugSchema,
  weaponCategorySchema,
} from '@rpg/contracts'
import {
  toOptions,
  type EditableGridFieldConfig,
  type FieldOption,
  type FieldVisibility,
  type FormItem,
  type StackConfig,
  type TabbedFormTab,
} from '@rpg/ui/form'

import { identityFields } from '../../lib/forms/fields/content-identity-form-fields'
import {
  getLevelFieldOptions,
  HIT_DIE_SELECT_DIGITS,
  levelSelectDigits,
} from '../../lib/form-options/level-field-options'
import { effectiveMaxFromCtx } from '../../lib/form-options/content-campaign-rules'
import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import { titleCase } from '../../lib/utils/title-case'
import { CANTRIPS_KNOWN_PROFILES } from './cantrips-profiles'
import { ClassFeaturesTab } from '../components/class-features-tab.client'
import { ClassCharacterCreationTab } from '../components/class-character-creation-tab.client'
import { ClassSubclassesTab } from '../components/class-subclasses-tab.client'
import { SUBCLASS_CHOICE_LEVEL_NONE, WEAPON_PROFICIENCY_MODES } from './class-form-constants'
import {
  CLASS_SKILL_OPTIONS_INFO,
  INDIVIDUAL_WEAPONS_TOGGLE_HINT,
  SAVING_THROWS_HINT,
  WEAPON_PROFICIENCIES_HINT,
  WEAPON_PROFICIENCY_MODE_LABELS,
} from './class-form-labels'
import { createFeatureRowFormSchema } from './class-feature-form-fields'
import { startingEquipmentFormSchema } from './character-creation/class-starting-equipment-form-fields'

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

export function maxLevelFromCtx(ctx: ContentFormCtx): number {
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

const toolCategoryOptions = toOptions(
  TOOL_CATEGORIES,
  Object.fromEntries(TOOL_CATEGORIES.map((c) => [c, TOOL_CATEGORY_ENTRIES[c].label])) as Record<
    (typeof TOOL_CATEGORIES)[number],
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
  tools: z.object({
    categories: z.array(toolCategorySchema),
    items: z.array(z.string()).optional(),
  }),
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

export function createClassFormSchema(maxLevel: number = MAX_CHARACTER_LEVEL) {
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
    characterCreation: z
      .object({
        startingEquipment: startingEquipmentFormSchema.optional(),
      })
      .optional(),
  })
}

export const classFormSchema = createClassFormSchema()

export type ClassFormValues = z.infer<typeof classFormSchema>

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

function buildSpellProgressionGridField(rowCount: number): EditableGridFieldConfig {
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

function resourceItemFields(ctx: ContentFormCtx): FormItem[] {
  const levelOptions = getLevelFieldOptions(ctx)
  const levelDigits = levelSelectDigits(ctx)
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
              digits: levelDigits,
              width: 'auto',
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

function coreAttributesFields(ctx: ContentFormCtx): FormItem[] {
  const flatLevelOptions = getLevelFieldOptions(ctx, { showTierLabels: false })
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
          digits: HIT_DIE_SELECT_DIGITS,
          width: 'auto',
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
      digits: 2,
    },
  ]
}

function spellcastingFields(ctx: ContentFormCtx): FormItem[] {
  const levelOptions = getLevelFieldOptions(ctx)
  const levelDigits = levelSelectDigits(ctx)
  const stack: StackConfig = {
    kind: 'stack',
    layout: 'toggleDependent',
    dependentsChrome: 'subtle',
    rhythm: 'comfortable',
    fields: [
      {
        type: 'switch',
        name: 'hasSpellcasting',
        label: 'Has spellcasting',
      },
      {
        type: 'select',
        name: 'spellcasting.level',
        label: 'Spellcasting level',
        labelPosition: 'settings',
        separator: 'subtle',
        options: levelOptions,
        required: true,
        digits: levelDigits,
        hint: 'First class level at which this class gains spellcasting',
        visibility: visibleWhenSpellcasting(),
      },
      {
        kind: 'row',
        visibility: visibleWhenSpellcasting(),
        fields: [
          {
            type: 'select',
            name: 'spellcasting.progression',
            label: 'Progression',
            options: spellcastingProgressionOptions,
            required: true,
          },
          {
            type: 'select',
            name: 'spellcasting.ability',
            label: 'Spellcasting ability',
            options: abilityOptions,
            required: true,
          },
          {
            type: 'select',
            name: 'spellcasting.preparation',
            label: 'Preparation',
            options: spellPreparationOptions,
            required: true,
          },
        ],
      },
      {
        type: 'richtext',
        name: 'spellcasting.description',
        label: 'Rules description',
        linkable: true,
        internalLinkOptions: ctx.options?.richTextInternalLinkOptions,
        contentTypeOptions: ctx.options?.richTextContentTypeOptions,
        visibility: visibleWhenSpellcasting(),
        hint: 'SRD spellcasting feature prose (shown on the class detail view)',
      },
      buildSpellProgressionGridField(effectiveMaxFromCtx(ctx)),
    ],
  }
  return [stack]
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
          width: 'xl',
        },
      ],
    },
    {
      kind: 'group',
      legend: 'Skills & Tools',
      fields: [
        {
          type: 'chooseFromChips',
          name: 'proficiencies.skills.from',
          chooseName: 'proficiencies.skills.choose',
          label: 'Skill proficiencies',
          options: skillOptions,
          info: CLASS_SKILL_OPTIONS_INFO,
          chooseMin: 0,
          chooseMax: SKILL_IDS.length,
          required: true,
        },
        {
          type: 'chips',
          name: 'proficiencies.tools.categories',
          label: 'Tool categories',
          options: toolCategoryOptions,
        },
        {
          type: 'combobox',
          name: 'proficiencies.tools.items',
          label: 'Specific tools',
          multiple: true,
          options: ctx.options?.tools ?? [],
          placeholder: 'Choose tools…',
          width: 'xl',
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

export function buildClassTabs(ctx: ContentFormCtx): TabbedFormTab[] {
  return [
    {
      id: 'basics',
      label: 'Basics',
      fields: [...identityFields(ctx), ...coreAttributesFields(ctx)],
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
    {
      id: 'characterCreation',
      label: 'Character creation',
      fields: [],
      header: createElement(ClassCharacterCreationTab, { formCtx: ctx }),
    },
  ]
}
