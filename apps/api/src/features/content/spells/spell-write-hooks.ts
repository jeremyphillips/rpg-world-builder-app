import type { Spell } from '@rpg/contracts'

import {
  assertDamageTypesActiveInCampaign,
  assertSpellSchoolsActiveInCampaign,
} from '../../vocabulary'
import { extractSpellDamageTypeIds, extractSpellSchoolId } from '../../vocabulary'
import { resolveCatalogForCampaign } from '../content.service'
import { classContentConfig } from '../classes/classes.config'
import type { ContentWriteContext } from '../lib/content-write-config'
import { assertSpellClassIdsHaveSpellcasting } from './assert-spell-class-ids'

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

export async function spellValidateBeforeWrite(ctx: ContentWriteContext): Promise<void> {
  const inputForVocab =
    ctx.mode === 'update' && ctx.existing
      ? {
          ...entityBody(ctx.existing as unknown as Record<string, unknown>),
          ...ctx.input,
        }
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

  const classes = await resolveCatalogForCampaign(classContentConfig, ctx.campaignId)
  assertSpellClassIdsHaveSpellcasting(classIds, classes)
}
