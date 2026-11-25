import { createSpellCatalogContext, type SpellCatalogContext } from '@rpg/contracts'
import type { DependentChrome, FieldConfig, FieldVisibility, FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import type { MonsterActionSection } from '../references/monster-action-equipment-references'
import type { MonsterActionDraftRow } from '../monster-action-presets'
import {
  multiattackExecutableUseOptionsFromWatched,
  multiattackReplacementChoiceOptionsFromWatched,
  multiattackRowsWithFallback,
  multiattackSpellOptionsForAction,
} from './monster-multiattack-form-options'
import {
  MONSTER_MULTIATTACK_CHOICE_ACTION_LABEL,
  MONSTER_MULTIATTACK_CLEAR_SPELL_LABEL,
  MONSTER_MULTIATTACK_PIN_SPELL_LABEL,
  MONSTER_MULTIATTACK_NO_SPELLS_IN_SPELLCASTING,
  MONSTER_MULTIATTACK_SPELL_HINT,
  MONSTER_MULTIATTACK_SPELL_LABEL,
  MONSTER_MULTIATTACK_SPELL_PLACEHOLDER,
} from '../../monster-form-labels'

function spellSource(
  actionId: string,
  actionRows: readonly MonsterActionDraftRow[],
): Extract<MonsterActionDraftRow, { kind: 'spell' }> | undefined {
  const row = actionRows.find((entry) => entry.id === actionId)
  return row?.kind === 'spell' ? row : undefined
}

export function multiattackSpellActionOnlyVisibility(input: {
  sectionRowsDependsOn: string
  fallbackActionRows?: readonly MonsterActionDraftRow[]
}): FieldVisibility {
  return {
    dependsOn: ['actionId', input.sectionRowsDependsOn],
    visibleWhen: (watched) => {
      const actionId = typeof watched.actionId === 'string' ? watched.actionId.trim() : ''
      if (!actionId) return false
      const rows = multiattackRowsFromSpellWatch(watched, input)
      return spellSource(actionId, rows) != null
    },
  }
}

function spellPickerField(input: {
  sectionRowsDependsOn: string
  fallbackActionRows?: readonly MonsterActionDraftRow[]
  spellCatalog?: SpellCatalogContext
  /** Parent `kind: 'dependent'` owns spell-on-action visibility when true. */
  dependentsGated?: boolean
  visibility?: FieldVisibility
}): FormItem {
  const spellCatalog = input.spellCatalog ?? createSpellCatalogContext({ status: 'pending' })
  const spellContext = {
    sectionRowsDependsOn: input.sectionRowsDependsOn,
    fallbackActionRows: input.fallbackActionRows,
  }
  const spellVisibility = multiattackSpellActionOnlyVisibility(spellContext)
  return {
    type: 'select',
    name: 'spellId',
    label: MONSTER_MULTIATTACK_SPELL_LABEL,
    placeholder: MONSTER_MULTIATTACK_SPELL_PLACEHOLDER,
    controlSizeOverride: 'xs',
    optionalDisclosure: {
      intent: 'add',
      addLabel: MONSTER_MULTIATTACK_PIN_SPELL_LABEL,
      removeLabel: MONSTER_MULTIATTACK_CLEAR_SPELL_LABEL,
      expandWhenPopulated: true,
      actionSubject: 'specific spell',
    },
    ...(!input.dependentsGated && {
      visibility: input.visibility ? { ...spellVisibility, ...input.visibility } : spellVisibility,
    }),
    ...(input.dependentsGated &&
      input.visibility && {
        visibility: input.visibility,
      }),
    optionsResolve: {
      dependsOn: ['actionId', input.sectionRowsDependsOn],
      optionsWhen: (watched) => {
        const rows = multiattackRowsFromSpellWatch(watched, spellContext)
        return multiattackSpellOptionsForAction(
          typeof watched.actionId === 'string' ? watched.actionId : '',
          rows,
          spellCatalog,
        )
      },
    },
    interactivity: {
      dependsOn: ['actionId', input.sectionRowsDependsOn],
      disabledWhen: (watched) => {
        const rows = multiattackRowsFromSpellWatch(watched, spellContext)
        const source = spellSource(
          typeof watched.actionId === 'string' ? watched.actionId : '',
          rows,
        )
        if (!source) return false
        return !(source.spells ?? []).some((spell) => Boolean(spell.spellId))
      },
    },
    hint: {
      resolve: {
        dependsOn: ['actionId', input.sectionRowsDependsOn],
        hintWhen: (watched) => {
          const rows = multiattackRowsFromSpellWatch(watched, spellContext)
          const source = spellSource(
            typeof watched.actionId === 'string' ? watched.actionId : '',
            rows,
          )
          if (!source) return undefined
          const hasSpells = (source.spells ?? []).some((spell) => Boolean(spell.spellId))
          if (!hasSpells) return MONSTER_MULTIATTACK_NO_SPELLS_IN_SPELLCASTING
          return MONSTER_MULTIATTACK_SPELL_HINT
        },
      },
    },
  }
}

function multiattackRowsFromSpellWatch(
  watched: Record<string, unknown>,
  input: { sectionRowsDependsOn: string; fallbackActionRows?: readonly MonsterActionDraftRow[] },
): MonsterActionDraftRow[] {
  const live = multiattackRowsWithFallback(
    watched,
    input.sectionRowsDependsOn,
    input.fallbackActionRows,
  )
  const actionId = typeof watched.actionId === 'string' ? watched.actionId : ''
  if (actionId && !live.some((row) => row.id === actionId)) {
    return [...(input.fallbackActionRows ?? [])]
  }
  return live
}

type MultiattackActionSpellSpellContext = {
  sectionRowsDependsOn: string
  fallbackActionRows?: readonly MonsterActionDraftRow[]
  spellCatalog?: SpellCatalogContext
}

/** Action controller + spell dependents with shared spell-on-action visibility. */
export function monsterMultiattackActionSpellDependent(
  input: {
    actionField: FieldConfig
    chrome: DependentChrome
    visibility?: FieldVisibility
  } & MultiattackActionSpellSpellContext,
): FormItem {
  const spellContext = {
    sectionRowsDependsOn: input.sectionRowsDependsOn,
    fallbackActionRows: input.fallbackActionRows,
  }
  return {
    kind: 'dependent',
    ...(input.visibility ? { visibility: input.visibility } : {}),
    controller: input.actionField,
    dependents: {
      chrome: input.chrome,
      visibility: multiattackSpellActionOnlyVisibility(spellContext),
      fields: [
        spellPickerField({
          ...spellContext,
          spellCatalog: input.spellCatalog,
          dependentsGated: true,
        }),
      ],
    },
  }
}

function buildMultiattackChoiceActionField(input: {
  section: MonsterActionSection
  sectionRowsDependsOn: string
  actionRows: readonly MonsterActionDraftRow[]
  actionPicker:
    | {
        mode: 'use'
        multiattackId: string
        ctx: ContentFormCtx
      }
    | {
        mode: 'replacement'
        multiattackId: string
        ctx: ContentFormCtx
      }
}): FieldConfig {
  if (input.actionPicker.mode === 'replacement') {
    return {
      type: 'select',
      name: 'actionId',
      label: MONSTER_MULTIATTACK_CHOICE_ACTION_LABEL,
      placeholder: 'Choose',
      options: [],
      optionsResolve: {
        dependsOn: [
          'actionId',
          'spellId',
          '../../replacesActionId',
          '../../../steps',
          '../../choices',
          input.sectionRowsDependsOn,
        ],
        optionsWhen: (watched) =>
          multiattackReplacementChoiceOptionsFromWatched({
            rows: input.actionRows,
            section: input.section,
            sectionRowsDependsOn: input.sectionRowsDependsOn,
            multiattackId: input.actionPicker.multiattackId,
            ctx: input.actionPicker.ctx,
            watched,
          }),
      },
    }
  }
  return {
    type: 'select',
    name: 'actionId',
    label: MONSTER_MULTIATTACK_CHOICE_ACTION_LABEL,
    placeholder: 'Choose',
    options: [],
    optionsResolve: {
      dependsOn: ['actionId', input.sectionRowsDependsOn],
      optionsWhen: (watched) =>
        multiattackExecutableUseOptionsFromWatched({
          section: input.section,
          multiattackId: input.actionPicker.multiattackId,
          ctx: input.actionPicker.ctx,
          watched,
          sectionRowsDependsOn: input.sectionRowsDependsOn,
          fallbackRows: input.actionRows,
        }),
    },
  }
}

/** Shared action + optional spell row for replacement choices and use-choice rows. */
export function monsterMultiattackChoiceRowFields(input: {
  section: MonsterActionSection
  sectionRowsDependsOn: string
  actionRows: readonly MonsterActionDraftRow[]
  actionPicker:
    | {
        mode: 'use'
        multiattackId: string
        ctx: ContentFormCtx
      }
    | {
        mode: 'replacement'
        multiattackId: string
        ctx: ContentFormCtx
      }
}): FormItem[] {
  return [
    monsterMultiattackActionSpellDependent({
      actionField: buildMultiattackChoiceActionField(input),
      sectionRowsDependsOn: input.sectionRowsDependsOn,
      fallbackActionRows: input.actionRows,
      spellCatalog: createSpellCatalogContext({
        status: input.actionPicker.ctx.spellCatalogStatus ?? 'pending',
        spellsById: input.actionPicker.ctx.spellCatalogById,
      }),
      chrome: 'none',
    }),
  ]
}

export function monsterMultiattackUseStepActionSpellDependent(input: {
  section: MonsterActionSection
  multiattackId: string
  ctx: ContentFormCtx
  sectionRowsDependsOn: string
  actionRows: readonly MonsterActionDraftRow[]
}): FormItem {
  return monsterMultiattackActionSpellDependent({
    actionField: {
      type: 'select',
      name: 'actionId',
      label: MONSTER_MULTIATTACK_CHOICE_ACTION_LABEL,
      placeholder: 'Choose',
      options: [],
      optionsResolve: {
        dependsOn: ['actionId', input.sectionRowsDependsOn],
        optionsWhen: (watched) =>
          multiattackExecutableUseOptionsFromWatched({
            section: input.section,
            multiattackId: input.multiattackId,
            ctx: input.ctx,
            watched,
            sectionRowsDependsOn: input.sectionRowsDependsOn,
            fallbackRows: input.actionRows,
          }),
      },
    },
    sectionRowsDependsOn: input.sectionRowsDependsOn,
    fallbackActionRows: input.actionRows,
    spellCatalog: createSpellCatalogContext({
      status: input.ctx.spellCatalogStatus ?? 'pending',
      spellsById: input.ctx.spellCatalogById,
    }),
    chrome: 'rail',
  })
}
