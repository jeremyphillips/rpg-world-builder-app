import {
  assertDamageTypesActiveInCampaign,
  assertSpellSchoolsActiveInCampaign,
} from '../../vocabulary'
import { extractSpellDamageTypeIds, extractSpellSchoolId } from '../../vocabulary'
import {
  catalogOverlayFailureSlugs,
  resolveCatalogForCampaignWithOverlayContext,
} from '../content.service'
import { classRegistration } from '../classes/classes.config'
import type { ContentWriteContext } from '../lib/content-write-config'
import { contentEntityBody, mergeExistingContentBody } from '../lib/resolve-system-overlay.lib'
import { assertSpellClassIdsHaveSpellcasting } from './assert-spell-class-ids'

function validatedSpellBody(ctx: ContentWriteContext): Record<string, unknown> {
  if (ctx.effectiveBody) {
    return contentEntityBody(ctx.effectiveBody)
  }
  if (ctx.mode === 'update' && ctx.existing) {
    return mergeExistingContentBody(
      ctx.existing as unknown as Record<string, unknown>,
      ctx.input,
    ) as Record<string, unknown>
  }
  return ctx.input
}

export async function spellValidateBeforeWrite(ctx: ContentWriteContext): Promise<void> {
  const inputForVocab = validatedSpellBody(ctx)

  await assertDamageTypesActiveInCampaign(ctx.campaignId, [
    ...extractSpellDamageTypeIds(inputForVocab),
  ])
  await assertSpellSchoolsActiveInCampaign(ctx.campaignId, [...extractSpellSchoolId(inputForVocab)])

  const classIds = inputForVocab.classIds as string[] | undefined

  if (!classIds?.length) return

  const classContext = await resolveCatalogForCampaignWithOverlayContext(
    classRegistration.read,
    ctx.campaignId,
  )
  assertSpellClassIdsHaveSpellcasting(
    classIds,
    classContext.records,
    catalogOverlayFailureSlugs(classContext.overlayFailures),
    ctx.validationIntent,
  )
}
