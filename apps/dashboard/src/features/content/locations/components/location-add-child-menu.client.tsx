'use client'

import type { LocationKind } from '@rpg/contracts'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@rpg/ui'
import { Plus } from 'lucide-react'

import {
  childAuthoringTypesForParentKind,
  getLocationAuthoringTypeLabel,
} from '../lib/location-create-shortcuts'
import type { LocationAuthoringType } from '../lib/location-authoring-type'

export type LocationAddChildMenuProps = {
  parentKind: LocationKind
  onSelectAuthoringType: (authoringType: LocationAuthoringType) => void
}

/** Detail-page menu of child location types derived from contracts hierarchy. */
export function LocationAddChildMenu({
  parentKind,
  onSelectAuthoringType,
}: LocationAddChildMenuProps) {
  const childTypes = childAuthoringTypesForParentKind(parentKind)

  if (childTypes.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Plus className="size-3.5" aria-hidden />
          Add location
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
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
