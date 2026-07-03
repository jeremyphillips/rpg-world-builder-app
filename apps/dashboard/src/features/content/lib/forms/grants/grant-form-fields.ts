import {
  FEAT_CATEGORY_IDS,
  FEAT_CATEGORY_ENTRIES,
  formatDamageTypeGrantSentence,
  formatFeatChoiceGrantSentence,
  formatLanguageGrantSentence,
  formatMovementBonusAuthoringSummary,
  formatMovementBonusTitle,
  formatResistanceGrantSentence,
  formatSenseGrantSentence,
  getMovementModeGrantLabel,
  INNATE_SPELL_KINDS,
  MOVEMENT_BONUS_FEET,
  MOVEMENT_MODES,
  MOVEMENT_OPERATION_ENTRIES,
  MOVEMENT_OPERATIONS,
  SENSE_RANGES,
  USAGE_FREQUENCIES,
  USAGE_FREQUENCY_ENTRIES,
  type FeatCategory,
  type MovementMode,
  type SenseId,
  type UsageFrequency,
} from '@rpg/contracts'
import {
  toOptions,
  type FieldOption,
  type FieldVisibility,
  type FormItem,
  type InlineSentenceFieldConfig,
} from '@rpg/ui/form'

import {
  buildActiveDamageTypeFieldOptions,
  buildActiveLanguageFieldOptions,
  buildActiveSenseFieldOptions,
} from '@/features/homebrew'

import type { ContentFormCtx } from '../content-form-registry'
import { getLevelFieldOptions, withLevelOptionLabels } from '../../form-options/level-field-options'
import { getSpellcastingAbilityFieldOptions } from '../../form-options/spellcasting-ability-field-options'
import { titleCase } from '../../utils/title-case'
import {
  equipmentGrantItemFields,
  type EquipmentGrantItemForm,
} from './equipment-grant-form-fields'
import { equipmentGrantSummary, equipmentGrantTitle } from './equipment-grant-form-values'
import {
  proficiencyGrantItemFields,
  type ArmorTrainingItemForm,
  type ProficiencyGrantType,
  type SkillProficiencyItemForm,
  type ToolProficiencyItemForm,
  type WeaponProficiencyItemForm,
} from './proficiency-grant-form-fields'
import {
  armorTrainingGrantSummary,
  armorTrainingGrantTitle,
  skillProficiencyGrantSummary,
  skillProficiencyGrantTitle,
  toolProficiencyGrantSummary,
  toolProficiencyGrantTitle,
  weaponProficiencyGrantSummary,
  weaponProficiencyGrantTitle,
} from './proficiency-grant-form-values'
import {
  formatGrantUnlockLevelLabel,
  GRANT_DEFAULT_UNLOCK_LABEL,
  GRANT_DEFAULT_UNLOCK_LEVEL,
  GRANT_ROW_TYPE_LABELS,
} from './grant-form-schema'

const movementModeOptions: FieldOption[] = MOVEMENT_MODES.map((mode) => ({
  value: mode,
  label: getMovementModeGrantLabel(mode),
}))

const movementOperationOptions: FieldOption[] = MOVEMENT_OPERATIONS.map((operation) => ({
  value: operation,
  label: MOVEMENT_OPERATION_ENTRIES[operation].label,
}))

const movementBonusOptions: FieldOption[] = MOVEMENT_BONUS_FEET.map((feet) => ({
  value: String(feet),
  label: `+${feet} ft`,
}))

function movementInlineSentenceField(
  overrides?: Partial<InlineSentenceFieldConfig>,
): InlineSentenceFieldConfig {
  return {
    type: 'inlineSentence',
    name: 'movementValue',
    label: 'Movement',
    segments: [
      {
        kind: 'select',
        name: 'movementMode',
        options: movementModeOptions,
        defaultValue: 'walk',
        width: 'lg',
        ariaLabel: 'Movement mode',
      },
      {
        kind: 'select',
        name: 'movementOperation',
        options: movementOperationOptions,
        defaultValue: 'bonus',
        width: 'md',
        ariaLabel: 'Movement operation',
      },
      {
        kind: 'select',
        name: 'movementValue',
        options: movementBonusOptions,
        defaultValue: '5',
        width: 'sm',
        ariaLabel: 'Movement bonus',
      },
    ],
    ...overrides,
  }
}

/** Formats a concise title for a movement grant row header. */
export function formatMovementRowTitle(
  mode: string | undefined,
  value: number | string | undefined,
): string {
  if (!mode || value === undefined || value === '') return 'Movement bonus'
  const numericValue = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numericValue)) return 'Movement bonus'
  return `Movement — ${formatMovementBonusTitle({
    mode: mode as MovementMode,
    operation: 'bonus',
    value: numericValue as (typeof MOVEMENT_BONUS_FEET)[number],
    unit: 'ft',
  })}`
}

/** Formats the authoring summary for a movement grant row header. */
export function formatMovementRowSummary(
  mode: string | undefined,
  value: number | string | undefined,
): string {
  if (!mode || value === undefined || value === '') return ''
  const numericValue = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numericValue)) return ''
  return formatMovementBonusAuthoringSummary({
    mode: mode as MovementMode,
    operation: 'bonus',
    value: numericValue as (typeof MOVEMENT_BONUS_FEET)[number],
    unit: 'ft',
  })
}

export function formatResistanceRowSummary(damageTypes: string[] | undefined): string {
  if (!damageTypes?.length) return ''
  return formatResistanceGrantSentence(damageTypes)
}

export function formatDamageTypeRowSummary(damageTypes: string[] | undefined): string {
  if (!damageTypes?.length) return ''
  return formatDamageTypeGrantSentence(damageTypes)
}

export function formatSenseRowSummary(
  type: string | undefined,
  range: number | string | undefined,
): string {
  if (!type || range === undefined || range === '') return ''
  const numericRange = typeof range === 'number' ? range : Number(range)
  if (!Number.isFinite(numericRange)) return ''
  return formatSenseGrantSentence({ type: type as SenseId, range: numericRange })
}

export function formatLanguageRowSummary(languageId: string | undefined): string {
  if (!languageId) return ''
  return formatLanguageGrantSentence([languageId])
}

export function formatFeatChoiceRowSummary(
  category: string | undefined,
  choose: number | string | undefined,
): string {
  if (!category) return ''
  const numericChoose = choose === undefined || choose === '' ? 1 : Number(choose)
  if (!Number.isFinite(numericChoose)) return ''
  return formatFeatChoiceGrantSentence({
    category: category as FeatCategory,
    choose: numericChoose,
  })
}

const senseRangeOptions: FieldOption[] = SENSE_RANGES.map((range) => ({
  value: String(range),
  label: String(range),
}))

function senseRangeInlineSentenceField(
  overrides?: Partial<InlineSentenceFieldConfig>,
): InlineSentenceFieldConfig {
  return {
    type: 'inlineSentence',
    name: 'senseRange',
    label: 'Range',
    width: '1/3',
    segments: [
      {
        kind: 'select',
        name: 'senseRange',
        options: senseRangeOptions,
        digits: 3,
        defaultValue: '60',
        ariaLabel: 'Range',
      },
      { kind: 'text', value: 'ft.', tone: 'label' },
    ],
    ...overrides,
  }
}

const spellModeOptions = toOptions(
  INNATE_SPELL_KINDS,
  Object.fromEntries(
    INNATE_SPELL_KINDS.map((k) => [k, titleCase(k.replaceAll('_', ' '))]),
  ) as Record<(typeof INNATE_SPELL_KINDS)[number], string>,
)

const usageFrequencyOptions = toOptions(
  USAGE_FREQUENCIES,
  Object.fromEntries(USAGE_FREQUENCIES.map((f) => [f, USAGE_FREQUENCY_ENTRIES[f].label])) as Record<
    UsageFrequency,
    string
  >,
)

const featCategoryOptions = toOptions(
  FEAT_CATEGORY_IDS,
  Object.fromEntries(
    FEAT_CATEGORY_IDS.map((id) => [id, FEAT_CATEGORY_ENTRIES[id].label]),
  ) as Record<FeatCategory, string>,
)

function featChoiceInlineSentenceField(
  overrides?: Partial<InlineSentenceFieldConfig>,
): InlineSentenceFieldConfig {
  return {
    type: 'inlineSentence',
    name: 'featChoose',
    label: '',
    hideLabel: true,
    segments: [
      { kind: 'text', value: 'Choose', tone: 'label' },
      {
        kind: 'number',
        name: 'featChoose',
        min: 1,
        digits: 1,
        defaultValue: 1,
      },
      { kind: 'text', value: 'from', tone: 'label' },
      {
        kind: 'select',
        name: 'featCategory',
        options: featCategoryOptions,
        width: 'auto',
        defaultValue: 'general',
        ariaLabel: 'Feat category',
      },
      { kind: 'text', value: 'category', tone: 'label' },
    ],
    ...overrides,
  }
}

function visibleFor<T extends string>(value: T): FieldVisibility {
  return {
    dependsOn: ['grantType'],
    visibleWhen: (watched) => watched['grantType'] === value,
  }
}

function includesGrantType(grantTypes: readonly string[], grantType: string): boolean {
  return grantTypes.includes(grantType)
}

function includesEquipmentGrantType(grantTypes: readonly string[]): boolean {
  return includesGrantType(grantTypes, 'equipment')
}

const PROFICIENCY_GRANT_TYPES = [
  'weaponProficiency',
  'toolProficiency',
  'skillProficiency',
  'armorTraining',
] as const satisfies readonly ProficiencyGrantType[]

function proficiencyGrantFieldsForTypes(
  grantTypes: readonly string[],
  ctx: ContentFormCtx,
): FormItem[] {
  return PROFICIENCY_GRANT_TYPES.flatMap((grantType) =>
    includesGrantType(grantTypes, grantType)
      ? proficiencyGrantItemFields(grantType, ctx, {
          guardVisibility: visibleFor(grantType),
        })
      : [],
  )
}

function grantTypeOptionsFor<T extends string>(
  grantTypes: readonly T[],
  labels: Record<T, string>,
): FieldOption[] {
  return grantTypes.map((t) => ({ value: t, label: labels[t] }))
}

/** Formats a concise title for a spells row header. */
export function formatSpellRowTitle(
  spellIds: string[] | undefined,
  spellOptions: FieldOption[],
): string {
  if (!spellIds?.length) return 'Spells'
  const labels = spellIds.map(
    (id) => spellOptions.find((option) => option.value === id)?.label ?? id,
  )
  return labels.length <= 2 ? labels.join(', ') : `${labels.length} spells`
}

export function grantItemFields<T extends string>(
  grantTypes: readonly T[],
  labels: Record<T, string>,
  ctx: ContentFormCtx,
): FormItem[] {
  const spellOptions = ctx.options?.spells ?? []
  const featOptions = ctx.options?.feats ?? []
  const damageTypeOptions = buildActiveDamageTypeFieldOptions(ctx.damageTypeVocabulary)
  const senseTypeOptions = buildActiveSenseFieldOptions(ctx.senseVocabulary)
  const languageOptions = buildActiveLanguageFieldOptions(ctx.languageVocabulary)
  const levelOptions = getLevelFieldOptions(ctx)

  const unlockLevelOptions = [
    { value: GRANT_DEFAULT_UNLOCK_LEVEL, label: GRANT_DEFAULT_UNLOCK_LABEL },
    ...withLevelOptionLabels(levelOptions, formatGrantUnlockLevelLabel),
  ]

  return [
    {
      type: 'select',
      name: 'grantType',
      label: 'Grant type',
      options: grantTypeOptionsFor(grantTypes, labels),
      required: true,
    },
    {
      type: 'inlineSentence',
      name: 'unlockLevel',
      label: 'Granted at',
      hideLabel: true,
      segments: [
        { kind: 'text', value: 'Grant this', tone: 'label' },
        {
          kind: 'select',
          name: 'unlockLevel',
          options: unlockLevelOptions,
          width: 'auto',
          defaultValue: GRANT_DEFAULT_UNLOCK_LEVEL,
        },
      ],
    },
    {
      type: 'chips',
      name: 'resistances',
      label: 'Damage types',
      options: damageTypeOptions,
      visibility: visibleFor('resistances'),
    },
    {
      type: 'chips',
      name: 'damageType',
      label: 'Damage types',
      options: damageTypeOptions,
      visibility: visibleFor('damageType'),
    },
    {
      kind: 'row',
      visibility: visibleFor('senses'),
      fields: [
        {
          type: 'select',
          name: 'senseType',
          label: 'Sense type',
          options: senseTypeOptions,
          width: '2/3',
        },
        senseRangeInlineSentenceField(),
      ],
    },
    movementInlineSentenceField({
      visibility: visibleFor('movement'),
    }),
    {
      type: 'select',
      name: 'language',
      label: 'Language',
      options: languageOptions,
      visibility: visibleFor('languages'),
    },
    ...proficiencyGrantFieldsForTypes(grantTypes, ctx),
    // --- Spells row fields (replaces legacy innateSpells entries array) ---
    {
      kind: 'row',
      visibility: visibleFor('spells'),
      fields: [
        {
          type: 'select',
          name: 'spellAbility',
          label: 'Spellcasting ability',
          options: getSpellcastingAbilityFieldOptions(),
          width: '1/3',
        },
        {
          type: 'select',
          name: 'spellMode',
          label: 'Cast mode',
          options: spellModeOptions,
          defaultValue: 'free_cast',
          width: '1/3',
        },
        {
          type: 'select',
          name: 'spellFrequency',
          label: 'Frequency',
          options: usageFrequencyOptions,
          width: '1/3',
          visibility: {
            dependsOn: ['grantType', 'spellMode'],
            visibleWhen: (watched) =>
              watched['grantType'] === 'spells' &&
              (watched['spellMode'] === undefined || watched['spellMode'] === 'free_cast'),
          },
        },
      ],
    },
    {
      type: 'combobox',
      name: 'spellIds',
      label: 'Spells',
      multiple: true,
      options: spellOptions,
      placeholder: 'Choose spells…',
      required: true,
      visibility: visibleFor('spells'),
    },
    // --- Feat choice fields ---
    featChoiceInlineSentenceField({
      visibility: visibleFor('featChoice'),
    }),
    {
      type: 'checkbox',
      name: 'featAllowAnyQualifying',
      label: 'Allow any qualifying feat (Epic Boon or another feat the character qualifies for)',
      visibility: {
        dependsOn: ['grantType', 'featCategory'],
        visibleWhen: (watched) =>
          watched['grantType'] === 'featChoice' &&
          (watched['featCategory'] === 'epic-boon' || watched['featCategory'] === 'general'),
      },
    },
    {
      type: 'combobox',
      name: 'featRecommendedIds',
      label: 'Recommended feats',
      multiple: true,
      options: featOptions,
      placeholder: 'Choose feats…',
      visibility: visibleFor('featChoice'),
    },
    {
      type: 'checkbox',
      name: 'featReplaceable',
      label: 'Replaceable on later class levels',
      visibility: visibleFor('featChoice'),
    },
    ...(includesEquipmentGrantType(grantTypes)
      ? equipmentGrantItemFields(ctx, {
          guardVisibility: visibleFor('equipment'),
          kindSelectLabel: 'Item kind',
        })
      : []),
  ]
}

export function grantArrayFields<T extends string>(
  grantTypes: readonly T[],
  labels: Record<T, string>,
  ctx: ContentFormCtx,
): FormItem[] {
  const equipmentOptions = ctx.options?.equipment ?? []
  const spellOptions = ctx.options?.spells ?? []
  const weaponOptions = ctx.options?.weapons ?? []
  const toolOptions = ctx.options?.tools ?? []
  const armorOptions = ctx.options?.armor ?? []
  const skillOptions = ctx.options?.skills ?? []
  const rowLabels = labels as Record<string, string>

  return [
    {
      kind: 'array',
      name: 'grants',
      legend: 'Grants',
      addLabel: 'Add grant',
      itemCollapsible: true,
      itemHeader: {
        fallback: (index) => `Grant ${index + 1}`,
        primary: (values, index) => {
          const type = values['grantType'] as string | undefined
          if (type === 'equipment') {
            return equipmentGrantTitle(values as EquipmentGrantItemForm, index, equipmentOptions)
          }
          if (type === 'weaponProficiency') {
            return weaponProficiencyGrantTitle(
              values as WeaponProficiencyItemForm,
              index,
              weaponOptions,
            )
          }
          if (type === 'toolProficiency') {
            return toolProficiencyGrantTitle(values as ToolProficiencyItemForm, index, toolOptions)
          }
          if (type === 'skillProficiency') {
            return skillProficiencyGrantTitle(
              values as SkillProficiencyItemForm,
              index,
              skillOptions,
            )
          }
          if (type === 'armorTraining') {
            return armorTrainingGrantTitle(values as ArmorTrainingItemForm, index, armorOptions)
          }
          if (type === 'movement') {
            return formatMovementRowTitle(
              values['movementMode'] as string | undefined,
              values['movementValue'] as number | string | undefined,
            )
          }
          if (type === 'spells') {
            return formatSpellRowTitle(values['spellIds'] as string[] | undefined, spellOptions)
          }
          return type ? rowLabels[type] : undefined
        },
        summary: (values) => {
          const type = values['grantType']
          if (type === 'resistances') {
            return formatResistanceRowSummary(values['resistances'] as string[] | undefined)
          }
          if (type === 'damageType') {
            return formatDamageTypeRowSummary(values['damageType'] as string[] | undefined)
          }
          if (type === 'senses') {
            return formatSenseRowSummary(
              values['senseType'] as string | undefined,
              values['senseRange'] as number | string | undefined,
            )
          }
          if (type === 'movement') {
            return formatMovementRowSummary(
              values['movementMode'] as string | undefined,
              values['movementValue'] as number | string | undefined,
            )
          }
          if (type === 'languages') {
            return formatLanguageRowSummary(values['language'] as string | undefined)
          }
          if (type === 'featChoice') {
            return formatFeatChoiceRowSummary(
              values['featCategory'] as string | undefined,
              values['featChoose'] as number | string | undefined,
            )
          }
          if (type === 'equipment') {
            return equipmentGrantSummary(values as EquipmentGrantItemForm, equipmentOptions)
          }
          if (type === 'weaponProficiency') {
            return weaponProficiencyGrantSummary(values as WeaponProficiencyItemForm, weaponOptions)
          }
          if (type === 'toolProficiency') {
            return toolProficiencyGrantSummary(values as ToolProficiencyItemForm, toolOptions)
          }
          if (type === 'skillProficiency') {
            return skillProficiencyGrantSummary(values as SkillProficiencyItemForm, skillOptions)
          }
          if (type === 'armorTraining') {
            return armorTrainingGrantSummary(values as ArmorTrainingItemForm, armorOptions)
          }
          return ''
        },
      },
      fields: grantItemFields(grantTypes, labels, ctx),
    },
  ]
}

// Re-export GRANT_ROW_TYPE_LABELS for consumers that import it from this module.
export { GRANT_ROW_TYPE_LABELS }
