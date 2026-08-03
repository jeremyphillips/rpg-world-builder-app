'use client'

import { Link } from 'react-router-dom'
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
  buildLocationCreateHref,
  childAuthoringTypesForParentKind,
  getLocationAuthoringTypeLabel,
} from '../lib/location-create-shortcuts'

export type LocationAddChildMenuProps = {
  campaignId: string
  parentLocationId: string
  parentKind: LocationKind
}

/** Detail-page menu of child location types derived from contracts hierarchy. */
export function LocationAddChildMenu({
  campaignId,
  parentLocationId,
  parentKind,
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
          <DropdownMenuItem key={authoringType} asChild>
            <Link
              to={buildLocationCreateHref(campaignId, {
                authoringType,
                parentLocationId,
              })}
            >
              {getLocationAuthoringTypeLabel(authoringType)}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
