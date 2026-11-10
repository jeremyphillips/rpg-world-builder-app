import { createGrantRowId } from '@rpg/contracts'
import type { ArrayAddActionConfig } from '@rpg/ui/form'

import type { GrantType } from './grant-form-schema'
import {
  GRANT_TEMPLATE_GROUPS,
  getGrantTemplatesForTypes,
  resolveGrantTemplateDuplicatePolicy,
  resolveGrantTemplateVocabRef,
  type GrantTemplate,
} from './grant-template-registry'

export type GrantArrayAddMenuConfig = NonNullable<ArrayAddActionConfig['menu']>

function collectGrantTemplateSearchTerms(template: GrantTemplate): readonly string[] {
  const terms = [...(template.searchTerms ?? [])]
  for (const ref of template.vocabRefs ?? []) {
    const resolved = resolveGrantTemplateVocabRef(ref)
    terms.push(resolved.label)
    if (resolved.description) terms.push(resolved.description)
  }
  return terms
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
      searchTerms: collectGrantTemplateSearchTerms(template),
      aliases: template.aliases,
      search: { includeSupporting: true },
      appendDefaults: () => ({ id: createGrantRowId(), ...template.createDefault() }),
      isDuplicate: buildIsDuplicate(template),
      duplicatePolicy: resolveGrantTemplateDuplicatePolicy(template),
    })),
  }
}
