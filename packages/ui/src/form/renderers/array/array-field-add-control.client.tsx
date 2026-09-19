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

type ArrayFieldAddButtonProps = {
  addActionLabel: string
  addActionVariant: NonNullable<ButtonVariantProps['variant']>
  buttonSize: NonNullable<ButtonVariantProps['size']>
  buttonDensity?: ButtonVariantProps['density']
  triggerClassName?: string
  showAddIcon?: boolean
  onClick?: () => void
  disabledProps: ReturnType<typeof resolveArrayAddDisabledProps>
}

function ArrayFieldAddTriggerLabel({
  addActionLabel,
  showAddIcon = true,
}: Pick<ArrayFieldAddButtonProps, 'addActionLabel' | 'showAddIcon'>) {
  if (!showAddIcon) return addActionLabel

  return (
    <>
      <Plus aria-hidden />
      {addActionLabel}
    </>
  )
}

function ArrayFieldAddButton({
  addActionLabel,
  addActionVariant,
  buttonSize,
  buttonDensity,
  triggerClassName,
  showAddIcon = true,
  onClick,
  disabledProps,
}: ArrayFieldAddButtonProps) {
  return (
    <Button
      variant={addActionVariant}
      size={buttonSize}
      density={buttonDensity}
      className={triggerClassName}
      onClick={onClick}
      aria-label={addActionLabel}
      {...disabledProps}
    >
      <ArrayFieldAddTriggerLabel addActionLabel={addActionLabel} showAddIcon={showAddIcon} />
    </Button>
  )
}

function ArrayFieldAddDisabledReason({
  addDisabledReason,
  disabledReasonId,
}: {
  addDisabledReason?: string
  disabledReasonId: string
}) {
  if (!addDisabledReason) return null

  return (
    <span id={disabledReasonId} className="sr-only">
      {addDisabledReason}
    </span>
  )
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
> &
  Pick<ArrayFieldAddButtonProps, 'buttonSize' | 'buttonDensity' | 'triggerClassName'> & {
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
      <>
        <ArrayFieldAddButton
          addActionLabel={addActionLabel}
          addActionVariant={addActionVariant}
          buttonSize={buttonSize}
          buttonDensity={buttonDensity}
          triggerClassName={triggerClassName}
          showAddIcon={showAddIcon}
          disabledProps={disabledProps}
        />
        <ArrayFieldAddDisabledReason
          addDisabledReason={addDisabledReason}
          disabledReasonId={disabledReasonId}
        />
      </>
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
  const disabledProps = resolveArrayAddDisabledProps(
    addEnabled,
    addDisabledReason,
    disabledReasonId,
  )

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
    <>
      <ArrayFieldAddButton
        addActionLabel={addActionLabel}
        addActionVariant={addActionVariant}
        buttonSize={buttonSize}
        buttonDensity={buttonDensity}
        triggerClassName={triggerClassName}
        showAddIcon={showAddIcon}
        onClick={addEnabled ? onAppendItem : undefined}
        disabledProps={disabledProps}
      />
      <ArrayFieldAddDisabledReason
        addDisabledReason={addDisabledReason}
        disabledReasonId={disabledReasonId}
      />
    </>
  )
}
