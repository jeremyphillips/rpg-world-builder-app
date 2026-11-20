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
import { monsterActionTurnLimitField } from '../monster-action-turn-limit-fields'
import { MonsterActionAttackSummary } from '../../../components/form/actions/attack/attack-preview.slot'
import { MonsterActionBonusSummary } from '../../../components/form/actions/sections/bonus-preview.slot'
import { MonsterActionParrySummary } from '../../../components/form/actions/parry/parry-preview.slot'
import { MonsterActionMultiattackSummary } from '../../../components/form/actions/multiattack/multiattack-preview.slot'
import { MonsterActionSpellSummary } from '../../../components/form/actions/spell/spell-preview.slot'
import { MonsterActionShapeShiftSummary } from '../../../components/form/actions/shape-shift/shape-shift-summary.slot'
import {
  MONSTER_RULES_TEXT_LABEL,
  MONSTER_CUSTOM_DESCRIPTION_HINT,
  MONSTER_CUSTOM_DESCRIPTION_LABEL,
  MONSTER_TELEPORT_PASSENGER_HINT,
  MONSTER_TELEPORT_DISTANCE_HINT,
  MONSTER_TELEPORT_DISTANCE_LABEL,
  MONSTER_TELEPORT_PASSENGER_LEGEND,
  MONSTER_TELEPORT_WITHIN_HINT,
  MONSTER_TELEPORT_WITHIN_LABEL,
  MONSTER_TAKE_ACTIONS_ACTIONS_LABEL,
  MONSTER_TAKE_ACTIONS_BEHAVIOR_HINT_DISABLED,
  MONSTER_TAKE_ACTIONS_CHOICE_EACH,
  MONSTER_TAKE_ACTIONS_CHOICE_LABEL,
  MONSTER_TAKE_ACTIONS_CHOICE_ONE,
  MONSTER_TAKE_ACTIONS_RESTRICTION_HINT,
  MONSTER_TAKE_ACTIONS_RESTRICTION_LABEL,
  MONSTER_TAKE_ACTIONS_RESTRICTION_PLACEHOLDER,
  MONSTER_REACTION_ADDITIONAL_RULES_HINT,
  MONSTER_REACTION_ADDITIONAL_RULES_LABEL,
  MONSTER_REACTION_REFERENCE_HINT,
  MONSTER_REFERENCE_ACTION_LABEL,
  MONSTER_PARRY_AC_BONUS_HINT,
  MONSTER_PARRY_AC_BONUS_LABEL,
  MONSTER_PARRY_FOLLOW_UP_HINT,
  MONSTER_PARRY_FOLLOW_UP_LABEL,
} from '../../monster-form-labels'
import type { MonsterActionSection } from '../references/monster-action-equipment-references'
import type { MonsterActionDraftRow } from '../monster-action-presets'
import { monsterActionActiveKeys } from '../monster-action-kind'
import { insertMonsterFormAvailabilityField } from '../../forms/monster-form-availability-fields'
import type { MonsterFormAdvisory } from '../../monster-form-advisories'
import { monsterFormAdvisoryDisplay } from '../../monster-form-advisory-presentation'
import { legendaryActionCategory } from '../legendary/legendary-action-category'
import { leapDistanceFields } from '../leap-distance-options'
import { legendaryActionDetailFields } from '../legendary/monster-legendary-action-fields'
import type { MonsterActionAcquisitionChoice } from '../acquisition/monster-action-acquisition'
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
  optionalDisclosure: { intent: 'add', actionSubject: 'details' },
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
    case 'shape-shift':
      return [
        {
          kind: 'slot',
          name: 'shapeShiftSummary',
          render: () => <MonsterActionShapeShiftSummary ctx={ctx} action={action} />,
        },
      ]
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

const turnLimitField = monsterActionTurnLimitField

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
        heading: {
          label: MONSTER_TELEPORT_PASSENGER_LEGEND,
          hint: MONSTER_TELEPORT_PASSENGER_HINT,
        },
        optionalDisclosure: {
          intent: 'add',
          actionSubject: 'passenger',
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
        optionalDisclosure: { intent: 'add' },
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
      monsterFormAdvisoryDisplay(input.advisories ?? [], input.namePrefix),
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
          intent: 'add',
          actionSubject: 'follow-up attack',
        },
      },
    ]
  }
  if (input.action.kind === 'action-reference') {
    return [
      monsterFormAdvisoryDisplay(input.advisories ?? [], input.namePrefix),
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
        optionalDisclosure: {
          intent: 'add',
          actionSubject: 'rules',
        },
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
    monsterFormAdvisoryDisplay(input.advisories ?? [], input.namePrefix),
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
    monsterFormAdvisoryDisplay(input.advisories ?? [], namePrefix),
    ...primaryProse,
    ...monsterActionMechanicFields({
      ctx,
      action,
      section,
      namePrefix,
      sharedCastingOptions: input.sharedCastingOptions,
      attackOptions: input.attackOptions ?? [],
      actionRows: input.actionRows,
      bonusActionRows: input.bonusActionRows,
      equipment: input.equipment ?? [],
      weapons: input.weapons,
      weaponActions: input.weaponActions,
      allowAddWeapon: input.allowAddWeapon,
      onAcquireAttack: input.onAcquireAttack,
      onCastingSourceBlocked: input.onCastingSourceBlocked,
    }),
    ...(monsterActionActiveKeys(action.kind, section).includes('onceUntilNextTurn')
      ? [turnLimitField()]
      : []),
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
  actionRows?: MonsterActionDraftRow[]
  bonusActionRows?: MonsterActionDraftRow[]
  weapons?: readonly { entryId: string; label: string; equipped: boolean }[]
  weaponActions?: readonly { id: string; equipmentEntryId?: string }[]
  allowAddWeapon?: boolean
  onAcquireAttack?: (
    section: MonsterActionSection,
    choice: Exclude<MonsterActionAcquisitionChoice, { type: 'add-weapon' }>,
  ) => void
  referenceOptions?: { value: string; label: string }[]
  sourceSpellOptions?: { value: string; label: string }[]
  onCastingSourceBlocked?: (message: string) => void
  advisories?: readonly MonsterFormAdvisory[]
}

export function resolveMonsterActionSectionFields(
  input: MonsterActionDetailFieldsInput,
): FormItem[] {
  const fields =
    reactionAuthoringFields(input) ??
    legendaryAuthoringFields(input) ??
    bonusAuthoringFields(input) ??
    sharedAuthoringFields(input)
  if (!monsterActionActiveKeys(input.action.kind, input.section).includes('onlyInFormIds')) {
    return fields
  }
  return insertMonsterFormAvailabilityField(fields)
}
