import { useWatch } from 'react-hook-form'
import { formatFieldMessage } from '@rpg/contracts'
import { Alert } from '@rpg/ui'
import { FormSectionHeader } from '@rpg/ui/form'

import { TABLE_BUILDER_VALUES_LABEL } from '../../lib/table-builder/table-builder-copy'
import type { TableBuilderFormValues } from '../../lib/table-builder/table-builder-draft'
import {
  tableBuilderGroupClasses,
  tableBuilderSectionClasses,
  tableBuilderSectionErrorClasses,
} from './table-builder.variants'
import { tableBuilderValuesStickyPaddingClasses } from './table-builder-values.variants'
import { useTableBuilderHostConfig } from '../../lib/table-builder/table-builder-host-context'
import { TableBuilderValuesGrid } from './table-builder-values-grid'
import { resolveTableBuilderValuesHint, useTableBuilderValues } from './table-builder-values.lib'

export type TableBuilderValuesProps = {
  allowedLevels: readonly number[]
}

export function TableBuilderValues({ allowedLevels }: TableBuilderValuesProps) {
  const config = useTableBuilderHostConfig()
  const values = useTableBuilderValues(allowedLevels)
  const fixedLevels = config.rows === 'fixedLevels'
  const draft = useWatch<TableBuilderFormValues>() as TableBuilderFormValues
  const valuesNotice = config.resolveValuesNotice?.({
    draft: {
      kind: draft.kind ?? 'levelProgression',
      name: draft.name ?? '',
      columns: draft.columns ?? [],
      rows: draft.rows ?? [],
    },
  })

  const stickyPadding =
    config.resolveExtendedProgressionAction !== undefined
      ? tableBuilderValuesStickyPaddingClasses
      : undefined

  return (
    <section
      className={[tableBuilderSectionClasses, stickyPadding].filter(Boolean).join(' ')}
      aria-label={TABLE_BUILDER_VALUES_LABEL}
    >
      <FormSectionHeader
        label={TABLE_BUILDER_VALUES_LABEL}
        hint={resolveTableBuilderValuesHint(values.hasNoColumns, values.includeLevel)}
        labelPresentation="field-label"
        size="md"
        required
      />
      {valuesNotice ? (
        <Alert
          variant="info"
          density="compact"
          title={valuesNotice.title}
          description={valuesNotice.description}
        />
      ) : null}
      {!values.hasNoColumns ? (
        <div className={tableBuilderGroupClasses}>
          <TableBuilderValuesGrid
            allowedLevels={allowedLevels}
            columns={values.columns}
            fields={values.fields}
            rowLevels={values.rowLevels}
            usedLevels={values.usedLevels}
            includeLevel={values.includeLevel}
            gridTemplate={values.gridTemplate}
            includeActions={!fixedLevels}
            addRowDisabled={values.addRowDisabled}
            onLevelChange={values.handleLevelChange}
            onAddRow={values.handleAddRow}
            onRemoveRow={values.removeRow}
          />
        </div>
      ) : null}
      {values.rowsErrorMessage ? (
        <p className={tableBuilderSectionErrorClasses}>
          {formatFieldMessage(values.rowsErrorMessage)}
        </p>
      ) : null}
    </section>
  )
}
