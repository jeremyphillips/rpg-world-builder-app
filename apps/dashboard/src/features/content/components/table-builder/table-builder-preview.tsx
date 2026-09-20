import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import { FormSectionHeader } from '@rpg/ui/form'

import { useTableBuilderHostConfig } from '../../lib/table-builder/table-builder-host-context'
import { TableGrid } from '../tables/table-grid'
import { isTableGridDataRow, type TableGridPresentation } from '../tables/table-grid-presentation'
import {
  TABLE_BUILDER_PREVIEW_DESCRIPTION,
  TABLE_BUILDER_PREVIEW_NO_COLUMNS_DESCRIPTION,
  TABLE_BUILDER_PREVIEW_NO_ROWS,
  TABLE_BUILDER_PREVIEW_TITLE,
} from '../../lib/table-builder/table-builder-copy'
import {
  isTableBuilderCellBlank,
  parseLevelDraft,
  progressionDraftToGridPresentation,
  type TableBuilderFormValues,
} from '../../lib/table-builder/table-builder-draft'
import { generalDraftToGridPresentation } from '../../lib/table-builder/table-builder-general-draft'
import { withTierSeparatorAfterStandardMax } from '../../lib/table-builder/table-builder-tier-separator.lib'
import { tableBuilderSectionClasses } from './table-builder.variants'
import { TableBuilderInsetGate } from './table-builder-inset-gate'
import { tableBuilderPreviewTableWrapClasses } from './table-builder-preview.variants'

function applyExtendedProgressionSeparators(
  presentation: TableGridPresentation,
  config: ReturnType<typeof useTableBuilderHostConfig>,
  kind: TableBuilderFormValues['kind'],
): TableGridPresentation {
  const extended = config.extendedProgression
  if (!extended || kind !== 'levelProgression') return presentation

  return {
    ...presentation,
    rows: withTierSeparatorAfterStandardMax(
      presentation.rows,
      extended.standardMaxLevel,
      extended.tierName,
    ),
  }
}

function fixedLevelsDraftToGridPresentation(
  draft: TableBuilderFormValues,
  config: ReturnType<typeof useTableBuilderHostConfig>,
): TableGridPresentation {
  const base =
    draft.kind === 'general'
      ? generalDraftToGridPresentation(draft)
      : progressionDraftToGridPresentation(draft)

  if (!config.resolveCellPresentation) return base

  return {
    ...base,
    rows: draft.rows.map((row, rowIndex) => {
      const level = parseLevelDraft(row.level ?? '')
      const cells = Object.fromEntries(
        draft.columns.map((column) => {
          const draftValue = row.cells[column.key]
          const presentation = config.resolveCellPresentation?.({
            draft,
            rowIndex,
            level,
            columnKey: column.key,
            draftValue,
          })
          const baseRow = base.rows[rowIndex]
          if (!isTableBuilderCellBlank(draftValue)) {
            return [
              column.key,
              presentation?.formattedValue ??
                (baseRow !== undefined && isTableGridDataRow(baseRow)
                  ? baseRow.cells[column.key]
                  : undefined),
            ]
          }
          if (presentation?.placeholder !== undefined) {
            return [column.key, presentation.placeholder]
          }
          return [column.key, undefined]
        }),
      )

      return {
        rowHeader: level,
        cells,
      }
    }),
  }
}

/**
 * Live resolved preview of the authoring draft. Renders the tolerant
 * presentation model — unresolved cells show as em dashes; the preview never
 * claims the draft is a valid persisted table.
 */
export function TableBuilderPreview() {
  const config = useTableBuilderHostConfig()
  const values = useWatch<TableBuilderFormValues>() as TableBuilderFormValues

  const kind = values.kind ?? 'levelProgression'

  const presentation = useMemo(() => {
    const draft: TableBuilderFormValues = {
      kind,
      name: values.name ?? '',
      columns: values.columns ?? [],
      rows: values.rows ?? [],
    }

    const base =
      config.rows === 'fixedLevels'
        ? fixedLevelsDraftToGridPresentation(draft, config)
        : kind === 'general'
          ? generalDraftToGridPresentation(draft)
          : progressionDraftToGridPresentation(draft)

    return applyExtendedProgressionSeparators(base, config, kind)
  }, [config, kind, values])

  const rowHeaderLabel = kind === 'levelProgression' ? 'Level' : undefined
  const hasColumns = presentation.columns.length > 0

  return (
    <section className={tableBuilderSectionClasses} aria-label={TABLE_BUILDER_PREVIEW_TITLE}>
      <FormSectionHeader
        label={TABLE_BUILDER_PREVIEW_TITLE}
        hint={TABLE_BUILDER_PREVIEW_DESCRIPTION}
        tier="subsection"
      />
      {!hasColumns ? (
        <TableBuilderInsetGate description={TABLE_BUILDER_PREVIEW_NO_COLUMNS_DESCRIPTION} />
      ) : (
        <div className={tableBuilderPreviewTableWrapClasses}>
          <TableGrid
            presentation={presentation}
            caption={TABLE_BUILDER_PREVIEW_TITLE}
            scrollMode="embedded"
            emptyBodyMessage={
              presentation.rows.length === 0 ? TABLE_BUILDER_PREVIEW_NO_ROWS : undefined
            }
            {...(rowHeaderLabel === undefined ? {} : { rowHeaderLabel })}
          />
        </div>
      )}
    </section>
  )
}
