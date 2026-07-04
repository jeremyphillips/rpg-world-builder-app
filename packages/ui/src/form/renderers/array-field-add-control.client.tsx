'use client'

/**
 * Renders the array section add control below the item list.
 *
 * Chooses between a plain outline button and `ButtonDropdown` when
 * `ArrayConfig.addMenu` is configured; hides entirely when `canAdd` is false.
 */
import { Button } from '../../components/ui/button.client'
import { ButtonDropdown } from '../../components/ui/button-dropdown.client'
import type {
  ButtonDropdownGroup,
  ButtonDropdownItem,
} from '../../components/ui/button-dropdown.types'
import type { ArrayConfig } from '../field-config'

type ArrayFieldAddControlProps = {
  canAdd: boolean
  addLabel: string
  addMenu?: ArrayConfig['addMenu']
  addMenuItems: ButtonDropdownItem[]
  onAppendItem: () => void
  onAppendFromMenu: (itemId: string) => void
}

export function ArrayFieldAddControl({
  canAdd,
  addLabel,
  addMenu,
  addMenuItems,
  onAppendItem,
  onAppendFromMenu,
}: ArrayFieldAddControlProps) {
  if (!canAdd) return null

  if (addMenu) {
    return (
      <ButtonDropdown
        label={addLabel}
        groups={addMenu.groups as ButtonDropdownGroup[]}
        items={addMenuItems}
        enableSearch={addMenu.enableSearch}
        onSelectItem={onAppendFromMenu}
      />
    )
  }

  return (
    <Button variant="outline" size="sm" onClick={onAppendItem} aria-label={addLabel}>
      {addLabel}
    </Button>
  )
}
