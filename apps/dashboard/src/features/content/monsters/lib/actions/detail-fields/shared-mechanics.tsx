import {
  getContentTypeTerm,
  getWeaponModeLabel,
  isPrimarySpellcastingAction,
  monsterActionUsageCapability,
  SHAPE_SHIFT_EQUIPMENT,
  SHAPE_SHIFT_EQUIPMENT_ENTRIES,
  type ShapeShiftEquipment,
  WEAPON_MODES,
  REACH_FEET,
} from '@rpg/contracts'
import {
  combineFieldVisibilityAll,
  type FieldVisibility,
  type FormItem,
  type JoinedPairFieldConfig,
  toOptions,
} from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import { damageFieldGroup } from '../../../../lib/forms/mechanics/damage-field-group'
import { SAVING_THROW_SPELLCASTING_HINT } from '../../../../lib/forms/mechanics/saving-throw-field-copy'
import { savingThrowFieldGroup } from '../../../../lib/forms/mechanics/saving-throw-field-group'
import {
  ATTACK_RANGE_LONG_FIELD_LABEL,
  ATTACK_RANGE_NORMAL_FIELD_LABEL,
  attackRangeJoinedPairFields,
} from '../../../../lib/forms/fields/weapon-attack-range-form-fields'
import { MonsterAttackRangeClusterSlot } from '../monster-attack-range-cluster-slot.client'
import {
  MONSTER_ADDITIONAL_CONDITION_HINT,
  MONSTER_ADDITIONAL_CONDITION_LABEL,
  MONSTER_DAMAGE_TYPE_CHANGE_LABEL,
  MONSTER_ACTION_DISTANCE_SECTION_LEGEND,
  MONSTER_ACTION_REACH_FIELD_LABEL,
  MONSTER_NATURAL_WEAPON_DAMAGE_HINT,
  MONSTER_ATTACK_BONUS_SOURCE_ABILITY_HINT,
  MONSTER_ATTACK_BONUS_SOURCE_ABILITY_LABEL,
  MONSTER_ATTACK_BONUS_SOURCE_SPELL_HINT,
  MONSTER_ATTACK_BONUS_SOURCE_SPELL_LABEL,
  MONSTER_ATTACK_BONUS_ADVANCED_LEGEND,
  MONSTER_ATTACK_BONUS_INCLUDE_PROFICIENCY_HINT,
  MONSTER_ATTACK_BONUS_INCLUDE_PROFICIENCY_LABEL,
  MONSTER_ATTACK_BONUS_LABEL,
  MONSTER_TRIGGER_LABEL,
  MONSTER_TRIGGER_PLACEHOLDER,
  MONSTER_SHAPE_SHIFT_EQUIPMENT_LABEL,
  MONSTER_SHAPE_SHIFT_PREREQUISITE_ADD_LABEL,
  MONSTER_SHAPE_SHIFT_PREREQUISITE_HINT,
  MONSTER_SHAPE_SHIFT_PREREQUISITE_LABEL,
} from '../../monster-form-labels'
import type { MonsterActionSection } from '../references/monster-action-equipment-references'
import type { MonsterActionDraftRow } from '../monster-action-presets'
import { MonsterActionAttackAbilityField } from '../monster-attack-ability-field'
import { MonsterActionCastingAbilityField } from '../spell/monster-action-casting-fields'
import { MonsterActionRechargeField } from '../recharge/monster-action-recharge-field'
import {
  monsterActionLimitedUseFields,
  monsterActionOnHitFields,
} from '../monster-action-on-hit-fields'
import { monsterSpellComponentRequirementsField } from '../spell/monster-spell-component-form-fields'
import { monsterWeaponDamageOverrideField } from '../weapon/monster-weapon-damage-override'
import type { MonsterFormValues } from '../../monster-form-values'
import { monsterSpellCastAtLevelField } from '../spell/monster-spell-cast-at-level-form-fields'
import { MONSTER_SPELL_PICKER_INTERCEPT } from '../../../components/form/monster-spell-picker-context'
import {
  MonsterSpellChangeAction,
  MonsterSpellEntryCard,
  MonsterSpellFrequencySlot,
} from '../../../components/form/monster-spell-entry-card'
import { monsterAbilitySourceDependent, monsterActionSaveSection } from './save-authoring'

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

export function monsterReactionConditionField(action: MonsterActionDraftRow): FormItem {
  const spell = action.kind === 'spell'
  return {
    type: 'text',
    name: 'trigger.text',
    label: spell ? MONSTER_ADDITIONAL_CONDITION_LABEL : MONSTER_TRIGGER_LABEL,
    hint: spell ? MONSTER_ADDITIONAL_CONDITION_HINT : undefined,
    ...(spell ? {} : { placeholder: MONSTER_TRIGGER_PLACEHOLDER, required: true }),
  }
}

function monsterActionBonusSourceDependent(namePrefix: string, currentActionId: string): FormItem {
  return monsterAbilitySourceDependent({
    sourcePath: 'bonusSource',
    namePrefix,
    controllerLabel: MONSTER_ATTACK_BONUS_LABEL,
    controllerVariant: 'segmentedControl',
    sectionLegend: { headingScale: 'subsection', separator: 'subtle' },
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
        heading: { label: MONSTER_ATTACK_BONUS_ADVANCED_LEGEND },
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
    heading: { label: MONSTER_ACTION_DISTANCE_SECTION_LEGEND },
    visibility: distanceVisibility(modeField),
    separator: 'subtle',
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

export function monsterActionUsageEditor(
  action: MonsterActionDraftRow,
  namePrefix: string,
): FormItem[] {
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
          profile={isPrimarySpellcastingAction(input.action) ? 'primary' : 'shared'}
          preview="save-dc"
        />
      ),
    },
    {
      kind: 'array',
      name: 'spells',
      heading: { label: getContentTypeTerm('spells').label },
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
export function monsterActionMechanicFields(input: {
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
  if (action.kind === 'shape-shift') {
    kindFields.push(
      {
        type: 'radio',
        name: `${namePrefix}.equipment`,
        label: MONSTER_SHAPE_SHIFT_EQUIPMENT_LABEL,
        options: toOptions(
          SHAPE_SHIFT_EQUIPMENT,
          Object.fromEntries(
            SHAPE_SHIFT_EQUIPMENT.map((id) => [id, SHAPE_SHIFT_EQUIPMENT_ENTRIES[id].label]),
          ) as Record<ShapeShiftEquipment, string>,
        ),
      },
      {
        type: 'text',
        name: `${namePrefix}.prerequisite`,
        label: MONSTER_SHAPE_SHIFT_PREREQUISITE_LABEL,
        hint: MONSTER_SHAPE_SHIFT_PREREQUISITE_HINT,
        optionalDisclosure: { intent: 'add', addLabel: MONSTER_SHAPE_SHIFT_PREREQUISITE_ADD_LABEL },
      },
    )
  }
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
      {
        ...monsterActionOnHitFields(ctx),
        separator: 'subtle',
      },
    )
  }
  if (action.kind === 'save') {
    kindFields.push(monsterActionSaveSection(ctx, namePrefix, action.id))
  }
  if (action.kind === 'multiattack') {
    kindFields.push({
      kind: 'array',
      name: 'steps',
      heading: { label: 'Steps' },
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
