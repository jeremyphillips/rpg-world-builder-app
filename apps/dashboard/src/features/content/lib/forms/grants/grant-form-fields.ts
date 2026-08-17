import {
  FEAT_CATEGORY_IDS,
  FEAT_CATEGORY_ENTRIES,
  DAMAGE_TYPE_TERM,
  formatDamageTypeGrantSentence,
  formatFeatChoiceGrantSentence,
  formatLanguageGrantSentence,
  formatMovementGrantAuthoringSummary,
  formatMovementGrantCompact,
  formatResistanceGrantSentence,
  formatSenseGrantSentence,
  formatSpellsGrantSentence,
  getMovementModeGrantLabel,
  getSpellGrantAvailabilityLabel,
  getUsageFrequencyLabel,
  MOVEMENT_BONUS_FEET,
  MOVEMENT_MODES,
  MOVEMENT_OPERATION_ENTRIES,
  MOVEMENT_OPERATIONS,
  MOVEMENT_SPEED_FEET,
  SENSE_RANGES,
  USAGE_FREQUENCIES,
  USAGE_FREQUENCY_ENTRIES,
  type FeatCategory,
  type MovementGrantPayload,
  type MovementMode,
  type MovementOperation,
  type SenseId,
  type UsageFrequency,
  isArmorEquipment,
  isWeaponEquipment,
} from '@rpg/contracts'
import { Text } from '@rpg/ui'
import {
  toOptions,
  type FieldOption,
  type FieldVisibility,
  type FormItem,
  type InlineSentenceFieldConfig,
} from '@rpg/ui/form'
import { createElement } from 'react'

import {
  buildActiveDamageTypeFieldOptions,
  buildActiveLanguageFieldOptions,
  buildActiveSenseFieldOptions,
  vocabularyFieldLabel,
} from '@/features/vocabulary'

import {
  formatChooseContentTypePlaceholder,
  getContentTypeCollectionLabel,
  getContentTypeMidSentenceLabel,
} from '@/features/content/lib/content-type-labels'

import type { ContentFormCtx } from '../content-form-registry'
import { getLevelFieldOptions, withLevelOptionLabels } from '../../form-options/level-field-options'
import {
  referenceEquipmentFieldOptions,
  toSortedContentFieldOptions,
} from '../../form-options/content-field-option.lib'
import { getSpellcastingAbilityFieldOptions } from '../../form-options/spellcasting-ability-field-options'
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
import { buildGrantArrayAddMenu } from './grant-add-menu.lib'
import { renderGrantArrayItemShell } from './grant-array-item-shell.lib'
import {
  formatGrantUnlockLevelLabel,
  GRANT_DEFAULT_UNLOCK_LABEL,
  GRANT_DEFAULT_UNLOCK_LEVEL,
  GRANT_ROW_TYPE_LABELS,
  type GrantType,
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

const movementSpeedOptions: FieldOption[] = MOVEMENT_SPEED_FEET.map((feet) => ({
  value: String(feet),
  label: `${feet} ft`,
}))

function visibleWhenMovementOperation(operation: MovementOperation): FieldVisibility {
  return {
    dependsOn: ['grantType', 'movementOperation'],
    visibleWhen: (watched) =>
      watched['grantType'] === 'movement' && watched['movementOperation'] === operation,
  }
}

function movementFormValuesToGrantPayload(values: {
  movementMode?: string
  movementOperation?: string
  movementFeet?: number | string
  movementMatchMode?: string
}): MovementGrantPayload | undefined {
  if (!values.movementMode || !values.movementOperation) return undefined
  const mode = values.movementMode as MovementMode
  const operation = values.movementOperation as MovementOperation

  if (operation === 'match') {
    if (!values.movementMatchMode || values.movementMatchMode === mode) return undefined
    return { mode, operation, matchMode: values.movementMatchMode as MovementMode }
  }

  const feetRaw = values.movementFeet
  if (feetRaw === undefined || feetRaw === '') return undefined
  const feet = typeof feetRaw === 'number' ? feetRaw : Number(feetRaw)
  if (!Number.isFinite(feet)) return undefined

  if (operation === 'increase') {
    return { mode, operation, feet: feet as (typeof MOVEMENT_BONUS_FEET)[number] }
  }

  return { mode, operation, feet: feet as (typeof MOVEMENT_SPEED_FEET)[number] }
}

function movementInlineSentenceField(
  overrides?: Partial<InlineSentenceFieldConfig>,
): InlineSentenceFieldConfig {
  return {
    type: 'inlineSentence',
    name: 'movement',
    label: 'Movement',
    segments: [
      {
        kind: 'select',
        name: 'movementMode',
        options: movementModeOptions,
        defaultValue: 'walk',
        width: 'auto',
        ariaLabel: 'Movement mode',
      },
      {
        kind: 'select',
        name: 'movementOperation',
        options: movementOperationOptions,
        defaultValue: 'increase',
        width: 'auto',
        ariaLabel: 'Movement operation',
      },
      {
        kind: 'select',
        name: 'movementFeet',
        options: movementBonusOptions,
        defaultValue: '5',
        digits: 3,
        ariaLabel: 'Movement bonus in feet',
        visibility: visibleWhenMovementOperation('increase'),
      },
      {
        kind: 'select',
        name: 'movementFeet',
        options: movementSpeedOptions,
        defaultValue: '30',
        width: 'auto',
        ariaLabel: 'Movement speed in feet',
        visibility: visibleWhenMovementOperation('set'),
      },
      {
        kind: 'select',
        name: 'movementMatchMode',
        options: movementModeOptions,
        defaultValue: 'walk',
        width: 'auto',
        ariaLabel: 'Movement mode to match',
        visibility: visibleWhenMovementOperation('match'),
      },
    ],
    ...overrides,
  }
}

/** Formats a concise title for a movement grant row header. */
export function formatMovementRowTitle(values: {
  movementMode?: string
  movementOperation?: string
  movementFeet?: number | string
  movementMatchMode?: string
}): string {
  const grant = movementFormValuesToGrantPayload(values)
  if (!grant) return 'Movement'
  return `Movement — ${formatMovementGrantCompact(grant)}`
}

/** Formats the authoring summary for a movement grant row header. */
export function formatMovementRowSummary(values: {
  movementMode?: string
  movementOperation?: string
  movementFeet?: number | string
  movementMatchMode?: string
}): string {
  const grant = movementFormValuesToGrantPayload(values)
  if (!grant) return ''
  return formatMovementGrantAuthoringSummary(grant)
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

export function formatSpellRowSummary(values: GrantRowValues): string {
  const ability = values['spellAbility']
  const spellIds = values['spellIds'] as string[] | undefined
  if (!ability || !spellIds?.length) return ''

  const hasAvailability = values['spellAvailability'] === true
  const hasCasting = values['spellCastingEnabled'] === true
  if (!hasAvailability && !hasCasting) return ''

  return formatSpellsGrantSentence({
    kind: 'spells',
    ability: ability as never,
    spellIds,
    ...(hasAvailability ? { availability: 'always_prepared' as const } : {}),
    ...(hasCasting && values['spellCastingFrequency']
      ? {
          casting: {
            mode: 'free_cast' as const,
            frequency: values['spellCastingFrequency'] as UsageFrequency,
            ...(values['spellAllowsSlotCasting'] === true ? { allowsSlotCasting: true } : {}),
          },
        }
      : {}),
  })
}

function formatSpellsGrantRowSummary(values: GrantRowValues, ctx: GrantRowHeaderContext): string {
  const summary = formatSpellRowSummary(values)
  if (summary) return summary

  const parts: string[] = []
  if (values['spellAvailability'] === true) {
    parts.push(getSpellGrantAvailabilityLabel('always_prepared'))
  }
  if (values['spellCastingEnabled'] === true && values['spellCastingFrequency']) {
    parts.push(`${getUsageFrequencyLabel(values['spellCastingFrequency'] as string)} free cast`)
  }

  const spellTitle = formatSpellRowTitle(
    values['spellIds'] as string[] | undefined,
    ctx.spellOptions,
  )
  if (parts.length) return `${parts.join(' · ')} · ${spellTitle}`
  return ''
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
    label: 'Feat choice',
    labelVisibility: 'srOnly',
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

export const GRANT_TYPE_MISSING_PRIMARY = 'Grant type missing'

const GRANT_TYPE_MISSING_MESSAGE =
  'This grant row is missing its type. Remove it and add a new grant from the menu.'

function visibleFor<T extends string>(value: T): FieldVisibility {
  return {
    dependsOn: ['grantType'],
    visibleWhen: (watched) => watched['grantType'] === value,
  }
}

function visibleWhenGrantTypeSet(): FieldVisibility {
  return {
    dependsOn: ['grantType'],
    visibleWhen: (watched) => {
      const grantType = watched['grantType']
      return typeof grantType === 'string' && grantType.length > 0
    },
  }
}

function visibleWhenGrantTypeMissing(): FieldVisibility {
  return {
    dependsOn: ['grantType'],
    visibleWhen: (watched) => {
      const grantType = watched['grantType']
      return typeof grantType !== 'string' || grantType.length === 0
    },
  }
}

function grantTypeMissingRepairFields(): FormItem[] {
  return [
    {
      kind: 'group',
      visibility: visibleWhenGrantTypeMissing(),
      fields: [
        {
          kind: 'slot',
          name: '_grantTypeMissingRepair',
          render: () =>
            createElement(
              Text,
              { variant: 'muted', className: 'text-sm' },
              GRANT_TYPE_MISSING_MESSAGE,
            ),
        },
      ],
    },
  ]
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
      ? [
          {
            kind: 'group' as const,
            visibility: visibleFor(grantType),
            fields: proficiencyGrantItemFields(grantType, ctx),
          },
        ]
      : [],
  )
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

type GrantRowValues = Record<string, unknown>

export type GrantRowHeaderContext = {
  rowLabels: Record<string, string>
  equipmentOptions: FieldOption[]
  weaponOptions: FieldOption[]
  toolOptions: FieldOption[]
  armorOptions: FieldOption[]
  skillOptions: FieldOption[]
  spellOptions: FieldOption[]
}

type GrantRowSummaryFormatter = (values: GrantRowValues, ctx: GrantRowHeaderContext) => string

const GRANT_ROW_SUMMARY_BY_TYPE: Partial<Record<string, GrantRowSummaryFormatter>> = {
  resistances: (values) =>
    formatResistanceRowSummary(values['resistances'] as string[] | undefined),
  damageType: (values) => formatDamageTypeRowSummary(values['damageType'] as string[] | undefined),
  senses: (values) =>
    formatSenseRowSummary(
      values['senseType'] as string | undefined,
      values['senseRange'] as number | string | undefined,
    ),
  movement: (values) => formatMovementRowSummary(values),
  languages: (values) => formatLanguageRowSummary(values['language'] as string | undefined),
  featChoice: (values) =>
    formatFeatChoiceRowSummary(
      values['featCategory'] as string | undefined,
      values['featChoose'] as number | string | undefined,
    ),
  equipment: (values, ctx) =>
    equipmentGrantSummary(values as EquipmentGrantItemForm, ctx.equipmentOptions),
  weaponProficiency: (values, ctx) =>
    weaponProficiencyGrantSummary(values as WeaponProficiencyItemForm, ctx.weaponOptions),
  toolProficiency: (values, ctx) =>
    toolProficiencyGrantSummary(values as ToolProficiencyItemForm, ctx.toolOptions),
  skillProficiency: (values, ctx) =>
    skillProficiencyGrantSummary(values as SkillProficiencyItemForm, ctx.skillOptions),
  armorTraining: (values, ctx) =>
    armorTrainingGrantSummary(values as ArmorTrainingItemForm, ctx.armorOptions),
  spells: (values, ctx) => formatSpellsGrantRowSummary(values, ctx),
}

/** Collapsed-row summary for a grant array item. */
export function formatGrantRowSummary(values: GrantRowValues, ctx: GrantRowHeaderContext): string {
  const type = values['grantType']
  if (typeof type !== 'string') return ''
  return GRANT_ROW_SUMMARY_BY_TYPE[type]?.(values, ctx) ?? ''
}

type GrantRowPrimaryFormatter = (
  values: GrantRowValues,
  index: number,
  ctx: GrantRowHeaderContext,
) => string | undefined

const GRANT_ROW_PRIMARY_BY_TYPE: Partial<Record<string, GrantRowPrimaryFormatter>> = {
  equipment: (values, index, ctx) =>
    equipmentGrantTitle(values as EquipmentGrantItemForm, index, ctx.equipmentOptions),
  weaponProficiency: (values, index, ctx) =>
    weaponProficiencyGrantTitle(values as WeaponProficiencyItemForm, index, ctx.weaponOptions),
  toolProficiency: (values, index, ctx) =>
    toolProficiencyGrantTitle(values as ToolProficiencyItemForm, index, ctx.toolOptions),
  skillProficiency: (values, index, ctx) =>
    skillProficiencyGrantTitle(values as SkillProficiencyItemForm, index, ctx.skillOptions),
  armorTraining: (values, index, ctx) =>
    armorTrainingGrantTitle(values as ArmorTrainingItemForm, index, ctx.armorOptions),
  movement: (values) => formatMovementRowTitle(values),
  spells: (values, _index, ctx) =>
    formatSpellRowTitle(values['spellIds'] as string[] | undefined, ctx.spellOptions),
}

/** Primary title for a grant array item header. */
export function formatGrantRowPrimary(
  values: GrantRowValues,
  index: number,
  ctx: GrantRowHeaderContext,
): string | undefined {
  const type = values['grantType']
  if (typeof type !== 'string' || type.length === 0) return GRANT_TYPE_MISSING_PRIMARY
  return GRANT_ROW_PRIMARY_BY_TYPE[type]?.(values, index, ctx) ?? ctx.rowLabels[type]
}

export function grantItemFields<T extends string>(
  grantTypes: readonly T[],
  _labels: Record<T, string>,
  ctx: ContentFormCtx,
): FormItem[] {
  const spellOptions = toSortedContentFieldOptions(ctx.options?.spells?.forReference(), 'spells')
  const featOptions = toSortedContentFieldOptions(ctx.options?.feats?.forReference(), 'feats')
  const damageTypeOptions = buildActiveDamageTypeFieldOptions(ctx.damageTypeVocabulary)
  const senseTypeOptions = buildActiveSenseFieldOptions(ctx.senseVocabulary)
  const languageOptions = buildActiveLanguageFieldOptions(ctx.languageVocabulary)
  const levelOptions = getLevelFieldOptions(ctx)

  const unlockLevelOptions = [
    { value: GRANT_DEFAULT_UNLOCK_LEVEL, label: GRANT_DEFAULT_UNLOCK_LABEL },
    ...withLevelOptionLabels(levelOptions, formatGrantUnlockLevelLabel),
  ]

  return [
    ...grantTypeMissingRepairFields(),
    {
      type: 'inlineSentence',
      name: 'unlockLevel',
      label: 'Granted at',
      labelVisibility: 'srOnly',
      visibility: visibleWhenGrantTypeSet(),
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
      label: vocabularyFieldLabel(DAMAGE_TYPE_TERM, { plural: true }),
      options: damageTypeOptions,
      visibility: visibleFor('resistances'),
    },
    {
      type: 'chips',
      name: 'damageType',
      label: vocabularyFieldLabel(DAMAGE_TYPE_TERM, { plural: true }),
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
          type: 'checkbox',
          name: 'spellAvailability',
          label: 'Always prepared',
          visibility: visibleFor('spells'),
        },
        {
          type: 'checkbox',
          name: 'spellCastingEnabled',
          label: 'Free cast',
          defaultValue: true,
          visibility: visibleFor('spells'),
        },
      ],
    },
    {
      kind: 'row',
      visibility: visibleFor('spells'),
      fields: [
        {
          type: 'select',
          name: 'spellCastingFrequency',
          label: 'Cast frequency',
          options: usageFrequencyOptions,
          width: '1/2',
          visibility: {
            dependsOn: ['grantType', 'spellCastingEnabled'],
            visibleWhen: (watched) =>
              watched['grantType'] === 'spells' && watched['spellCastingEnabled'] === true,
          },
        },
        {
          type: 'checkbox',
          name: 'spellAllowsSlotCasting',
          label: 'Also cast with spell slots',
          visibility: {
            dependsOn: ['grantType', 'spellAvailability', 'spellCastingEnabled'],
            visibleWhen: (watched) =>
              watched['grantType'] === 'spells' &&
              watched['spellAvailability'] === true &&
              watched['spellCastingEnabled'] === true,
          },
        },
      ],
    },
    {
      type: 'combobox',
      name: 'spellIds',
      label: getContentTypeCollectionLabel('spells'),
      multiple: true,
      options: spellOptions,
      placeholder: formatChooseContentTypePlaceholder('spells', { plural: true }),
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
      label: `Recommended ${getContentTypeMidSentenceLabel('feats', { plural: true })}`,
      multiple: true,
      options: featOptions,
      placeholder: formatChooseContentTypePlaceholder('feats', { plural: true }),
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

function buildGrantRowHeaderContext(
  labels: Record<string, string>,
  ctx: ContentFormCtx,
): GrantRowHeaderContext {
  const referenceEquipment = ctx.options?.equipment?.forReference() ?? []

  return {
    rowLabels: labels,
    equipmentOptions: referenceEquipmentFieldOptions(ctx.options?.equipment),
    weaponOptions: toSortedContentFieldOptions(
      referenceEquipment.filter(isWeaponEquipment),
      'equipment',
    ),
    toolOptions: toSortedContentFieldOptions(
      referenceEquipment.filter((item) => item.kind === 'tool'),
      'equipment',
    ),
    armorOptions: toSortedContentFieldOptions(
      referenceEquipment.filter(isArmorEquipment),
      'equipment',
    ),
    skillOptions: toSortedContentFieldOptions(
      ctx.options?.skills?.forReference(),
      'skill-proficiencies',
    ),
    spellOptions: toSortedContentFieldOptions(ctx.options?.spells?.forReference(), 'spells'),
  }
}

export function grantArrayFields<T extends string>(
  grantTypes: readonly T[],
  labels: Record<T, string>,
  ctx: ContentFormCtx,
): FormItem[] {
  const rowLabels = labels as Record<string, string>
  const headerContext = buildGrantRowHeaderContext(rowLabels, ctx)

  return [
    {
      kind: 'array',
      name: 'grants',
      legend: 'Grants',
      addAction: {
        label: 'Add grant',
        menu: buildGrantArrayAddMenu(grantTypes as readonly GrantType[]),
      },
      item: {
        collapsible: true,
        header: {
          fallback: (index) => `Grant ${index + 1}`,
          primary: (values, index) => formatGrantRowPrimary(values, index, headerContext),
          summary: (values) => formatGrantRowSummary(values, headerContext),
        },
        renderShell: renderGrantArrayItemShell,
      },
      fields: grantItemFields(grantTypes, labels, ctx),
    },
  ]
}

// Re-export GRANT_ROW_TYPE_LABELS for consumers that import it from this module.
export { GRANT_ROW_TYPE_LABELS }
