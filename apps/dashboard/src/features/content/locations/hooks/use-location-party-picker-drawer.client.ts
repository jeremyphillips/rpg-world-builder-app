'use client'

import * as React from 'react'

import type {
  LocationPartyAssociationSemanticId,
  LocationPartyKind,
  Organization,
} from '@rpg/contracts'

import { useCampaignCharacters } from '@/features/campaign'
import { CATALOG_PICKER_COMMIT_SUCCESS_MS } from '@/features/character'
import { useNpcs } from '@/features/character'
import { useOrganizations } from '@/features/content'

import {
  buildLocationPartyCharactersById,
  buildLocationPartySemanticOptions,
  buildPartyKindsForSemanticKey,
  resolvePartyKindForRelationshipChange,
  type LocationPartyCharacterOption,
} from '../lib/location-party-associations.lib'
import type { LocationAuthoringType } from '../lib/location-authoring-type'

type LocationPartyPickerItem =
  | { kind: 'character'; character: LocationPartyCharacterOption }
  | { kind: 'organization'; organization: Organization }

function useLocationPartySuccessFlashes(clearWhen: string) {
  const [flashKeys, setFlashKeys] = React.useState<ReadonlySet<string>>(() => new Set())
  const [trackedClearWhen, setTrackedClearWhen] = React.useState(clearWhen)

  if (clearWhen !== trackedClearWhen) {
    setTrackedClearWhen(clearWhen)
    setFlashKeys(new Set())
  }

  const triggerFlash = React.useCallback((exactKey: string) => {
    setFlashKeys((current) => new Set(current).add(exactKey))
    window.setTimeout(() => {
      setFlashKeys((current) => {
        if (!current.has(exactKey)) return current
        const next = new Set(current)
        next.delete(exactKey)
        return next
      })
    }, CATALOG_PICKER_COMMIT_SUCCESS_MS)
  }, [])

  return { flashKeys, triggerFlash }
}

function useSyncedPartyKind(open: boolean, partyKinds: readonly LocationPartyKind[]) {
  const partyKindSyncKey = `${open}:${partyKinds.join(',')}`
  const [trackedPartyKindSyncKey, setTrackedPartyKindSyncKey] = React.useState(partyKindSyncKey)
  const [partyKind, setPartyKind] = React.useState<LocationPartyKind | null>(null)

  if (open && partyKindSyncKey !== trackedPartyKindSyncKey) {
    setTrackedPartyKindSyncKey(partyKindSyncKey)
    setPartyKind((current) =>
      resolvePartyKindForRelationshipChange({ previousPartyKind: current, partyKinds }),
    )
  } else if (!open && partyKindSyncKey !== trackedPartyKindSyncKey) {
    setTrackedPartyKindSyncKey(partyKindSyncKey)
  }

  return { partyKind, setPartyKind }
}

export function useLocationPartyPickerDrawer(input: {
  open: boolean
  campaignId: string
  authoringType: LocationAuthoringType
  semanticKey: LocationPartyAssociationSemanticId | null
}) {
  const semanticOptions = React.useMemo(
    () => buildLocationPartySemanticOptions(input.authoringType),
    [input.authoringType],
  )
  const partyKinds = input.semanticKey ? buildPartyKindsForSemanticKey(input.semanticKey) : []
  const { partyKind, setPartyKind } = useSyncedPartyKind(input.open, partyKinds)
  const relationshipContextKey = `${input.semanticKey ?? 'none'}::${partyKind ?? 'none'}`
  const { flashKeys, triggerFlash } = useLocationPartySuccessFlashes(relationshipContextKey)

  const { data: campaignCharacters = [] } = useCampaignCharacters(input.campaignId)
  const { data: npcs = [] } = useNpcs(input.campaignId)
  const { data: organizations = [] } = useOrganizations(input.campaignId)

  const characters = React.useMemo(
    () => [...buildLocationPartyCharactersById(campaignCharacters, npcs).values()],
    [campaignCharacters, npcs],
  )

  const items = React.useMemo<LocationPartyPickerItem[]>(() => {
    if (!input.semanticKey || !partyKind) return []

    if (partyKind === 'character') {
      return characters.map((character) => ({ kind: 'character' as const, character }))
    }
    return organizations.map((organization) => ({ kind: 'organization' as const, organization }))
  }, [characters, input.semanticKey, organizations, partyKind])

  return {
    characters,
    flashKeys,
    items,
    partyKind,
    partyKinds,
    semanticOptions,
    setPartyKind,
    triggerFlash,
  }
}
