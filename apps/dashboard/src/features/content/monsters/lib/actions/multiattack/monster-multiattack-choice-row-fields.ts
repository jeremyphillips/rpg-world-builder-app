import type { Spell } from '@rpg/contracts'
import type { FieldVisibility, FormItem } from '@rpg/ui/form'

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

function spellPickerField(input: {
  sectionRowsDependsOn: string
  fallbackActionRows?: readonly MonsterActionDraftRow[]
  spellCatalogById?: ReadonlyMap<string, Spell>
  visibility?: FieldVisibility
}): FormItem {
  return {
    type: 'select',
    name: 'spellId',
    label: MONSTER_MULTIATTACK_SPELL_LABEL,
    placeholder: MONSTER_MULTIATTACK_SPELL_PLACEHOLDER,
    optionalDisclosure: {
      intent: 'add',
      addLabel: MONSTER_MULTIATTACK_PIN_SPELL_LABEL,
      removeLabel: MONSTER_MULTIATTACK_CLEAR_SPELL_LABEL,
      expandWhenPopulated: true,
      actionSubject: 'specific spell',
    },
    visibility: input.visibility ?? {
      dependsOn: ['actionId', input.sectionRowsDependsOn],
      visibleWhen: (watched) => {
        const rows = multiattackRowsFromSpellWatch(watched, input)
        return (
          spellSource(typeof watched.actionId === 'string' ? watched.actionId : '', rows) != null
        )
      },
    },
    optionsResolve: {
      dependsOn: ['actionId', input.sectionRowsDependsOn],
      optionsWhen: (watched) => {
        const rows = multiattackRowsFromSpellWatch(watched, input)
        return multiattackSpellOptionsForAction(
          typeof watched.actionId === 'string' ? watched.actionId : '',
          rows,
          input.spellCatalogById,
        )
      },
    },
    interactivity: {
      dependsOn: ['actionId', input.sectionRowsDependsOn],
      disabledWhen: (watched) => {
        const rows = multiattackRowsFromSpellWatch(watched, input)
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
          const rows = multiattackRowsFromSpellWatch(watched, input)
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

/** Shared action + optional spell row for replacement choices and use-choice rows. */
export function monsterMultiattackChoiceRowFields(input: {
  section: MonsterActionSection
  sectionRowsDependsOn: string
  actionRows: readonly MonsterActionDraftRow[]
  spellCatalogById?: ReadonlyMap<string, Spell>
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
  const actionField: FormItem =
    input.actionPicker.mode === 'replacement'
      ? {
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
      : {
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

  return [
    actionField,
    spellPickerField({
      sectionRowsDependsOn: input.sectionRowsDependsOn,
      fallbackActionRows: input.actionRows,
      spellCatalogById: input.spellCatalogById,
    }),
  ]
}

export function monsterMultiattackUseStepSpellField(input: {
  sectionRowsDependsOn: string
  actionRows: readonly MonsterActionDraftRow[]
  spellCatalogById?: ReadonlyMap<string, Spell>
  visibility: FieldVisibility
}): FormItem {
  return spellPickerField({
    sectionRowsDependsOn: input.sectionRowsDependsOn,
    fallbackActionRows: input.actionRows,
    spellCatalogById: input.spellCatalogById,
    visibility: input.visibility,
  })
}
