import type { CreateNpcRequestInput, NpcCharacter } from '@rpg/contracts'

import { deleteJson, postJson, request } from '@/lib/api-client'

const LIST_NPCS_ERROR = 'Could not load NPCs.'
const GET_NPC_ERROR = 'Could not load NPC.'
const CREATE_NPC_ERROR = 'Could not create NPC.'
const DELETE_NPC_ERROR = 'Could not delete NPC.'

function npcCollectionPath(campaignId: string) {
  return `/api/campaigns/${campaignId}/npcs`
}

export async function listNpcs(campaignId: string): Promise<NpcCharacter[]> {
  const { npcs } = await request<{ npcs: NpcCharacter[] }>(
    npcCollectionPath(campaignId),
    undefined,
    LIST_NPCS_ERROR,
  )
  return npcs
}

export async function getNpc(campaignId: string, npcId: string): Promise<NpcCharacter> {
  const { npc } = await request<{ npc: NpcCharacter }>(
    `${npcCollectionPath(campaignId)}/${npcId}`,
    undefined,
    GET_NPC_ERROR,
  )
  return npc
}

export async function createNpc(
  campaignId: string,
  input: CreateNpcRequestInput,
): Promise<NpcCharacter> {
  const { npc } = await postJson<{ npc: NpcCharacter }>(
    npcCollectionPath(campaignId),
    input,
    CREATE_NPC_ERROR,
  )
  return npc
}

export async function deleteNpc(campaignId: string, npcId: string): Promise<void> {
  await deleteJson(`${npcCollectionPath(campaignId)}/${npcId}`, DELETE_NPC_ERROR)
}

export type { CreateNpcRequestInput, NpcCharacter }
