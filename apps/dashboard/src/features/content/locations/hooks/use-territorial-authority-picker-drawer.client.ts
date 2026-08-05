'use client'

import * as React from 'react'

import {
  getOrganizationKindLabel,
  type Organization,
  type TerritorialAuthorityKind,
} from '@rpg/contracts'

import { useOrganizations } from '@/features/content'

import { buildTerritorialAuthorityKindOptions } from '../lib/territorial-authority.lib'
import type { LocationAuthoringType } from '../lib/location-authoring-type'

export function useTerritorialAuthorityPickerDrawer(input: {
  open: boolean
  campaignId: string
  authoringType: LocationAuthoringType
  authorityKind: TerritorialAuthorityKind | null
}) {
  const kindOptions = React.useMemo(
    () => buildTerritorialAuthorityKindOptions(input.authoringType),
    [input.authoringType],
  )

  const { data: organizations = [] } = useOrganizations(input.campaignId)

  const items = React.useMemo<Organization[]>(() => {
    if (!input.authorityKind) return []
    return organizations
  }, [input.authorityKind, organizations])

  return {
    kindOptions,
    items,
    getOrganizationKindLabel,
  }
}
