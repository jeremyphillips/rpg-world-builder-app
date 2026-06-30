import type { Spell } from '@rpg/contracts'

import { resolveCatalogForCampaign } from '../content.service'
import { classContentConfig } from '../classes/classes.config'
import type { ContentWriteContext } from '../lib/content-write-config'
import { assertSpellClassIdsHaveSpellcasting } from './assert-spell-class-ids'

export async function spellValidateBeforeWrite(ctx: ContentWriteContext): Promise<void> {
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
