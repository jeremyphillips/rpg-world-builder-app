import type { WeightedSearchField } from '@rpg/ui'
import type { ArrayConfig } from '@rpg/ui/form'
import type { SpellAtomicEffectKind } from '@rpg/contracts'

import {
  EFFECT_TEMPLATE_GROUPS,
  getEffectTemplateGroup,
  getEffectTemplatesForKinds,
  type EffectTemplate,
} from './effect-template-registry'

export type EffectArrayAddMenuConfig = NonNullable<ArrayConfig['addMenu']>

function buildTemplateSearchTerms(template: EffectTemplate): WeightedSearchField[] {
  const fields: WeightedSearchField[] = [
    { text: template.label, weight: 1, role: 'label' },
    { text: template.description, weight: 1, role: 'description' },
    { text: getEffectTemplateGroup(template.groupId).label, weight: 1, role: 'group' },
  ]

  for (const alias of template.search?.aliases ?? []) {
    fields.push({ text: alias, weight: 1, role: 'alias' })
  }
  for (const keyword of template.search?.keywords ?? []) {
    fields.push({ text: keyword, weight: 1, role: 'keyword' })
  }

  return fields
}

/** Builds the searchable effect template add menu for spell atomic effects. */
export function buildEffectArrayAddMenu(
  kinds?: readonly SpellAtomicEffectKind[],
): EffectArrayAddMenuConfig {
  const templates = getEffectTemplatesForKinds(kinds)
  const groupIds = new Set(templates.map((template) => template.groupId))

  return {
    groups: EFFECT_TEMPLATE_GROUPS.filter((group) => groupIds.has(group.id)).map((group) => ({
      id: group.id,
      label: group.label,
    })),
    items: templates.map((template) => ({
      id: template.id,
      label: template.label,
      description: template.description,
      groupId: template.groupId,
      searchTerms: buildTemplateSearchTerms(template),
      appendDefaults: template.createDefault,
    })),
  }
}
