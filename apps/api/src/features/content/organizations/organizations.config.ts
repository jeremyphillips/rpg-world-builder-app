import type { Organization, OrganizationAuthoringPresetId } from '@rpg/contracts'
import {
  createOrganizationDraftInputSchema,
  createOrganizationInputSchema,
  organizationBodySchema,
  organizationDraftStoredSchema,
  organizationSchema,
  organizationMembershipTitlesSchema,
  resolveOrganizationCreateMembershipTitles,
  updateOrganizationDraftInputSchema,
  updateOrganizationInputSchema,
} from '@rpg/contracts'

import { homebrewContentEnvelope } from '../lib/homebrew-envelope'
import type { ContentTypeConfig } from '../lib/content-type-config'
import type { ContentWriteConfig, HomebrewDoc } from '../lib/content-write-config'
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
    ...(record.imageKey !== undefined && { imageKey: record.imageKey }),
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
    ...(record.sourcePresetId !== undefined && record.sourcePresetId !== null
      ? { sourcePresetId: record.sourcePresetId as OrganizationAuthoringPresetId }
      : {}),
    connections: {
      locations: record.connections?.locations ?? [],
    },
  } as Organization
}

function bodyFromCreateInput(input: Record<string, unknown>): Record<string, unknown> {
  const { slug: _slug, ...rest } = input
  const sourcePresetId = rest.sourcePresetId as OrganizationAuthoringPresetId | undefined
  const membersInput = (rest.members ?? {}) as Record<string, unknown>
  const titles = resolveOrganizationCreateMembershipTitles({
    ...(sourcePresetId !== undefined ? { sourcePresetId } : {}),
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
    ...(sourcePresetId !== undefined ? { sourcePresetId } : {}),
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
  }

  return {
    ...rest,
    ...(affinities.classAffinityIds !== undefined
      ? { 'members.classAffinityIds': affinities.classAffinityIds }
      : {}),
    ...(affinities.speciesAffinityIds !== undefined
      ? { 'members.speciesAffinityIds': affinities.speciesAffinityIds }
      : {}),
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
  characterUsageBlocksDemotion: false,
}

export const organizationRegistration = {
  read: organizationContentConfig,
  write: organizationWriteConfig,
} as const
