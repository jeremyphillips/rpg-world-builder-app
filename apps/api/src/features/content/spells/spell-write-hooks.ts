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
import { resolveValidatedWriteBody } from '../lib/resolve-system-overlay.lib'
import { assertSpellClassIdsHaveSpellcasting } from './assert-spell-class-ids'

export async function spellValidateBeforeWrite(ctx: ContentWriteContext): Promise<void> {
  const inputForVocab = resolveValidatedWriteBody({
    effectiveBody: ctx.effectiveBody,
    mode: ctx.mode,
    existing: ctx.existing as Record<string, unknown> | undefined,
    input: ctx.input,
  })

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
