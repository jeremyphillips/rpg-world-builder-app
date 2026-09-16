import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import { EmptyPanel } from '@rpg/ui'
import { FormSectionHeader } from '@rpg/ui/form'

import {
  TABLE_BUILDER_PREVIEW_DESCRIPTION,
  TABLE_BUILDER_PREVIEW_EMPTY,
  TABLE_BUILDER_PREVIEW_TITLE,
} from '../../lib/table-builder/table-builder-copy'
import {
  draftToPresentation,
  type TableBuilderFormValues,
} from '../../lib/table-builder/table-builder-draft'
import { ProgressionTableGrid } from '../tables/progression-table-grid'
import { tableBuilderSectionClasses } from './table-builder.variants'
import { tableBuilderPreviewTableWrapClasses } from './table-builder-preview.variants'

/**
 * Live resolved preview of the authoring draft. Renders the tolerant
 * presentation model — unresolved cells show as em dashes; the preview never
 * claims the draft is a valid `ProgressionTable`.
 */
export function TableBuilderPreview() {
  const values = useWatch<TableBuilderFormValues>() as TableBuilderFormValues

  const presentation = useMemo(
    () =>
      draftToPresentation({
        name: values.name ?? '',
        columns: values.columns ?? [],
        rows: values.rows ?? [],
      }),
    [values],
  )

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
          <ProgressionTableGrid presentation={presentation} caption={TABLE_BUILDER_PREVIEW_TITLE} />
        </div>
      )}
    </section>
  )
}
