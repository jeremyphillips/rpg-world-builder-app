import { isMultiattackUseClause } from '@rpg/contracts'
import type { FieldVisibility, FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import type { MonsterActionSection } from '../references/monster-action-equipment-references'
import type { MonsterActionDraftRow } from '../monster-action-presets'
import type { MonsterActionAcquisitionChoice } from '../acquisition/monster-action-acquisition'
import {
  MONSTER_MULTIATTACK_ADD_ACTION_CHOICE_LABEL,
  MONSTER_MULTIATTACK_ADD_ALTERNATIVE_LABEL,
  MONSTER_MULTIATTACK_ADD_CHOICE_LABEL,
  MONSTER_MULTIATTACK_ADD_REPLACEMENT_LABEL,
  MONSTER_MULTIATTACK_ADD_TARGET_ATTACK_LABEL,
  MONSTER_MULTIATTACK_ADD_TO_SEQUENCE_LABEL,
  MONSTER_MULTIATTACK_ALTERNATIVE_HINT,
  MONSTER_MULTIATTACK_ALTERNATIVE_LABEL,
  MONSTER_MULTIATTACK_ANY_ATTACK_HINT,
  MONSTER_MULTIATTACK_ANY_ATTACK_LABEL,
  MONSTER_MULTIATTACK_ATTACKS_HINT,
  MONSTER_MULTIATTACK_ATTACKS_PICKER_LABEL,
  MONSTER_MULTIATTACK_ATTACKS_REPLACED_HINT,
  MONSTER_MULTIATTACK_ATTACKS_REPLACED_LABEL,
  MONSTER_MULTIATTACK_ATTACK_GROUP_LABEL,
  MONSTER_MULTIATTACK_CHOICES_HINT,
  MONSTER_MULTIATTACK_CHOICES_LABEL,
  MONSTER_MULTIATTACK_COUNT_LABEL,
  MONSTER_MULTIATTACK_NO_PREREQUISITE,
  MONSTER_MULTIATTACK_ONLY_AFTER_USING_LABEL,
  MONSTER_MULTIATTACK_OPTIONAL_HINT,
  MONSTER_MULTIATTACK_OPTIONAL_LABEL,
  MONSTER_MULTIATTACK_REMOVE_ALTERNATIVE_LABEL,
  MONSTER_MULTIATTACK_REPLACEMENT_HINT,
  MONSTER_MULTIATTACK_REPLACEMENT_LABEL,
  MONSTER_MULTIATTACK_REPLACES_ONE_ATTACK,
  MONSTER_MULTIATTACK_OTHER_ACTIONS_GROUP_LABEL,
  MONSTER_MULTIATTACK_STEP_CONJUNCTION,
  MONSTER_MULTIATTACK_TARGET_ATTACK_LABEL,
} from '../../monster-form-labels'
import {
  multiattackAnyAttackWordingVisible,
  multiattackShowsStaticReplacementCount,
  multiattackTargetAttackFieldVisible,
} from './monster-multiattack-replacement-visibility'
import { MonsterMultiattackEmptyAttacksSlot } from '../../../components/form/actions/multiattack/multiattack-empty-attacks.slot'
import { MonsterMultiattackPersistSlot } from '../../../components/form/actions/multiattack/multiattack-persist.slot'
import { MonsterMultiattackUseStepKindSlot } from '../../../components/form/actions/multiattack/multiattack-use-step-kind.slot'
import { MonsterMultiattackUseStepChoiceAcquisitionSlot } from '../../../components/form/actions/multiattack/multiattack-use-step-choice-acquisition.slot'
import { MonsterMultiattackUseStepActionTransitionSlot } from '../../../components/form/actions/multiattack/multiattack-use-step-action-transition.slot'
import { MonsterMultiattackUseStepRepetitionSlot } from '../../../components/form/actions/multiattack/multiattack-use-step-repetition.slot'
import { MonsterMultiattackUseChoiceRemoveControl } from '../../../components/form/actions/multiattack/multiattack-use-choice-remove-control'
import {
  MULTIATTACK_STEP_HEADER_DEPENDS_ON,
  multiattackStepHeaderPrimary,
  multiattackStepHeaderSummary,
} from './monster-multiattack-step-headers'
import {
  monsterMultiattackChoiceRowFields,
  monsterMultiattackUseStepActionSpellDependent,
} from './monster-multiattack-choice-row-fields'
import {
  multiattackAttackPickerDependsOn,
  multiattackExecutableAttackOptionsFromWatched,
  multiattackPrerequisiteOptionsFromWatched,
  multiattackPrimarySequenceHeading,
  multiattackReplacementChoiceRowSectionRowsDependsOn,
  multiattackRowScopeSectionRowsDependsOn,
  multiattackSequenceAddMenuItems,
  multiattackSequenceMenuContextDependsOn,
  multiattackSequenceRowsDependsOn,
  multiattackTargetAttackOptionsFromWatched,
  type MultiattackSequenceScope,
} from './monster-multiattack-form-options'

type MultiattackDraft = Extract<MonsterActionDraftRow, { kind: 'multiattack' }>

const stepShapeDependsOn = ['kind', 'actionId', 'mode', 'choices'] as const

const attackGroupVisible: FieldVisibility = {
  dependsOn: [...stepShapeDependsOn],
  visibleWhen: (values) => !isMultiattackUseClause(values),
}

const useClauseVisible: FieldVisibility = {
  dependsOn: [...stepShapeDependsOn],
  visibleWhen: (values) => isMultiattackUseClause(values),
}

const singleUseVisible: FieldVisibility = {
  dependsOn: ['kind', 'mode'],
  visibleWhen: (values) => values.kind === 'use' && values.mode !== 'choice',
}

const choiceUseVisible: FieldVisibility = {
  dependsOn: ['kind', 'mode'],
  visibleWhen: (values) => values.kind === 'use' && values.mode === 'choice',
}

function monsterMultiattackUseClauseFields(input: {
  section: MonsterActionSection
  action: MultiattackDraft
  ctx: ContentFormCtx
  actionRows: readonly MonsterActionDraftRow[]
  stepSectionRowsDependsOn: string
  useChoiceSectionRowsDependsOn: string
}): FormItem[] {
  return [
    {
      kind: 'slot',
      name: 'multiattackUseStepKind',
      visibility: useClauseVisible,
      render: ({ namePrefix }) => <MonsterMultiattackUseStepKindSlot namePrefix={namePrefix} />,
    },
    {
      kind: 'group',
      visibility: singleUseVisible,
      fields: [
        monsterMultiattackUseStepActionSpellDependent({
          section: input.section,
          multiattackId: input.action.id,
          ctx: input.ctx,
          sectionRowsDependsOn: input.stepSectionRowsDependsOn,
          actionRows: input.actionRows,
        }),
        {
          kind: 'slot',
          name: 'multiattackUseStepActionTransition',
          render: ({ namePrefix }) => (
            <MonsterMultiattackUseStepActionTransitionSlot
              namePrefix={namePrefix}
              fallbackActionRows={input.actionRows}
            />
          ),
        },
      ],
    },
    {
      kind: 'slot',
      name: 'multiattackUseStepChoiceAcquisition',
      visibility: singleUseVisible,
      render: ({ namePrefix }) => (
        <MonsterMultiattackUseStepChoiceAcquisitionSlot namePrefix={namePrefix} />
      ),
    },
    {
      kind: 'slot',
      name: 'multiattackUseStepRepetition',
      visibility: singleUseVisible,
      render: ({ namePrefix }) => (
        <MonsterMultiattackUseStepRepetitionSlot
          namePrefix={namePrefix}
          fallbackActionRows={input.actionRows}
        />
      ),
    },
    {
      type: 'checkbox',
      name: 'optional',
      label: MONSTER_MULTIATTACK_OPTIONAL_LABEL,
      hint: { text: MONSTER_MULTIATTACK_OPTIONAL_HINT },
      visibility: singleUseVisible,
    },
    {
      kind: 'array',
      name: 'choices',
      heading: { label: MONSTER_MULTIATTACK_CHOICES_LABEL },
      visibility: choiceUseVisible,
      addAction: { label: MONSTER_MULTIATTACK_ADD_ACTION_CHOICE_LABEL },
      item: {
        headerVisibility: 'hidden',
        header: { fallback: () => '' },
        removeSlot: {
          name: 'multiattackUseChoiceRemove',
          render: () => <MonsterMultiattackUseChoiceRemoveControl />,
        },
      },
      fields: monsterMultiattackChoiceRowFields({
        section: input.section,
        sectionRowsDependsOn: input.useChoiceSectionRowsDependsOn,
        actionRows: input.actionRows,
        actionPicker: { mode: 'use', multiattackId: input.action.id, ctx: input.ctx },
      }),
    },
  ]
}

function monsterMultiattackStepsArray(input: {
  section: MonsterActionSection
  action: MultiattackDraft
  ctx: ContentFormCtx
  actionRows: readonly MonsterActionDraftRow[]
  scope?: MultiattackSequenceScope
  headingHint?: string
}): FormItem {
  const scope = input.scope ?? 'primary'
  const stepSectionRowsDependsOn = multiattackSequenceRowsDependsOn(input.section, scope, 'step')
  const useChoiceSectionRowsDependsOn = multiattackSequenceRowsDependsOn(
    input.section,
    scope,
    'choice',
  )
  const config = {
    kind: 'array' as const,
    name: 'steps',
    itemConjunction: MONSTER_MULTIATTACK_STEP_CONJUNCTION,
    heading: {
      label: multiattackPrimarySequenceHeading(input.action),
      ...(input.headingHint ? { hint: { text: input.headingHint } } : {}),
    },
    addAction: {
      label: MONSTER_MULTIATTACK_ADD_TO_SEQUENCE_LABEL,
      menu: {
        groups: [
          { id: 'attack', label: '' },
          { id: 'other-actions', label: MONSTER_MULTIATTACK_OTHER_ACTIONS_GROUP_LABEL },
        ],
        enableSearch: false,
        items: [],
        contextDependsOn: multiattackSequenceMenuContextDependsOn(input.section, scope),
        resolveItems: (watched: Record<string, unknown>) =>
          multiattackSequenceAddMenuItems({
            section: input.section,
            scope,
            multiattackId: input.action.id,
            ctx: input.ctx,
            watched,
            fallbackRows: input.actionRows,
          }),
      },
    },
    item: {
      variant: 'compact',
      reorder: 'dragHandle',
      header: {
        fallback: () => MONSTER_MULTIATTACK_ATTACK_GROUP_LABEL,
        primary: (
          values: Record<string, unknown>,
          index: number,
          watched?: Record<string, unknown>,
        ) =>
          multiattackStepHeaderPrimary(values, index, watched, {
            section: input.section,
            fallbackRows: input.actionRows,
            ctx: input.ctx,
          }),
        summary: (
          values: Record<string, unknown>,
          index: number,
          watched?: Record<string, unknown>,
        ) =>
          multiattackStepHeaderSummary(values, index, watched, {
            section: input.section,
            fallbackRows: input.actionRows,
            ctx: input.ctx,
          }),
        primaryDependsOn: [...MULTIATTACK_STEP_HEADER_DEPENDS_ON],
        summaryDependsOn: [...MULTIATTACK_STEP_HEADER_DEPENDS_ON],
      },
    },
    fields: [
      {
        kind: 'row',
        visibility: attackGroupVisible,
        fields: [
          {
            type: 'number',
            name: 'count',
            label: MONSTER_MULTIATTACK_COUNT_LABEL,
            min: 1,
            step: 1,
            control: 'stepper',
            width: 'auto',
          },
          {
            type: 'chips',
            name: 'actionIds',
            label: MONSTER_MULTIATTACK_ATTACKS_PICKER_LABEL,
            width: 'full',
            options: [],
            optionsResolve: {
              dependsOn: [...multiattackAttackPickerDependsOn(input.section, scope)],
              optionsWhen: (watched: Record<string, unknown>) =>
                multiattackExecutableAttackOptionsFromWatched({
                  section: input.section,
                  multiattackId: input.action.id,
                  ctx: input.ctx,
                  watched,
                  fallbackRows: input.actionRows,
                  scope,
                }),
            },
          },
        ],
      },
      ...monsterMultiattackUseClauseFields({
        section: input.section,
        action: input.action,
        ctx: input.ctx,
        actionRows: input.actionRows,
        stepSectionRowsDependsOn,
        useChoiceSectionRowsDependsOn,
      }),
    ],
  }
  return config as unknown as FormItem
}

function monsterMultiattackReplacementGroup(input: {
  section: MonsterActionSection
  action: MultiattackDraft
  ctx: ContentFormCtx
  actionRows: readonly MonsterActionDraftRow[]
  canConfigureReplacement: boolean
  replacementCountMax?: number
}): FormItem {
  const rowSectionRowsDependsOn = multiattackRowScopeSectionRowsDependsOn(input.section)
  const hasAlternative = input.action.alternative !== undefined
  const staticReplacementCountDeps: string[] = [
    'replacement.count',
    'replacement.replacesActionId',
    'steps',
  ]
  const replacementCountStepperDeps = [...staticReplacementCountDeps]
  return {
    kind: 'group',
    name: 'replacement',
    heading: {
      label: MONSTER_MULTIATTACK_REPLACEMENT_LABEL,
      hint: { text: MONSTER_MULTIATTACK_REPLACEMENT_HINT },
    },
    optionalDisclosure: {
      intent: 'add',
      addLabel: MONSTER_MULTIATTACK_ADD_REPLACEMENT_LABEL,
      seedWhen: () => ({ count: 1, choices: [] }),
      addDisabled: hasAlternative || !input.canConfigureReplacement,
    },
    fields: [
      {
        kind: 'display',
        id: 'replacementCountStatic',
        visibility: {
          dependsOn: staticReplacementCountDeps,
          visibleWhen: (values) => multiattackShowsStaticReplacementCount(values),
        },
        content: {
          variant: 'text',
          text: MONSTER_MULTIATTACK_REPLACES_ONE_ATTACK,
          role: 'supporting',
        },
      },
      {
        type: 'number',
        name: 'replacement.count',
        label: MONSTER_MULTIATTACK_ATTACKS_REPLACED_LABEL,
        hint: { text: MONSTER_MULTIATTACK_ATTACKS_REPLACED_HINT },
        labelPosition: 'settings',
        min: 1,
        max: input.replacementCountMax,
        step: 1,
        control: 'stepper',
        visibility: {
          dependsOn: replacementCountStepperDeps,
          visibleWhen: (values) => !multiattackShowsStaticReplacementCount(values),
        },
      },
      {
        type: 'select',
        name: 'replacement.replacesActionId',
        label: MONSTER_MULTIATTACK_TARGET_ATTACK_LABEL,
        placeholder: 'Choose',
        options: [],
        optionsResolve: {
          dependsOn: ['../../steps', '../../replacement', rowSectionRowsDependsOn],
          optionsWhen: (watched) =>
            multiattackTargetAttackOptionsFromWatched({
              section: input.section,
              ctx: input.ctx,
              watched,
            }),
        },
        optionalDisclosure: {
          intent: 'add',
          addLabel: MONSTER_MULTIATTACK_ADD_TARGET_ATTACK_LABEL,
          actionSubject: 'target attack',
        },
        visibility: {
          dependsOn: [
            'replacement.attackWord',
            'replacement.replacesActionId',
            'replacement.count',
            'steps',
          ],
          visibleWhen: (values) => multiattackTargetAttackFieldVisible(values),
        },
      },
      {
        type: 'switch',
        name: 'replacement.attackWord',
        label: MONSTER_MULTIATTACK_ANY_ATTACK_LABEL,
        hint: { text: MONSTER_MULTIATTACK_ANY_ATTACK_HINT },
        optionalDisclosure: { intent: 'add', actionSubject: 'repeated replacements' },
        visibility: {
          dependsOn: [
            'replacement.attackWord',
            'replacement.replacesActionId',
            'replacement.count',
            'steps',
          ],
          visibleWhen: (values) => multiattackAnyAttackWordingVisible(values),
        },
      },
      {
        kind: 'array',
        name: 'replacement.choices',
        heading: {
          label: MONSTER_MULTIATTACK_CHOICES_LABEL,
          hint: { text: MONSTER_MULTIATTACK_CHOICES_HINT },
        },
        addAction: { label: MONSTER_MULTIATTACK_ADD_CHOICE_LABEL },
        item: { headerVisibility: 'hidden', header: { fallback: () => '' } },
        fields: monsterMultiattackChoiceRowFields({
          section: input.section,
          sectionRowsDependsOn: multiattackReplacementChoiceRowSectionRowsDependsOn(input.section),
          actionRows: input.actionRows,
          actionPicker: { mode: 'replacement', multiattackId: input.action.id, ctx: input.ctx },
        }),
      },
    ],
  }
}

function monsterMultiattackAlternativeGroup(input: {
  section: MonsterActionSection
  action: MultiattackDraft
  ctx: ContentFormCtx
  actionRows: readonly MonsterActionDraftRow[]
}): FormItem {
  const hasReplacement = input.action.replacement !== undefined
  const group = {
    kind: 'group' as const,
    name: 'alternative',
    heading: {
      label: MONSTER_MULTIATTACK_ALTERNATIVE_LABEL,
      hint: { text: MONSTER_MULTIATTACK_ALTERNATIVE_HINT },
    },
    optionalDisclosure: {
      intent: 'add',
      addLabel: MONSTER_MULTIATTACK_ADD_ALTERNATIVE_LABEL,
      removeLabel: MONSTER_MULTIATTACK_REMOVE_ALTERNATIVE_LABEL,
      seedWhen: () => ({ steps: [] }),
      addDisabled: hasReplacement,
    },
    fields: [
      {
        type: 'select',
        name: 'alternative.afterUsingActionId',
        label: MONSTER_MULTIATTACK_ONLY_AFTER_USING_LABEL,
        placeholder: MONSTER_MULTIATTACK_NO_PREREQUISITE,
        options: [],
        optionsResolve: {
          dependsOn: [
            multiattackRowScopeSectionRowsDependsOn(input.section),
            '../../../bonusActions',
          ],
          optionsWhen: (watched: Record<string, unknown>) =>
            multiattackPrerequisiteOptionsFromWatched({
              section: input.section,
              multiattackId: input.action.id,
              ctx: input.ctx,
              watched,
            }),
        },
        optionalDisclosure: { intent: 'add', actionSubject: 'prerequisite' },
      },
      {
        ...monsterMultiattackStepsArray({
          section: input.section,
          action: input.action,
          ctx: input.ctx,
          actionRows: input.actionRows,
          scope: 'alternative',
        }),
        name: 'alternative.steps',
        heading: {
          label: multiattackPrimarySequenceHeading(input.action),
          labelVisibility: 'srOnly',
        },
      },
    ],
  }
  return group as unknown as FormItem
}

export function monsterMultiattackFormFields(input: {
  namePrefix: string
  section: MonsterActionSection
  action: MultiattackDraft
  ctx: ContentFormCtx
  attackOptions: { value: string; label: string }[]
  useOptions: { value: string; label: string }[]
  prerequisiteOptions: { value: string; label: string }[]
  targetAttackOptions: { value: string; label: string }[]
  actionRows: readonly MonsterActionDraftRow[]
  hasAttackOptions: boolean
  canConfigureReplacement: boolean
  replacementCountMax?: number
  weapons: readonly { entryId: string; label: string; equipped: boolean }[]
  weaponActions: readonly { id: string; equipmentEntryId?: string }[]
  allowAddWeapon: boolean
  onAcquireAttack?: (
    section: MonsterActionSection,
    choice: Exclude<MonsterActionAcquisitionChoice, { type: 'add-weapon' }>,
  ) => void
}): FormItem[] {
  const acquireAttack =
    input.onAcquireAttack ??
    ((
      _section: MonsterActionSection,
      _choice: Exclude<MonsterActionAcquisitionChoice, { type: 'add-weapon' }>,
    ) => {
      return undefined
    })
  const persist: FormItem = {
    kind: 'slot',
    name: 'multiattackPersist',
    render: () => <MonsterMultiattackPersistSlot namePrefix={input.namePrefix} />,
  }

  if (!input.hasAttackOptions) {
    return [
      persist,
      {
        kind: 'slot',
        name: 'multiattackEmptyAttacks',
        render: () => (
          <MonsterMultiattackEmptyAttacksSlot
            section={input.section}
            ctx={input.ctx}
            weapons={input.weapons}
            weaponActions={input.weaponActions}
            allowAddWeapon={input.allowAddWeapon}
            onSelect={acquireAttack}
          />
        ),
      },
    ]
  }

  return [
    persist,
    monsterMultiattackStepsArray({
      section: input.section,
      action: input.action,
      ctx: input.ctx,
      actionRows: input.actionRows,
      headingHint: MONSTER_MULTIATTACK_ATTACKS_HINT,
    }),
    monsterMultiattackAlternativeGroup({
      section: input.section,
      action: input.action,
      ctx: input.ctx,
      actionRows: input.actionRows,
    }),
    monsterMultiattackReplacementGroup({
      section: input.section,
      action: input.action,
      ctx: input.ctx,
      actionRows: input.actionRows,
      canConfigureReplacement: input.canConfigureReplacement,
      replacementCountMax: input.replacementCountMax,
    }),
  ]
}

// Re-export legacy name used in a few imports while migrating call sites.
export function monsterMultiattackAttackFields(
  input: Parameters<typeof monsterMultiattackFormFields>[0],
): FormItem[] {
  return monsterMultiattackFormFields(input)
}
