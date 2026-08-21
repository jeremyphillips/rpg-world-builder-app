import type { ButtonProps } from '@rpg/ui'
import { Badge, CatalogPickerActionButton, Text } from '@rpg/ui'
import { resolveAcquisitionCommitButtonLabel } from '../../acquisition/equipment-acquisition-commit-labels.lib'

const EQUIPMENT_PICKER_ADD_LABEL = 'Add'
const EQUIPMENT_PICKER_ADD_FAILED_LABEL = 'Could not add this item.'

export type EquipmentPickerCommerceProps = {
  ownedQuantity: number
  showAdd?: boolean
  disabled?: boolean
  buttonLabel?: string
  isPending?: boolean
  successQuantity?: number
  commitFailed?: boolean
  onAdd: () => void
  buttonVariant?: ButtonProps['variant']
}

export function EquipmentPickerCommerce({
  ownedQuantity,
  showAdd = true,
  disabled = false,
  buttonLabel,
  isPending = false,
  successQuantity,
  commitFailed = false,
  onAdd,
  buttonVariant,
}: EquipmentPickerCommerceProps) {
  const label =
    buttonLabel ??
    resolveAcquisitionCommitButtonLabel({
      isPending,
      successQuantity,
      primaryActionLabel: EQUIPMENT_PICKER_ADD_LABEL,
    })

  return (
    <>
      {ownedQuantity > 0 ? (
        <Badge appearance="soft" tone="neutral" size="sm">
          {ownedQuantity}
        </Badge>
      ) : null}
      {showAdd ? (
        <CatalogPickerActionButton
          variant={buttonVariant}
          disabled={disabled || isPending}
          onClick={onAdd}
        >
          {label}
        </CatalogPickerActionButton>
      ) : null}
      {commitFailed ? (
        <Text as="span" variant="destructive" className="text-sm" role="status">
          {EQUIPMENT_PICKER_ADD_FAILED_LABEL}
        </Text>
      ) : null}
    </>
  )
}
