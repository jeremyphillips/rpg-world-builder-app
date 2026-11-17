import type { MasterDetailInlineTitle } from '../../components/master-detail/master-detail-inline-title'
import type { MasterDetailItemMeta } from './master-detail-item-meta'
import type { MasterDetailItemNounTerm } from './master-detail-item-noun'
import { masterDetailUnnamedItemTitle } from './master-detail-constants'

export type MasterDetailListMetaInput = Pick<
  MasterDetailItemMeta,
  'eyebrow' | 'kindLabel' | 'summary'
>

export type MasterDetailStringField<TRow> = {
  [K in keyof TRow & string]: TRow[K] extends string | undefined ? K : never
}[keyof TRow & string]

export type MasterDetailRowTitleContext<TRow> = {
  row: TRow
  index: number
  fieldId: string
  rows: readonly TRow[]
  itemNoun: MasterDetailItemNounTerm
  lastAddedFieldId: string | null
  /** False while the field-array slot has no materialized row object (e.g. watch lag). */
  rowReady: boolean
}

export type MasterDetailRowTitleStrategy<TRow> =
  | {
      strategy: 'authored'
      field: MasterDetailStringField<TRow>
      /** Display-only when stored value empty. Default: masterDetailUnnamedItemTitle(itemNoun). */
      resolveFallback?: (ctx: MasterDetailRowTitleContext<TRow>) => string
      /** When false, suppresses initial inline edit on add even when the stored name is empty. */
      allowInitialEditOnAdd?: boolean
      /** Overflow reset label when a stored override should be clearable (e.g. action reference). */
      resetLabel?: string
    }
  | {
      strategy: 'override'
      field: MasterDetailStringField<TRow>
      resolveDerived: (ctx: MasterDetailRowTitleContext<TRow>) => string
      resetLabel?: string
    }
  | {
      strategy: 'readonly'
      resolveTitle: (ctx: MasterDetailRowTitleContext<TRow>) => string
    }

export type MasterDetailRowTitleConfig<TRow> =
  | MasterDetailRowTitleStrategy<TRow>
  | {
      resolveRowTitle: (
        ctx: MasterDetailRowTitleContext<TRow>,
      ) => MasterDetailRowTitleStrategy<TRow>
    }

export type MasterDetailTitleResolution = {
  /** Single display string for list row title and static header. */
  displayTitle: string
  inlineTitle?: MasterDetailInlineTitle
  sourceName?: string
}

function storedTrim(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function readStoredField<TRow>(row: TRow, field: keyof TRow & string): unknown {
  if (row == null || typeof row !== 'object') return undefined
  return (row as Record<string, unknown>)[field]
}

function resolveStrategy<TRow>(
  config: MasterDetailRowTitleConfig<TRow>,
  ctx: MasterDetailRowTitleContext<TRow>,
): MasterDetailRowTitleStrategy<TRow> {
  if ('resolveRowTitle' in config) {
    return config.resolveRowTitle(ctx)
  }
  return config
}

function inlineTitleField(field: string): MasterDetailInlineTitle['field'] {
  return field === 'nameOverride' ? 'nameOverride' : 'name'
}

function buildAuthoredResolution<TRow>(
  strategy: Extract<MasterDetailRowTitleStrategy<TRow>, { strategy: 'authored' }>,
  ctx: MasterDetailRowTitleContext<TRow>,
): MasterDetailTitleResolution {
  const trimmed = storedTrim(readStoredField(ctx.row, strategy.field))
  const fallback = strategy.resolveFallback?.(ctx) ?? masterDetailUnnamedItemTitle(ctx.itemNoun)
  const displayTitle = trimmed || fallback
  const allowInitial =
    ctx.rowReady &&
    strategy.allowInitialEditOnAdd !== false &&
    ctx.lastAddedFieldId === ctx.fieldId &&
    !trimmed

  return {
    displayTitle,
    inlineTitle: {
      field: inlineTitleField(strategy.field),
      mode: 'authored',
      fallback,
      placeholder: fallback,
      ...(allowInitial ? { initialEdit: true } : {}),
      ...(trimmed && strategy.resetLabel ? { resetLabel: strategy.resetLabel } : {}),
    },
  }
}

function buildOverrideResolution<TRow>(
  strategy: Extract<MasterDetailRowTitleStrategy<TRow>, { strategy: 'override' }>,
  ctx: MasterDetailRowTitleContext<TRow>,
): MasterDetailTitleResolution {
  const derived = strategy.resolveDerived(ctx)
  const trimmed = storedTrim(readStoredField(ctx.row, strategy.field))
  const displayTitle = trimmed || derived
  const sourceName = trimmed && trimmed !== derived ? derived : undefined

  return {
    displayTitle,
    ...(sourceName ? { sourceName } : {}),
    inlineTitle: {
      field: inlineTitleField(strategy.field),
      mode: 'override',
      fallback: derived || displayTitle,
      placeholder: derived || '',
      ...(trimmed && strategy.resetLabel ? { resetLabel: strategy.resetLabel } : {}),
    },
  }
}

function buildReadonlyResolution<TRow>(
  strategy: Extract<MasterDetailRowTitleStrategy<TRow>, { strategy: 'readonly' }>,
  ctx: MasterDetailRowTitleContext<TRow>,
): MasterDetailTitleResolution {
  return {
    displayTitle: strategy.resolveTitle(ctx),
  }
}

/** Authoritative title + inline header binding for one master-detail row. */
export function resolveMasterDetailRowTitle<TRow>(
  config: MasterDetailRowTitleConfig<TRow>,
  ctx: MasterDetailRowTitleContext<TRow>,
): MasterDetailTitleResolution {
  const strategy = resolveStrategy(config, ctx)
  switch (strategy.strategy) {
    case 'authored':
      return buildAuthoredResolution(strategy, ctx)
    case 'override':
      return buildOverrideResolution(strategy, ctx)
    case 'readonly':
      return buildReadonlyResolution(strategy, ctx)
    default: {
      const _exhaustive: never = strategy
      return _exhaustive
    }
  }
}
