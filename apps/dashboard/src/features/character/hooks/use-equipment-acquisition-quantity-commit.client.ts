'use client'

export {
  CATALOG_PICKER_COMMIT_SUCCESS_MS as COMMIT_SUCCESS_DISPLAY_MS,
  useCatalogPickerCommitConfirmation,
} from '../components/picker/use-catalog-picker-commit-confirmation.client'

import { useCatalogPickerCommitConfirmation } from '../components/picker/use-catalog-picker-commit-confirmation.client'

/** @deprecated Use {@link useCatalogPickerCommitConfirmation}. */
export function useEquipmentAcquisitionQuantityCommit(args: {
  commit: (requestedQuantity: number) => boolean
}) {
  const { confirm, ...rest } = useCatalogPickerCommitConfirmation(args)
  return {
    ...rest,
    commitQuantity: confirm,
  }
}
