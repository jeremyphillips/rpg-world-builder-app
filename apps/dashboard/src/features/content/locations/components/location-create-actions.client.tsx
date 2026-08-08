'use client'

import { Link, useNavigate } from 'react-router-dom'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  buttonVariants,
} from '@rpg/ui'
import { ChevronDown } from 'lucide-react'

import { ROUTES } from '@/app/routes'
import { formatContentCreateHeading } from '@/features/content/lib/content-type-labels'

import { useLocationCreateSessionLaunch } from './location-create-launcher.client'
import {
  buildLocationFixedCreateHref,
  getLocationAuthoringTypeLabel,
  LOCATION_CREATE_PROMOTED_AUTHORING_TYPES,
} from '../lib/location-create-shortcuts'

export type LocationCreateActionsProps = {
  campaignId: string
}

/** Overview "New location" primary action with promoted type shortcuts. */
export function LocationCreateActions({ campaignId }: LocationCreateActionsProps) {
  const navigate = useNavigate()
  const createLabel = formatContentCreateHeading('locations')
  const createHref = ROUTES.content.locations.create(campaignId)

  const { launch, setupHost } = useLocationCreateSessionLaunch({
    onReady: (fixedCreate) => {
      navigate(buildLocationFixedCreateHref(campaignId, fixedCreate))
    },
  })

  return (
    <>
      {setupHost}
      <div className="flex items-stretch">
        <Link
          to={createHref}
          className={buttonVariants({
            size: 'sm',
            className: 'rounded-r-none border-r-0',
          })}
        >
          {createLabel}
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size="sm"
              className="rounded-l-none px-2"
              aria-label={`${createLabel} shortcuts`}
            >
              <ChevronDown className="size-3.5 opacity-80" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {LOCATION_CREATE_PROMOTED_AUTHORING_TYPES.map((authoringType) => (
              <DropdownMenuItem key={authoringType} onSelect={() => launch({ authoringType })}>
                {getLocationAuthoringTypeLabel(authoringType)}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={createHref}>More location types…</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}
