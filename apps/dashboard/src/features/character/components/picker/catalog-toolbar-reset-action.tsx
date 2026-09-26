import { ActionButton } from '@rpg/ui'

import { catalogPickerToolbarResetButtonClasses } from './catalog-picker-filter-toolbar.variants'

export type CatalogToolbarResetActionProps = {
  label: string
  onClick: () => void
  tabIndex?: number
}

export function CatalogToolbarResetAction({
  label,
  onClick,
  tabIndex,
}: CatalogToolbarResetActionProps) {
  return (
    <ActionButton
      action="reset"
      variant="ghost"
      size="sm"
      iconStep="sm"
      className={catalogPickerToolbarResetButtonClasses}
      onClick={onClick}
      tabIndex={tabIndex}
    >
      {label}
    </ActionButton>
  )
}

export type CatalogToolbarResetSlotProps = {
  visible: boolean
  label: string
  onClick: () => void
}

/** Reserves toolbar space so the reset action does not shift sibling controls. */
export function CatalogToolbarResetSlot({ visible, label, onClick }: CatalogToolbarResetSlotProps) {
  return (
    <div className={visible ? undefined : 'invisible'} aria-hidden={visible ? undefined : true}>
      <CatalogToolbarResetAction
        label={label}
        onClick={onClick}
        tabIndex={visible ? undefined : -1}
      />
    </div>
  )
}
