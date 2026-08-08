'use client'

import * as React from 'react'

import type { Location } from '@rpg/contracts'
import { useQueryClient } from '@tanstack/react-query'

import { LocationDetailIdentity } from './location-detail-identity.client'
import { LocationParentReplacementDrawer } from './location-parent-replacement-drawer.client'
import type { LocationDetailIdentityViewModel } from '../lib/location-display'
import {
  applyLocationParentReplacement,
  invalidateLocationParentReplacementQueries,
} from '../lib/location-parent-replacement'

export type LocationDetailMetadataProps = {
  location: Location
  campaignId: string
  locations: readonly Location[]
  identity: LocationDetailIdentityViewModel
}

export function LocationDetailMetadata({
  location,
  campaignId,
  locations,
  identity,
}: LocationDetailMetadataProps) {
  const queryClient = useQueryClient()
  const [parentReplacementOpen, setParentReplacementOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleParentReplacementSubmit = async (newParentLocationId: string) => {
    setIsSubmitting(true)
    try {
      await applyLocationParentReplacement({
        campaignId,
        subjectId: location.id,
        newParentLocationId,
      })
      invalidateLocationParentReplacementQueries(queryClient, campaignId)
      setParentReplacementOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <LocationDetailIdentity
        identity={identity}
        onParentReplacementAction={
          identity.parentReplacementAction ? () => setParentReplacementOpen(true) : undefined
        }
      />
      {identity.parentReplacementAction ? (
        <LocationParentReplacementDrawer
          open={parentReplacementOpen}
          onOpenChange={setParentReplacementOpen}
          subject={location}
          campaignLocations={locations}
          isSubmitting={isSubmitting}
          onSubmit={handleParentReplacementSubmit}
        />
      ) : null}
    </>
  )
}
