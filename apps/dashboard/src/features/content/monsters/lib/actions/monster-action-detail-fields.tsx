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
  MONSTER_TRIGGER_LABEL,
} from '../monster-form-labels'
import type { MonsterActionSection } from '../../lib/actions/monster-action-equipment-references'
import type { MonsterActionDraftRow } from '../../lib/actions/monster-action-presets'
import {
  MonsterActionAttackCastingField,
  MonsterActionCastingAbilityField,
} from './monster-action-casting-fields'
import {
  monsterActionLimitedUseFields,
  monsterActionOnHitFields,
  spellComponentField,
} from './monster-action-on-hit-fields'
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
    action.kind === 'natural-weapon'
      ? {
          type: 'richtext',
          name: 'description',
          label: MONSTER_CUSTOM_DESCRIPTION_LABEL,
          hint: MONSTER_CUSTOM_DESCRIPTION_HINT,
          optionalDisclosure: { addLabel: MONSTER_CUSTOM_DESCRIPTION_ADD_LABEL },
        }
      : {
          type: 'richtext',
          name: 'description',
          label: MONSTER_CUSTOM_DESCRIPTION_LABEL,
          required: action.kind === 'special',
        },
  ]

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
    const ability: FieldVisibility = {
      dependsOn: ['bonusSource.kind'],
      visibleWhen: (values) => values['bonusSource.kind'] === 'ability',
    }
    fields.push(
      {
        type: 'select',
        name: 'bonusSource.kind',
        label: 'Attack bonus',
        placeholder: 'Choose',
        options: [
          { value: 'ability', label: 'Ability' },
          { value: 'spell', label: 'Spellcasting' },
        ],
      },
      {
        type: 'select',
        name: 'bonusSource.ability',
        label: 'Ability',
        placeholder: 'Choose',
        options: ABILITY_IDS.map((id) => ({ value: id, label: getAbilityLabel(id) })),
        visibility: ability,
      },
      {
        type: 'switch',
        name: 'bonusSource.proficient',
        label: 'Proficient',
        visibility: ability,
      },
      {
        kind: 'slot',
        name: 'bonusSource.castingAbility',
        render: () => (
          <MonsterActionAttackCastingField
            namePrefix={namePrefix}
            sharedOptions={sharedCastingOptions}
          />
        ),
      },
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
    fields.push(
      {
        type: 'select',
        name: 'dcSource.kind',
        label: 'Save DC',
        placeholder: 'Choose',
        options: [
          { value: 'ability', label: 'Ability' },
          { value: 'spell', label: 'Spellcasting' },
        ],
      },
      {
        type: 'select',
        name: 'dcSource.ability',
        label: 'Ability',
        placeholder: 'Choose',
        options: ABILITY_IDS.map((id) => ({ value: id, label: getAbilityLabel(id) })),
        visibility: {
          dependsOn: ['dcSource.kind'],
          visibleWhen: (values) => values['dcSource.kind'] === 'ability',
        },
      },
      {
        type: 'switch',
        name: 'dcSource.proficient',
        label: 'Proficient',
        visibility: {
          dependsOn: ['dcSource.kind'],
          visibleWhen: (values) => values['dcSource.kind'] === 'ability',
        },
      },
      {
        type: 'select',
        name: 'resolution.selectionMode',
        label: 'Selection',
        options: [
          { value: 'self', label: 'Area from self' },
          { value: 'targets', label: 'Creatures in reach' },
        ],
      },
      {
        type: 'select',
        name: 'resolution.method.ability',
        label: 'Save ability',
        options: ABILITY_IDS.map((id) => ({ value: id, label: getAbilityLabel(id) })),
      },
      ...areaGeometryFormFields({
        fieldPrefix: 'resolution.areaOfEffect',
        legend: 'Area',
        shapeHint: 'Area measured from the monster.',
        visibility: {
          dependsOn: ['resolution.selectionMode'],
          visibleWhen: (values) => values['resolution.selectionMode'] === 'self',
        },
      }),
      ...rollValueFields({
        namePrefix: 'resolution.effects.0.roll',
        label: MONSTER_ACTION_DAMAGE_FIELD_LABEL,
        required: true,
      }),
      damageTypeField({ name: 'resolution.effects.0.damageType', ctx, required: true }),
      {
        type: 'number',
        name: 'resolution.target.count',
        label: 'Target count',
        min: 1,
        visibility: {
          dependsOn: ['resolution.selectionMode'],
          visibleWhen: (values) => values['resolution.selectionMode'] === 'targets',
        },
      },
      {
        type: 'select',
        name: 'resolution.target.proximity.kind',
        label: 'Target distance',
        options: [
          { value: 'reach', label: 'Reach' },
          { value: 'distance', label: 'Range' },
        ],
        visibility: {
          dependsOn: ['resolution.selectionMode'],
          visibleWhen: (values) => values['resolution.selectionMode'] === 'targets',
        },
      },
      distanceInputSelectField({
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
    )
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
