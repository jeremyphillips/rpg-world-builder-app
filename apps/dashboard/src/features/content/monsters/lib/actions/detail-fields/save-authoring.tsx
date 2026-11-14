import { ABILITY_IDS, getAbilityLabel } from '@rpg/contracts'
import type { FieldVisibility, FormItem, SelectFieldConfig } from '@rpg/ui/form'

import { buildActiveCreatureTypeFieldOptions } from '@/features/vocabulary'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import { areaGeometryFormFields } from '../../../../lib/forms/fields/area-geometry-form-fields'
import {
  resolutionOccupantRequirementsFields,
  resolutionTargetAuthoringFields,
} from '../../../../lib/forms/fields/resolution-target-authoring-fields'
import { damageFieldGroup } from '../../../../lib/forms/mechanics/damage-field-group'
import {
  SAVING_THROW_ABILITY_HINT,
  SAVING_THROW_ABILITY_LABEL,
  SAVING_THROW_DC_SOURCE_LABEL,
  SAVING_THROW_SECTION_LEGEND,
  SAVING_THROW_SPELLCASTING_HINT,
} from '../../../../lib/forms/mechanics/saving-throw-field-copy'
import {
  MONSTER_ABILITY_SOURCE_KIND_ABILITY_LABEL,
  MONSTER_ABILITY_SOURCE_KIND_SPELL_LABEL,
  MONSTER_SAVE_DC_ABILITY_LABEL,
  MONSTER_SAVE_DC_PROFICIENCY_LABEL,
  MONSTER_SAVE_THROW_SECTION_DESCRIPTION,
  MONSTER_SAVE_TARGETING_DESCRIPTION,
  MONSTER_SAVE_TARGETING_LEGEND,
  MONSTER_SAVE_AREA_OCCUPANT_REQUIREMENTS_HINT,
  MONSTER_SAVE_TARGETING_MODE_AREA_FROM_SELF,
  MONSTER_SAVE_TARGETING_MODE_LABEL,
  MONSTER_SAVE_TARGETING_MODE_SELECTED_TARGETS,
} from '../../monster-form-labels'
import { MonsterActionCastingAbilityField } from '../monster-action-casting-fields'
import { monsterSaveDcAbilityHintWhen } from '../monster-action-save-field-hints'
import {
  MonsterActionSaveFailureNoteField,
  MonsterActionSaveSuccessAmountField,
} from '../monster-action-save-outcome-fields'

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

export function monsterAbilitySourceDependent(input: {
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

function monsterActionSaveDcDependent(namePrefix: string, currentActionId: string): FormItem {
  return monsterAbilitySourceDependent({
    sourcePath: 'dcSource',
    namePrefix,
    controllerLabel: SAVING_THROW_DC_SOURCE_LABEL,
    currentActionId,
    dependentsChrome: 'none',
    spellcastingHint: SAVING_THROW_SPELLCASTING_HINT,
    required: { controller: true, ability: true, castingAbility: true },
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
            required: true,
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

function monsterActionSaveSelectionDependent(ctx: ContentFormCtx): FormItem {
  const selfMode = whenFieldEquals('resolution.selectionMode', 'self')
  const targetsMode = whenFieldEquals('resolution.selectionMode', 'targets')
  const creatureTypeOptions = buildActiveCreatureTypeFieldOptions(ctx.creatureTypeVocabulary)
  return {
    kind: 'group',
    heading: { label: MONSTER_SAVE_TARGETING_LEGEND },
    description: MONSTER_SAVE_TARGETING_DESCRIPTION,
    fieldChrome: { variant: 'panel', elevation: 'canvas' },
    fields: [
      {
        kind: 'dependent',
        controller: {
          type: 'segmentedControl',
          name: 'resolution.selectionMode',
          label: MONSTER_SAVE_TARGETING_MODE_LABEL,
          fullWidth: true,
          width: 'full',
          options: [
            { value: 'targets', label: MONSTER_SAVE_TARGETING_MODE_SELECTED_TARGETS },
            { value: 'self', label: MONSTER_SAVE_TARGETING_MODE_AREA_FROM_SELF },
          ],
          defaultValue: 'targets',
        },
        dependents: {
          chrome: 'none',
          visibility: whenFieldIsOneOf('resolution.selectionMode', ['self', 'targets']),
          fields: [
            ...areaGeometryFormFields({
              fieldPrefix: 'resolution.areaOfEffect',
              legend: 'Area',
              legendVisibility: 'srOnly',
              shapeHint: 'Area measured from the monster.',
              visibility: selfMode,
              includeExplicitNoneOption: false,
            }),
            ...resolutionTargetAuthoringFields({
              prefix: 'resolution.target',
              visibility: targetsMode,
              creatureTypeOptions,
              includeProximityKindSelect: false,
              requirementsFieldChrome: { variant: 'panel', emphasis: 'faint' },
            }),
            ...resolutionOccupantRequirementsFields({
              requirementsPath: 'resolution.occupantRequirements',
              creatureTypeOptions,
              visibility: selfMode,
              hint: MONSTER_SAVE_AREA_OCCUPANT_REQUIREMENTS_HINT,
              fieldsOnly: true,
              requirementsFieldChrome: { variant: 'panel', emphasis: 'faint' },
            }),
          ],
        },
      },
    ],
  }
}

export function monsterActionSaveSection(
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
        required: true,
      },
      monsterActionSaveDcDependent(namePrefix, currentActionId),
      monsterActionSaveSelectionDependent(ctx),
      monsterSaveResolutionDamageGroup(ctx),
      {
        kind: 'slot',
        name: '_saveFailureNote',
        issuePaths: ['resolution.outcomes'],
        render: () => <MonsterActionSaveFailureNoteField namePrefix={namePrefix} />,
      },
      {
        kind: 'slot',
        name: '_saveSuccessAmount',
        issuePaths: ['resolution.outcomes'],
        render: () => <MonsterActionSaveSuccessAmountField namePrefix={namePrefix} />,
      },
    ],
  }
}
