import { z } from 'zod'

import {
  getLocationPartyAssociationSemanticEntry,
  LOCATION_PARTY_ASSOCIATION_SEMANTIC_ENTRIES,
  type LocationPartyAssociationSemanticId,
  type LocationPartyKind,
} from '../../vocab/location/party-association'

// ---------------------------------------------------------------------------
// Location party associations — location-owned edges to characters and
// organizations. Classification / archetype describes what the place is;
// partyAssociations describe who owns, occupies, or operates it.
// ---------------------------------------------------------------------------

const locationPartyCharacterRefSchema = z.object({
  kind: z.literal('character'),
  characterId: z.string().min(1),
})

const locationPartyOrganizationRefSchema = z.object({
  kind: z.literal('organization'),
  organizationId: z.string().min(1),
})

export const locationPartyRefSchema = z.discriminatedUnion('kind', [
  locationPartyCharacterRefSchema,
  locationPartyOrganizationRefSchema,
])

export type LocationPartyRef = z.infer<typeof locationPartyRefSchema>

const locationPartyAssociationBaseSchema = z.object({
  id: z.string().min(1),
  party: locationPartyRefSchema,
})

const locationPartyOwnershipAssociationSchema = locationPartyAssociationBaseSchema.extend({
  kind: z.literal('ownership'),
})

const locationPartyOccupancyAssociationSchema = locationPartyAssociationBaseSchema.extend({
  kind: z.literal('occupancy'),
  role: z.enum(['tenant', 'resident', 'headquarters']),
})

const locationPartyOperationAssociationSchema = locationPartyAssociationBaseSchema.extend({
  kind: z.literal('operation'),
  role: z.enum(['operator', 'works_at']),
})

type PersistedAssociationShape =
  | { kind: 'ownership'; role?: never }
  | { kind: 'occupancy'; role: 'tenant' | 'resident' | 'headquarters' }
  | { kind: 'operation'; role: 'operator' | 'works_at' }

/** Maps a persisted association to its authoring semantic key (`owner`, `tenant`, …). */
export function getAssociationSemanticKey(
  association: PersistedAssociationShape,
): LocationPartyAssociationSemanticId {
  if (association.kind === 'ownership') return 'owner'
  if (association.kind === 'occupancy') {
    if (association.role === 'tenant') return 'tenant'
    if (association.role === 'resident') return 'resident'
    return 'headquarters'
  }
  return association.role === 'works_at' ? 'works_at' : 'operator'
}

function refinePartyKindForAssociation(
  association: PersistedAssociationShape & { party: LocationPartyRef },
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[] = [],
): void {
  const semanticKey = getAssociationSemanticKey(association)
  const entry = getLocationPartyAssociationSemanticEntry(semanticKey)
  if (!entry) return

  const partyKind = association.party.kind
  if (!entry.partyKinds.includes(partyKind)) {
    ctx.addIssue({
      code: 'custom',
      message: `${entry.label} cannot reference a ${partyKind}.`,
      path: [...pathPrefix, 'party', 'kind'],
    })
  }
}

export const locationPartyAssociationSchema = z
  .discriminatedUnion('kind', [
    locationPartyOwnershipAssociationSchema,
    locationPartyOccupancyAssociationSchema,
    locationPartyOperationAssociationSchema,
  ])
  .superRefine((association, ctx) => {
    refinePartyKindForAssociation(association, ctx)
  })

export type LocationPartyAssociation = z.infer<typeof locationPartyAssociationSchema>

export const locationPartyAssociationsSchema = z
  .array(locationPartyAssociationSchema)
  .default([])
  .superRefine((associations, ctx) => {
    const seenIds = new Set<string>()
    const seenExactKeys = new Set<string>()

    associations.forEach((association, index) => {
      if (seenIds.has(association.id)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Party association ids must be unique within the location.',
          path: [index, 'id'],
        })
      }
      seenIds.add(association.id)

      const exactKey = getLocationPartyAssociationExactKey(association)
      if (seenExactKeys.has(exactKey)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Duplicate active party relationship.',
          path: [index],
        })
      }
      seenExactKeys.add(exactKey)
      refinePartyKindForAssociation(association, ctx, [index])
    })
  })

export type LocationPartyAssociations = z.infer<typeof locationPartyAssociationsSchema>

/** Builds a persisted association from a semantic key and party ref. */
export function buildLocationPartyAssociation(input: {
  id: string
  semanticKey: LocationPartyAssociationSemanticId
  party: LocationPartyRef
}): LocationPartyAssociation {
  switch (input.semanticKey) {
    case 'owner':
      return { id: input.id, party: input.party, kind: 'ownership' }
    case 'tenant':
      return { id: input.id, party: input.party, kind: 'occupancy', role: 'tenant' }
    case 'resident':
      return { id: input.id, party: input.party, kind: 'occupancy', role: 'resident' }
    case 'headquarters':
      return { id: input.id, party: input.party, kind: 'occupancy', role: 'headquarters' }
    case 'operator':
      return { id: input.id, party: input.party, kind: 'operation', role: 'operator' }
    case 'works_at':
      return { id: input.id, party: input.party, kind: 'operation', role: 'works_at' }
  }
}

/** Stable v1 active-association dedupe key — not a permanent domain invariant. */
export function getLocationPartyAssociationExactKey(association: LocationPartyAssociation): string {
  const semanticKey = getAssociationSemanticKey(association)
  const partyKey =
    association.party.kind === 'character'
      ? `character:${association.party.characterId}`
      : `organization:${association.party.organizationId}`
  return `${semanticKey}::${partyKey}`
}

/** Returns allowed party kinds for a semantic relationship key. */
export function getPartyKindsForSemanticKey(
  semanticKey: LocationPartyAssociationSemanticId,
): readonly LocationPartyKind[] {
  return LOCATION_PARTY_ASSOCIATION_SEMANTIC_ENTRIES[semanticKey].partyKinds
}

/** Whether a party kind is valid for the given semantic relationship key. */
export function isPartyKindAllowedForSemanticKey(
  semanticKey: LocationPartyAssociationSemanticId,
  partyKind: LocationPartyKind,
): boolean {
  return getPartyKindsForSemanticKey(semanticKey).includes(partyKind)
}
