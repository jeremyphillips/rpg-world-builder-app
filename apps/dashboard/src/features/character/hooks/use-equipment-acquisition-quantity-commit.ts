export {
  EQUIPMENT_ACQUISITION_COMMIT_SUCCESS_MS as COMMIT_SUCCESS_DISPLAY_MS,
  useEquipmentAcquisitionCommitConfirmation,
} from '../components/equipment/acquisition/use-equipment-acquisition-commit-confirmation'

import { useEquipmentAcquisitionCommitConfirmation } from '../components/equipment/acquisition/use-equipment-acquisition-commit-confirmation'

/** @deprecated Use {@link useEquipmentAcquisitionCommitConfirmation}. */
export function useEquipmentAcquisitionQuantityCommit(args: {
  commit: (requestedQuantity: number) => boolean
}) {
  const { confirm, ...rest } = useEquipmentAcquisitionCommitConfirmation(args)
  return {
    ...rest,
    commitQuantity: confirm,
  }
}
