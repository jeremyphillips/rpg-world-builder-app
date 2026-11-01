import {
  ABILITY_IDS,
  getAbilityLabel,
  getContentTypeTerm,
  getWeaponModeLabel,
  REACH_FEET,
  WEAPON_MODES,
} from '@rpg/contracts'
import type { FieldVisibility, FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { areaGeometryFormFields } from '../../../lib/forms/fields/area-geometry-form-fields'
import { distanceInputSelectField } from '../../../lib/forms/fields/content-speed-form-fields'
import { damageTypeField } from '../../../lib/forms/mechanics/damage-type-field'
import {
  rollValueFieldConfigs,
  rollValueFields,
} from '../../../lib/forms/mechanics/roll-value-fields'
import {
  MONSTER_ACTION_NAME_LABEL,
  MONSTER_ADDITIONAL_CONDITION_HINT,
  MONSTER_ADDITIONAL_CONDITION_LABEL,
  MONSTER_CUSTOM_DESCRIPTION_ADD_LABEL,
  MONSTER_CUSTOM_DESCRIPTION_HINT,
  MONSTER_CUSTOM_DESCRIPTION_LABEL,
  MONSTER_DAMAGE_TYPE_CHANGE_LABEL,
  MONSTER_ACTION_DAMAGE_FIELD_LABEL,
  MONSTER_ACTION_REACH_FIELD_LABEL,
  MONSTER_NATURAL_WEAPON_DAMAGE_HINT,
  MONSTER_SAVE_ABILITY_LABEL,
  MONSTER_SAVE_DC_ABILITY_LABEL,
  MONSTER_SAVE_DC_KIND_ABILITY_LABEL,
  MONSTER_SAVE_DC_KIND_SPELL_LABEL,
  MONSTER_SAVE_DC_LABEL,
  MONSTER_SAVE_DC_PROFICIENCY_LABEL,
  MONSTER_SAVE_THROW_SECTION_DESCRIPTION,
  MONSTER_SAVE_THROW_SECTION_LEGEND,
  MONSTER_TRIGGER_LABEL,
} from '../monster-form-labels'
import type { MonsterActionSection } from '../../lib/actions/monster-action-equipment-references'
import type { MonsterActionDraftRow } from '../../lib/actions/monster-action-presets'
import {
  MonsterActionAttackCastingField,
  MonsterActionCastingAbilityField,
  MonsterActionSaveDcCastingField,
} from './monster-action-casting-fields'
import {
  monsterActionLimitedUseFields,
  monsterActionOnHitFields,
  spellComponentField,
} from './monster-action-on-hit-fields'
import {
  monsterSaveAbilityHintWhen,
  monsterSaveDcAbilityHintWhen,
} from './monster-action-save-field-hints'
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

function monsterActionDescriptionField(action: MonsterActionDraftRow): FormItem {
  if (action.kind === 'special') {
    return {
      type: 'richtext',
      name: 'description',
      label: MONSTER_CUSTOM_DESCRIPTION_LABEL,
      required: true,
    }
  }
  return monsterActionOptionalDescriptionField
}

function monsterSaveResolutionDamageRow(ctx: ContentFormCtx): FormItem {
  return {
    kind: 'row',
    fields: [
      ...rollValueFieldConfigs({
        namePrefix: 'resolution.effects.0.roll',
        label: MONSTER_ACTION_DAMAGE_FIELD_LABEL,
        required: true,
      }),
      damageTypeField({ name: 'resolution.effects.0.damageType', ctx, required: true }),
    ],
  }
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

function monsterActionBonusSourceDependent(
  namePrefix: string,
  sharedCastingOptions: { value: string; label: string }[],
): FormItem {
  const abilityBranch = whenFieldEquals('bonusSource.kind', 'ability')
  const spellBranch = whenFieldEquals('bonusSource.kind', 'spell')
  return {
    kind: 'dependent',
    controller: {
      type: 'select',
      name: 'bonusSource.kind',
      label: 'Attack bonus',
      placeholder: 'Choose',
      options: [
        { value: 'ability', label: 'Ability' },
        { value: 'spell', label: 'Spellcasting' },
      ],
    },
    dependents: {
      visibility: whenFieldIsOneOf('bonusSource.kind', ['ability', 'spell']),
      fields: [
        {
          type: 'select',
          name: 'bonusSource.ability',
          label: 'Ability',
          placeholder: 'Choose',
          options: abilityOptions(),
          visibility: abilityBranch,
        },
        {
          type: 'switch',
          name: 'bonusSource.proficient',
          label: 'Proficient',
          visibility: abilityBranch,
        },
        {
          kind: 'slot',
          name: 'bonusSource.castingAbility',
          visibility: spellBranch,
          render: () => (
            <MonsterActionAttackCastingField
              namePrefix={namePrefix}
              sharedOptions={sharedCastingOptions}
            />
          ),
        },
      ],
    },
  }
}

function monsterActionSaveDcDependent(
  namePrefix: string,
  sharedCastingOptions: { value: string; label: string }[],
): FormItem {
  const abilityBranch = whenFieldEquals('dcSource.kind', 'ability')
  const spellBranch = whenFieldEquals('dcSource.kind', 'spell')
  return {
    kind: 'dependent',
    controller: {
      type: 'select',
      name: 'dcSource.kind',
      label: MONSTER_SAVE_DC_LABEL,
      placeholder: 'Choose',
      options: [
        { value: 'ability', label: MONSTER_SAVE_DC_KIND_ABILITY_LABEL },
        { value: 'spell', label: MONSTER_SAVE_DC_KIND_SPELL_LABEL },
      ],
    },
    dependents: {
      chrome: 'none',
      visibility: whenFieldIsOneOf('dcSource.kind', ['ability', 'spell']),
      fields: [
        {
          kind: 'row',
          visibility: abilityBranch,
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
        {
          kind: 'slot',
          name: 'dcSource.castingAbility',
          visibility: spellBranch,
          render: () => (
            <MonsterActionSaveDcCastingField
              namePrefix={namePrefix}
              sharedOptions={sharedCastingOptions}
            />
          ),
        },
      ],
    },
  }
}

function monsterActionSaveSelectionDependent(ctx: ContentFormCtx): FormItem {
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
        {
          ...distanceInputSelectField({
            name: 'resolution.target.proximity.distance.value',
            label: 'Distance (ft)',
            visibility: {
              dependsOn: ['resolution.selectionMode', 'resolution.target.proximity.kind'],
              visibleWhen: (values) =>
                values['resolution.selectionMode'] === 'targets' &&
                (values['resolution.target.proximity.kind'] === 'distance' ||
                  values['resolution.target.proximity.kind'] === 'reach'),
            },
          }),
        },
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
      monsterActionSaveSelectionDependent(ctx),
      {
        type: 'textarea',
        name: 'resolution.outcomes.0.note',
        label: 'Failure note',
        rows: 2,
        width: 'full',
        optionalDisclosure: {
          addLabel: 'Add failure note',
          removeLabel: 'Remove',
          expandWhenPopulated: true,
        },
      },
      {
        type: 'select',
        name: 'resolution.outcomes.1.applications.0.amount',
        label: 'On successful save',
        options: [
          { value: 'half', label: 'Half damage' },
          { value: 'full', label: 'Full damage' },
          { value: 'none', label: 'No effect' },
        ],
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
    {
      type: 'number',
      name: 'range.normal',
      label: 'Normal range',
      min: 5,
      visibility: rangedVisibility(modeField),
    },
    {
      type: 'number',
      name: 'range.long',
      label: 'Long range',
      min: 5,
      visibility: rangedVisibility(modeField),
    },
  ]
}

function spellOptions(ctx: ContentFormCtx) {
  return [...(ctx.spellCatalogById?.values() ?? [])].map((spell) => ({
    value: spell.id,
    label: spell.name,
  }))
}

// fallow-ignore-next-line complexity
export function monsterActionDetailFields(input: {
  ctx: ContentFormCtx
  action: MonsterActionDraftRow
  section: MonsterActionSection
  namePrefix: string
  equipmentOptions: { value: string; label: string }[]
  sharedCastingOptions: { value: string; label: string }[]
  attackOptions?: { value: string; label: string }[]
}): FormItem[] {
  const { ctx, action, section, namePrefix, equipmentOptions, sharedCastingOptions } = input
  const attackOptions = input.attackOptions ?? []
  const fields: FormItem[] = [
    { type: 'text', name: 'name', label: MONSTER_ACTION_NAME_LABEL },
    monsterActionDescriptionField(action),
  ]

  if (action.kind === 'save') {
    fields.push(monsterSaveResolutionDamageRow(ctx))
  }

  if (section === 'reactions') {
    fields.push({
      type: 'text',
      name: 'trigger.text',
      label: action.kind === 'spell' ? MONSTER_ADDITIONAL_CONDITION_LABEL : MONSTER_TRIGGER_LABEL,
      hint: action.kind === 'spell' ? MONSTER_ADDITIONAL_CONDITION_HINT : undefined,
    })
  }

  if (action.kind !== 'spell' && action.kind !== 'natural-weapon') {
    fields.push(...monsterActionLimitedUseFields())
  }

  if (action.kind === 'weapon') {
    fields.push({
      type: 'select',
      name: 'equipmentEntryId',
      label: getContentTypeTerm('equipment').label,
      placeholder: 'Select',
      options: equipmentOptions,
    })
    fields.push(...rollValueFields({ namePrefix: 'damage', label: 'Damage override' }))
    fields.push(monsterActionOnHitFields(ctx))
  }

  if (action.kind === 'natural-weapon') {
    fields.push(
      {
        kind: 'row',
        fields: [
          ...rollValueFieldConfigs({
            namePrefix: 'damage',
            label: MONSTER_ACTION_DAMAGE_FIELD_LABEL,
            required: true,
            hint: {
              text: MONSTER_NATURAL_WEAPON_DAMAGE_HINT,
              position: 'below-control',
            },
          }),
          {
            ...damageTypeField({
              name: 'damageType',
              ctx,
              scope: 'physical-and-vocabulary',
              required: true,
            }),
            presentation: { change: { label: MONSTER_DAMAGE_TYPE_CHANGE_LABEL } },
          },
        ],
      },
      monsterActionOnHitFields(ctx),
    )
  }

  if (action.kind === 'attack') {
    fields.push(
      monsterActionBonusSourceDependent(namePrefix, sharedCastingOptions),
      {
        type: 'chips',
        name: 'modes',
        label: 'Modes',
        options: modeOptions(),
      },
      ...reachRangeFields('modes'),
      damageTypeField({ name: 'damageType', ctx, required: true }),
      ...rollValueFields({
        namePrefix: 'damage',
        label: MONSTER_ACTION_DAMAGE_FIELD_LABEL,
        required: true,
      }),
      monsterActionOnHitFields(ctx),
    )
  }

  if (action.kind === 'save') {
    fields.push(monsterActionSaveSection(ctx, namePrefix, sharedCastingOptions))
  }

  if (action.kind === 'multiattack') {
    fields.push({
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
          options: attackOptions,
        },
      ],
    })
  }

  if (action.kind === 'spell') {
    fields.push(
      {
        kind: 'slot',
        name: 'castingAbility',
        render: () => (
          <MonsterActionCastingAbilityField
            name={`${namePrefix}.castingAbility`}
            sharedOptions={sharedCastingOptions}
            labelPosition="settings"
          />
        ),
      },
      spellComponentField(),
      ...monsterActionLimitedUseFields(),
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
            options: spellOptions(ctx),
          },
          { type: 'number', name: 'castAtLevel', label: 'Cast at level', min: 0, max: 9 },
          ...monsterActionLimitedUseFields(),
        ],
      },
    )
  }

  return fields
}
