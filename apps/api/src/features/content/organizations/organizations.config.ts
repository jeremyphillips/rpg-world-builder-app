import type { Organization } from '@rpg/contracts'
import {
  createOrganizationDraftInputSchema,
  createOrganizationInputSchema,
  organizationBodySchema,
  organizationDraftStoredSchema,
  organizationSchema,
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
    ...(record.organizationKind !== undefined && {
      organizationKind: record.organizationKind,
    }),
  } as Organization
}

function bodyFromCreateInput(input: Record<string, unknown>): Record<string, unknown> {
  const { slug: _slug, ...body } = input
  return body
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
  characterUsageBlocksDemotion: false,
}

export const organizationRegistration = {
  read: organizationContentConfig,
  write: organizationWriteConfig,
} as const
