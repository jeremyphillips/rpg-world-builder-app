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
import { CollectionAddControl } from '../../../components/ui/collection-add-control.client'
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
import {
  resolveArrayAddButtonDensity,
  resolveArrayAddDisabledProps,
} from './array-field-add-control.lib'

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

type ArrayFieldAddMenuControlProps = Pick<
  ArrayFieldAddControlProps,
  | 'addEnabled'
  | 'addDisabledReason'
  | 'addActionLabel'
  | 'addActionVariant'
  | 'addActionLayout'
  | 'showAddIcon'
  | 'addActionMenu'
  | 'addActionMenuItems'
  | 'onAppendFromMenu'
> & {
  buttonSize: NonNullable<ButtonVariantProps['size']>
  buttonDensity?: ButtonVariantProps['density']
  triggerClassName?: string
  disabledReasonId: string
  leadingIcon?: React.ReactNode
}

function ArrayFieldAddMenuControl({
  addEnabled,
  addDisabledReason,
  addActionLabel,
  addActionVariant,
  addActionLayout = 'stacked',
  showAddIcon = true,
  addActionMenu,
  addActionMenuItems,
  onAppendFromMenu,
  buttonSize,
  buttonDensity,
  triggerClassName,
  disabledReasonId,
  leadingIcon,
}: ArrayFieldAddMenuControlProps) {
  const disabledProps = resolveArrayAddDisabledProps(
    addEnabled,
    addDisabledReason,
    disabledReasonId,
  )

  if (!addEnabled) {
    return (
      <CollectionAddControl
        label={addActionLabel}
        enabled={false}
        disabledReason={addDisabledReason}
        variant={addActionVariant}
        size={buttonSize}
        density={buttonDensity}
        showIcon={showAddIcon}
        className={triggerClassName}
      />
    )
  }

  return (
    <ButtonDropdown
      label={addActionLabel}
      leadingIcon={leadingIcon}
      groups={addActionMenu!.groups as ButtonDropdownGroup[]}
      items={addActionMenuItems}
      enableSearch={addActionMenu!.enableSearch}
      variant={addActionVariant}
      size={buttonSize}
      density={buttonDensity}
      width={addActionLayout === 'inline' ? 'fit' : 'full'}
      className={triggerClassName}
      onSelectItem={onAppendFromMenu}
      {...disabledProps}
    />
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
  const buttonSize = resolveArrayAddButtonSize(size, addActionSize, addActionLayout)
  const buttonDensity = resolveArrayAddButtonDensity(addActionLayout, addActionVariant)
  const triggerClassName = cn(addActionLayout === 'inline' && 'shrink-0')
  const leadingIcon = showAddIcon ? <Plus aria-hidden /> : undefined
  const disabledReasonId = React.useId()

  if (!showAddControl) return null

  if (addActionMenu) {
    return (
      <ArrayFieldAddMenuControl
        addEnabled={addEnabled}
        addDisabledReason={addDisabledReason}
        addActionLabel={addActionLabel}
        addActionVariant={addActionVariant}
        addActionLayout={addActionLayout}
        showAddIcon={showAddIcon}
        addActionMenu={addActionMenu}
        addActionMenuItems={addActionMenuItems}
        onAppendFromMenu={onAppendFromMenu}
        buttonSize={buttonSize}
        buttonDensity={buttonDensity}
        triggerClassName={triggerClassName}
        disabledReasonId={disabledReasonId}
        leadingIcon={leadingIcon}
      />
    )
  }

  return (
    <CollectionAddControl
      label={addActionLabel}
      onClick={onAppendItem}
      enabled={addEnabled}
      disabledReason={addDisabledReason}
      variant={addActionVariant}
      size={buttonSize}
      density={buttonDensity}
      showIcon={showAddIcon}
      className={triggerClassName}
    />
  )
}
