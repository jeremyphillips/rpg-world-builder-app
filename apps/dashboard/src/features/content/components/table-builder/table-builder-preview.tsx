import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import { EmptyPanel } from '@rpg/ui'
import { FormSectionHeader } from '@rpg/ui/form'

import { TableGrid } from '../tables/table-grid'
import {
  TABLE_BUILDER_PREVIEW_DESCRIPTION,
  TABLE_BUILDER_PREVIEW_EMPTY,
  TABLE_BUILDER_PREVIEW_TITLE,
} from '../../lib/table-builder/table-builder-copy'
import {
  progressionDraftToGridPresentation,
  type TableBuilderFormValues,
} from '../../lib/table-builder/table-builder-draft'
import { generalDraftToGridPresentation } from '../../lib/table-builder/table-builder-general-draft'
import { tableBuilderSectionClasses } from './table-builder.variants'
import { tableBuilderPreviewTableWrapClasses } from './table-builder-preview.variants'

/**
 * Live resolved preview of the authoring draft. Renders the tolerant
 * presentation model — unresolved cells show as em dashes; the preview never
 * claims the draft is a valid persisted table.
 */
export function TableBuilderPreview() {
  const values = useWatch<TableBuilderFormValues>() as TableBuilderFormValues

  const kind = values.kind ?? 'levelProgression'

  const presentation = useMemo(() => {
    const draft: TableBuilderFormValues = {
      kind,
      name: values.name ?? '',
      columns: values.columns ?? [],
      rows: values.rows ?? [],
    }
    return kind === 'general'
      ? generalDraftToGridPresentation(draft)
      : progressionDraftToGridPresentation(draft)
  }, [kind, values])

  const rowHeaderLabel = kind === 'levelProgression' ? 'Level' : undefined

  return (
    <section className={tableBuilderSectionClasses} aria-label={TABLE_BUILDER_PREVIEW_TITLE}>
      <FormSectionHeader
        label={TABLE_BUILDER_PREVIEW_TITLE}
        hint={TABLE_BUILDER_PREVIEW_DESCRIPTION}
        tier="subsection"
      />
      {presentation.columns.length === 0 ? (
        <EmptyPanel>{TABLE_BUILDER_PREVIEW_EMPTY}</EmptyPanel>
      ) : (
        <div className={tableBuilderPreviewTableWrapClasses}>
          <TableGrid
            presentation={presentation}
            caption={TABLE_BUILDER_PREVIEW_TITLE}
            {...(rowHeaderLabel === undefined ? {} : { rowHeaderLabel })}
          />
        </div>
      )}
    </section>
  )
}
