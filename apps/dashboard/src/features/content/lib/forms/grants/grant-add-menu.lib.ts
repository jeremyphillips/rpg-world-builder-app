import type { WeightedSearchField } from '@rpg/ui'

import type { GrantType } from './grant-form-schema'
import {
  GRANT_TEMPLATE_GROUPS,
  getGrantTemplateGroup,
  getGrantTemplatesForTypes,
  resolveGrantTemplateDuplicatePolicy,
  resolveGrantTemplateVocabRef,
  type GrantTemplate,
} from './grant-template-registry'

const VOCAB_LABEL_WEIGHT = 0.8
const VOCAB_DESCRIPTION_WEIGHT = 0.8

export type GrantArrayAddMenuConfig = NonNullable<
  import('@rpg/ui/form').ArrayAddActionConfig['menu']
>

function buildTemplateSearchTerms(template: GrantTemplate): WeightedSearchField[] {
  const fields: WeightedSearchField[] = [
    { text: template.label, weight: 1, role: 'label' },
    { text: template.description, weight: 1, role: 'description' },
    { text: getGrantTemplateGroup(template.groupId).label, weight: 1, role: 'group' },
  ]

  for (const alias of template.search?.aliases ?? []) {
    fields.push({ text: alias, weight: 1, role: 'alias' })
  }
  for (const keyword of template.search?.keywords ?? []) {
    fields.push({ text: keyword, weight: 1, role: 'keyword' })
  }

  for (const ref of template.vocabRefs ?? []) {
    const resolved = resolveGrantTemplateVocabRef(ref)
    fields.push({ text: resolved.label, weight: VOCAB_LABEL_WEIGHT, role: 'label' })
    if (resolved.description) {
      fields.push({
        text: resolved.description,
        weight: VOCAB_DESCRIPTION_WEIGHT,
        role: 'description',
      })
    }
  }

  return fields
}

function buildIsDuplicate(template: GrantTemplate): ((items: unknown[]) => boolean) | undefined {
  const policy = resolveGrantTemplateDuplicatePolicy(template)
  if (policy === 'allow') return undefined

  return (items) =>
    items.some((item) => {
      if (!item || typeof item !== 'object') return false
      return (item as Record<string, unknown>).grantType === template.grantType
    })
}

/** Builds the searchable grant template add menu for a consumer's allowed grant types. */
export function buildGrantArrayAddMenu(grantTypes: readonly GrantType[]): GrantArrayAddMenuConfig {
  const templates = getGrantTemplatesForTypes(grantTypes)
  const groupIds = new Set(templates.map((template) => template.groupId))

  return {
    groups: GRANT_TEMPLATE_GROUPS.filter((group) => groupIds.has(group.id)).map((group) => ({
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
      isDuplicate: buildIsDuplicate(template),
      duplicatePolicy: resolveGrantTemplateDuplicatePolicy(template),
    })),
  }
}
