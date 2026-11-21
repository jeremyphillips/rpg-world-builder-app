import {
  getMonsterActionKindLabel,
  isPrimarySpellcastingAction,
  monsterActionAuthoring,
  MONSTER_SPELLCASTING_ACTION_NAME,
} from '@rpg/contracts'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import type {
  MasterDetailRowTitleConfig,
  MasterDetailRowTitleStrategy,
} from '../../../lib/master-detail/master-detail-row-title'
import { masterDetailItemTitle } from '../../../lib/master-detail/master-detail-constants'
import {
  MONSTER_MULTIATTACK_USE_LABEL,
  MONSTER_USE_DEFAULT_NAME_LABEL,
} from '../monster-form-labels'
import type { MonsterFormValues } from '../monster-form-values'
import { monsterActionEditorTitles } from './monster-action-editor-title'
import type { MonsterActionDraftRow } from './monster-action-presets'
import type { MonsterActionSection } from './references/monster-action-equipment-references'
import { resolveMonsterFormActionIdentity } from './monster-action-identity'
import { MONSTER_ACTION_ITEM_NOUN } from '../monster-form-labels'

function withBlankName(action: MonsterActionDraftRow): MonsterActionDraftRow {
  const next = { ...action }
  delete next.name
  return next
}

export function resolveMonsterActionRowTitleStrategy(input: {
  action: MonsterActionDraftRow
  sectionRows: readonly MonsterActionDraftRow[]
  values: MonsterFormValues | undefined
  ctx: ContentFormCtx
  section?: MonsterActionSection
}): MasterDetailRowTitleStrategy<MonsterActionDraftRow> {
  if (isPrimarySpellcastingAction(input.action)) {
    return {
      strategy: 'readonly',
      resolveTitle: () => MONSTER_SPELLCASTING_ACTION_NAME,
    }
  }

  if (input.action.kind === 'multiattack') {
    const canonical = getMonsterActionKindLabel('multiattack')
    const stored = input.action.name?.trim()
    if (stored && stored !== canonical) {
      return {
        strategy: 'override',
        field: 'name',
        resolveDerived: () => canonical,
        resetLabel: MONSTER_MULTIATTACK_USE_LABEL,
      }
    }
    return {
      strategy: 'readonly',
      resolveTitle: () => canonical,
    }
  }

  const identity = resolveMonsterFormActionIdentity(input.action, input.values, input.ctx)
  const titles = monsterActionEditorTitles(
    input.sectionRows,
    input.values,
    input.ctx,
    input.section,
  )
  const listFallback =
    titles.get(input.action.id) ?? masterDetailItemTitle(undefined, MONSTER_ACTION_ITEM_NOUN)

  if (monsterActionAuthoring(input.action).name === 'authored') {
    const storedReferenceName =
      input.action.kind === 'action-reference' ? input.action.name?.trim() : undefined
    return {
      strategy: 'authored',
      field: 'name',
      allowInitialEditOnAdd: input.action.kind !== 'action-reference',
      ...(storedReferenceName ? { resetLabel: MONSTER_USE_DEFAULT_NAME_LABEL } : {}),
      resolveFallback: (rowCtx) => {
        const clearedRows = rowCtx.rows.map((row) =>
          row.id === input.action.id ? withBlankName(row) : row,
        )
        return (
          monsterActionEditorTitles(clearedRows, input.values, input.ctx, input.section).get(
            input.action.id,
          ) ?? listFallback
        )
      },
    }
  }

  return {
    strategy: 'override',
    field: 'name',
    resolveDerived: () => identity.defaultName || listFallback,
    resetLabel: MONSTER_USE_DEFAULT_NAME_LABEL,
  }
}

export function createMonsterActionRowTitleConfig(input: {
  section: MonsterActionSection
  values: MonsterFormValues | undefined
  ctx: ContentFormCtx
}): MasterDetailRowTitleConfig<MonsterActionDraftRow> {
  return {
    resolveRowTitle: (rowCtx) =>
      resolveMonsterActionRowTitleStrategy({
        action: rowCtx.row,
        sectionRows: rowCtx.rows,
        values: input.values,
        ctx: input.ctx,
        section: input.section,
      }),
  }
}
