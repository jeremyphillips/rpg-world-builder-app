import { formatFieldMessage } from '@rpg/contracts'
import { FormSectionHeader } from '@rpg/ui/form'

import {
  TABLE_BUILDER_GENERAL_VALUES_HINT,
  TABLE_BUILDER_VALUES_HINT,
  TABLE_BUILDER_VALUES_LABEL,
} from '../../lib/table-builder/table-builder-copy'
import {
  tableBuilderGroupClasses,
  tableBuilderSectionClasses,
  tableBuilderSectionErrorClasses,
} from './table-builder.variants'
import { TableBuilderValuesGrid } from './table-builder-values-grid'
import { useTableBuilderValues } from './table-builder-values.lib'
import { TableBuilderValuesNeedsColumns } from './table-builder-values-needs-columns'

export type TableBuilderValuesProps = {
  allowedLevels: readonly number[]
}

export function TableBuilderValues({ allowedLevels }: TableBuilderValuesProps) {
  const values = useTableBuilderValues(allowedLevels)

  return (
    <section className={tableBuilderSectionClasses} aria-label={TABLE_BUILDER_VALUES_LABEL}>
      <FormSectionHeader
        label={TABLE_BUILDER_VALUES_LABEL}
        hint={values.includeLevel ? TABLE_BUILDER_VALUES_HINT : TABLE_BUILDER_GENERAL_VALUES_HINT}
        tier="subsection"
        required
      />
      <div className={tableBuilderGroupClasses}>
        {values.isGeneralPreColumn ? (
          <TableBuilderValuesNeedsColumns />
        ) : (
          <TableBuilderValuesGrid
            allowedLevels={allowedLevels}
            columns={values.columns}
            fields={values.fields}
            rowLevels={values.rowLevels}
            usedLevels={values.usedLevels}
            includeLevel={values.includeLevel}
            gridTemplate={values.gridTemplate}
            addRowDisabled={values.addRowDisabled}
            onLevelChange={values.handleLevelChange}
            onAddRow={values.handleAddRow}
            onRemoveRow={values.removeRow}
          />
        )}
      </div>
      {values.rowsErrorMessage ? (
        <p className={tableBuilderSectionErrorClasses}>
          {formatFieldMessage(values.rowsErrorMessage)}
        </p>
      ) : null}
    </section>
  )
}
