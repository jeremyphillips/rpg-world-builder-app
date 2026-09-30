import type { ChoiceSet } from '../../choice-set'
import { buildChoiceSetId } from '../../choice-set'
import type { ChoiceSourceResolver } from '../registry/choice-source-resolver'
import { isBuilderLevelZeroClassless } from '../../progression/character-level-policy'
import { resolveToolPoolChoiceOptions } from '../proficiency/resolve-tool-pool-choice-options'
import type { CharacterBuildCatalogIndex } from '../../context'
import {
  getNpcTemplateEntry,
  resolveNpcTemplateRoleChoiceCounts,
  type NpcTemplateId,
} from '../../../../vocab/npc/npc-template'

export const NPC_TEMPLATE_SKILL_CHOICE_SLOT = 'skills' as const
export const NPC_TEMPLATE_TOOL_CHOICE_SLOT = 'tools' as const

export function npcTemplateSkillChoiceSetId(templateId: string): string {
  return buildChoiceSetId('npcTemplate', templateId, NPC_TEMPLATE_SKILL_CHOICE_SLOT)
}

export function npcTemplateToolChoiceSetId(templateId: string): string {
  return buildChoiceSetId('npcTemplate', templateId, NPC_TEMPLATE_TOOL_CHOICE_SLOT)
}

function anySkillOptions(
  catalogIndex: CharacterBuildCatalogIndex,
  rulesetId: string,
): ChoiceSet['options'] {
  return [...catalogIndex.skillProficiencies.values()]
    .filter((skill) => skill.rulesetId === rulesetId)
    .sort((left, right) => left.slug.localeCompare(right.slug))
    .map((skill) => ({ id: skill.id, label: skill.name }))
}

function roleChoiceSet(args: {
  templateId: NpcTemplateId
  templateLabel: string
  slot: typeof NPC_TEMPLATE_SKILL_CHOICE_SLOT | typeof NPC_TEMPLATE_TOOL_CHOICE_SLOT
  choiceType: 'skillProficiency' | 'toolProficiency'
  count: number
  options: ChoiceSet['options']
  label: string
}): ChoiceSet | undefined {
  if (args.count <= 0 || args.options.length < args.count) return undefined
  return {
    id: buildChoiceSetId('npcTemplate', args.templateId, args.slot),
    sourceType: 'npcTemplate',
    sourceId: args.templateId,
    choiceType: args.choiceType,
    min: args.count,
    max: args.count,
    options: args.options,
    required: true,
    poolSource: 'any',
    provenance: {
      ownerKind: 'npcTemplate',
      ownerLabel: args.templateLabel,
      choiceLabel: args.label,
    },
    label: args.label,
  }
}

/**
 * Level-0 role choices for the selected template. Zero counts produce no set.
 * Classed characters never receive these sets.
 */
export const resolveNpcTemplateRoleChoices: ChoiceSourceResolver = (
  draft,
  context,
  catalogIndex,
) => {
  if (!isBuilderLevelZeroClassless(draft, context)) return []
  const templateId = draft.npcTemplateId
  if (!templateId) return []

  const entry = getNpcTemplateEntry(templateId)
  if (!entry?.levelZero) return []

  const { skillCount, toolCount } = resolveNpcTemplateRoleChoiceCounts(entry.levelZero.roleChoices)
  const sets: ChoiceSet[] = []

  const skills = roleChoiceSet({
    templateId,
    templateLabel: entry.label,
    slot: NPC_TEMPLATE_SKILL_CHOICE_SLOT,
    choiceType: 'skillProficiency',
    count: skillCount,
    options: anySkillOptions(catalogIndex, context.rulesetId),
    label: skillCount === 1 ? 'Choose 1 role skill' : `Choose ${skillCount} role skills`,
  })
  if (skills) sets.push(skills)

  const tools = roleChoiceSet({
    templateId,
    templateLabel: entry.label,
    slot: NPC_TEMPLATE_TOOL_CHOICE_SLOT,
    choiceType: 'toolProficiency',
    count: toolCount,
    options: resolveToolPoolChoiceOptions(
      { source: 'any' },
      catalogIndex.equipment,
      context.rulesetId,
    ),
    label: 'Choose 1 role tool',
  })
  if (tools) sets.push(tools)

  return sets
}
