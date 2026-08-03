import type { Location } from '@rpg/contracts'
import {
  createLocationDraftInputSchema,
  createLocationInputSchema,
  locationBodySchema,
  locationDraftStoredSchema,
  locationSchema,
  updateLocationDraftInputSchema,
  updateLocationInputSchema,
} from '@rpg/contracts'

import { homebrewContentEnvelope } from '../lib/homebrew-envelope'
import type { ContentTypeConfig } from '../lib/content-type-config'
import type { ContentWriteConfig, HomebrewDoc } from '../lib/content-write-config'
import { HomebrewLocationModel, type HomebrewLocationSchemaType } from './homebrew-location.model'
import { validateLocationHierarchy } from './validate-location-hierarchy'

type HomebrewLocationRecord = HomebrewLocationSchemaType & { _id: unknown }

const HOMEBREW_DOC_ENVELOPE_KEYS = new Set([
  '_id',
  'campaignId',
  'rulesetId',
  'slug',
  'status',
  'createdAt',
  'updatedAt',
  '__v',
])

export function toHomebrewLocation(doc: HomebrewDoc): Location {
  const record = doc as HomebrewLocationRecord
  const body = Object.fromEntries(
    Object.entries(record).filter(([key]) => !HOMEBREW_DOC_ENVELOPE_KEYS.has(key)),
  )
  return {
    ...homebrewContentEnvelope(record),
    ...body,
  } as Location
}

function bodyFromCreateInput(input: Record<string, unknown>): Record<string, unknown> {
  const { slug: _slug, ...body } = input
  return body
}

export const locationContentConfig: ContentTypeConfig<Location> = {
  type: 'locations',
  loadHomebrew: async (campaignId, rulesetId) => {
    const docs = await HomebrewLocationModel.find({ campaignId, rulesetId }).lean<
      HomebrewLocationRecord[]
    >()
    return docs.map(toHomebrewLocation)
  },
}

export const locationWriteConfig: ContentWriteConfig<Location> = {
  typeName: 'locations',
  readConfig: locationContentConfig,
  responseKey: 'locations',
  createInputSchema: createLocationInputSchema,
  updateInputSchema: updateLocationInputSchema,
  createDraftInputSchema: createLocationDraftInputSchema,
  updateDraftInputSchema: updateLocationDraftInputSchema,
  storedSchema: locationSchema,
  draftStoredSchema: locationDraftStoredSchema,
  bodySchema: locationBodySchema,
  homebrewModel: HomebrewLocationModel,
  toHomebrewEntity: toHomebrewLocation,
  bodyFromCreateInput,
  validateBeforeWrite: validateLocationHierarchy,
  characterUsageBlocksDemotion: false,
}

export const locationRegistration = {
  read: locationContentConfig,
  write: locationWriteConfig,
} as const
