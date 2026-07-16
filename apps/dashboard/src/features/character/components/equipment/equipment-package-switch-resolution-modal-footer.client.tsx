'use client'

import { Button, Text } from '@rpg/ui'

import {
  PACKAGE_SWITCH_CANCEL_LABEL,
  PACKAGE_SWITCH_CONFIRM_LABEL,
} from './equipment-package-switch-resolution.lib'
import {
  equipmentPackageSwitchResolutionFooterActionsClasses,
  equipmentPackageSwitchResolutionFooterClasses,
  equipmentPackageSwitchResolutionHelperClasses,
} from './equipment-package-switch-resolution-modal.variants'

export function EquipmentPackageSwitchResolutionModalFooter({
  isBlocked,
  confirmDisabled,
  isCommitting = false,
  helperMessage,
  onCancel,
  onConfirm,
}: {
  isBlocked: boolean
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
            {isCommitting ? 'Switching…' : PACKAGE_SWITCH_CONFIRM_LABEL}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
