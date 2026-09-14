import type { ReactNode } from 'react'

export type DropdownMenuItemContentProps = {
  icon?: ReactNode
  label: ReactNode
}

/** Shared icon + label layout for dropdown menu items (RowActionsMenu, detail overflow, …). */
export function DropdownMenuItemContent({ icon, label }: DropdownMenuItemContentProps) {
  return (
    <>
      {icon}
      <span className="truncate">{label}</span>
    </>
  )
}
