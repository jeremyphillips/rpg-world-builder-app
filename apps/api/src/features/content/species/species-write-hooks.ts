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
import {
  catalogOverlayFailureSlugs,
  resolveCatalogForCampaignWithOverlayContext,
} from '../content.service'
import { classRegistration } from '../classes/classes.config'
import type { ContentWriteContext } from '../lib/content-write-config'
import { mergeExistingContentBody } from '../lib/resolve-system-overlay.lib'
import { assertContentSpellReferences } from '../lib/assert-content-spell-references'
import { rejectInvalidCreatureTraitTemplates } from '../lib/reject-creature-trait-templates'
import { assertSpeciesClassSlugsFromInput } from './assert-species-class-slugs'

export async function speciesValidateBeforeWrite(ctx: ContentWriteContext): Promise<void> {
  const creatureType = ctx.input.creatureType
  if (typeof creatureType === 'string') {
    await assertCreatureTypesActiveInCampaign(ctx.campaignId, [creatureType])
  }

  const inputForVocab =
    ctx.mode === 'update' && ctx.existing
      ? mergeExistingContentBody(ctx.existing as unknown as Record<string, unknown>, ctx.input)
      : ctx.input

  rejectInvalidCreatureTraitTemplates(inputForVocab.traits, ['traits'], { host: 'species' })
  const heritage = inputForVocab.heritage
  if (heritage && typeof heritage === 'object' && 'options' in heritage) {
    rejectInvalidCreatureTraitTemplates(
      (heritage as { options?: unknown }).options,
      ['heritage', 'options'],
      { host: 'species' },
    )
  }

  await assertDamageTypesActiveInCampaign(ctx.campaignId, [
    ...extractSpeciesDamageTypeIds(inputForVocab),
  ])
  await assertSensesActiveInCampaign(ctx.campaignId, [...extractSpeciesSenseTypeIds(inputForVocab)])
  await assertLanguagesActiveInCampaign(ctx.campaignId, [
    ...extractSpeciesLanguageIds(inputForVocab),
  ])

  const classContext = await resolveCatalogForCampaignWithOverlayContext(
    classRegistration.read,
    ctx.campaignId,
  )
  assertSpeciesClassSlugsFromInput(
    inputForVocab,
    classContext.records,
    catalogOverlayFailureSlugs(classContext.overlayFailures),
    ctx.validationIntent,
  )
  await assertContentSpellReferences(ctx, inputForVocab)
}
