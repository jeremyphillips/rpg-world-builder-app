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
} from '../../vocabulary'
import { resolveCatalogForCampaign } from '../content.service'
import { classContentConfig } from '../classes/classes.config'
import type { ContentWriteContext } from '../lib/content-write-config'
import { assertContentSpellReferences } from '../lib/assert-content-spell-references'
import { rejectInvalidCreatureTraitTemplates } from '../lib/reject-creature-trait-templates'
import { assertSpeciesClassSlugsFromInput } from './assert-species-class-slugs'

function entityBody(entity: Record<string, unknown>): Record<string, unknown> {
  const {
    id: _id,
    slug: _slug,
    rulesetId: _rulesetId,
    catalogLayer: _catalogLayer,
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

  rejectInvalidCreatureTraitTemplates(inputForVocab.traits, ['traits'])
  const heritage = inputForVocab.heritage
  if (heritage && typeof heritage === 'object' && 'options' in heritage) {
    rejectInvalidCreatureTraitTemplates((heritage as { options?: unknown }).options, [
      'heritage',
      'options',
    ])
  }

  await assertDamageTypesActiveInCampaign(ctx.campaignId, [
    ...extractSpeciesDamageTypeIds(inputForVocab),
  ])
  await assertSensesActiveInCampaign(ctx.campaignId, [...extractSpeciesSenseTypeIds(inputForVocab)])
  await assertLanguagesActiveInCampaign(ctx.campaignId, [
    ...extractSpeciesLanguageIds(inputForVocab),
  ])

  const classes = await resolveCatalogForCampaign(classContentConfig, ctx.campaignId)
  assertSpeciesClassSlugsFromInput(inputForVocab, classes)
  await assertContentSpellReferences(ctx, inputForVocab)
}
