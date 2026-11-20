import type { Spell } from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import type { MonsterActionDraftRow } from '../monster-action-presets'
import { multiattackReplacementChoiceOptionsFromWatched } from './monster-multiattack-form-options'
import {
  MONSTER_MULTIATTACK_CHOICE_ACTION_LABEL,
  MONSTER_MULTIATTACK_CLEAR_SPELL_LABEL,
  MONSTER_MULTIATTACK_PIN_SPELL_LABEL,
  MONSTER_MULTIATTACK_NO_SPELLS_IN_SPELLCASTING,
  MONSTER_MULTIATTACK_SPELL_HINT,
  MONSTER_MULTIATTACK_SPELL_LABEL,
  MONSTER_MULTIATTACK_SPELL_PLACEHOLDER,
} from '../../monster-form-labels'
import { multiattackSpellOptionsForAction } from './monster-multiattack-form-options'

function spellSource(
  actionId: string,
  actionRows: readonly MonsterActionDraftRow[],
): Extract<MonsterActionDraftRow, { kind: 'spell' }> | undefined {
  const row = actionRows.find((entry) => entry.id === actionId)
  return row?.kind === 'spell' ? row : undefined
}

/** Shared action + optional spell row for replacement choices and use-choice rows. */
export function monsterMultiattackChoiceRowFields(input: {
  actionOptions: { value: string; label: string }[]
  actionRows: readonly MonsterActionDraftRow[]
  spellCatalogById?: ReadonlyMap<string, Spell>
  replacementChoicePicker?: {
    multiattackId: string
    ctx: ContentFormCtx
  }
}): FormItem[] {
  const actionField: FormItem = input.replacementChoicePicker
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
          ],
          optionsWhen: (watched) =>
            multiattackReplacementChoiceOptionsFromWatched({
              rows: input.actionRows,
              multiattackId: input.replacementChoicePicker!.multiattackId,
              ctx: input.replacementChoicePicker!.ctx,
              watched,
            }),
        },
      }
    : {
        type: 'select',
        name: 'actionId',
        label: MONSTER_MULTIATTACK_CHOICE_ACTION_LABEL,
        placeholder: 'Choose',
        options: input.actionOptions,
      }

  return [
    actionField,
    {
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
      visibility: {
        dependsOn: ['actionId'],
        visibleWhen: (values) =>
          spellSource(
            typeof values.actionId === 'string' ? values.actionId : '',
            input.actionRows,
          ) != null,
      },
      optionsResolve: {
        dependsOn: ['actionId'],
        optionsWhen: (values) =>
          multiattackSpellOptionsForAction(
            typeof values.actionId === 'string' ? values.actionId : '',
            input.actionRows,
            input.spellCatalogById,
          ),
      },
      interactivity: {
        dependsOn: ['actionId'],
        disabledWhen: (values) => {
          const source = spellSource(
            typeof values.actionId === 'string' ? values.actionId : '',
            input.actionRows,
          )
          if (!source) return false
          return !(source.spells ?? []).some((spell) => Boolean(spell.spellId))
        },
      },
      hint: {
        resolve: {
          dependsOn: ['actionId'],
          hintWhen: (values) => {
            const source = spellSource(
              typeof values.actionId === 'string' ? values.actionId : '',
              input.actionRows,
            )
            if (!source) return undefined
            const hasSpells = (source.spells ?? []).some((spell) => Boolean(spell.spellId))
            if (!hasSpells) return MONSTER_MULTIATTACK_NO_SPELLS_IN_SPELLCASTING
            return MONSTER_MULTIATTACK_SPELL_HINT
          },
        },
      },
    },
  ]
}
