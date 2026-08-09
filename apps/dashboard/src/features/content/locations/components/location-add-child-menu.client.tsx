'use client'

import type { LocationKind } from '@rpg/contracts'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@rpg/ui'
import { Plus } from 'lucide-react'

import {
  childAuthoringTypesForParentKind,
  getLocationAuthoringTypeLabel,
} from '../lib/location-create-shortcuts'
import type { LocationAuthoringType } from '../lib/location-authoring-type'

type LocationAddChildMenuTriggerProps =
  | {
      appearance?: 'labeled'
      triggerLabel?: string
    }
  | {
      appearance: 'icon'
      triggerLabel: string
    }

export type LocationAddChildMenuProps = {
  parentKind: LocationKind
  onSelectAuthoringType: (authoringType: LocationAuthoringType) => void
  /** Optional context above type items (e.g. "Add to Dock Ward"). */
  menuHeading?: string
} & LocationAddChildMenuTriggerProps

/** Detail-page menu of child location types derived from contracts hierarchy. */
export function LocationAddChildMenu({
  parentKind,
  onSelectAuthoringType,
  menuHeading,
  ...triggerProps
}: LocationAddChildMenuProps) {
  const childTypes = childAuthoringTypesForParentKind(parentKind)

  if (childTypes.length === 0) {
    return null
  }

  const appearance = triggerProps.appearance ?? 'labeled'
  const trigger =
    appearance === 'icon' ? (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        density="compact"
        aria-label={triggerProps.triggerLabel}
      >
        <Plus aria-hidden />
      </Button>
    ) : (
      <Button type="button" variant="outline" size="sm">
        <Plus className="size-3.5" aria-hidden />
        Add location
      </Button>
    )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align={appearance === 'icon' ? 'end' : 'start'}>
        {menuHeading ? <DropdownMenuLabel>{menuHeading}</DropdownMenuLabel> : null}
        {childTypes.map((authoringType) => (
          <DropdownMenuItem
            key={authoringType}
            onSelect={() => onSelectAuthoringType(authoringType)}
          >
            {getLocationAuthoringTypeLabel(authoringType)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
