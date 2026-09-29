import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { ContentCreateSplitAction } from '@/lib/create-flow'
import { formatContentCreateHeading } from '@/features/content/lib/content-type-labels'

import { LocationCreateModal } from './location-create-modal'
import { buildLocationCreateHandoffHref } from '../../lib/create/location-create-shortcuts'
import type { LocationCreateSetupResult } from '../../lib/create/session/location-create-session'
import type { LocationFixedCreateContext } from '../../lib/forms/location-form-ctx'

export type LocationCreateActionsProps = {
  campaignId: string
}

/** Overview "New location" split create action (scratch, setup handoff, quick create). */
export function LocationCreateActions({ campaignId }: LocationCreateActionsProps) {
  const navigate = useNavigate()
  const [modalMode, setModalMode] = useState<'handoff' | 'details' | null>(null)
  const createLabel = formatContentCreateHeading('locations')
  const createHref = ROUTES.content.locations.create(campaignId)

  const handleSetupHandoff = (
    fixedCreate: LocationFixedCreateContext,
    result: LocationCreateSetupResult,
  ) => {
    navigate(buildLocationCreateHandoffHref(campaignId, fixedCreate, result))
  }

  return (
    <>
      <LocationCreateModal
        open={modalMode != null}
        onOpenChange={(open) => {
          if (!open) setModalMode(null)
        }}
        intent={{}}
        campaignId={campaignId}
        setupCompletion={modalMode === 'handoff' ? 'handoff' : 'details'}
        onSetupHandoff={modalMode === 'handoff' ? handleSetupHandoff : undefined}
      />
      <ContentCreateSplitAction
        entityLabel="location"
        primaryLabel={createLabel}
        onCreateFromScratch={() => navigate(createHref)}
        onStartWithSetup={() => setModalMode('handoff')}
        onQuickCreate={() => setModalMode('details')}
      />
    </>
  )
}
