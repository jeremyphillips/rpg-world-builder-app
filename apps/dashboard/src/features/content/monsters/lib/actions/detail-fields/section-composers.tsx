import {
  monsterActionAuthoring,
  getContentTypeTerm,
  getActionVocabularyEntry,
  BONUS_STANDARD_ACTION_IDS,
  MEASURED_RANGE_FEET,
  TELEPORT_WITHIN_DEFAULT,
  PARRY_AC_BONUS_MAX,
  PARRY_AC_BONUS_MIN,
} from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

import { buildActiveCreatureTypeFieldOptions } from '@/features/vocabulary'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import { distanceJoinedPairField } from '../../../../lib/forms/fields/content-distance-form-fields'
import { resolutionOccupantRequirementsFields } from '../../../../lib/forms/fields/resolution-target-authoring-fields'
import { MonsterActionAttackSummary } from '../../../components/form/actions/monster-action-attack-summary'
import { MonsterActionBonusSummary } from '../../../components/form/actions/monster-action-bonus-summary'
import { MonsterActionParrySummary } from '../../../components/form/actions/monster-action-parry-summary'
import { MonsterActionMultiattackSummary } from '../../../components/form/actions/monster-action-multiattack-summary'
import { MonsterActionSpellSummary } from '../../../components/form/actions/monster-action-spell-summary'
import {
  MONSTER_RULES_TEXT_LABEL,
  MONSTER_CUSTOM_DESCRIPTION_ADD_LABEL,
  MONSTER_CUSTOM_DESCRIPTION_HINT,
  MONSTER_CUSTOM_DESCRIPTION_LABEL,
  MONSTER_TELEPORT_PASSENGER_HINT,
  MONSTER_TELEPORT_DISTANCE_HINT,
  MONSTER_TELEPORT_DISTANCE_LABEL,
  MONSTER_TELEPORT_PASSENGER_ADD_LABEL,
  MONSTER_TELEPORT_PASSENGER_LEGEND,
  MONSTER_TELEPORT_WITHIN_HINT,
  MONSTER_TELEPORT_WITHIN_LABEL,
  MONSTER_TAKE_ACTIONS_ACTIONS_LABEL,
  MONSTER_TAKE_ACTIONS_BEHAVIOR_HINT_DISABLED,
  MONSTER_TAKE_ACTIONS_CHOICE_EACH,
  MONSTER_TAKE_ACTIONS_CHOICE_LABEL,
  MONSTER_TAKE_ACTIONS_CHOICE_ONE,
  MONSTER_TAKE_ACTIONS_RESTRICTION_ADD_LABEL,
  MONSTER_TAKE_ACTIONS_RESTRICTION_HINT,
  MONSTER_TAKE_ACTIONS_RESTRICTION_LABEL,
  MONSTER_TAKE_ACTIONS_RESTRICTION_PLACEHOLDER,
  MONSTER_REACTION_ADDITIONAL_RULES_ADD_LABEL,
  MONSTER_REACTION_ADDITIONAL_RULES_HINT,
  MONSTER_REACTION_ADDITIONAL_RULES_LABEL,
  MONSTER_REACTION_REFERENCE_HINT,
  MONSTER_REFERENCE_ACTION_LABEL,
  MONSTER_TURN_LIMIT_ADD_LABEL,
  MONSTER_TURN_LIMIT_EMPTY_LABEL,
  MONSTER_TURN_LIMIT_LABEL,
  MONSTER_TURN_LIMIT_OPTION_LABEL,
  MONSTER_PARRY_AC_BONUS_HINT,
  MONSTER_PARRY_AC_BONUS_LABEL,
  MONSTER_PARRY_FOLLOW_UP_ADD_LABEL,
  MONSTER_PARRY_FOLLOW_UP_HINT,
  MONSTER_PARRY_FOLLOW_UP_LABEL,
} from '../../monster-form-labels'
import type { MonsterActionSection } from '../references/monster-action-equipment-references'
import type { MonsterActionDraftRow } from '../monster-action-presets'
import type { MonsterFormAdvisory } from '../../monster-form-advisories'
import { monsterFormAdvisorySlot } from '../../monster-form-advisory-presentation'
import { legendaryActionCategory } from '../legendary-action-category'
import { leapDistanceFields } from '../leap-distance-options'
import { legendaryActionDetailFields } from '../monster-legendary-action-fields'
import type { MonsterFormValues } from '../../monster-form-values'
import {
  monsterActionMechanicFields,
  monsterActionUsageEditor,
  monsterReactionConditionField,
} from './shared-mechanics'

const monsterActionOptionalDescriptionField = {
  type: 'richtext',
  name: 'description',
  label: MONSTER_CUSTOM_DESCRIPTION_LABEL,
  hint: MONSTER_CUSTOM_DESCRIPTION_HINT,
  optionalDisclosure: { addLabel: MONSTER_CUSTOM_DESCRIPTION_ADD_LABEL },
} as const satisfies FormItem

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

function monsterActionParryPreviewSlot(
  ctx: ContentFormCtx,
  action: MonsterActionDraftRow,
): FormItem {
  return {
    kind: 'slot',
    name: 'parryPreview',
    render: () => <MonsterActionParrySummary ctx={ctx} action={action} />,
  }
}

function bonusAuthoringFields(input: {
  ctx: ContentFormCtx
  action: MonsterActionDraftRow
  section: MonsterActionSection
  namePrefix: string
}): FormItem[] | undefined {
  if (input.section !== 'bonusActions') return undefined
  const preview: FormItem = {
    kind: 'slot',
    name: 'bonusPreview',
    render: () => <MonsterActionBonusSummary ctx={input.ctx} action={input.action} />,
  }
  const usage = monsterActionUsageEditor(input.action, input.namePrefix)
  if (input.action.kind === 'leap') {
    return [preview, ...leapDistanceFields(), ...usage]
  }
  if (input.action.kind === 'teleport') {
    const creatureTypeOptions = buildActiveCreatureTypeFieldOptions(
      input.ctx.creatureTypeVocabulary,
    )
    return [
      preview,
      distanceJoinedPairField({
        amountName: 'distanceFeet',
        label: MONSTER_TELEPORT_DISTANCE_LABEL,
        presets: MEASURED_RANGE_FEET,
        allowCustom: true,
        required: true,
        hint: { text: MONSTER_TELEPORT_DISTANCE_HINT },
      }),
      {
        kind: 'group',
        name: 'passenger',
        legend: MONSTER_TELEPORT_PASSENGER_LEGEND,
        description: MONSTER_TELEPORT_PASSENGER_HINT,
        optionalDisclosure: {
          addLabel: MONSTER_TELEPORT_PASSENGER_ADD_LABEL,
          seedWhen: () => ({ withinFeet: TELEPORT_WITHIN_DEFAULT }),
        },
        fields: [
          distanceJoinedPairField({
            amountName: 'passenger.withinFeet',
            label: MONSTER_TELEPORT_WITHIN_LABEL,
            presets: MEASURED_RANGE_FEET,
            allowCustom: true,
            required: true,
            hint: { text: MONSTER_TELEPORT_WITHIN_HINT },
          }),
          ...resolutionOccupantRequirementsFields({
            requirementsPath: 'passenger.requirements',
            creatureTypeOptions,
            fieldsOnly: true,
          }),
        ],
      },
      ...usage,
    ]
  }
  if (input.action.kind === 'take-actions') {
    return [
      preview,
      {
        type: 'segmentedControl',
        name: 'combination',
        label: MONSTER_TAKE_ACTIONS_CHOICE_LABEL,
        defaultValue: 'one',
        options: [
          { value: 'one', label: MONSTER_TAKE_ACTIONS_CHOICE_ONE },
          { value: 'each', label: MONSTER_TAKE_ACTIONS_CHOICE_EACH },
        ],
        interactivity: {
          dependsOn: ['standardActions'],
          disabledWhen: (values) => {
            const selected = values.standardActions
            return !Array.isArray(selected) || selected.length < 2
          },
        },
        hint: {
          position: 'below-control',
          resolve: {
            dependsOn: ['standardActions'],
            hintWhen: (values) => {
              const selected = values.standardActions
              if (!Array.isArray(selected) || selected.length < 2) {
                return MONSTER_TAKE_ACTIONS_BEHAVIOR_HINT_DISABLED
              }
              return undefined
            },
          },
        },
      },
      {
        type: 'chips',
        name: 'standardActions',
        label: MONSTER_TAKE_ACTIONS_ACTIONS_LABEL,
        noun: { singular: 'action', plural: 'actions' },
        required: true,
        options: BONUS_STANDARD_ACTION_IDS.map((id) => ({
          value: id,
          label: getActionVocabularyEntry(id)?.label ?? id,
        })),
      },
      {
        type: 'text',
        name: 'restriction',
        label: MONSTER_TAKE_ACTIONS_RESTRICTION_LABEL,
        hint: { text: MONSTER_TAKE_ACTIONS_RESTRICTION_HINT },
        placeholder: MONSTER_TAKE_ACTIONS_RESTRICTION_PLACEHOLDER,
        optionalDisclosure: { addLabel: MONSTER_TAKE_ACTIONS_RESTRICTION_ADD_LABEL },
      },
      ...usage,
    ]
  }
  return undefined
}

function reactionAuthoringFields(input: {
  ctx: ContentFormCtx
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
      monsterActionParryPreviewSlot(input.ctx, input.action),
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

export type MonsterActionDetailFieldsInput = {
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
  advisories?: readonly MonsterFormAdvisory[]
}

export function resolveMonsterActionSectionFields(
  input: MonsterActionDetailFieldsInput,
): FormItem[] {
  return (
    reactionAuthoringFields(input) ??
    legendaryAuthoringFields(input) ??
    bonusAuthoringFields(input) ??
    sharedAuthoringFields(input)
  )
}
