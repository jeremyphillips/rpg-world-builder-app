import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'

export type DropdownMenuItemContentProps = {
  icon?: ReactNode
  label: ReactNode
  description?: ReactNode
  /** When true, description may wrap to multiple lines (rich action menus). */
  descriptionWrap?: boolean
}

/** Shared icon, label, and optional description layout for dropdown menu items. */
export function DropdownMenuItemContent({
  icon,
  label,
  description,
  descriptionWrap = false,
}: DropdownMenuItemContentProps) {
  const hasDescription = description != null && description !== ''

  if (!hasDescription) {
    return (
      <>
        {icon}
        <span className="truncate">{label}</span>
      </>
    )
  }

  return (
    <>
      {icon}
      <span className="ui-menu-item__text min-w-0 flex-1">
        <span className="ui-menu-item__label block truncate text-left">{label}</span>
        <span
          className={cn(
            'ui-menu-item__description block text-left',
            descriptionWrap && 'ui-menu-item__description--wrap',
          )}
        >
          {description}
        </span>
      </span>
    </>
  )
}
