'use client'

import { useEffect } from 'react'
import { useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { buildLocationFixedCreateHref } from '../lib/create/location-create-shortcuts'
import type { LocationAuthoringType } from '../lib/location-authoring-type'

export function LocationCreateAuthoringTypeWatcher({
  campaignId,
  softParentLocationId,
}: {
  campaignId: string
  softParentLocationId?: string
}) {
  const navigate = useNavigate()
  const authoringType = useWatch({ name: 'authoringType' }) as LocationAuthoringType | undefined

  useEffect(() => {
    if (authoringType !== 'building') return
    navigate(
      buildLocationFixedCreateHref(campaignId, { authoringType: 'building' }, softParentLocationId),
      { replace: true },
    )
  }, [authoringType, campaignId, navigate, softParentLocationId])

  return null
}
