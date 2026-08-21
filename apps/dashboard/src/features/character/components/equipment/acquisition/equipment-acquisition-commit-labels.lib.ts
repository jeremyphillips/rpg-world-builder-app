import { EQUIPMENT_ACQUISITION_ADDING_LABEL } from '../../../lib/equipment/equipment-step.lib'
import { EQUIPMENT_ACQUISITION_ADDED_LABEL } from './use-equipment-acquisition-commit-confirmation'

import { formatAcquisitionCommitSuccessButtonLabel } from './equipment-acquisition-panel.lib'

export function resolveAcquisitionCommitButtonLabel(args: {
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

export { EQUIPMENT_ACQUISITION_ADDED_LABEL }
