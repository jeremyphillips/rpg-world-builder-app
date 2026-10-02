import type { NpcTemplateId } from '@rpg/contracts'

import {
  buildNpcTemplateFieldOptions,
  buildNpcTemplateRadioCardOptions,
} from '@/lib/npc-template/npc-template-form-options.lib'

import {
  buildQuickNpcAffinityRadioCardPresentation,
  QUICK_NPC_RECOMMENDED_GROUP_EYEBROW,
} from './quick-npc-affinity-option-groups.lib'

export const QUICK_NPC_NPC_TEMPLATE_FIELD_PROMPT = 'What role should this NPC fill?' as const

export const QUICK_NPC_ROLE_ALL_GROUP_EYEBROW = 'All other roles' as const

/** Canonical NPC role options — labels and descriptions from NPC_TEMPLATE_ENTRIES. */
export function buildNpcTemplateRadioOptions() {
  return buildNpcTemplateRadioCardOptions()
}

export function buildQuickNpcRoleRadioCardPresentation(
  recommendedTemplateId: NpcTemplateId | undefined,
) {
  const fieldOptions = buildNpcTemplateFieldOptions()
  const recommendedIds = recommendedTemplateId ? [recommendedTemplateId] : []

  return buildQuickNpcAffinityRadioCardPresentation({
    options: fieldOptions,
    recommendedIds,
    recommendedGroupEyebrow: QUICK_NPC_RECOMMENDED_GROUP_EYEBROW,
    allOtherGroupEyebrow: QUICK_NPC_ROLE_ALL_GROUP_EYEBROW,
    allOtherGroupId: 'all-roles',
    radioCardOptions: buildNpcTemplateRadioCardOptions(),
  })
}
