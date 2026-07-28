import { EQUIPMENT_ACQUISITION_ADDING_LABEL } from '../../lib/equipment/equipment-step.lib'

import { formatAcquisitionCommitSuccessButtonLabel } from './equipment-acquisition-panel.lib'

export function resolveAcquisitionCommitButtonLabel(args: {
  isPending?: boolean
  successQuantity?: number
  primaryActionLabel: string
}): string {
  if (args.isPending) return EQUIPMENT_ACQUISITION_ADDING_LABEL
  if (args.successQuantity !== undefined) {
    return formatAcquisitionCommitSuccessButtonLabel(args.successQuantity)
  }
  return args.primaryActionLabel
}
