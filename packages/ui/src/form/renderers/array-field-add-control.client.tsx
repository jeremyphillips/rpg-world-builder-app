'use client'

/**
 * Renders the array section add action below the item list or inline with the legend.
 *
 * Chooses between a plain button and `ButtonDropdown` when
 * `ArrayConfig.addActionMenu` is configured; hides entirely when `canAdd` is false.
 * `addActionVariant` controls the trigger style (defaults to `outline`).
 */
import { Plus } from 'lucide-react'

import type { ButtonVariantProps } from '../../components/ui/button.variants'
import { Button } from '../../components/ui/button.client'
import { ButtonDropdown } from '../../components/ui/button-dropdown.client'
import type {
  ButtonDropdownGroup,
  ButtonDropdownItem,
} from '../../components/ui/button-dropdown.types'
import { resolveArrayAddButtonSize } from '../../components/ui/field-sizing.variants'
import { cn } from '../../lib/utils'
import { useFormSectionContext } from '../context/form-section.context'
import type { ArrayAddActionLayout, ArrayConfig } from '../field-config'

type ArrayFieldAddControlProps = {
  canAdd: boolean
  addActionLabel: string
  addActionVariant: NonNullable<ButtonVariantProps['variant']>
  addActionLayout?: ArrayAddActionLayout
  addActionSize?: NonNullable<ButtonVariantProps['size']>
  addActionMenu?: ArrayConfig['addActionMenu']
  addActionMenuItems: ButtonDropdownItem[]
  onAppendItem: () => void
  onAppendFromMenu: (itemId: string) => void
}

function ArrayFieldAddTriggerLabel({
  addActionLabel,
  addActionLayout,
}: Pick<ArrayFieldAddControlProps, 'addActionLabel' | 'addActionLayout'>) {
  if (addActionLayout !== 'inline') return addActionLabel

  return (
    <>
      <Plus aria-hidden />
      {addActionLabel}
    </>
  )
}

export function ArrayFieldAddControl({
  canAdd,
  addActionLabel,
  addActionVariant,
  addActionLayout = 'stacked',
  addActionSize,
  addActionMenu,
  addActionMenuItems,
  onAppendItem,
  onAppendFromMenu,
}: ArrayFieldAddControlProps) {
  const { size } = useFormSectionContext()
  const buttonSize = resolveArrayAddButtonSize(size, addActionSize)
  const triggerClassName = cn(addActionLayout === 'inline' && 'shrink-0')

  if (!canAdd) return null

  if (addActionMenu) {
    return (
      <ButtonDropdown
        label={addActionLabel}
        groups={addActionMenu.groups as ButtonDropdownGroup[]}
        items={addActionMenuItems}
        enableSearch={addActionMenu.enableSearch}
        variant={addActionVariant}
        size={buttonSize}
        className={triggerClassName}
        onSelectItem={onAppendFromMenu}
      />
    )
  }

  return (
    <Button
      variant={addActionVariant}
      size={buttonSize}
      className={triggerClassName}
      onClick={onAppendItem}
      aria-label={addActionLabel}
    >
      <ArrayFieldAddTriggerLabel
        addActionLabel={addActionLabel}
        addActionLayout={addActionLayout}
      />
    </Button>
  )
}
