// ---------------------------------------------------------------------------
// Generic table-builder copy. The builder is consumer-agnostic — no feature
// or content-type specific wording belongs here. Contextual copy lives on the
// consuming surface (e.g. a feature-tables section), not in the builder.
// ---------------------------------------------------------------------------

export const TABLE_BUILDER_CREATE_TITLE = 'Add table'
export const TABLE_BUILDER_EDIT_TITLE = 'Edit table'
export const TABLE_BUILDER_MODAL_DESCRIPTION = 'Define the structure and values for this table.'

export const TABLE_BUILDER_NAME_LABEL = 'Table name'
export const TABLE_BUILDER_NAME_HINT = 'Used as the table heading.'

export const TABLE_BUILDER_COLUMNS_LABEL = 'Columns'
export const TABLE_BUILDER_COLUMNS_HINT =
  'Add the value columns for this table. Level is included automatically.'
export const TABLE_BUILDER_COLUMN_NAME_LABEL = 'Column name'
export const TABLE_BUILDER_COLUMN_TYPE_LABEL = 'Column type'
export const TABLE_BUILDER_NUMBER_FORMAT_LABEL = 'Number format'
export const TABLE_BUILDER_ADD_COLUMN_LABEL = 'Add column'

export const TABLE_BUILDER_VALUES_LABEL = 'Values'
export const TABLE_BUILDER_VALUES_HINT =
  'Add a row when values change. Blank cells keep the previous value.'
export const TABLE_BUILDER_LEVEL_HEADER = 'Level'
export const TABLE_BUILDER_ADD_ROW_LABEL = 'Add row'
export const TABLE_BUILDER_ALL_LEVELS_USED_REASON = 'All levels have been added.'

export const TABLE_BUILDER_PREVIEW_TITLE = 'Preview'
export const TABLE_BUILDER_PREVIEW_DESCRIPTION = 'This is how the table will appear.'
export const TABLE_BUILDER_PREVIEW_EMPTY = 'Add a column to preview this table.'

export const TABLE_BUILDER_CANCEL_LABEL = 'Cancel'
export const TABLE_BUILDER_CREATE_SUBMIT_LABEL = 'Add table'
export const TABLE_BUILDER_EDIT_SUBMIT_LABEL = 'Save table'
export const TABLE_BUILDER_DELETE_LABEL = 'Delete table'

export const TABLE_BUILDER_DELETE_CONFIRM_HEADLINE = 'Delete table?'
export const TABLE_BUILDER_DELETE_CONFIRM_DESCRIPTION =
  'This permanently removes the table and its values.'
export const TABLE_BUILDER_DELETE_CONFIRM_LABEL = 'Delete table'

export const TABLE_BUILDER_TYPE_CHANGE_CONFIRM_HEADLINE = 'Change column type?'
export const TABLE_BUILDER_TYPE_CHANGE_CONFIRM_DESCRIPTION =
  'Changing the column type will clear its existing values.'
export const TABLE_BUILDER_TYPE_CHANGE_CONFIRM_LABEL = 'Change type'
