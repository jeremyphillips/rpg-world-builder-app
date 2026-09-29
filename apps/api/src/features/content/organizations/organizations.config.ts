import type { Organization } from '@rpg/contracts'
import {
  assertOrganizationMembershipTitlesCatalogUpdateAllowed,
  createOrganizationDraftInputSchema,
  createOrganizationInputSchema,
  organizationBodySchema,
  organizationDraftStoredSchema,
  organizationMembershipTitlesSchema,
  organizationSchema,
  resolveOrganizationCreateMembershipTitles,
  updateOrganizationDraftInputSchema,
  updateOrganizationInputSchema,
} from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { homebrewContentEnvelope } from '../lib/homebrew-envelope'
import type { ContentTypeConfig } from '../lib/content-type-config'
import type {
  ContentWriteConfig,
  ContentWriteContext,
  HomebrewDoc,
} from '../lib/content-write-config'
import { CharacterRelationshipModel } from '../../character-relationships'
import {
  HomebrewOrganizationModel,
  type HomebrewOrganizationSchemaType,
} from './homebrew-organization.model'

type HomebrewOrganizationRecord = HomebrewOrganizationSchemaType & { _id: unknown }

export function toHomebrewOrganization(doc: HomebrewDoc): Organization {
  const record = doc as HomebrewOrganizationRecord
  return {
    ...homebrewContentEnvelope(record),
    name: record.name,
    ...(record.media !== undefined && { media: record.media }),
    ...(record.description !== undefined && { description: record.description }),
    ...(record.organizationDomain !== undefined && {
      organizationDomain: record.organizationDomain,
    }),
    ...(record.organizationForm !== undefined && {
      organizationForm: record.organizationForm,
    }),
    functions: record.functions ?? [],
    practices: record.practices ?? [],
    members: {
      classAffinityIds: record.members?.classAffinityIds ?? [],
      speciesAffinityIds: record.members?.speciesAffinityIds ?? [],
      titles: organizationMembershipTitlesSchema.parse(record.members?.titles ?? []),
    },
    connections: {
      locations: record.connections?.locations ?? [],
    },
  } as Organization
}

function bodyFromCreateInput(input: Record<string, unknown>): Record<string, unknown> {
  const { slug: _slug, ...rest } = input
  const membersInput = (rest.members ?? {}) as Record<string, unknown>
  const titles = resolveOrganizationCreateMembershipTitles({
    ...(membersInput.titles !== undefined
      ? {
          titles: organizationMembershipTitlesSchema.parse(membersInput.titles),
        }
      : {}),
  })

  const { members: _clientMembers, ...bodyWithoutClientMembers } = rest

  return {
    ...bodyWithoutClientMembers,
    members: {
      classAffinityIds: membersInput.classAffinityIds ?? [],
      speciesAffinityIds: membersInput.speciesAffinityIds ?? [],
      titles,
    },
  }
}

function prepareHomebrewOrganizationUpdate(
  _doc: HomebrewDoc,
  update: Record<string, unknown>,
): Record<string, unknown> {
  const { members, ...rest } = update
  if (members === undefined || typeof members !== 'object' || members === null) {
    return rest
  }

  const affinities = members as {
    classAffinityIds?: unknown
    speciesAffinityIds?: unknown
    titles?: unknown
  }

  return {
    ...rest,
    ...(affinities.classAffinityIds !== undefined
      ? { 'members.classAffinityIds': affinities.classAffinityIds }
      : {}),
    ...(affinities.speciesAffinityIds !== undefined
      ? { 'members.speciesAffinityIds': affinities.speciesAffinityIds }
      : {}),
    ...(affinities.titles !== undefined
      ? {
          'members.titles': organizationMembershipTitlesSchema.parse(affinities.titles),
        }
      : {}),
  }
}

async function validateOrganizationMembershipTitlesBeforeWrite(
  ctx: ContentWriteContext,
): Promise<void> {
  if (ctx.mode !== 'update' || !ctx.existing?.id) {
    return
  }

  const members = ctx.input.members as { titles?: unknown } | undefined
  if (members?.titles === undefined) {
    return
  }

  const doc = await HomebrewOrganizationModel.findById(ctx.existing.id).lean<HomebrewDoc | null>()
  if (!doc) {
    throw new HttpError(404, 'not_found', 'Organization not found.')
  }

  const existing = toHomebrewOrganization(doc)
  const nextCatalog = organizationMembershipTitlesSchema.parse(members.titles)
  const edges = await CharacterRelationshipModel.find({
    kind: 'organizationMembership',
    organizationId: ctx.existing.id,
  })
    .select({ details: 1 })
    .lean<Array<{ details?: { membershipTitleId?: string } }>>()

  try {
    assertOrganizationMembershipTitlesCatalogUpdateAllowed({
      previousCatalog: existing.members.titles,
      nextCatalog,
      edges,
    })
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim().length > 0
        ? error.message
        : 'Organization membership titles update is invalid.'
    throw new HttpError(400, 'invalid_membership_titles', message)
  }
}

export const organizationContentConfig: ContentTypeConfig<Organization> = {
  type: 'organizations',
  loadHomebrew: async (campaignId, rulesetId) => {
    const docs = await HomebrewOrganizationModel.find({ campaignId, rulesetId }).lean<
      HomebrewOrganizationRecord[]
    >()
    return docs.map(toHomebrewOrganization)
  },
}

export const organizationWriteConfig: ContentWriteConfig<Organization> = {
  typeName: 'organizations',
  readConfig: organizationContentConfig,
  responseKey: 'organizations',
  createInputSchema: createOrganizationInputSchema,
  updateInputSchema: updateOrganizationInputSchema,
  createDraftInputSchema: createOrganizationDraftInputSchema,
  updateDraftInputSchema: updateOrganizationDraftInputSchema,
  storedSchema: organizationSchema,
  draftStoredSchema: organizationDraftStoredSchema,
  bodySchema: organizationBodySchema,
  homebrewModel: HomebrewOrganizationModel,
  toHomebrewEntity: toHomebrewOrganization,
  bodyFromCreateInput,
  prepareHomebrewUpdate: prepareHomebrewOrganizationUpdate,
  validateBeforeWrite: validateOrganizationMembershipTitlesBeforeWrite,
  characterUsageBlocksDemotion: false,
}

export const organizationRegistration = {
  read: organizationContentConfig,
  write: organizationWriteConfig,
} as const
