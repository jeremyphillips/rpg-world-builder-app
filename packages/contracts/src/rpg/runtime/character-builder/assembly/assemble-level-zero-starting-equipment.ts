import {
  LEVEL_ZERO_NPC_DEFAULT_WEALTH_TIER,
  resolveLevelZeroNpcWealthTierPurse,
} from '../../../campaign/patches/campaign-level-zero-npcs-patch'
import { toEquipmentContentId } from '../../creature/equipment'
import {
  appendEquipmentEntry,
  characterWealthFromGrant,
  EMPTY_CHARACTER_EQUIPMENT,
  type CharacterEquipment,
  type CharacterWealth,
} from '../../character/sheet/equipment-inventory'
import type { CharacterSelectionSource } from '../../character/sheet/selection-sources'
import type { ResolvedCampaignLevelZeroNpcsPatch } from '../../../campaign/patches/campaign-level-zero-npcs-patch'
import type { SystemRulesetId } from '../../../primitives/ruleset'
import type { CharacterBuildCatalogIndex } from '../context'
import type { CharacterBuilderDraft } from '../draft/draft'
import { npcTemplateToolChoiceSetId } from '../resolvers/npc-template/resolve-npc-template-role-choices'
import {
  getNpcTemplateEntry,
  resolveNpcTemplateRoleChoiceCounts,
} from '../../../vocab/npc/npc-template'

function npcTemplateSource(templateId: string, grantId: string): CharacterSelectionSource[] {
  return [{ kind: 'npcTemplate', sourceId: templateId, grantId }]
}

function appendResolvedEquipment(args: {
  inventory: CharacterEquipment
  catalogIndex: CharacterBuildCatalogIndex
  rulesetId: string
  slugOrId: string
  quantity: number
  sources: CharacterSelectionSource[]
}): CharacterEquipment {
  const equipmentId = toEquipmentContentId(args.rulesetId, args.slugOrId)
  const equipment = args.catalogIndex.equipment.get(equipmentId)
  if (!equipment) return args.inventory
  return appendEquipmentEntry(args.inventory, equipment, {
    equipmentId: equipment.id,
    quantity: args.quantity,
    sources: args.sources,
  })
}

function appendTemplateEquipment(
  inventory: CharacterEquipment,
  draft: CharacterBuilderDraft,
  options: {
    rulesetId: string
    catalogIndex: CharacterBuildCatalogIndex
  },
): CharacterEquipment {
  const templateId = draft.npcTemplateId
  const levelZero = templateId ? getNpcTemplateEntry(templateId)?.levelZero : undefined
  if (!templateId || !levelZero) return inventory

  let next = inventory
  const kitSources = npcTemplateSource(templateId, 'kit')
  for (const item of levelZero.kit) {
    next = appendResolvedEquipment({
      inventory: next,
      catalogIndex: options.catalogIndex,
      rulesetId: options.rulesetId,
      slugOrId: item.slug,
      quantity: item.quantity ?? 1,
      sources: kitSources,
    })
  }

  const { toolCount } = resolveNpcTemplateRoleChoiceCounts(levelZero.roleChoices)
  if (toolCount !== 1) return next

  const toolChoiceId = npcTemplateToolChoiceSetId(templateId)
  const selectedToolId = draft.choiceSelections[toolChoiceId]?.[0]
  if (!selectedToolId) return next

  return appendResolvedEquipment({
    inventory: next,
    catalogIndex: options.catalogIndex,
    rulesetId: options.rulesetId,
    slugOrId: selectedToolId,
    quantity: 1,
    sources: npcTemplateSource(templateId, toolChoiceId),
  })
}

function appendDraftEquipmentGrants(
  inventory: CharacterEquipment,
  draft: CharacterBuilderDraft,
  options: {
    rulesetId: string
    catalogIndex: CharacterBuildCatalogIndex
  },
): CharacterEquipment {
  let next = inventory
  for (const grant of draft.equipment?.grants ?? []) {
    next = appendResolvedEquipment({
      inventory: next,
      catalogIndex: options.catalogIndex,
      rulesetId: options.rulesetId,
      slugOrId: grant.equipmentId,
      quantity: grant.quantity,
      sources: [{ kind: 'grant' }],
    })
  }
  return next
}

/**
 * Classless level-0 inventory and purse. Adds the template kit, the picked role
 * tool when the template grants one tool choice, and draft equipment grants.
 * Templateless NPCs receive the modest purse and no kit.
 */
export function assembleLevelZeroStartingEquipment(
  draft: CharacterBuilderDraft,
  options: {
    rulesetId: SystemRulesetId
    levelZeroRules: Pick<ResolvedCampaignLevelZeroNpcsPatch, 'wealthTiers'>
    catalogIndex: CharacterBuildCatalogIndex
  },
): { equipment: CharacterEquipment; wealth: CharacterWealth } {
  const { catalogIndex } = options
  const templateId = draft.npcTemplateId
  const entry = templateId ? getNpcTemplateEntry(templateId) : undefined
  const levelZero = entry?.levelZero
  const tierId = levelZero?.wealthTier ?? LEVEL_ZERO_NPC_DEFAULT_WEALTH_TIER
  const purse = resolveLevelZeroNpcWealthTierPurse(options.levelZeroRules.wealthTiers, tierId)

  const rulesetId = options.rulesetId
  const withKit = appendTemplateEquipment(EMPTY_CHARACTER_EQUIPMENT, draft, {
    rulesetId,
    catalogIndex,
  })
  const equipment = appendDraftEquipmentGrants(withKit, draft, { rulesetId, catalogIndex })

  return {
    equipment,
    wealth: characterWealthFromGrant(purse),
  }
}
