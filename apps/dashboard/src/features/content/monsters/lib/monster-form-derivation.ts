import { createMagicPropertyDefinitionProvider } from '@rpg/catalog/magic-properties'
import {
  deriveMonsterDraftStatBlock,
  type ArmorClassRules,
  type DerivedMonsterDraftStatBlock,
  type Equipment,
  type MagicPropertyDefinitionProvider,
  type SkillProficiency,
  type SystemRulesetId,
} from '@rpg/contracts'

import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import type { MonsterFormValues } from './monster-form-values'
import { normalizeMonsterFormValues } from './normalize-monster-form-values'

export function monsterArmorClassRules(ctx: ContentFormCtx): ArmorClassRules | undefined {
  return ctx.armorClassRules
}

export function monsterMagicPropertyProvider(ctx: ContentFormCtx): MagicPropertyDefinitionProvider {
  const rulesetId = (ctx.rulesetId ?? 'srd-cc-5.2.1') as SystemRulesetId
  return createMagicPropertyDefinitionProvider(rulesetId)
}

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
  const armorClassRules = monsterArmorClassRules(ctx)
  if (!armorClassRules) return null
  const normalized = normalizeMonsterFormValues(values, {
    intent: 'draft',
    mode: 'create',
    armorClassRules,
  })
  return deriveMonsterDraftStatBlock({
    monster: normalized,
    equipmentCatalog: monsterEquipmentCatalog(ctx),
    skillCatalog: monsterSkillCatalog(ctx),
    armorClassRules,
    magicPropertyProvider: monsterMagicPropertyProvider(ctx),
  })
}
