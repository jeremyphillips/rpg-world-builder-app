import { Button, Text } from '@rpg/ui'

import { PACKAGE_SWITCH_CANCEL_LABEL } from '../../../../../lib/equipment/equipment-package-switch-resolution.lib'
import {
  equipmentPackageSwitchResolutionFooterActionsClasses,
  equipmentPackageSwitchResolutionFooterClasses,
  equipmentPackageSwitchResolutionHelperClasses,
} from './equipment-package-switch-resolution-modal.variants'

export function EquipmentPackageSwitchResolutionModalFooter({
  isBlocked,
  confirmLabel,
  confirmDisabled,
  isCommitting = false,
  helperMessage,
  onCancel,
  onConfirm,
}: {
  isBlocked: boolean
  confirmLabel: string
  confirmDisabled: boolean
  isCommitting?: boolean
  helperMessage?: string
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className={equipmentPackageSwitchResolutionFooterClasses}>
      {helperMessage ? (
        <Text as="p" className={equipmentPackageSwitchResolutionHelperClasses}>
          {helperMessage}
        </Text>
      ) : null}
      <div className={equipmentPackageSwitchResolutionFooterActionsClasses}>
        <Button type="button" variant="outline" onClick={onCancel}>
          {PACKAGE_SWITCH_CANCEL_LABEL}
        </Button>
        {!isBlocked ? (
          <Button type="button" disabled={confirmDisabled} onClick={onConfirm}>
            {isCommitting ? 'Switching…' : confirmLabel}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
