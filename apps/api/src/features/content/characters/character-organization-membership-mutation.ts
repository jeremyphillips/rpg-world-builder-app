import type { CharacterOrganizationConnection } from '@rpg/contracts'
import {
  characterOrganizationConnectionSchema,
  type CreateCharacterOrganizationMembershipInput,
  type UpdateCharacterOrganizationMembershipInput,
} from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { CharacterModel } from '../../character'
import { HomebrewOrganizationModel } from '../organizations/homebrew-organization.model'

type CharacterOrganizationsDocument = {
  connections?: {
    organizations?: CharacterOrganizationConnection[]
  }
}

export function readCharacterOrganizationMemberships(
  character: CharacterOrganizationsDocument,
): CharacterOrganizationConnection[] {
  return [...(character.connections?.organizations ?? [])]
}

async function loadCharacterForOrganizationMembershipWrite(
  characterId: string,
): Promise<CharacterOrganizationsDocument> {
  const character = await CharacterModel.findById(characterId)
    .select({ connections: 1 })
    .lean<CharacterOrganizationsDocument | null>()

  if (!character) {
    throw new HttpError(404, 'not_found', 'Character not found in campaign.')
  }

  return character
}

async function assertOrganizationExistsInCampaign(
  campaignId: string,
  organizationId: string,
): Promise<void> {
  const exists = await HomebrewOrganizationModel.exists({
    _id: organizationId,
    campaignId,
  })

  if (!exists) {
    throw new HttpError(
      404,
      'not_found',
      `Organization "${organizationId}" was not found in this campaign.`,
    )
  }
}

export async function persistCharacterOrganizationMemberships(
  characterId: string,
  memberships: CharacterOrganizationConnection[],
): Promise<void> {
  const result = await CharacterModel.updateOne(
    { _id: characterId },
    { $set: { 'connections.organizations': memberships } },
  )

  if (result.matchedCount !== 1) {
    throw new HttpError(404, 'not_found', 'Character not found.')
  }
}

function addMembership(
  existing: readonly CharacterOrganizationConnection[],
  input: CreateCharacterOrganizationMembershipInput,
): CharacterOrganizationConnection[] {
  if (existing.some((membership) => membership.organizationId === input.organizationId)) {
    throw new HttpError(409, 'conflict', 'Character is already a member of this organization.')
  }

  const membership = characterOrganizationConnectionSchema.parse(input)
  return [...existing, membership]
}

function updateMembership(
  existing: readonly CharacterOrganizationConnection[],
  organizationId: string,
  patch: UpdateCharacterOrganizationMembershipInput,
): CharacterOrganizationConnection[] {
  const index = existing.findIndex((membership) => membership.organizationId === organizationId)
  if (index === -1) {
    throw new HttpError(
      404,
      'not_found',
      `Organization membership "${organizationId}" was not found on this character.`,
    )
  }

  const nextMembership = characterOrganizationConnectionSchema.parse({
    organizationId,
    ...(patch.title !== null ? { title: patch.title } : {}),
    ...(patch.priority !== null ? { priority: patch.priority } : {}),
  })

  const next = [...existing]
  next[index] = nextMembership
  return next
}

function removeMembership(
  existing: readonly CharacterOrganizationConnection[],
  organizationId: string,
): CharacterOrganizationConnection[] {
  if (!existing.some((membership) => membership.organizationId === organizationId)) {
    throw new HttpError(
      404,
      'not_found',
      `Organization membership "${organizationId}" was not found on this character.`,
    )
  }

  return existing.filter((membership) => membership.organizationId !== organizationId)
}

export type CharacterOrganizationMembershipMutationResult = {
  membership: CharacterOrganizationConnection
}

/** Shared create/update/delete flow — always re-reads memberships from the loaded document. */
export async function createCharacterOrganizationMembershipRecord(input: {
  campaignId: string
  characterId: string
  body: CreateCharacterOrganizationMembershipInput
}): Promise<CharacterOrganizationMembershipMutationResult> {
  await assertOrganizationExistsInCampaign(input.campaignId, input.body.organizationId)
  const character = await loadCharacterForOrganizationMembershipWrite(input.characterId)
  const existing = readCharacterOrganizationMemberships(character)
  const memberships = addMembership(existing, input.body)
  const membership = memberships.at(-1)
  if (!membership) {
    throw new HttpError(500, 'internal_error', 'Organization membership mutation failed.')
  }

  await persistCharacterOrganizationMemberships(input.characterId, memberships)
  return { membership }
}

export async function updateCharacterOrganizationMembershipRecord(input: {
  campaignId: string
  characterId: string
  organizationId: string
  body: UpdateCharacterOrganizationMembershipInput
}): Promise<CharacterOrganizationMembershipMutationResult> {
  await assertOrganizationExistsInCampaign(input.campaignId, input.organizationId)
  const character = await loadCharacterForOrganizationMembershipWrite(input.characterId)
  const existing = readCharacterOrganizationMemberships(character)
  const memberships = updateMembership(existing, input.organizationId, input.body)
  const membership = memberships.find((row) => row.organizationId === input.organizationId)
  if (!membership) {
    throw new HttpError(
      404,
      'not_found',
      `Organization membership "${input.organizationId}" was not found on this character.`,
    )
  }

  await persistCharacterOrganizationMemberships(input.characterId, memberships)
  return { membership }
}

export async function deleteCharacterOrganizationMembershipRecord(input: {
  characterId: string
  organizationId: string
}): Promise<void> {
  const character = await loadCharacterForOrganizationMembershipWrite(input.characterId)
  const existing = readCharacterOrganizationMemberships(character)
  const memberships = removeMembership(existing, input.organizationId)
  await persistCharacterOrganizationMemberships(input.characterId, memberships)
}
