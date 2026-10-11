import {
  deriveMonsterDraftStatBlock,
  type DerivedMonsterDraftStatBlock,
  type Equipment,
  type SkillProficiency,
} from '@rpg/contracts'

import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import type { MonsterFormValues } from './monster-form-values'
import { normalizeMonsterFormValues } from './normalize-monster-form-values'

export function monsterSkillCatalog(ctx: ContentFormCtx): Map<string, SkillProficiency> {
  const skills = ctx.options?.skills?.visible ?? []
  return new Map(skills.map((skill) => [skill.id, skill]))
}

export function monsterEquipmentCatalog(ctx: ContentFormCtx): ReadonlyMap<string, Equipment> {
  return ctx.equipmentCatalogById ?? new Map()
}

/** Draft derivation for preview and editor panels. Skips catalog math until equipment is loaded. */
export function deriveMonsterFormDraft(
  values: MonsterFormValues,
  ctx: ContentFormCtx,
): DerivedMonsterDraftStatBlock | null {
  if (ctx.equipmentCatalogStatus !== 'ready') return null
  const normalized = normalizeMonsterFormValues(values, { intent: 'draft', mode: 'create' })
  return deriveMonsterDraftStatBlock({
    monster: normalized,
    equipmentCatalog: monsterEquipmentCatalog(ctx),
    skillCatalog: monsterSkillCatalog(ctx),
  })
}
