import {
  ApiError,
  contentDeletionResultSchema,
  fetchCsrfToken,
  getCharacterBuilderChromeMessages,
  type CampaignNpcDetail,
  type CampaignNpcListItem,
  type CampaignNpcStatusPatch,
  type ContentDeletionResult,
  type CreateNpcRequestInput,
} from '@rpg/contracts'

import { CSRF_HEADER, patchJson, postJson, request } from '@/lib/api-client'

const LIST_NPCS_ERROR = 'Could not load NPCs.'
const GET_NPC_ERROR = 'Could not load NPC.'
const CREATE_NPC_ERROR = getCharacterBuilderChromeMessages('campaign_npc').createErrorDefault
const DELETE_NPC_ERROR = 'Could not delete NPC.'
const PATCH_NPC_STATUS_ERROR = 'Could not update NPC status.'

function npcCollectionPath(campaignId: string) {
  return `/api/campaigns/${campaignId}/npcs`
}

export function mapNpcDetailToListItem(npc: CampaignNpcDetail): CampaignNpcListItem {
  return {
    character: {
      id: npc.character.id,
      name: npc.character.name,
      vital: npc.character.vital,
      classes: npc.character.classes,
      species: npc.character.species,
    },
    participation: {
      id: npc.participation.id,
      roster: npc.participation.roster,
      joinedAt: npc.participation.joinedAt,
    },
  }
}

export async function listNpcs(campaignId: string): Promise<CampaignNpcListItem[]> {
  const { npcs } = await request<{ npcs: CampaignNpcListItem[] }>(
    npcCollectionPath(campaignId),
    undefined,
    LIST_NPCS_ERROR,
  )
  return npcs
}

export async function getNpc(campaignId: string, npcId: string): Promise<CampaignNpcDetail> {
  const { npc } = await request<{ npc: CampaignNpcDetail }>(
    `${npcCollectionPath(campaignId)}/${npcId}`,
    undefined,
    GET_NPC_ERROR,
  )
  return npc
}

export async function createNpc(
  campaignId: string,
  input: CreateNpcRequestInput,
): Promise<CampaignNpcDetail> {
  const { npc } = await postJson<{ npc: CampaignNpcDetail }>(
    npcCollectionPath(campaignId),
    input,
    CREATE_NPC_ERROR,
  )
  return npc
}

export async function deleteNpc(campaignId: string, npcId: string): Promise<ContentDeletionResult> {
  const csrfToken = await fetchCsrfToken()
  const res = await fetch(`${npcCollectionPath(campaignId)}/${encodeURIComponent(npcId)}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { [CSRF_HEADER]: csrfToken },
  })

  if (res.status === 204) {
    return { status: 'deleted' }
  }

  const body = (await res.json().catch(() => null)) as {
    result?: unknown
    error?: { code?: string; message?: string }
  } | null

  if (res.status === 409) {
    return contentDeletionResultSchema.parse(body?.result)
  }

  throw new ApiError(
    res.status,
    body?.error?.code ?? 'request_error',
    body?.error?.message ?? DELETE_NPC_ERROR,
  )
}

export async function patchNpcStatus(
  campaignId: string,
  npcId: string,
  patch: CampaignNpcStatusPatch,
): Promise<CampaignNpcDetail> {
  const { npc } = await patchJson<{ npc: CampaignNpcDetail }>(
    `${npcCollectionPath(campaignId)}/${npcId}`,
    patch,
    PATCH_NPC_STATUS_ERROR,
  )
  return npc
}

export type {
  CampaignNpcDetail,
  CampaignNpcListItem,
  CampaignNpcStatusPatch,
  CreateNpcRequestInput,
}
