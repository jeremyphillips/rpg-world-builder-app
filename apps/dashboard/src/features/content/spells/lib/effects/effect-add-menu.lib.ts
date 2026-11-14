import type { ArrayAddActionConfig } from '@rpg/ui/form'
import type { SpellAtomicEffectKind } from '@rpg/contracts'

import { EFFECT_TEMPLATE_GROUPS, getEffectTemplatesForKinds } from './effect-template-registry'

export type EffectArrayAddMenuConfig = NonNullable<ArrayAddActionConfig['menu']>

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
      searchTerms: template.searchTerms,
      aliases: template.aliases,
      search: { includeSupporting: true },
      appendDefaults: template.createDefault,
    })),
  }
}
