import { contextualCountSchema, formatLegendaryResistanceStatBlockTitle } from '@rpg/contracts'

import type { MasterDetailRowTitleConfig } from '../../../lib/master-detail/master-detail-row-title'
import {
  MONSTER_CLEAR_LEGENDARY_RESISTANCE_NAME_LABEL,
  MONSTER_USE_DEFAULT_NAME_LABEL,
} from '../monster-form-labels'
import {
  monsterCustomTraitFallbacks,
  monsterTraitResolvedTitle,
  rowId,
  traitOrdinalLabel,
  templateDerivedName,
} from './monster-trait-editor-title'

type MonsterTraitTitleRow = {
  id?: string
  name?: string
  nameOverride?: string
  templateId?: string
  preset?: string
  kind?: string
  config?: unknown
}

function isRecord(row: unknown): row is Record<string, unknown> {
  return typeof row === 'object' && row !== null
}

function isTemplateRow(row: unknown): row is MonsterTraitTitleRow & { templateId: string } {
  return isRecord(row) && typeof row.templateId === 'string'
}

function isPresetRow(row: unknown): row is MonsterTraitTitleRow & { preset: string } {
  return isRecord(row) && typeof row.preset === 'string' && !isTemplateRow(row)
}

function legendaryResistanceRowTitle(config: unknown, lairEnabled: boolean): string | undefined {
  const parsed = contextualCountSchema.safeParse(
    config && typeof config === 'object' && !Array.isArray(config)
      ? (config as { uses?: unknown }).uses
      : undefined,
  )
  if (!parsed.success) return undefined
  return formatLegendaryResistanceStatBlockTitle({
    uses: parsed.data,
    lairEnabled,
  })
}

export function resolveMonsterTraitRowTitleConfig(
  monsterName: string,
  lairEnabled = false,
): MasterDetailRowTitleConfig<MonsterTraitTitleRow> {
  return {
    resolveRowTitle: (ctx) => {
      if (isPresetRow(ctx.row)) {
        return {
          strategy: 'readonly',
          resolveTitle: () => monsterTraitResolvedTitle(ctx.row, monsterName),
        }
      }
      if (isTemplateRow(ctx.row)) {
        const templateRow = ctx.row
        if (templateRow.templateId === 'legendary-resistance') {
          return {
            strategy: 'override',
            field: 'nameOverride',
            resolveDerived: () =>
              legendaryResistanceRowTitle(templateRow.config, lairEnabled) ??
              templateDerivedName(templateRow),
            resetLabel: MONSTER_CLEAR_LEGENDARY_RESISTANCE_NAME_LABEL,
          }
        }
        return {
          strategy: 'override',
          field: 'nameOverride',
          resolveDerived: () => templateDerivedName(templateRow),
          resetLabel: MONSTER_USE_DEFAULT_NAME_LABEL,
        }
      }
      return {
        strategy: 'authored',
        field: 'name',
        resolveFallback: (rowCtx) => {
          const cleared = rowCtx.rows.map((entry, entryIndex) =>
            entryIndex === rowCtx.index && isRecord(entry) ? { ...entry, name: '' } : entry,
          )
          return (
            monsterCustomTraitFallbacks(cleared, monsterName).get(
              rowId(rowCtx.row, rowCtx.index),
            ) ?? traitOrdinalLabel(rowCtx.index + 1)
          )
        },
      }
    },
  }
}
