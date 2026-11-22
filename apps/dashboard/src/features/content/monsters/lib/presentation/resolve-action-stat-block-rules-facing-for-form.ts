import {
  availableBodyRows,
  deriveMonsterStatBlock,
  monsterActionSectionRows,
  type Monster,
  type MonsterAction,
  type MonsterBonusAction,
  type MonsterLegendaryAction,
  type MonsterReaction,
} from '@rpg/contracts'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import type { MonsterActionSection } from '../actions/references/monster-action-equipment-references'
import {
  monsterArmorClassRules,
  monsterEquipmentCatalog,
  monsterMagicPropertyProvider,
  monsterSkillCatalog,
} from '../monster-form-derivation'
import type { MonsterFormValues } from '../monster-form-values'
import { normalizeMonsterDraftForPreview } from '../normalize-monster-form-values'

import {
  actionReferenceHeadings,
  buildSpellDisplayContext,
  resolveActionStatBlockRulesFacing,
  type MonsterActionRulesFacing,
} from './resolve-action-stat-block-rules-facing'

type PublishedAction = MonsterAction | MonsterBonusAction | MonsterReaction | MonsterLegendaryAction

function sectionRows(monster: Monster, section: MonsterActionSection): PublishedAction[] {
  if (section === 'legendaryActions') {
    return availableBodyRows(
      monsterActionSectionRows<MonsterLegendaryAction>(monster, 'legendaryActions'),
    )
  }
  return availableBodyRows(monster[section] as PublishedAction[])
}

function derivedSection(
  section: MonsterActionSection,
): 'actions' | 'bonusActions' | 'reactions' | 'legendaryActions' {
  return section
}

export function tryResolveActionStatBlockRulesFacingForForm(input: {
  values: MonsterFormValues
  ctx: ContentFormCtx
  actionId: string
  section: MonsterActionSection
}): MonsterActionRulesFacing | null {
  if (input.ctx.equipmentCatalogStatus !== 'ready') return null
  const armorClassRules = monsterArmorClassRules(input.ctx)
  if (!armorClassRules) return null

  const normalized = normalizeMonsterDraftForPreview(input.values, {
    intent: 'draft',
    mode: 'create',
    armorClassRules,
  })

  let derived
  try {
    derived = deriveMonsterStatBlock({
      monster: normalized,
      equipmentCatalog: monsterEquipmentCatalog(input.ctx),
      skillCatalog: monsterSkillCatalog(input.ctx),
      armorClassRules,
      magicPropertyProvider: monsterMagicPropertyProvider(input.ctx),
    })
  } catch {
    return null
  }

  const action = sectionRows(normalized, input.section).find((row) => row.id === input.actionId)
  if (!action) return null

  const catalogState = 'ready' as const
  const spellContext = buildSpellDisplayContext({
    monster: normalized,
    equipmentById: monsterEquipmentCatalog(input.ctx),
    catalogState,
    spellsById: input.ctx.spellCatalogById,
    spellCatalogStatus: input.ctx.spellCatalogStatus === 'ready' ? 'ready' : 'unavailable',
    magicPropertyProvider: monsterMagicPropertyProvider(input.ctx),
  })

  const headings = actionReferenceHeadings(sectionRows(normalized, input.section), spellContext)

  return resolveActionStatBlockRulesFacing(
    action,
    derivedSection(input.section),
    derived,
    catalogState,
    spellContext,
    headings,
  )
}
