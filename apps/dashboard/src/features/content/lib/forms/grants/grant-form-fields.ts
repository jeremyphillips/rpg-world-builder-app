import {
  FEAT_CATEGORY_IDS,
  FEAT_CATEGORY_ENTRIES,
  formatDamageTypeGrantSentence,
  formatFeatChoiceGrantSentence,
  formatLanguageGrantSentence,
  formatMovementGrantAuthoringSummary,
  formatResistanceGrantSentence,
  formatSenseGrantSentence,
  getMovementModeGrantLabel,
  MOVEMENT_BONUS_FEET,
  MOVEMENT_MODES,
  MOVEMENT_OPERATION_ENTRIES,
  MOVEMENT_OPERATIONS,
  MOVEMENT_SPEED_FEET,
  SENSE_RANGES,
  USAGE_FREQUENCIES,
  USAGE_FREQUENCY_ENTRIES,
  type FeatCategory,
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
  type JoinedPairFieldConfig,
  type SelectFieldOptionListItem,
  flattenSelectFieldOptions,
} from '@rpg/ui/form'
import { createElement } from 'react'

import {
  buildActiveDamageTypeFieldOptions,
  buildActiveLanguageFieldOptions,
  buildActiveSenseFieldOptions,
} from '@/features/vocabulary'

import { GrantTypePersistField } from './grant-type-persist-field'
import {
  formatChooseContentTypePlaceholder,
  getContentTypeCollectionLabel,
  getContentTypeMidSentenceLabel,
} from '@/features/content/lib/content-type-labels'

import type { ContentFormCtx } from '../registry/content-form-registry'
import { getLevelFieldOptions, withLevelOptionLabels } from '../../form-options/level-field-options'
import {
  referenceEquipmentFieldOptions,
  toSortedContentFieldOptions,
} from '../../form-options/content-field-option.lib'
import { getSpellcastingAbilityFieldOptions } from '../../form-options/spellcasting-ability-field-options'
import { equipmentGrantItemFields } from './equipment/equipment-grant-form-fields'
import {
  proficiencyGrantItemFields,
  type ProficiencyGrantType,
} from './proficiency/proficiency-grant-form-fields'
import { buildGrantArrayAddMenu } from './grant-add-menu.lib'
import { grantFieldLabel } from './grant-field-terms'
import { createGrantArrayItemShell } from './grant-array-item-shell.lib'
import {
  movementFormValuesToGrantPayload,
  resolveGrantRowPresentation,
  resolveSpellGrantName,
  GRANT_TYPE_MISSING_PRIMARY,
  type GrantRowHeaderContext,
  type GrantRowValues,
} from './grant-row-presentation.lib'
import {
  formatGrantUnlockLevelLabel,
  GRANT_DEFAULT_UNLOCK_LABEL,
  GRANT_DEFAULT_UNLOCK_LEVEL,
  GRANT_ROW_TYPE_LABELS,
  type GrantType,
} from './grant-form-schema'

export type GrantItemFieldsOptions = {
  /** When set, grant unlock defaults to the parent row field and only later levels are selectable. */
  inheritUnlockFromParentField?: 'level'
}

function parseParentUnlockLevel(parentLevel: unknown): number | undefined {
  if (parentLevel === undefined || parentLevel === null || parentLevel === '') return undefined
  const level = typeof parentLevel === 'number' ? parentLevel : Number(parentLevel)
  return Number.isFinite(level) ? level : undefined
}

/** Default unlock label; includes parent level when inheriting from a class feature row. */
export function formatGrantDefaultUnlockLabel(parentLevel?: number): string {
  if (parentLevel !== undefined) {
    return `${GRANT_DEFAULT_UNLOCK_LABEL} (level ${parentLevel})`
  }
  return GRANT_DEFAULT_UNLOCK_LABEL
}

/** Builds Granted-at select options, optionally scoped to levels after a parent feature level. */
export function buildGrantUnlockLevelOptions(
  levelOptions: SelectFieldOptionListItem[],
  parentLevelInput?: unknown,
): FieldOption[] {
  const parentLevel = parseParentUnlockLevel(parentLevelInput)
  const defaultOption: FieldOption = {
    value: GRANT_DEFAULT_UNLOCK_LEVEL,
    label: formatGrantDefaultUnlockLabel(parentLevel),
  }

  const flatLevels = flattenSelectFieldOptions(
    withLevelOptionLabels(levelOptions, formatGrantUnlockLevelLabel),
  )

  if (parentLevel === undefined) {
    return [defaultOption, ...flatLevels]
  }

  return [defaultOption, ...flatLevels.filter((option) => Number(option.value) > parentLevel)]
}

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

export function formatSpellRowSummary(values: GrantRowValues, ctx: GrantRowHeaderContext): string {
  return resolveGrantRowPresentation(values, ctx)?.description ?? ''
}

const senseRangeOptions = SENSE_RANGES.map((range) => ({
  value: range,
  label: String(range),
}))

function senseRangeJoinedPairField(
  overrides?: Partial<JoinedPairFieldConfig>,
): JoinedPairFieldConfig {
  return {
    type: 'joinedPair',
    label: 'Range',
    width: '1/3',
    start: {
      kind: 'select',
      name: 'senseRange',
      options: senseRangeOptions,
      digits: 3,
      defaultValue: 60,
      ariaLabel: 'Range',
    },
    end: {
      kind: 'label',
      text: 'ft.',
      ariaLabel: 'Range unit',
    },
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

export { GRANT_TYPE_MISSING_PRIMARY }

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

function grantTypePersistFields(): FormItem[] {
  return [
    {
      kind: 'slot',
      name: '_grantTypePersist',
      render: () => createElement(GrantTypePersistField),
    },
  ]
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

export type { GrantRowHeaderContext, GrantRowValues }

/** Collapsed-row summary for a grant array item. */
export function formatGrantRowSummary(values: GrantRowValues, ctx: GrantRowHeaderContext): string {
  return resolveGrantRowPresentation(values, ctx)?.description ?? ''
}

/** Primary heading for a grant array item header. */
export function formatGrantRowPrimary(
  values: GrantRowValues,
  _index: number,
  ctx: GrantRowHeaderContext,
): string | undefined {
  return resolveGrantRowPresentation(values, ctx)?.heading
}

export { resolveGrantRowPresentation, resolveSpellGrantName }

export function grantItemFields<T extends string>(
  grantTypes: readonly T[],
  _labels: Record<T, string>,
  ctx: ContentFormCtx,
  options?: GrantItemFieldsOptions,
): FormItem[] {
  const spellOptions = toSortedContentFieldOptions(ctx.options?.spells?.forReference(), 'spells')
  const featOptions = toSortedContentFieldOptions(ctx.options?.feats?.forReference(), 'feats')
  const damageTypeOptions = buildActiveDamageTypeFieldOptions(ctx.damageTypeVocabulary)
  const senseTypeOptions = buildActiveSenseFieldOptions(ctx.senseVocabulary)
  const languageOptions = buildActiveLanguageFieldOptions(ctx.languageVocabulary)
  const levelOptions = getLevelFieldOptions(ctx)

  const unlockLevelOptions = buildGrantUnlockLevelOptions(levelOptions)
  const inheritUnlockFromParent = options?.inheritUnlockFromParentField === 'level'

  return [
    ...grantTypePersistFields(),
    ...grantTypeMissingRepairFields(),
    {
      type: 'inlineSentence',
      name: 'unlockLevel',
      label: 'Granted at',
      labelVisibility: 'srOnly',
      visibility: visibleWhenGrantTypeSet(),
      ...(inheritUnlockFromParent
        ? {
            optionsResolve: {
              dependsOn: ['../../level'],
              optionsWhen: (values: Record<string, unknown>) =>
                buildGrantUnlockLevelOptions(levelOptions, values['../../level']),
            },
          }
        : {}),
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
      label: grantFieldLabel('resistances', { plural: true }),
      required: true,
      options: damageTypeOptions,
      visibility: visibleFor('resistances'),
    },
    {
      type: 'chips',
      name: 'damageType',
      label: grantFieldLabel('damageType', { plural: true }),
      required: true,
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
          label: grantFieldLabel('senseType'),
          required: true,
          options: senseTypeOptions,
          width: '2/3',
        },
        senseRangeJoinedPairField(),
      ],
    },
    movementInlineSentenceField({
      visibility: visibleFor('movement'),
    }),
    {
      type: 'select',
      name: 'language',
      label: grantFieldLabel('language'),
      required: true,
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
  options?: GrantItemFieldsOptions,
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
          primary: (values) => resolveGrantRowPresentation(values, headerContext)?.heading,
          summary: (values) => formatGrantRowSummary(values, headerContext),
        },
        renderShell: createGrantArrayItemShell(headerContext),
      },
      fields: grantItemFields(grantTypes, labels, ctx, options),
    },
  ]
}

// Re-export GRANT_ROW_TYPE_LABELS for consumers that import it from this module.
export { GRANT_ROW_TYPE_LABELS }
