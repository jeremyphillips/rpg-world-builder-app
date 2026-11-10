import {
  ABILITY_IDS,
  monsterActionAuthoring,
  monsterActionUsageCapability,
  getAbilityLabel,
  getContentTypeTerm,
  getWeaponModeLabel,
  MEASURED_RANGE_FEET,
  REACH_FEET,
  WEAPON_MODES,
} from '@rpg/contracts'
import type { FieldVisibility, FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { areaGeometryFormFields } from '../../../lib/forms/fields/area-geometry-form-fields'
import { distanceJoinedPairField } from '../../../lib/forms/fields/content-distance-form-fields'
import { weaponAttackRangeGroup } from '../../../lib/forms/fields/weapon-attack-range-form-fields'
import { damageFieldGroup } from '../../../lib/forms/mechanics/damage-field-group'
import { MonsterActionAttackSummary } from '../../components/form/monster-action-attack-summary'
import {
  MONSTER_RULES_TEXT_LABEL,
  MONSTER_ADDITIONAL_CONDITION_HINT,
  MONSTER_ADDITIONAL_CONDITION_LABEL,
  MONSTER_CUSTOM_DESCRIPTION_ADD_LABEL,
  MONSTER_CUSTOM_DESCRIPTION_HINT,
  MONSTER_CUSTOM_DESCRIPTION_LABEL,
  MONSTER_DAMAGE_TYPE_CHANGE_LABEL,
  MONSTER_ACTION_REACH_FIELD_LABEL,
  MONSTER_NATURAL_WEAPON_DAMAGE_HINT,
  MONSTER_SAVE_ABILITY_LABEL,
  MONSTER_ABILITY_SOURCE_KIND_ABILITY_LABEL,
  MONSTER_ABILITY_SOURCE_KIND_SPELL_LABEL,
  MONSTER_SAVE_DC_ABILITY_LABEL,
  MONSTER_SAVE_DC_LABEL,
  MONSTER_SAVE_DC_PROFICIENCY_LABEL,
  MONSTER_SAVE_THROW_SECTION_DESCRIPTION,
  MONSTER_SAVE_THROW_SECTION_LEGEND,
  MONSTER_TRIGGER_LABEL,
} from '../monster-form-labels'
import type { MonsterActionSection } from '../../lib/actions/monster-action-equipment-references'
import type { MonsterActionDraftRow } from '../../lib/actions/monster-action-presets'
import type { MonsterFormAdvisory } from '../monster-form-advisories'
import { monsterFormAdvisorySlot } from '../monster-form-advisory-presentation'
import { MonsterActionCastingAbilityField } from './monster-action-casting-fields'
import { MonsterActionRechargeField } from './monster-action-recharge-field'
import {
  monsterActionLimitedUseFields,
  monsterActionOnHitFields,
  spellComponentField,
} from './monster-action-on-hit-fields'
import {
  monsterSaveAbilityHintWhen,
  monsterSaveDcAbilityHintWhen,
} from './monster-action-save-field-hints'
import { monsterWeaponDamageOverrideField } from './monster-weapon-damage-override'
import type { MonsterFormValues } from '../monster-form-values'
import {
  MonsterActionSaveFailureNoteField,
  MonsterActionSaveSuccessAmountField,
} from './monster-action-save-outcome-fields'
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

function arrayIncludes(value: unknown, mode: string): boolean {
  return Array.isArray(value) && value.includes(mode)
}

const monsterActionOptionalDescriptionField = {
  type: 'richtext',
  name: 'description',
  label: MONSTER_CUSTOM_DESCRIPTION_LABEL,
  hint: MONSTER_CUSTOM_DESCRIPTION_HINT,
  optionalDisclosure: { addLabel: MONSTER_CUSTOM_DESCRIPTION_ADD_LABEL },
} as const satisfies FormItem

function monsterReactionConditionField(action: MonsterActionDraftRow): FormItem {
  return {
    type: 'text',
    name: 'trigger.text',
    label: action.kind === 'spell' ? MONSTER_ADDITIONAL_CONDITION_LABEL : MONSTER_TRIGGER_LABEL,
    hint: action.kind === 'spell' ? MONSTER_ADDITIONAL_CONDITION_HINT : undefined,
  }
}

function monsterActionDescriptionField(action: MonsterActionDraftRow): FormItem {
  if (monsterActionAuthoring(action).description === 'authored') {
    return {
      type: 'richtext',
      name: 'description',
      label: MONSTER_RULES_TEXT_LABEL,
      required: true,
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

function monsterAbilitySourceDependent(input: {
  sourcePath: MonsterAbilitySourcePath
  namePrefix: string
  controllerLabel: string
  abilityFields: FormItem[]
  sharedCastingOptions: { value: string; label: string }[]
  dependentsChrome?: 'none'
}): FormItem {
  const kindName = `${input.sourcePath}.kind`
  const abilityBranch = whenFieldEquals(kindName, 'ability')
  const spellBranch = whenFieldEquals(kindName, 'spell')
  return {
    kind: 'dependent',
    controller: {
      type: 'select',
      name: kindName,
      label: input.controllerLabel,
      placeholder: 'Choose',
      options: [
        { value: 'ability', label: MONSTER_ABILITY_SOURCE_KIND_ABILITY_LABEL },
        { value: 'spell', label: MONSTER_ABILITY_SOURCE_KIND_SPELL_LABEL },
      ],
    },
    dependents: {
      ...(input.dependentsChrome ? { chrome: input.dependentsChrome } : {}),
      visibility: whenFieldIsOneOf(kindName, ['ability', 'spell']),
      fields: [
        ...input.abilityFields.map((field) => ({ ...field, visibility: abilityBranch })),
        {
          kind: 'slot',
          name: `${input.sourcePath}.castingAbility`,
          visibility: spellBranch,
          render: () => (
            <MonsterActionCastingAbilityField
              name={`${input.namePrefix}.${input.sourcePath}.castingAbility`}
              sharedOptions={input.sharedCastingOptions}
            />
          ),
        },
      ],
    },
  }
}

function monsterActionBonusSourceDependent(
  namePrefix: string,
  sharedCastingOptions: { value: string; label: string }[],
): FormItem {
  return monsterAbilitySourceDependent({
    sourcePath: 'bonusSource',
    namePrefix,
    controllerLabel: 'Attack bonus',
    sharedCastingOptions,
    abilityFields: [
      {
        type: 'select',
        name: 'bonusSource.ability',
        label: 'Ability',
        placeholder: 'Choose',
        options: abilityOptions(),
      },
      {
        type: 'switch',
        name: 'bonusSource.proficient',
        label: 'Proficient',
      },
    ],
  })
}

function monsterActionSaveDcDependent(
  namePrefix: string,
  sharedCastingOptions: { value: string; label: string }[],
): FormItem {
  return monsterAbilitySourceDependent({
    sourcePath: 'dcSource',
    namePrefix,
    controllerLabel: MONSTER_SAVE_DC_LABEL,
    sharedCastingOptions,
    dependentsChrome: 'none',
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
  sharedCastingOptions: { value: string; label: string }[],
): FormItem {
  return {
    kind: 'group',
    heading: { label: MONSTER_SAVE_THROW_SECTION_LEGEND },
    description: MONSTER_SAVE_THROW_SECTION_DESCRIPTION,
    headingScale: 'subsection',
    fields: [
      {
        type: 'select',
        name: 'resolution.method.ability',
        label: MONSTER_SAVE_ABILITY_LABEL,
        options: abilityOptions(),
        hint: {
          resolve: {
            dependsOn: ['resolution.method.ability'],
            hintWhen: monsterSaveAbilityHintWhen,
          },
        },
      },
      monsterActionSaveDcDependent(namePrefix, sharedCastingOptions),
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

function reachRangeFields(modeField: 'mode' | 'modes'): FormItem[] {
  return [
    {
      type: 'joinedPair',
      label: MONSTER_ACTION_REACH_FIELD_LABEL,
      width: 'auto',
      visibility: meleeVisibility(modeField),
      start: {
        kind: 'select',
        name: 'reach',
        options: reachFeetOptions,
        digits: 2,
        defaultValue: 5,
        ariaLabel: 'Reach value',
      },
      end: {
        kind: 'label',
        text: 'ft.',
        ariaLabel: 'Reach unit',
      },
    },
    weaponAttackRangeGroup({
      normalName: 'range.normal',
      longName: 'range.long',
      visibility: rangedVisibility(modeField),
    }),
  ]
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
          sharedOptions={input.sharedCastingOptions}
          labelPosition="settings"
          sourceActionId={input.action.id}
          onBlocked={input.onCastingSourceBlocked}
        />
      ),
    },
    {
      kind: 'array',
      name: 'spells',
      label: getContentTypeTerm('spells').label,
      addAction: { label: 'Add spell' },
      item: { header: { fallback: (index) => `Spell ${index + 1}` } },
      fields: [
        {
          type: 'select',
          name: 'spellId',
          label: getContentTypeTerm('spells').label,
          placeholder: 'Choose',
          options: spellOptions(input.ctx),
        },
        { type: 'number', name: 'castAtLevel', label: 'Cast at level', min: 0, max: 9 },
        ...monsterActionLimitedUseFields(),
      ],
    },
    spellComponentField(),
    ...monsterActionLimitedUseFields(),
  ]
}

/** Trigger, usage, configuration, primary damage, then secondary effects. */
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
  const { ctx, action, section, namePrefix, sharedCastingOptions } = input
  const trigger =
    section === 'reactions' && action.kind !== 'multiattack'
      ? [monsterReactionConditionField(action)]
      : []
  if (action.kind === 'spell') {
    return [...trigger, ...monsterActionSpellMechanics(input)]
  }

  const usage = monsterActionUsageEditor(action, namePrefix)
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
      monsterActionBonusSourceDependent(namePrefix, sharedCastingOptions),
      {
        type: 'chips',
        name: 'modes',
        label: 'Modes',
        options: modeOptions(),
      },
      ...reachRangeFields('modes'),
      damageFieldGroup({
        ctx,
        damageTypeName: 'damageType',
        rollName: 'damage',
      }),
      monsterActionOnHitFields(ctx),
    )
  }
  if (action.kind === 'save') {
    kindFields.push(monsterActionSaveSection(ctx, namePrefix, sharedCastingOptions))
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
  return [...trigger, ...usage, ...kindFields]
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
  onCastingSourceBlocked?: (message: string) => void
  /** Already collected for this form. The advisory slot only filters this list. */
  advisories?: readonly MonsterFormAdvisory[]
}): FormItem[] {
  const { ctx, action, section, namePrefix } = input
  const source =
    action.kind === 'weapon' ? [monsterActionEquipmentField(input.equipmentOptions)] : []
  const preview =
    action.kind === 'weapon' || action.kind === 'natural-weapon' || action.kind === 'attack'
      ? [monsterActionAttackPreviewSlot(ctx, action)]
      : []
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
    ...supplemental,
  ]
}
