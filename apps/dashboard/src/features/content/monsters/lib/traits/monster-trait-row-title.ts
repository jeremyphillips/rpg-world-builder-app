import type { MasterDetailRowTitleConfig } from '../../../lib/master-detail/master-detail-row-title'
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

export function resolveMonsterTraitRowTitleConfig(
  monsterName: string,
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
        return {
          strategy: 'readonly',
          resolveTitle: () => templateDerivedName(ctx.row),
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
