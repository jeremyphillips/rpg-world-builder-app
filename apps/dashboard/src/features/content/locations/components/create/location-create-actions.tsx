import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SplitButton } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { formatContentCreateHeading } from '@/features/content/lib/content-type-labels'

import { useLocationCreateSessionLaunch } from './location-create-launcher'
import { LocationCreateModal } from './location-create-modal'
import {
  buildLocationFixedCreateHref,
  getLocationAuthoringTypeLabel,
  LOCATION_CREATE_PROMOTED_AUTHORING_TYPES,
} from '../../lib/create/location-create-shortcuts'

export type LocationCreateActionsProps = {
  campaignId: string
}

/** Overview "New location" primary action with promoted type shortcuts. */
export function LocationCreateActions({ campaignId }: LocationCreateActionsProps) {
  const navigate = useNavigate()
  const [buildingCreateOpen, setBuildingCreateOpen] = useState(false)
  const createLabel = formatContentCreateHeading('locations')
  const createHref = ROUTES.content.locations.create(campaignId)

  const { launch, setupHost } = useLocationCreateSessionLaunch((fixedCreate) => {
    navigate(buildLocationFixedCreateHref(campaignId, fixedCreate))
  })

  return (
    <>
      {setupHost}
      <LocationCreateModal
        open={buildingCreateOpen}
        onOpenChange={setBuildingCreateOpen}
        intent={{ authoringType: 'building' }}
        campaignId={campaignId}
      />
      <SplitButton
        label={createLabel}
        showLeadingIcon={false}
        onPrimaryClick={() => navigate(createHref)}
        menuGroups={[
          {
            id: 'promoted',
            items: LOCATION_CREATE_PROMOTED_AUTHORING_TYPES.map((authoringType) => ({
              id: authoringType,
              label: getLocationAuthoringTypeLabel(authoringType),
              onSelect: () => {
                if (authoringType === 'building') {
                  setBuildingCreateOpen(true)
                  return
                }
                launch({ authoringType })
              },
            })),
          },
          {
            id: 'more',
            items: [
              {
                id: 'more-types',
                label: 'More location types…',
                onSelect: () => navigate(createHref),
              },
            ],
          },
        ]}
        menuAriaLabel={`${createLabel} shortcuts`}
      />
    </>
  )
}
