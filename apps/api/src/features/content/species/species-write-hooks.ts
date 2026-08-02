import {
  assertCreatureTypesActiveInCampaign,
  assertDamageTypesActiveInCampaign,
  assertLanguagesActiveInCampaign,
  assertSensesActiveInCampaign,
} from '../../vocabulary'
import {
  extractSpeciesDamageTypeIds,
  extractSpeciesLanguageIds,
  extractSpeciesSenseTypeIds,
} from '../../vocabulary/lib/reference-sources/species'
import { resolveCatalogForCampaign } from '../content.service'
import { classContentConfig } from '../classes/classes.config'
import type { ContentWriteContext } from '../lib/content-write-config'
import { assertSpeciesClassSlugsFromInput } from './assert-species-class-slugs'

function entityBody(entity: Record<string, unknown>): Record<string, unknown> {
  const {
    id: _id,
    slug: _slug,
    rulesetId: _rulesetId,
    source: _source,
    campaignId: _campaignId,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    ...body
  } = entity
  return body
}

export async function speciesValidateBeforeWrite(ctx: ContentWriteContext): Promise<void> {
  const creatureType = ctx.input.creatureType
  if (typeof creatureType === 'string') {
    await assertCreatureTypesActiveInCampaign(ctx.campaignId, [creatureType])
  }

  const inputForVocab =
    ctx.mode === 'update' && ctx.existing
      ? {
          ...entityBody(ctx.existing as unknown as Record<string, unknown>),
          ...ctx.input,
        }
      : ctx.input

  await assertDamageTypesActiveInCampaign(ctx.campaignId, [
    ...extractSpeciesDamageTypeIds(inputForVocab),
  ])
  await assertSensesActiveInCampaign(ctx.campaignId, [...extractSpeciesSenseTypeIds(inputForVocab)])
  await assertLanguagesActiveInCampaign(ctx.campaignId, [
    ...extractSpeciesLanguageIds(inputForVocab),
  ])

  const classes = await resolveCatalogForCampaign(classContentConfig, ctx.campaignId)
  assertSpeciesClassSlugsFromInput(inputForVocab, classes)
}
