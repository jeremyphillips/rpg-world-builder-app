export {
  TableBuilderModal,
  type TableBuilderModalProps,
} from '@/features/content/components/table-builder/table-builder-modal'
export { createFixedLevelsTableBuilderDraft } from '@/features/content/lib/table-builder/create-fixed-levels-table-builder-draft'
export {
  isTableBuilderCellBlank,
  parseLevelDraft,
  type TableBuilderCellDraft,
  type TableBuilderColumnDraft,
  type TableBuilderFormValues,
} from '@/features/content/lib/table-builder/table-builder-draft'
export { flattenFormTouchedPaths } from '@/features/content/lib/table-builder/table-builder-form-touched.lib'
export type {
  TableBuilderCellPresentation,
  TableBuilderCellPresentationContext,
  TableBuilderCommittedDraftLevelsContext,
  TableBuilderDraftValidationResult,
  TableBuilderExtendedProgression,
  TableBuilderExtendedProgressionAction,
  TableBuilderFixedColumnDefinition,
  TableBuilderHostConfig,
  TableBuilderHostEditorRowState,
  TableBuilderRowPresentation,
  TableBuilderRowPresentationContext,
  TableBuilderRowRestoreAction,
  TableBuilderValuesNotice,
} from '@/features/content/lib/table-builder/table-builder-host-config'
export { resolveTableBuilderFixedColumns } from '@/features/content/lib/table-builder/table-builder-host-config'
