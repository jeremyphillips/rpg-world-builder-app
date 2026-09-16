'use client'

import * as React from 'react'

/**
 * Renders the array section add action below the item list or inline with the legend.
 *
 * Chooses between a plain button and `ButtonDropdown` when
 * `ArrayConfig.addActionMenu` is configured. When append is blocked, the control
 * stays visible and disabled with an accessible explanation.
 */
import { Plus } from 'lucide-react'

import type { ButtonVariantProps } from '../../../components/ui/button.variants'
import { Button } from '../../../components/ui/button.client'
import { ButtonDropdown } from '../../../components/ui/button-dropdown.client'
import type {
  ButtonDropdownGroup,
  ButtonDropdownItem,
} from '../../../components/ui/button-dropdown.types'
import { resolveArrayAddButtonSize } from '../../../components/ui/field-sizing.variants'
import { cn } from '../../../lib/utils'
import { resolveFormDensity } from '../../form-density'
import { useFormSectionContext } from '../../context/form-section.context'
import type { ArrayAddActionConfig, ArrayAddActionLayout } from '../../field-config'

type ArrayFieldAddControlProps = {
  showAddControl: boolean
  addEnabled: boolean
  addDisabledReason?: string
  addActionLabel: string
  addActionVariant: NonNullable<ButtonVariantProps['variant']>
  addActionLayout?: ArrayAddActionLayout
  addActionSize?: NonNullable<ButtonVariantProps['size']>
  showAddIcon?: boolean
  addActionMenu?: ArrayAddActionConfig['menu']
  addActionMenuItems: ButtonDropdownItem[]
  onAppendItem: () => void
  onAppendFromMenu: (itemId: string) => void
}

function ArrayFieldAddTriggerLabel({
  addActionLabel,
  showAddIcon = true,
}: Pick<ArrayFieldAddControlProps, 'addActionLabel' | 'showAddIcon'>) {
  if (!showAddIcon) return addActionLabel

  return (
    <>
      <Plus aria-hidden />
      {addActionLabel}
    </>
  )
}

export function ArrayFieldAddControl({
  showAddControl,
  addEnabled,
  addDisabledReason,
  addActionLabel,
  addActionVariant,
  addActionLayout = 'stacked',
  addActionSize,
  showAddIcon = true,
  addActionMenu,
  addActionMenuItems,
  onAppendItem,
  onAppendFromMenu,
}: ArrayFieldAddControlProps) {
  const { density } = useFormSectionContext()
  const { size } = resolveFormDensity(density)
  const buttonSize = resolveArrayAddButtonSize(size, addActionSize)
  const triggerClassName = cn(addActionLayout === 'inline' && 'shrink-0')
  const leadingIcon = showAddIcon ? <Plus aria-hidden /> : undefined
  const disabledReasonId = React.useId()
  const disabledProps = addEnabled
    ? {}
    : {
        disabled: true,
        title: addDisabledReason,
        'aria-disabled': true as const,
        'aria-describedby': addDisabledReason ? disabledReasonId : undefined,
      }

  if (!showAddControl) return null

  const disabledReason = addDisabledReason ? (
    <span id={disabledReasonId} className="sr-only">
      {addDisabledReason}
    </span>
  ) : null

  if (addActionMenu) {
    if (!addEnabled) {
      return (
        <>
          <Button
            variant={addActionVariant}
            size={buttonSize}
            className={triggerClassName}
            aria-label={addActionLabel}
            {...disabledProps}
          >
            <ArrayFieldAddTriggerLabel addActionLabel={addActionLabel} showAddIcon={showAddIcon} />
          </Button>
          {disabledReason}
        </>
      )
    }

    return (
      <ButtonDropdown
        label={addActionLabel}
        leadingIcon={leadingIcon}
        groups={addActionMenu.groups as ButtonDropdownGroup[]}
        items={addActionMenuItems}
        enableSearch={addActionMenu.enableSearch}
        variant={addActionVariant}
        size={buttonSize}
        width={addActionLayout === 'inline' ? 'fit' : 'full'}
        className={triggerClassName}
        onSelectItem={onAppendFromMenu}
      />
    )
  }

  return (
    <>
      <Button
        variant={addActionVariant}
        size={buttonSize}
        className={triggerClassName}
        onClick={addEnabled ? onAppendItem : undefined}
        aria-label={addActionLabel}
        {...disabledProps}
      >
        <ArrayFieldAddTriggerLabel addActionLabel={addActionLabel} showAddIcon={showAddIcon} />
      </Button>
      {disabledReason}
    </>
  )
}
