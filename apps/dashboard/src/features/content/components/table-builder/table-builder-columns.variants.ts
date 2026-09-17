import {
  tableBuilderAddActionClasses,
  tableBuilderAddActionIconClasses,
} from './table-builder.variants'

/** 20px between inset-gate copy and add-column action. */
export const tableBuilderColumnsEmptyAddActionClasses = `${tableBuilderAddActionClasses} mt-5 w-auto shrink-0 px-4`

export const tableBuilderColumnsEmptyAddActionIconClasses = tableBuilderAddActionIconClasses

/** Populated columns — list + add action without bordered group chrome. */
export const tableBuilderColumnsBodyClasses = 'flex flex-col gap-4'

export const tableBuilderColumnsListClasses = 'flex flex-col gap-2.5'

export const tableBuilderColumnRowClasses = 'flex items-start gap-2'

export const tableBuilderColumnNameCellClasses = 'flex min-w-0 flex-1 flex-col gap-1'

/** Reserved slot so the format select appearing for Number columns causes no layout jump. */
export const tableBuilderColumnFormatSlotClasses = 'w-28 shrink-0'

export const tableBuilderColumnTypeTriggerClasses = 'w-32 shrink-0'

export const tableBuilderColumnTypeOptionClasses = 'flex items-center gap-1.5'

export const tableBuilderColumnTypeIconClasses = 'size-3.5 shrink-0 text-muted-foreground'

export const tableBuilderColumnLeadingSlotClasses = 'flex h-8 items-center'

export const tableBuilderColumnErrorClasses = 'text-xs text-destructive'
