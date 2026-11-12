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
  type Spell,
} from '@rpg/contracts'
import type { FieldVisibility, FormItem, SelectFieldConfig } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { areaGeometryFormFields } from '../../../lib/forms/fields/area-geometry-form-fields'
import { distanceJoinedPairField } from '../../../lib/forms/fields/content-distance-form-fields'
import { weaponAttackRangeGroup } from '../../../lib/forms/fields/weapon-attack-range-form-fields'
import { damageFieldGroup } from '../../../lib/forms/mechanics/damage-field-group'
import { savingThrowFieldGroup } from '../../../lib/forms/mechanics/saving-throw-field-group'
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
  MONSTER_SAVE_ABILITY_HINT,
  MONSTER_SAVE_ABILITY_LABEL,
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
  MONSTER_SAVE_DC_LABEL,
  MONSTER_SAVE_DC_PROFICIENCY_LABEL,
  MONSTER_SPELLCASTING_ABILITY_SAVE_DC_HINT,
  MONSTER_SAVE_THROW_SECTION_DESCRIPTION,
  MONSTER_SAVE_THROW_SECTION_LEGEND,
  MONSTER_TRIGGER_LABEL,
  MONSTER_TURN_LIMIT_ADD_LABEL,
  MONSTER_TURN_LIMIT_EMPTY_LABEL,
  MONSTER_TURN_LIMIT_LABEL,
  MONSTER_TURN_LIMIT_OPTION_LABEL,
  MONSTER_ATTACK_BONUS_LABEL,
  MONSTER_SPELL_CAST_HIGHER_LEVEL_LABEL,
  MONSTER_SPELL_CAST_LEVEL_PLACEHOLDER,
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
  spellComponentField,
} from './monster-action-on-hit-fields'
import { monsterSaveDcAbilityHintWhen } from './monster-action-save-field-hints'
import { monsterWeaponDamageOverrideField } from './monster-weapon-damage-override'
import type { MonsterFormValues } from '../monster-form-values'
import {
  MonsterActionSaveFailureNoteField,
  MonsterActionSaveSuccessAmountField,
} from './monster-action-save-outcome-fields'
import { legendaryActionCategory } from './legendary-action-category'
import { legendaryActionDetailFields } from './monster-legendary-action-fields'
import { spellAllowsHigherCastLevel, higherCastLevelOptions } from './monster-spell-frequency'
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
    controllerLabel: MONSTER_SAVE_DC_LABEL,
    currentActionId,
    dependentsChrome: 'none',
    spellcastingHint: MONSTER_SPELLCASTING_ABILITY_SAVE_DC_HINT,
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
    heading: { label: MONSTER_SAVE_THROW_SECTION_LEGEND },
    description: MONSTER_SAVE_THROW_SECTION_DESCRIPTION,
    fields: [
      {
        type: 'select',
        name: 'resolution.method.ability',
        label: MONSTER_SAVE_ABILITY_LABEL,
        options: abilityOptions(),
        hint: MONSTER_SAVE_ABILITY_HINT,
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
        placeholder: '5',
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
      normalRequired: true,
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

function monsterSpellCastAtLevelField(
  catalog: ReadonlyMap<string, Spell> | undefined,
): SelectFieldConfig {
  return {
    type: 'select',
    name: 'castAtLevel',
    label: 'Cast at level',
    labelVisibility: 'srOnly',
    placeholder: MONSTER_SPELL_CAST_LEVEL_PLACEHOLDER,
    width: '1/2',
    optionalDisclosure: {
      addLabel: MONSTER_SPELL_CAST_HIGHER_LEVEL_LABEL,
      expandWhenPopulated: true,
    },
    optionsResolve: {
      dependsOn: ['spellId'],
      optionsWhen: (values) => {
        const spellId = typeof values.spellId === 'string' ? values.spellId : ''
        const spell = catalog?.get(spellId)
        if (!spell || !spellAllowsHigherCastLevel(spell.level)) return []
        return higherCastLevelOptions(spell.level)
      },
    },
    visibility: {
      dependsOn: ['spellId'],
      visibleWhen: (values) => {
        const spellId = typeof values.spellId === 'string' ? values.spellId : ''
        const spell = catalog?.get(spellId)
        return Boolean(spell && spellAllowsHigherCastLevel(spell.level))
      },
    },
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
            monsterSpellCastAtLevelField(input.ctx.spellCatalogById),
          ],
        },
      ],
    },
    spellComponentField(),
    ...monsterActionLimitedUseFields({
      addDisabled:
        input.action.kind === 'spell' &&
        (input.action.spells ?? []).some((spell) => spell.limitedUse != null),
    }),
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
                hint={MONSTER_SPELLCASTING_ABILITY_SAVE_DC_HINT}
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
  return [...trigger, ...saveGroup, ...usage, ...kindFields]
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
  return legendaryAuthoringFields(input) ?? sharedAuthoringFields(input)
}
