import type { UseMasterDetailArrayResult } from './use-master-detail-array'

export type MasterDetailValidationEditor = Pick<
  UseMasterDetailArrayResult,
  'fields' | 'selectedIndex' | 'hasRowError'
>

/** True after submit when validation errors exist on rows other than the selection. */
export function showMasterDetailUnselectedRowErrors(
  editor: MasterDetailValidationEditor,
  submitCount: number,
): boolean {
  return (
    submitCount > 0 &&
    editor.fields.some(
      (_, index) =>
        editor.hasRowError(index) &&
        (editor.selectedIndex === null || index !== editor.selectedIndex),
    )
  )
}
