import type { Spell } from '@rpg/contracts'

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
import { mergeExistingContentBody } from '../lib/resolve-system-overlay.lib'
import { assertSpellClassIdsHaveSpellcasting } from './assert-spell-class-ids'

export async function spellValidateBeforeWrite(ctx: ContentWriteContext): Promise<void> {
  const inputForVocab =
    ctx.mode === 'update' && ctx.existing
      ? mergeExistingContentBody(ctx.existing as unknown as Record<string, unknown>, ctx.input)
      : ctx.input

  await assertDamageTypesActiveInCampaign(ctx.campaignId, [
    ...extractSpellDamageTypeIds(inputForVocab),
  ])
  await assertSpellSchoolsActiveInCampaign(ctx.campaignId, [...extractSpellSchoolId(inputForVocab)])

  const classIds =
    ctx.mode === 'update'
      ? ((ctx.input.classIds ?? (ctx.existing as Spell | undefined)?.classIds) as
          | string[]
          | undefined)
      : (ctx.input.classIds as string[] | undefined)

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
