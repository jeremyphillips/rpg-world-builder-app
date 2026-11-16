import type { ResolutionOutcomeResult } from '@rpg/contracts'
import type { ArrayAddMenuConfig, ArrayConfig } from '@rpg/ui/form'

import { resolutionOutcomeEffectsArray } from '../../../../lib/effects/resolution-outcome-effects-array'
import { EFFECT_NOTE_LABEL } from '../../../../lib/effects/effect-authoring-copy'
import { createResolutionEffectAppendDefaults } from '../effects/resolution-effect-add-menu.lib'
import type { ResolutionEffectKind } from '../effects/resolution-effect-add-menu.lib'
import { resolutionFormToSelectionContext } from '../selection/resolution-selection-context.lib'
import { RESOLUTION_SECTION_LABELS } from './resolution-form-labels'
import type {
  ResolutionEffectFormItem,
  ResolutionFormValues,
  ResolutionOutcomeFormItem,
} from './resolution-form-schema'
import { RESOLUTION_FIELD_NAME } from './resolution-form-values'
import { buildOutcomeApplicationRowPresentation } from './resolution-outcome-application-row.lib'
import {
  createOutcomeApplicationAppendValue,
  outcomeApplicationAmountField,
  outcomeApplicationAmountOptions,
  outcomeApplicationsFieldPath,
} from './resolution-outcome-applications-form-fields'
import { resolveOutcomeApplicationAddState } from './resolution-outcome-effect-availability.lib'

const LIBRARY_PATH = `${RESOLUTION_FIELD_NAME}.effects`
const MENU_LIBRARY = '../../../effects'
const MENU_RESULT = '../result'
const MENU_METHOD = '../../../methodKind'
const MENU_SELECTION = '../../../selectionMode'
const MENU_ATTACK = '../../../attackType'
const MENU_SAVE = '../../../saveAbility'
const MENU_PATTERN = '../../../applicationPatternKind'
const MENU_ORIGIN = '../../../originDistanceFt'
const MENU_PROJECTILE_COUNT = '../../../projectileCount'
const MENU_PROJECTILE_SINGULAR = '../../../projectileUnitLabelSingular'
const MENU_PROJECTILE_PLURAL = '../../../projectileUnitLabelPlural'
const MENU_AREA_SHAPE = '../../../areaOfEffect.shape'
const MENU_TARGET = '../../../target'
const AMOUNT_LIBRARY = '../../../../effects'

const CREATE_KINDS = [
  { id: 'create:damage', kind: 'damage', label: 'Damage' },
  { id: 'create:healing', kind: 'healing', label: 'Healing' },
  {
    id: 'create:temporary-hit-points',
    kind: 'temporary-hit-points',
    label: 'Temporary hit points',
  },
] as const satisfies readonly { id: string; kind: ResolutionEffectKind; label: string }[]

function resolutionFromMenuWatch(watched: Record<string, unknown>): ResolutionFormValues {
  const areaShape = watched[MENU_AREA_SHAPE]
  return {
    effects: (watched[MENU_LIBRARY] ?? []) as ResolutionFormValues['effects'],
    methodKind: watched[MENU_METHOD],
    selectionMode: watched[MENU_SELECTION],
    attackType: watched[MENU_ATTACK],
    saveAbility: watched[MENU_SAVE],
    applicationPatternKind: watched[MENU_PATTERN],
    originDistanceFt: watched[MENU_ORIGIN],
    projectileCount: watched[MENU_PROJECTILE_COUNT],
    projectileUnitLabelSingular: watched[MENU_PROJECTILE_SINGULAR],
    projectileUnitLabelPlural: watched[MENU_PROJECTILE_PLURAL],
    areaOfEffect: typeof areaShape === 'string' ? { shape: areaShape } : undefined,
    target: watched[MENU_TARGET],
  } as ResolutionFormValues
}

function spellOutcomeAddMenu(): ArrayAddMenuConfig {
  return {
    groups: [
      { id: 'create', label: 'Add' },
      { id: 'available', label: RESOLUTION_SECTION_LABELS.outcomeAvailableGroup },
      { id: 'unavailable', label: RESOLUTION_SECTION_LABELS.outcomeUnavailableGroup },
    ],
    enableSearch: false,
    contextDependsOn: [
      MENU_RESULT,
      MENU_LIBRARY,
      MENU_METHOD,
      MENU_SELECTION,
      MENU_ATTACK,
      MENU_SAVE,
      MENU_PATTERN,
      MENU_ORIGIN,
      MENU_PROJECTILE_COUNT,
      MENU_PROJECTILE_SINGULAR,
      MENU_PROJECTILE_PLURAL,
      MENU_AREA_SHAPE,
      MENU_TARGET,
    ],
    items: [],
    resolveItems: (watched, rows) => {
      const resolution = resolutionFromMenuWatch(watched)
      const effects = resolution.effects ?? []
      const result = (watched[MENU_RESULT] ?? 'hit') as ResolutionOutcomeResult
      const selectionContext = resolutionFormToSelectionContext(resolution)
      const availability = resolveOutcomeApplicationAddState(
        effects,
        { effects: rows as ResolutionOutcomeFormItem['effects'] },
        result,
        selectionContext,
      )

      const createItems = [
        ...CREATE_KINDS.map((item) => ({
          id: item.id,
          label: item.label,
          groupId: 'create',
          select: (ctx: {
            getValues: (path: string) => unknown
            append: (path: string, row: Record<string, unknown>) => void
          }) => {
            const definition = createResolutionEffectAppendDefaults(item.kind)
            const library = ctx.getValues(LIBRARY_PATH)
            const nextLibrary = [
              ...(Array.isArray(library) ? library : []),
              definition,
            ] as ResolutionEffectFormItem[]
            ctx.append(LIBRARY_PATH, definition)
            return createOutcomeApplicationAppendValue(String(definition.id), result, nextLibrary)
          },
        })),
        {
          id: 'note',
          label: EFFECT_NOTE_LABEL,
          groupId: 'create',
          appendDefaults: { kind: 'note', description: 'Note' },
        },
      ]

      const eligible =
        availability.kind === 'ready'
          ? availability.eligible.map((item) => ({
              id: item.id,
              label: item.label,
              groupId: 'available',
              select: (ctx: { getValues: (path: string) => unknown }) => {
                const library = ctx.getValues(LIBRARY_PATH)
                return createOutcomeApplicationAppendValue(
                  item.id,
                  result,
                  (Array.isArray(library) ? library : []) as ResolutionEffectFormItem[],
                )
              },
            }))
          : []

      const unavailable =
        availability.kind === 'ready' || availability.kind === 'all-incomplete'
          ? availability.unavailable.map((item) => ({
              id: item.id,
              label: item.label,
              description: item.metadata,
              groupId: 'unavailable',
              disabled: true,
            }))
          : []

      return [...createItems, ...eligible, ...unavailable]
    },
  }
}

function referencePresentation(
  values: Record<string, unknown>,
  index: number,
  watched: Record<string, unknown> | undefined,
) {
  const effects = (watched?.[LIBRARY_PATH] ?? []) as ResolutionEffectFormItem[]
  return buildOutcomeApplicationRowPresentation(
    effects,
    { effectId: typeof values.effectId === 'string' ? values.effectId : undefined },
    index,
  )
}

/** Library-first outcome list: references and notes on the shared array engine. */
export function spellOutcomeEffectsArray(outcomeIndex: number): ArrayConfig {
  return resolutionOutcomeEffectsArray({
    name: 'effects',
    listPath: outcomeApplicationsFieldPath(outcomeIndex),
    libraryPath: LIBRARY_PATH,
    inlineKinds: ['note'],
    references: {
      role: 'library',
      headingLabel: RESOLUTION_SECTION_LABELS.appliedEffects,
      addActionLabel: RESOLUTION_SECTION_LABELS.addAppliedEffect,
      menu: spellOutcomeAddMenu(),
      amountField: {
        ...outcomeApplicationAmountField,
        interactivity: {
          dependsOn: ['effectId', AMOUNT_LIBRARY],
          disabledWhen: (values) => {
            const effects = (values[AMOUNT_LIBRARY] ?? []) as ResolutionEffectFormItem[]
            const presentation = buildOutcomeApplicationRowPresentation(
              effects,
              { effectId: typeof values.effectId === 'string' ? values.effectId : '' },
              0,
            )
            return !presentation.amountEnabled
          },
        },
      },
      filterSelect: {
        dependsOn: [LIBRARY_PATH],
        filter: outcomeApplicationAmountOptions,
      },
      primaryDependsOn: [LIBRARY_PATH],
      summaryDependsOn: [LIBRARY_PATH],
      primary: (values, index, watched) => {
        if (values.kind === 'note') return EFFECT_NOTE_LABEL
        if (values.kind !== 'effect-reference') return undefined
        return referencePresentation(values, index, watched).rowAriaLabel
      },
      summary: (values, index, watched) => {
        if (values.kind !== 'effect-reference') return ''
        return referencePresentation(values, index, watched).statusDescription ?? ''
      },
    },
  })
}
