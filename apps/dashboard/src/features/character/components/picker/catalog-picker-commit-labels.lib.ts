import { EQUIPMENT_ACQUISITION_ADDING_LABEL } from '../../lib/equipment/equipment-step.lib'
import { formatAcquisitionCommitSuccessButtonLabel } from '../equipment/acquisition/equipment-acquisition-panel.lib'

import { CATALOG_PICKER_ADDED_LABEL } from './use-catalog-picker-commit-confirmation.client'

export function resolveCatalogPickerCommitActionLabel(args: {
  isPending?: boolean
  successQuantity?: number
  successLabel?: string
  primaryActionLabel: string
  pendingLabel?: string
}): string {
  if (args.isPending) return args.pendingLabel ?? EQUIPMENT_ACQUISITION_ADDING_LABEL
  if (args.successQuantity !== undefined) {
    return formatAcquisitionCommitSuccessButtonLabel(args.successQuantity)
  }
  if (args.successLabel) return args.successLabel
  return args.primaryActionLabel
}

export { CATALOG_PICKER_ADDED_LABEL }
