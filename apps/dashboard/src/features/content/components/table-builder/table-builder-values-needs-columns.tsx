import {
  TABLE_BUILDER_GENERAL_VALUES_NEEDS_COLUMNS_HEADLINE,
  TABLE_BUILDER_GENERAL_VALUES_NEEDS_COLUMNS_HINT,
} from '../../lib/table-builder/table-builder-copy'
import {
  tableBuilderValuesNeedsColumnsClasses,
  tableBuilderValuesNeedsColumnsHintClasses,
} from './table-builder-values.variants'

export function TableBuilderValuesNeedsColumns() {
  return (
    <div className={tableBuilderValuesNeedsColumnsClasses}>
      <p>{TABLE_BUILDER_GENERAL_VALUES_NEEDS_COLUMNS_HEADLINE}</p>
      <p className={tableBuilderValuesNeedsColumnsHintClasses}>
        {TABLE_BUILDER_GENERAL_VALUES_NEEDS_COLUMNS_HINT}
      </p>
    </div>
  )
}
