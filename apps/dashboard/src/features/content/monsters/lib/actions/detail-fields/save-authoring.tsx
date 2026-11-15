import { ABILITY_IDS, getAbilityLabel, hasMeaningfulRepeatSave } from '@rpg/contracts'
import type {
  FieldConfig,
  FieldSeparator,
  FieldVisibility,
  FormHeadingScale,
  FormItem,
  SelectFieldConfig,
} from '@rpg/ui/form'

import { buildActiveCreatureTypeFieldOptions } from '@/features/vocabulary'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import { areaGeometryFormFields } from '../../../../lib/forms/fields/area-geometry-form-fields'
import {
  resolutionOccupantRequirementsFields,
  resolutionTargetAuthoringFields,
} from '../../../../lib/forms/fields/resolution-target-authoring-fields'
import { damageFieldGroup } from '../../../../lib/forms/mechanics/damage-field-group'
import { monsterActionTurnLimitField } from '../../../../lib/forms/mechanics/monster-action-turn-limit-fields'
import { orderedEffectFormFields } from '../../../../lib/forms/mechanics/ordered-effect-form-fields'
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
  MONSTER_SAVE_FAILED_LEGEND,
  MONSTER_SAVE_FIRST_FAILURE_LEGEND,
  MONSTER_SAVE_SECOND_FAILURE_LEGEND,
  MONSTER_SAVE_SUCCESSFUL_LEGEND,
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
import { MonsterActionSaveSuccessAmountField } from '../monster-action-save-outcome-fields'
import {
  MonsterActionSaveEnsureOutcomeSlotsField,
  MonsterActionSaveFailureOrSuccessField,
  MonsterActionSaveRepeatSaveField,
} from '../monster-action-save-form-slots'

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

function resolutionEnvelopeHasDamage(values: Record<string, unknown>): boolean {
  const effects = values['resolution.effects']
  if (!Array.isArray(effects)) return false
  return effects.some(
    (effect) =>
      effect && typeof effect === 'object' && (effect as { kind?: string }).kind === 'damage',
  )
}

const envelopeDamageVisibility: FieldVisibility = {
  dependsOn: ['resolution.effects'],
  visibleWhen: (values) => resolutionEnvelopeHasDamage(values),
}

const noEnvelopeDamageVisibility: FieldVisibility = {
  dependsOn: ['resolution.effects'],
  visibleWhen: (values) => !resolutionEnvelopeHasDamage(values),
}

const SR_ONLY_EFFECTS_HEADING = { label: 'Effects', labelVisibility: 'srOnly' as const }

const repeatSaveMeaningfulVisibility: FieldVisibility = {
  dependsOn: ['resolution.outcomes.0.repeatSave'],
  visibleWhen: (values) => {
    const repeatSave = values['resolution.outcomes.0.repeatSave']
    return hasMeaningfulRepeatSave(repeatSave as Parameters<typeof hasMeaningfulRepeatSave>[0])
  },
}

const FAILED_OUTCOME_EFFECTS_PATH = 'resolution.outcomes.0.effects'
const SECOND_FAILURE_EFFECTS_PATH = 'resolution.outcomes.0.repeatSave.secondFailure.effects'
const SUCCESS_OUTCOME_EFFECTS_PATH = 'resolution.outcomes.1.effects'
/** From a second-failure effect row, reach first-failure `effects`. */
const PRECEDING_FAILED_EFFECTS_PATH = '../../../../effects'

function abilityOptions() {
  return ABILITY_IDS.map((id) => ({ value: id, label: getAbilityLabel(id) }))
}

type MonsterAbilitySourcePath = 'bonusSource' | 'dcSource'

type MonsterAbilitySourceRequiredMarks = {
  controller?: boolean
  ability?: boolean
  castingAbility?: boolean
}

type MonsterAbilitySourceDependentInput = {
  sourcePath: MonsterAbilitySourcePath
  namePrefix: string
  controllerLabel: string
  abilityFields: FormItem[]
  controllerVariant?: 'select' | 'segmentedControl'
  dependentsChrome?: 'none'
  required?: MonsterAbilitySourceRequiredMarks
  sectionLegend?: { headingScale?: FormHeadingScale; separator?: FieldSeparator }
  spellcastingHint?: string
  currentActionId?: string
  sourceOptions?: { value: string; label: string }[]
  sourceHint?: SelectFieldConfig['hint']
}

function defaultMonsterAbilitySourceOptions() {
  return [
    { value: 'ability', label: MONSTER_ABILITY_SOURCE_KIND_ABILITY_LABEL },
    { value: 'spellcasting', label: MONSTER_ABILITY_SOURCE_KIND_SPELL_LABEL },
  ]
}

function buildMonsterAbilitySourceController(
  input: MonsterAbilitySourceDependentInput,
  kindName: string,
  sourceOptions: { value: string; label: string }[],
  useSectionLegend: boolean,
): FieldConfig {
  const required = input.required?.controller ? { required: true as const } : {}
  if (input.controllerVariant === 'segmentedControl') {
    return {
      type: 'segmentedControl',
      name: kindName,
      label: input.controllerLabel,
      labelVisibility: useSectionLegend ? 'srOnly' : undefined,
      options: sourceOptions,
      fullWidth: true,
      ...required,
    }
  }
  return {
    type: 'select',
    name: kindName,
    label: input.controllerLabel,
    placeholder: 'Choose',
    options: sourceOptions,
    ...(!useSectionLegend && input.sourceHint ? { hint: input.sourceHint } : {}),
    ...required,
  }
}

function buildMonsterAbilitySourceDependent(
  input: MonsterAbilitySourceDependentInput,
  controller: FieldConfig,
): FormItem {
  const kindName = `${input.sourcePath}.kind`
  const abilityBranch = whenFieldEquals(kindName, 'ability')
  const spellBranch = whenFieldEquals(kindName, 'spellcasting')
  return {
    kind: 'dependent',
    controller,
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

function wrapMonsterAbilitySourceSectionLegend(
  input: MonsterAbilitySourceDependentInput,
  dependent: FormItem,
): FormItem {
  const sectionLegend = input.sectionLegend
  if (!sectionLegend) return dependent
  return {
    kind: 'group',
    headingScale: sectionLegend.headingScale ?? 'subsection',
    heading: {
      label: input.controllerLabel,
      ...(input.sourceHint ? { hint: input.sourceHint } : {}),
    },
    ...(sectionLegend.separator ? { separator: sectionLegend.separator } : {}),
    fields: [dependent],
  }
}

export function monsterAbilitySourceDependent(input: MonsterAbilitySourceDependentInput): FormItem {
  const kindName = `${input.sourcePath}.kind`
  const sourceOptions = input.sourceOptions ?? defaultMonsterAbilitySourceOptions()
  const useSectionLegend = input.sectionLegend != null
  const controller = buildMonsterAbilitySourceController(
    input,
    kindName,
    sourceOptions,
    useSectionLegend,
  )
  const dependent = buildMonsterAbilitySourceDependent(input, controller)
  return wrapMonsterAbilitySourceSectionLegend(input, dependent)
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
    heading: {
      label: MONSTER_SAVE_TARGETING_LEGEND,
      hint: MONSTER_SAVE_TARGETING_DESCRIPTION,
    },
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
              headingLabel: 'Area',
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

function monsterSaveFailedSubsection(ctx: ContentFormCtx, namePrefix: string): FormItem {
  return {
    kind: 'group',
    heading: { label: MONSTER_SAVE_FAILED_LEGEND },
    headingScale: 'subsection',
    fields: [
      {
        kind: 'group',
        heading: { label: MONSTER_SAVE_FIRST_FAILURE_LEGEND },
        headingScale: 'field',
        visibility: repeatSaveMeaningfulVisibility,
        fields: [],
      },
      orderedEffectFormFields({
        ctx,
        arrayName: FAILED_OUTCOME_EFFECTS_PATH,
        heading: SR_ONLY_EFFECTS_HEADING,
        legendVisibility: 'srOnly',
        allowedEffectKinds: ['condition', 'note'],
        visibility: envelopeDamageVisibility,
      }),
      orderedEffectFormFields({
        ctx,
        arrayName: FAILED_OUTCOME_EFFECTS_PATH,
        heading: SR_ONLY_EFFECTS_HEADING,
        legendVisibility: 'srOnly',
        visibility: noEnvelopeDamageVisibility,
      }),
      {
        kind: 'slot',
        name: '_saveRepeatSave',
        render: () => <MonsterActionSaveRepeatSaveField namePrefix={namePrefix} />,
      },
      {
        kind: 'group',
        heading: { label: MONSTER_SAVE_SECOND_FAILURE_LEGEND },
        headingScale: 'field',
        visibility: repeatSaveMeaningfulVisibility,
        fields: [
          orderedEffectFormFields({
            ctx,
            arrayName: SECOND_FAILURE_EFFECTS_PATH,
            heading: SR_ONLY_EFFECTS_HEADING,
            legendVisibility: 'srOnly',
            precedingEffectsPath: PRECEDING_FAILED_EFFECTS_PATH,
            allowedEffectKinds: ['condition', 'note'],
          }),
        ],
      },
      {
        ...monsterSaveResolutionDamageGroup(ctx),
        visibility: envelopeDamageVisibility,
      },
    ],
  }
}

function monsterSaveSuccessfulSubsection(ctx: ContentFormCtx, namePrefix: string): FormItem {
  return {
    kind: 'group',
    heading: { label: MONSTER_SAVE_SUCCESSFUL_LEGEND },
    headingScale: 'subsection',
    fields: [
      {
        kind: 'slot',
        name: '_saveSuccessAmount',
        issuePaths: ['resolution.outcomes'],
        visibility: envelopeDamageVisibility,
        render: () => <MonsterActionSaveSuccessAmountField namePrefix={namePrefix} />,
      },
      orderedEffectFormFields({
        ctx,
        arrayName: SUCCESS_OUTCOME_EFFECTS_PATH,
        heading: SR_ONLY_EFFECTS_HEADING,
        legendVisibility: 'srOnly',
        allowedEffectKinds: ['condition', 'note'],
      }),
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
    heading: {
      label: SAVING_THROW_SECTION_LEGEND,
      hint: MONSTER_SAVE_THROW_SECTION_DESCRIPTION,
    },
    fields: [
      {
        kind: 'slot',
        name: '_saveEnsureOutcomeSlots',
        render: () => <MonsterActionSaveEnsureOutcomeSlotsField namePrefix={namePrefix} />,
      },
      {
        kind: 'group',
        headingScale: 'subsection',
        heading: { label: SAVING_THROW_ABILITY_LABEL },
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
        ],
      },
      monsterActionSaveSelectionDependent(ctx),
      monsterSaveFailedSubsection(ctx, namePrefix),
      monsterSaveSuccessfulSubsection(ctx, namePrefix),
      {
        kind: 'slot',
        name: '_saveFailureOrSuccess',
        render: () => <MonsterActionSaveFailureOrSuccessField namePrefix={namePrefix} />,
      },
      monsterActionTurnLimitField(),
    ],
  }
}
