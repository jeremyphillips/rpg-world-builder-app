import {
  fetchCsrfToken,
  type CharacterRelationshipEdge,
  type CharacterRelationshipsListQuery,
  type CharacterRelationshipsProjectionResponse,
  type CreateCharacterRelationshipCommand,
  type DeleteCharacterRelationshipInput,
  type UpdateCharacterRelationshipInput,
} from '@rpg/contracts'

import { CSRF_HEADER, patchJson, postJson, request } from '@/lib/api-client'

const relationshipsListPath = (campaignId: string, characterId: string) =>
  `/api/campaigns/${campaignId}/characters/${characterId}/relationships`

const relationshipItemPath = (campaignId: string, relationshipId?: string) => {
  const base = `/api/campaigns/${campaignId}/character-relationships`
  return relationshipId ? `${base}/${relationshipId}` : base
}

function toRelationshipsQueryString(query?: CharacterRelationshipsListQuery): string {
  if (!query) return ''

  const params = new URLSearchParams()
  if (query.cursor) {
    params.set('cursor', query.cursor)
  }
  if (query.limit !== undefined) {
    params.set('limit', String(query.limit))
  }
  for (const kind of query.kinds ?? []) {
    params.append('kinds', kind)
  }

  const serialized = params.toString()
  return serialized ? `?${serialized}` : ''
}

export async function listCharacterRelationships(
  campaignId: string,
  characterId: string,
  query?: CharacterRelationshipsListQuery,
  fallbackMessage = 'Could not load character relationships.',
): Promise<CharacterRelationshipsProjectionResponse> {
  return request<CharacterRelationshipsProjectionResponse>(
    `${relationshipsListPath(campaignId, characterId)}${toRelationshipsQueryString(query)}`,
    undefined,
    fallbackMessage,
  )
}

export async function createCharacterRelationship(
  campaignId: string,
  command: CreateCharacterRelationshipCommand,
  fallbackMessage = 'Could not add this relationship.',
): Promise<{ relationship: CharacterRelationshipEdge }> {
  return postJson(relationshipItemPath(campaignId), command, fallbackMessage)
}

export async function updateCharacterRelationship(
  campaignId: string,
  relationshipId: string,
  input: UpdateCharacterRelationshipInput,
  fallbackMessage = 'Could not update this relationship.',
): Promise<{ relationship: CharacterRelationshipEdge }> {
  return patchJson(relationshipItemPath(campaignId, relationshipId), input, fallbackMessage)
}

export async function deleteCharacterRelationship(
  campaignId: string,
  relationshipId: string,
  input: DeleteCharacterRelationshipInput,
  fallbackMessage = 'Could not remove this relationship.',
): Promise<{ ok: true }> {
  const csrfToken = await fetchCsrfToken()
  return request<{ ok: true }>(
    relationshipItemPath(campaignId, relationshipId),
    {
      method: 'DELETE',
      headers: {
        'content-type': 'application/json',
        [CSRF_HEADER]: csrfToken,
      },
      body: JSON.stringify(input),
    },
    fallbackMessage,
  )
}

export function createCharacterRelationshipIdempotencyKey(): string {
  return crypto.randomUUID()
}
