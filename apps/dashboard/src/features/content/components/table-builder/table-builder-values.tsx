import { formatFieldMessage } from '@rpg/contracts'
import { FormSectionHeader } from '@rpg/ui/form'

import { TABLE_BUILDER_VALUES_LABEL } from '../../lib/table-builder/table-builder-copy'
import {
  tableBuilderGroupClasses,
  tableBuilderSectionClasses,
  tableBuilderSectionErrorClasses,
} from './table-builder.variants'
import { TableBuilderValuesGrid } from './table-builder-values-grid'
import { resolveTableBuilderValuesHint, useTableBuilderValues } from './table-builder-values.lib'

export type TableBuilderValuesProps = {
  allowedLevels: readonly number[]
}

export function TableBuilderValues({ allowedLevels }: TableBuilderValuesProps) {
  const values = useTableBuilderValues(allowedLevels)

  return (
    <section className={tableBuilderSectionClasses} aria-label={TABLE_BUILDER_VALUES_LABEL}>
      <FormSectionHeader
        label={TABLE_BUILDER_VALUES_LABEL}
        hint={resolveTableBuilderValuesHint(values.hasNoColumns, values.includeLevel)}
        labelPresentation="field-label"
        size="md"
        required
      />
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
