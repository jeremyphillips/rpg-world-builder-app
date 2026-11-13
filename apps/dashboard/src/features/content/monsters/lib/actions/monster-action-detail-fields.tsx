import {
  ABILITY_IDS,
  monsterActionAuthoring,
  monsterActionUsageCapability,
  PARRY_AC_BONUS_MAX,
  PARRY_AC_BONUS_MIN,
  getAbilityLabel,
  getContentTypeTerm,
  getWeaponModeLabel,
  MEASURED_RANGE_FEET,
  REACH_FEET,
  WEAPON_MODES,
} from '@rpg/contracts'
import {
  combineFieldVisibilityAll,
  type FieldVisibility,
  type FormItem,
  type JoinedPairFieldConfig,
  type SelectFieldConfig,
} from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { areaGeometryFormFields } from '../../../lib/forms/fields/area-geometry-form-fields'
import { distanceJoinedPairField } from '../../../lib/forms/fields/content-distance-form-fields'
import {
  ATTACK_RANGE_LONG_FIELD_LABEL,
  ATTACK_RANGE_NORMAL_FIELD_LABEL,
  attackRangeJoinedPairFields,
} from '../../../lib/forms/fields/weapon-attack-range-form-fields'
import { MonsterAttackRangeClusterSlot } from './monster-attack-range-cluster-slot.client'
import { damageFieldGroup } from '../../../lib/forms/mechanics/damage-field-group'
import {
  SAVING_THROW_ABILITY_HINT,
  SAVING_THROW_ABILITY_LABEL,
  SAVING_THROW_DC_SOURCE_LABEL,
  SAVING_THROW_SECTION_LEGEND,
  SAVING_THROW_SPELLCASTING_HINT,
} from '../../../lib/forms/mechanics/saving-throw-field-copy'
import { savingThrowFieldGroup } from '../../../lib/forms/mechanics/saving-throw-field-group'
import { MonsterActionAttackSummary } from '../../components/form/monster-action-attack-summary'
import { MonsterActionMultiattackSummary } from '../../components/form/monster-action-multiattack-summary'
import { MonsterActionSpellSummary } from '../../components/form/monster-action-spell-summary'
import {
  MONSTER_RULES_TEXT_LABEL,
  MONSTER_ADDITIONAL_CONDITION_HINT,
  MONSTER_ADDITIONAL_CONDITION_LABEL,
  MONSTER_CUSTOM_DESCRIPTION_ADD_LABEL,
  MONSTER_CUSTOM_DESCRIPTION_HINT,
  MONSTER_CUSTOM_DESCRIPTION_LABEL,
  MONSTER_DAMAGE_TYPE_CHANGE_LABEL,
  MONSTER_ACTION_DISTANCE_SECTION_LEGEND,
  MONSTER_ACTION_REACH_FIELD_LABEL,
  MONSTER_NATURAL_WEAPON_DAMAGE_HINT,
  MONSTER_ABILITY_SOURCE_KIND_ABILITY_LABEL,
  MONSTER_ABILITY_SOURCE_KIND_SPELL_LABEL,
  MONSTER_ATTACK_BONUS_SOURCE_ABILITY_HINT,
  MONSTER_ATTACK_BONUS_SOURCE_ABILITY_LABEL,
  MONSTER_ATTACK_BONUS_SOURCE_SPELL_HINT,
  MONSTER_ATTACK_BONUS_SOURCE_SPELL_LABEL,
  MONSTER_ATTACK_BONUS_ADVANCED_LEGEND,
  MONSTER_ATTACK_BONUS_INCLUDE_PROFICIENCY_HINT,
  MONSTER_ATTACK_BONUS_INCLUDE_PROFICIENCY_LABEL,
  MONSTER_SAVE_DC_ABILITY_LABEL,
  MONSTER_SAVE_DC_PROFICIENCY_LABEL,
  MONSTER_SAVE_THROW_SECTION_DESCRIPTION,
  MONSTER_TRIGGER_LABEL,
  MONSTER_TRIGGER_PLACEHOLDER,
  MONSTER_PARRY_AC_BONUS_HINT,
  MONSTER_PARRY_AC_BONUS_LABEL,
  MONSTER_PARRY_FOLLOW_UP_ADD_LABEL,
  MONSTER_PARRY_FOLLOW_UP_HINT,
  MONSTER_PARRY_FOLLOW_UP_LABEL,
  MONSTER_REACTION_ADDITIONAL_RULES_ADD_LABEL,
  MONSTER_REACTION_ADDITIONAL_RULES_HINT,
  MONSTER_REACTION_ADDITIONAL_RULES_LABEL,
  MONSTER_REACTION_REFERENCE_HINT,
  MONSTER_REFERENCE_ACTION_LABEL,
  MONSTER_TURN_LIMIT_ADD_LABEL,
  MONSTER_TURN_LIMIT_EMPTY_LABEL,
  MONSTER_TURN_LIMIT_LABEL,
  MONSTER_TURN_LIMIT_OPTION_LABEL,
  MONSTER_ATTACK_BONUS_LABEL,
} from '../monster-form-labels'
import type { MonsterActionSection } from '../../lib/actions/monster-action-equipment-references'
import type { MonsterActionDraftRow } from '../../lib/actions/monster-action-presets'
import type { MonsterFormAdvisory } from '../monster-form-advisories'
import { monsterFormAdvisorySlot } from '../monster-form-advisory-presentation'
import { MonsterActionAttackAbilityField } from './monster-attack-ability-field'
import { MonsterActionCastingAbilityField } from './monster-action-casting-fields'
import { MonsterActionRechargeField } from './monster-action-recharge-field'
import {
  monsterActionLimitedUseFields,
  monsterActionOnHitFields,
} from './monster-action-on-hit-fields'
import { monsterSpellComponentRequirementsField } from './monster-spell-component-form-fields'
import { monsterSaveDcAbilityHintWhen } from './monster-action-save-field-hints'
import { monsterWeaponDamageOverrideField } from './monster-weapon-damage-override'
import type { MonsterFormValues } from '../monster-form-values'
import {
  MonsterActionSaveFailureNoteField,
  MonsterActionSaveSuccessAmountField,
} from './monster-action-save-outcome-fields'
import { legendaryActionCategory } from './legendary-action-category'
import { legendaryActionDetailFields } from './monster-legendary-action-fields'
import { monsterSpellCastAtLevelField } from './monster-spell-cast-at-level-form-fields'
import { MONSTER_SPELL_PICKER_INTERCEPT } from '../../components/form/monster-spell-picker-context'
import {
  MonsterSpellChangeAction,
  MonsterSpellEntryCard,
  MonsterSpellFrequencySlot,
} from '../../components/form/monster-spell-entry-card'

function meleeVisibility(name: 'mode' | 'modes'): FieldVisibility {
  return {
    dependsOn: [name],
    visibleWhen: (values) =>
      name === 'mode' ? values.mode === 'melee' : arrayIncludes(values.modes, 'melee'),
  }
}

function rangedVisibility(name: 'mode' | 'modes'): FieldVisibility {
  return {
    dependsOn: [name],
    visibleWhen: (values) =>
      name === 'mode' ? values.mode === 'ranged' : arrayIncludes(values.modes, 'ranged'),
  }
}

function distanceVisibility(name: 'mode' | 'modes'): FieldVisibility {
  return {
    dependsOn: [name],
    visibleWhen: (values) =>
      name === 'mode'
        ? values.mode === 'melee' || values.mode === 'ranged'
        : arrayIncludes(values.modes, 'melee') || arrayIncludes(values.modes, 'ranged'),
  }
}

function arrayIncludes(value: unknown, mode: string): boolean {
  return Array.isArray(value) && value.includes(mode)
}

function withModeFieldVisibility<T extends { visibility?: FieldVisibility }>(
  field: T,
  modeVisibility: FieldVisibility,
): T {
  return {
    ...field,
    visibility: field.visibility
      ? combineFieldVisibilityAll(field.visibility, modeVisibility)
      : modeVisibility,
  }
}

function dualAttackModesVisibility(name: 'mode' | 'modes'): FieldVisibility {
  return {
    dependsOn: [name],
    visibleWhen: (values) =>
      name === 'modes' &&
      arrayIncludes(values.modes, 'melee') &&
      arrayIncludes(values.modes, 'ranged'),
  }
}

function meleeOnlyAttackModeVisibility(name: 'mode' | 'modes'): FieldVisibility {
  return {
    dependsOn: [name],
    visibleWhen: (values) =>
      name === 'mode'
        ? values.mode === 'melee'
        : arrayIncludes(values.modes, 'melee') && !arrayIncludes(values.modes, 'ranged'),
  }
}

function rangedOnlyAttackModeVisibility(name: 'mode' | 'modes'): FieldVisibility {
  return {
    dependsOn: [name],
    visibleWhen: (values) =>
      name === 'mode'
        ? values.mode === 'ranged'
        : arrayIncludes(values.modes, 'ranged') && !arrayIncludes(values.modes, 'melee'),
  }
}

const monsterActionOptionalDescriptionField = {
  type: 'richtext',
  name: 'description',
  label: MONSTER_CUSTOM_DESCRIPTION_LABEL,
  hint: MONSTER_CUSTOM_DESCRIPTION_HINT,
  optionalDisclosure: { addLabel: MONSTER_CUSTOM_DESCRIPTION_ADD_LABEL },
} as const satisfies FormItem

function monsterReactionConditionField(action: MonsterActionDraftRow): FormItem {
  const spell = action.kind === 'spell'
  return {
    type: 'text',
    name: 'trigger.text',
    label: spell ? MONSTER_ADDITIONAL_CONDITION_LABEL : MONSTER_TRIGGER_LABEL,
    hint: spell ? MONSTER_ADDITIONAL_CONDITION_HINT : undefined,
    ...(spell ? {} : { placeholder: MONSTER_TRIGGER_PLACEHOLDER, required: true }),
  }
}

function monsterActionDescriptionField(action: MonsterActionDraftRow): FormItem {
  if (monsterActionAuthoring(action).description === 'authored') {
    return {
      type: 'richtext',
      name: 'description',
      label: MONSTER_RULES_TEXT_LABEL,
    }
  }
  return monsterActionOptionalDescriptionField
}

function monsterSaveResolutionDamageGroup(ctx: ContentFormCtx): FormItem {
  return damageFieldGroup({
    ctx,
    damageTypeName: 'resolution.effects.0.damageType',
    rollName: 'resolution.effects.0.roll',
  })
}

function whenFieldEquals(field: string, value: string): FieldVisibility {
  return {
    dependsOn: [field],
    visibleWhen: (values) => values[field] === value,
  }
}

function whenFieldIsOneOf(field: string, allowed: readonly string[]): FieldVisibility {
  return {
    dependsOn: [field],
    visibleWhen: (values) => {
      const current = values[field]
      return typeof current === 'string' && allowed.includes(current)
    },
  }
}

function abilityOptions() {
  return ABILITY_IDS.map((id) => ({ value: id, label: getAbilityLabel(id) }))
}

type MonsterAbilitySourcePath = 'bonusSource' | 'dcSource'

type MonsterAbilitySourceRequiredMarks = {
  controller?: boolean
  ability?: boolean
  castingAbility?: boolean
}

function monsterAbilitySourceDependent(input: {
  sourcePath: MonsterAbilitySourcePath
  namePrefix: string
  controllerLabel: string
  abilityFields: FormItem[]
  dependentsChrome?: 'none'
  required?: MonsterAbilitySourceRequiredMarks
  spellcastingHint?: string
  currentActionId?: string
  sourceOptions?: { value: string; label: string }[]
  sourceHint?: SelectFieldConfig['hint']
}): FormItem {
  const kindName = `${input.sourcePath}.kind`
  const abilityBranch = whenFieldEquals(kindName, 'ability')
  const spellBranch = whenFieldEquals(kindName, 'spellcasting')
  return {
    kind: 'dependent',
    controller: {
      type: 'select',
      name: kindName,
      label: input.controllerLabel,
      placeholder: 'Choose',
      options: input.sourceOptions ?? [
        { value: 'ability', label: MONSTER_ABILITY_SOURCE_KIND_ABILITY_LABEL },
        { value: 'spellcasting', label: MONSTER_ABILITY_SOURCE_KIND_SPELL_LABEL },
      ],
      ...(input.sourceHint ? { hint: input.sourceHint } : {}),
      ...(input.required?.controller ? { required: true } : {}),
    },
    dependents: {
      ...(input.dependentsChrome ? { chrome: input.dependentsChrome } : {}),
      visibility: whenFieldIsOneOf(kindName, ['ability', 'spellcasting']),
      fields: [
        ...input.abilityFields.map((field) => ({ ...field, visibility: abilityBranch })),
        {
          kind: 'slot',
          name: `${input.sourcePath}.castingAbility`,
          visibility: spellBranch,
          render: () => (
            <MonsterActionCastingAbilityField
              name={`${input.namePrefix}.${input.sourcePath}.castingAbility`}
              currentActionId={input.currentActionId ?? ''}
              required={input.required?.castingAbility}
              hint={input.spellcastingHint}
              preview={input.sourcePath === 'bonusSource' ? 'attack-bonus' : 'save-dc'}
            />
          ),
        },
      ],
    },
  }
}

function monsterActionBonusSourceDependent(namePrefix: string, currentActionId: string): FormItem {
  return monsterAbilitySourceDependent({
    sourcePath: 'bonusSource',
    namePrefix,
    controllerLabel: MONSTER_ATTACK_BONUS_LABEL,
    currentActionId,
    dependentsChrome: 'none',
    sourceOptions: [
      { value: 'ability', label: MONSTER_ATTACK_BONUS_SOURCE_ABILITY_LABEL },
      { value: 'spellcasting', label: MONSTER_ATTACK_BONUS_SOURCE_SPELL_LABEL },
    ],
    sourceHint: {
      resolve: {
        dependsOn: ['bonusSource.kind'],
        hintWhen: (values) => {
          if (values['bonusSource.kind'] === 'ability')
            return MONSTER_ATTACK_BONUS_SOURCE_ABILITY_HINT
          if (values['bonusSource.kind'] === 'spellcasting') {
            return MONSTER_ATTACK_BONUS_SOURCE_SPELL_HINT
          }
          return undefined
        },
      },
    },
    required: { controller: true, ability: true, castingAbility: true },
    abilityFields: [
      {
        kind: 'slot',
        name: 'bonusSource.ability',
        render: () => (
          <MonsterActionAttackAbilityField
            name={`${namePrefix}.bonusSource.ability`}
            proficientName={`${namePrefix}.bonusSource.proficient`}
          />
        ),
      },
      {
        kind: 'group',
        legend: MONSTER_ATTACK_BONUS_ADVANCED_LEGEND,
        headingScale: 'field',
        disclosure: { variant: 'legend', defaultOpen: false, persistOpen: false },
        fields: [
          {
            type: 'switch',
            name: 'bonusSource.proficient',
            label: MONSTER_ATTACK_BONUS_INCLUDE_PROFICIENCY_LABEL,
            hint: MONSTER_ATTACK_BONUS_INCLUDE_PROFICIENCY_HINT,
            defaultValue: true,
          },
        ],
      },
    ],
  })
}

function monsterActionSaveDcDependent(namePrefix: string, currentActionId: string): FormItem {
  return monsterAbilitySourceDependent({
    sourcePath: 'dcSource',
    namePrefix,
    controllerLabel: SAVING_THROW_DC_SOURCE_LABEL,
    currentActionId,
    dependentsChrome: 'none',
    spellcastingHint: SAVING_THROW_SPELLCASTING_HINT,
    abilityFields: [
      {
        kind: 'row',
        fields: [
          {
            type: 'select',
            name: 'dcSource.ability',
            label: MONSTER_SAVE_DC_ABILITY_LABEL,
            placeholder: 'Choose',
            options: abilityOptions(),
            width: '1/2',
            hint: {
              resolve: {
                dependsOn: ['dcSource.ability'],
                hintWhen: monsterSaveDcAbilityHintWhen,
              },
            },
          },
          {
            type: 'switch',
            name: 'dcSource.proficient',
            label: MONSTER_SAVE_DC_PROFICIENCY_LABEL,
            labelPosition: 'above',
            width: '1/2',
          },
        ],
      },
    ],
  })
}

function monsterActionSaveSelectionDependent(): FormItem {
  const selfMode = whenFieldEquals('resolution.selectionMode', 'self')
  const targetsMode = whenFieldEquals('resolution.selectionMode', 'targets')
  return {
    kind: 'dependent',
    controller: {
      type: 'select',
      name: 'resolution.selectionMode',
      label: 'Selection',
      options: [
        { value: 'self', label: 'Area from self' },
        { value: 'targets', label: 'Creatures in reach' },
      ],
    },
    dependents: {
      visibility: whenFieldIsOneOf('resolution.selectionMode', ['self', 'targets']),
      fields: [
        ...areaGeometryFormFields({
          fieldPrefix: 'resolution.areaOfEffect',
          legend: 'Area',
          legendVisibility: 'srOnly',
          shapeHint: 'Area measured from the monster.',
          visibility: selfMode,
        }),
        {
          type: 'number',
          name: 'resolution.target.count',
          label: 'Target count',
          min: 1,
          digits: 2,
          visibility: targetsMode,
        },
        {
          type: 'select',
          name: 'resolution.target.proximity.kind',
          label: 'Target distance',
          options: [
            { value: 'reach', label: 'Reach' },
            { value: 'distance', label: 'Range' },
          ],
          visibility: targetsMode,
        },
        distanceJoinedPairField({
          amountName: 'resolution.target.proximity.distance.value',
          label: 'Distance',
          presets: MEASURED_RANGE_FEET,
          allowCustom: true,
          visibility: {
            dependsOn: ['resolution.selectionMode', 'resolution.target.proximity.kind'],
            visibleWhen: (values) =>
              values['resolution.selectionMode'] === 'targets' &&
              (values['resolution.target.proximity.kind'] === 'distance' ||
                values['resolution.target.proximity.kind'] === 'reach'),
          },
        }),
      ],
    },
  }
}

function monsterActionSaveSection(
  ctx: ContentFormCtx,
  namePrefix: string,
  currentActionId: string,
): FormItem {
  return {
    kind: 'group',
    heading: { label: SAVING_THROW_SECTION_LEGEND },
    description: MONSTER_SAVE_THROW_SECTION_DESCRIPTION,
    fields: [
      {
        type: 'select',
        name: 'resolution.method.ability',
        label: SAVING_THROW_ABILITY_LABEL,
        options: abilityOptions(),
        hint: SAVING_THROW_ABILITY_HINT,
      },
      monsterActionSaveDcDependent(namePrefix, currentActionId),
      monsterActionSaveSelectionDependent(),
      monsterSaveResolutionDamageGroup(ctx),
      {
        kind: 'slot',
        name: '_saveFailureNote',
        render: () => <MonsterActionSaveFailureNoteField namePrefix={namePrefix} />,
      },
      {
        kind: 'slot',
        name: '_saveSuccessAmount',
        render: () => <MonsterActionSaveSuccessAmountField namePrefix={namePrefix} />,
      },
    ],
  }
}

function modeOptions() {
  return WEAPON_MODES.map((id) => ({ value: id, label: getWeaponModeLabel(id) }))
}

const reachFeetOptions = REACH_FEET.map((feet) => ({
  value: feet,
  label: String(feet),
}))

function monsterAttackReachField(_modeField: 'mode' | 'modes'): JoinedPairFieldConfig {
  return {
    type: 'joinedPair',
    label: MONSTER_ACTION_REACH_FIELD_LABEL,
    width: 'auto',
    start: {
      kind: 'select',
      name: 'reach',
      options: reachFeetOptions,
      digits: 2,
      placeholder: '5',
      ariaLabel: 'Reach value',
    },
    end: {
      kind: 'label',
      text: 'ft.',
      ariaLabel: 'Reach unit',
    },
  }
}

function monsterAttackRangeJoinedPairs(modeField: 'mode' | 'modes'): JoinedPairFieldConfig[] {
  const ranged = rangedVisibility(modeField)
  return attackRangeJoinedPairFields({
    normalName: 'range.normal',
    longName: 'range.long',
    normalRequired: true,
    normalLabel: ATTACK_RANGE_NORMAL_FIELD_LABEL,
    longLabel: ATTACK_RANGE_LONG_FIELD_LABEL,
  }).map((field) => withModeFieldVisibility(field, ranged))
}

type MonsterAttackDistanceFormScope = {
  idPrefix: string
  namePrefix: string
}

function monsterAttackDistanceFields(
  modeField: 'mode' | 'modes',
  formScope: MonsterAttackDistanceFormScope,
): FormItem {
  const reach = monsterAttackReachField(modeField)
  const rangeFields = monsterAttackRangeJoinedPairs(modeField)
  const rangeClusterRow = {
    kind: 'row' as const,
    spacing: 'compact' as const,
    fields: rangeFields.map((field) => ({ ...field, width: '1/2' as const })),
  }
  return {
    kind: 'group',
    legend: MONSTER_ACTION_DISTANCE_SECTION_LEGEND,
    visibility: distanceVisibility(modeField),
    fields: [
      {
        kind: 'row',
        visibility: dualAttackModesVisibility(modeField),
        fields: [
          {
            ...withModeFieldVisibility(reach, meleeVisibility(modeField)),
            width: '1/3',
          },
          {
            kind: 'slot',
            name: 'attackRangeCluster',
            width: '2/3',
            render: () => (
              <MonsterAttackRangeClusterSlot
                idPrefix={formScope.idPrefix}
                namePrefix={formScope.namePrefix}
                fields={rangeClusterRow.fields}
              />
            ),
          },
        ],
      },
      {
        kind: 'row',
        visibility: meleeOnlyAttackModeVisibility(modeField),
        fields: [withModeFieldVisibility(reach, meleeVisibility(modeField))],
      },
      {
        kind: 'row',
        visibility: rangedOnlyAttackModeVisibility(modeField),
        fields: rangeFields,
      },
    ],
  }
}

function monsterActionAttackPreviewSlot(
  ctx: ContentFormCtx,
  action: MonsterActionDraftRow,
): FormItem {
  return {
    kind: 'slot',
    name: 'attackPreview',
    render: () => <MonsterActionAttackSummary ctx={ctx} action={action} />,
  }
}

function monsterActionSpellPreviewSlot(
  ctx: ContentFormCtx,
  action: MonsterActionDraftRow,
  section: MonsterActionSection,
): FormItem {
  return {
    kind: 'slot',
    name: 'spellPreview',
    render: () => <MonsterActionSpellSummary ctx={ctx} action={action} section={section} />,
  }
}

function monsterActionMultiattackPreviewSlot(
  ctx: ContentFormCtx,
  action: MonsterActionDraftRow,
): FormItem {
  return {
    kind: 'slot',
    name: 'multiattackPreview',
    render: () => <MonsterActionMultiattackSummary ctx={ctx} action={action} />,
  }
}

function monsterActionAuthoringPreviewSlots(
  ctx: ContentFormCtx,
  action: MonsterActionDraftRow,
  section: MonsterActionSection,
): FormItem[] {
  switch (action.kind) {
    case 'weapon':
    case 'natural-weapon':
    case 'attack':
      return [monsterActionAttackPreviewSlot(ctx, action)]
    case 'spell':
      return [monsterActionSpellPreviewSlot(ctx, action, section)]
    case 'multiattack':
      return [monsterActionMultiattackPreviewSlot(ctx, action)]
    default:
      return []
  }
}

function spellOptions(ctx: ContentFormCtx) {
  return [...(ctx.spellCatalogById?.values() ?? [])].map((spell) => ({
    value: spell.id,
    label: spell.name,
  }))
}

function monsterActionUsageEditor(action: MonsterActionDraftRow, namePrefix: string): FormItem[] {
  const usage = monsterActionUsageCapability(action)
  if (usage.presentation === 'none') return []
  if (usage.kinds.length === 1 && usage.kinds[0] === 'recharge') {
    const presentation = usage.presentation === 'included' ? 'included' : 'optional'
    return [
      {
        kind: 'slot',
        name: 'limitedUse',
        render: () => (
          <MonsterActionRechargeField
            name={`${namePrefix}.limitedUse`}
            presentation={presentation}
          />
        ),
      },
    ]
  }
  return monsterActionLimitedUseFields()
}

function monsterActionEquipmentField(
  equipmentOptions: { value: string; label: string }[],
): FormItem {
  return {
    type: 'select',
    width: '1/2',
    name: 'equipmentEntryId',
    label: getContentTypeTerm('equipment').label,
    placeholder: 'Select',
    options: equipmentOptions,
    presentation: { change: { label: 'Change weapon' } },
  }
}

function monsterActionSpellMechanics(input: {
  ctx: ContentFormCtx
  action: MonsterActionDraftRow
  namePrefix: string
  sharedCastingOptions: { value: string; label: string }[]
  onCastingSourceBlocked?: (message: string) => void
}): FormItem[] {
  return [
    {
      kind: 'slot',
      name: 'castingAbility',
      render: () => (
        <MonsterActionCastingAbilityField
          name={`${input.namePrefix}.castingAbility`}
          currentActionId={input.action.id}
          sourceActionId={input.action.id}
          onBlocked={input.onCastingSourceBlocked}
          profile="primary"
          preview="save-dc"
        />
      ),
    },
    {
      kind: 'array',
      name: 'spells',
      label: getContentTypeTerm('spells').label,
      addAction: { label: 'Add spell', intercept: MONSTER_SPELL_PICKER_INTERCEPT },
      item: {
        collapsible: true,
        header: {
          fallback: (index) => `Spell ${index + 1}`,
          primary: (values) => {
            const spellId = typeof values.spellId === 'string' ? values.spellId : ''
            return input.ctx.spellCatalogById?.get(spellId)?.name
          },
        },
        renderShell: (props) => (
          <MonsterSpellEntryCard {...props} catalog={input.ctx.spellCatalogById} />
        ),
        beforeRemove: {
          name: 'changeSpell',
          render: () => <MonsterSpellChangeAction catalog={input.ctx.spellCatalogById} />,
        },
      },
      fields: [
        {
          kind: 'row',
          fields: [
            {
              kind: 'slot',
              name: 'frequency',
              width: '1/2',
              render: () => <MonsterSpellFrequencySlot />,
            },
            monsterSpellCastAtLevelField({
              catalog: input.ctx.spellCatalogById,
              spellIdField: 'spellId',
              labelVisibility: 'srOnly',
              width: '1/2',
            }),
          ],
        },
      ],
    },
    monsterSpellComponentRequirementsField(),
    ...monsterActionLimitedUseFields({
      addDisabled:
        input.action.kind === 'spell' &&
        (input.action.spells ?? []).some((spell) => spell.limitedUse != null),
    }),
  ]
}

/** Trigger and save setup, then configuration, on-hit, then usage (recharge / limits). */
function monsterActionMechanicFields(input: {
  ctx: ContentFormCtx
  action: MonsterActionDraftRow
  section: MonsterActionSection
  namePrefix: string
  sharedCastingOptions: { value: string; label: string }[]
  attackOptions: { value: string; label: string }[]
  equipment: MonsterFormValues['equipment']
  onCastingSourceBlocked?: (message: string) => void
}): FormItem[] {
  const { ctx, action, section, namePrefix } = input
  const trigger =
    section === 'reactions' && action.kind !== 'multiattack'
      ? [monsterReactionConditionField(action)]
      : []
  if (action.kind === 'spell') {
    return [...trigger, ...monsterActionSpellMechanics(input)]
  }

  const usage = monsterActionUsageEditor(action, namePrefix)
  const saveGroup =
    action.kind === 'special'
      ? [
          savingThrowFieldGroup({
            renderCastingAbility: () => (
              <MonsterActionCastingAbilityField
                name={`${namePrefix}.savingThrow.dcSource.castingAbility`}
                currentActionId={action.id}
                required={false}
                hint={SAVING_THROW_SPELLCASTING_HINT}
                preview="save-dc"
              />
            ),
          }),
        ]
      : []
  const kindFields: FormItem[] = []
  if (action.kind === 'weapon') {
    kindFields.push(
      monsterWeaponDamageOverrideField({
        ctx,
        equipment: input.equipment,
        equipmentEntryId: action.equipmentEntryId,
        damage: action.damage,
      }),
      monsterActionOnHitFields(ctx),
    )
  }
  if (action.kind === 'natural-weapon') {
    kindFields.push(
      damageFieldGroup({
        ctx,
        damageTypeName: 'damageType',
        rollName: 'damage',
        scope: 'physical-and-vocabulary',
        typeChangeLabel: MONSTER_DAMAGE_TYPE_CHANGE_LABEL,
        rollHint: {
          text: MONSTER_NATURAL_WEAPON_DAMAGE_HINT,
          position: 'below-control',
        },
      }),
      monsterActionOnHitFields(ctx),
    )
  }
  if (action.kind === 'attack') {
    kindFields.push(
      {
        type: 'chips',
        name: 'modes',
        label: 'Modes',
        options: modeOptions(),
        required: true,
      },
      monsterActionBonusSourceDependent(namePrefix, action.id),
      monsterAttackDistanceFields('modes', {
        idPrefix: `monster-action-${action.id}`,
        namePrefix,
      }),
      damageFieldGroup({
        ctx,
        damageTypeName: 'damageType',
        rollName: 'damage',
      }),
      monsterActionOnHitFields(ctx),
    )
  }
  if (action.kind === 'save') {
    kindFields.push(monsterActionSaveSection(ctx, namePrefix, action.id))
  }
  if (action.kind === 'multiattack') {
    kindFields.push({
      kind: 'array',
      name: 'steps',
      label: 'Steps',
      addAction: { label: 'Add step' },
      item: { header: { fallback: (index) => `Step ${index + 1}` } },
      fields: [
        { type: 'number', name: 'count', label: 'Count', min: 1 },
        {
          type: 'chips',
          name: 'actionIds',
          label: 'Attacks',
          options: input.attackOptions,
        },
      ],
    })
  }
  return [...trigger, ...saveGroup, ...kindFields, ...usage]
}

function turnLimitField(): FormItem {
  return {
    type: 'select',
    name: 'onceUntilNextTurn',
    label: MONSTER_TURN_LIMIT_LABEL,
    placeholder: MONSTER_TURN_LIMIT_EMPTY_LABEL,
    optionalDisclosure: { addLabel: MONSTER_TURN_LIMIT_ADD_LABEL },
    options: [{ value: 'true', label: MONSTER_TURN_LIMIT_OPTION_LABEL }],
  }
}

function reactionAuthoringFields(input: {
  action: MonsterActionDraftRow
  section: MonsterActionSection
  namePrefix: string
  attackOptions?: { value: string; label: string }[]
  referenceOptions?: { value: string; label: string }[]
  advisories?: readonly MonsterFormAdvisory[]
}): FormItem[] | undefined {
  if (input.section !== 'reactions') return undefined
  const attackOptions = input.attackOptions ?? []
  const referenceOptions = input.referenceOptions ?? []
  if (input.action.kind === 'parry') {
    return [
      monsterFormAdvisorySlot(input.advisories ?? [], input.namePrefix),
      {
        type: 'number',
        name: 'acBonus',
        label: MONSTER_PARRY_AC_BONUS_LABEL,
        hint: { text: MONSTER_PARRY_AC_BONUS_HINT },
        min: PARRY_AC_BONUS_MIN,
        max: PARRY_AC_BONUS_MAX,
        step: 1,
        required: true,
        control: 'stepper',
      },
      {
        type: 'select',
        name: 'followUpActionId',
        label: MONSTER_PARRY_FOLLOW_UP_LABEL,
        hint: { text: MONSTER_PARRY_FOLLOW_UP_HINT },
        placeholder: 'Choose',
        options: attackOptions,
        optionalDisclosure: {
          addLabel: MONSTER_PARRY_FOLLOW_UP_ADD_LABEL,
          seedWhen: () => '',
        },
      },
    ]
  }
  if (input.action.kind === 'action-reference') {
    return [
      monsterFormAdvisorySlot(input.advisories ?? [], input.namePrefix),
      monsterReactionConditionField(input.action),
      {
        type: 'select',
        name: 'actionIds.0',
        label: MONSTER_REFERENCE_ACTION_LABEL,
        hint: { text: MONSTER_REACTION_REFERENCE_HINT },
        placeholder: 'Choose',
        options: referenceOptions,
        required: true,
      },
      {
        type: 'richtext',
        name: 'description',
        label: MONSTER_REACTION_ADDITIONAL_RULES_LABEL,
        hint: MONSTER_REACTION_ADDITIONAL_RULES_HINT,
        optionalDisclosure: { addLabel: MONSTER_REACTION_ADDITIONAL_RULES_ADD_LABEL },
      },
    ]
  }
  return undefined
}

function legendaryAuthoringFields(input: {
  ctx: ContentFormCtx
  action: MonsterActionDraftRow
  section: MonsterActionSection
  namePrefix: string
  sharedCastingOptions: { value: string; label: string }[]
  referenceOptions?: { value: string; label: string }[]
  sourceSpellOptions?: { value: string; label: string }[]
  onCastingSourceBlocked?: (message: string) => void
  advisories?: readonly MonsterFormAdvisory[]
}): FormItem[] | undefined {
  const category =
    input.section === 'legendaryActions' ? legendaryActionCategory(input.action) : undefined
  if (!category || category === 'custom') return undefined
  return [
    monsterFormAdvisorySlot(input.advisories ?? [], input.namePrefix),
    ...legendaryActionDetailFields({
      category,
      namePrefix: input.namePrefix,
      actionId: input.action.id,
      sharedCastingOptions: input.sharedCastingOptions,
      referenceOptions: input.referenceOptions ?? [],
      catalogSpellOptions: spellOptions(input.ctx),
      sourceSpellOptions: input.sourceSpellOptions ?? [],
      spellCatalogById: input.ctx.spellCatalogById,
      onCastingSourceBlocked: input.onCastingSourceBlocked,
    }),
    turnLimitField(),
  ]
}

function sharedAuthoringFields(input: {
  ctx: ContentFormCtx
  action: MonsterActionDraftRow
  section: MonsterActionSection
  namePrefix: string
  equipmentOptions: { value: string; label: string }[]
  equipment?: MonsterFormValues['equipment']
  sharedCastingOptions: { value: string; label: string }[]
  attackOptions?: { value: string; label: string }[]
  onCastingSourceBlocked?: (message: string) => void
  advisories?: readonly MonsterFormAdvisory[]
}): FormItem[] {
  const { ctx, action, section, namePrefix } = input
  const source =
    action.kind === 'weapon' ? [monsterActionEquipmentField(input.equipmentOptions)] : []
  const preview = monsterActionAuthoringPreviewSlots(ctx, action, section)
  const primaryProse = action.kind === 'special' ? [monsterActionDescriptionField(action)] : []
  const supplemental = action.kind === 'special' ? [] : [monsterActionDescriptionField(action)]
  return [
    ...source,
    ...preview,
    monsterFormAdvisorySlot(input.advisories ?? [], namePrefix),
    ...primaryProse,
    ...monsterActionMechanicFields({
      ctx,
      action,
      section,
      namePrefix,
      sharedCastingOptions: input.sharedCastingOptions,
      attackOptions: input.attackOptions ?? [],
      equipment: input.equipment ?? [],
      onCastingSourceBlocked: input.onCastingSourceBlocked,
    }),
    turnLimitField(),
    ...supplemental,
  ]
}

/**
 * Detail body order: source, preview, advisory, primary prose, mechanics, supplemental prose.
 * Identity stays on the master-detail header.
 */
export function monsterActionDetailFields(input: {
  ctx: ContentFormCtx
  action: MonsterActionDraftRow
  section: MonsterActionSection
  namePrefix: string
  equipmentOptions: { value: string; label: string }[]
  equipment?: MonsterFormValues['equipment']
  sharedCastingOptions: { value: string; label: string }[]
  attackOptions?: { value: string; label: string }[]
  referenceOptions?: { value: string; label: string }[]
  sourceSpellOptions?: { value: string; label: string }[]
  onCastingSourceBlocked?: (message: string) => void
  /** Already collected for this form. The advisory slot only filters this list. */
  advisories?: readonly MonsterFormAdvisory[]
}): FormItem[] {
  return (
    reactionAuthoringFields(input) ??
    legendaryAuthoringFields(input) ??
    sharedAuthoringFields(input)
  )
}
