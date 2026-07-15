'use client'

/**
 * Renders the array section add control below the item list.
 *
 * Chooses between a plain button and `ButtonDropdown` when
 * `ArrayConfig.addMenu` is configured; hides entirely when `canAdd` is false.
 * `addVariant` controls the trigger style (defaults to `outline`).
 */
import type { ButtonVariantProps } from '../../components/ui/button.variants'
import { Button } from '../../components/ui/button.client'
import { ButtonDropdown } from '../../components/ui/button-dropdown.client'
import type {
  ButtonDropdownGroup,
  ButtonDropdownItem,
} from '../../components/ui/button-dropdown.types'
import { fieldSizeToArrayAddButtonSize } from '../../components/ui/field-sizing.variants'
import { useFormSectionContext } from '../context/form-section.context'
import type { ArrayConfig } from '../field-config'

type ArrayFieldAddControlProps = {
  canAdd: boolean
  addLabel: string
  addVariant: NonNullable<ButtonVariantProps['variant']>
  addMenu?: ArrayConfig['addMenu']
  addMenuItems: ButtonDropdownItem[]
  onAppendItem: () => void
  onAppendFromMenu: (itemId: string) => void
}

export function ArrayFieldAddControl({
  canAdd,
  addLabel,
  addVariant,
  addMenu,
  addMenuItems,
  onAppendItem,
  onAppendFromMenu,
}: ArrayFieldAddControlProps) {
  const { size } = useFormSectionContext()
  const buttonSize = fieldSizeToArrayAddButtonSize[size]

  if (!canAdd) return null

  if (addMenu) {
    return (
      <ButtonDropdown
        label={addLabel}
        groups={addMenu.groups as ButtonDropdownGroup[]}
        items={addMenuItems}
        enableSearch={addMenu.enableSearch}
        variant={addVariant}
        size={buttonSize}
        onSelectItem={onAppendFromMenu}
      />
    )
  }

  return (
    <Button variant={addVariant} size={buttonSize} onClick={onAppendItem} aria-label={addLabel}>
      {addLabel}
    </Button>
  )
}
