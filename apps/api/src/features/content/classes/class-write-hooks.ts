import type { CharacterClass, ClassStored } from '@rpg/contracts'

import {
  extractSkillsFromFromUpdate,
  syncSuggestedClassesFromClass,
} from '../lib/sync-suggested-classes-from-class'
import { enrichClassWithDerivedSkills } from './derive-classes-catalog'
import type { ContentWriteAfterContext, ContentWriteContext } from '../lib/content-write-config'

export async function classBeforeUpdateParse(ctx: ContentWriteContext): Promise<void> {
  if (ctx.mode !== 'update' || !ctx.existing) return
  const nextSkillSlugs = extractSkillsFromFromUpdate(ctx.normalized)
  if (!nextSkillSlugs) return
  await syncSuggestedClassesFromClass(ctx.campaignId, ctx.existing.slug, nextSkillSlugs)
}

export async function classAfterWrite(ctx: ContentWriteAfterContext): Promise<CharacterClass> {
  if (ctx.mode === 'create') {
    const nextSkillSlugs = extractSkillsFromFromUpdate(ctx.normalized)
    if (nextSkillSlugs) {
      await syncSuggestedClassesFromClass(ctx.campaignId, ctx.entity.slug, nextSkillSlugs)
    }
  }
  return enrichClassWithDerivedSkills(ctx.campaignId, ctx.entity as ClassStored)
}
