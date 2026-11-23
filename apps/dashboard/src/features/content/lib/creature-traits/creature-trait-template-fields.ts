import { CREATURE_TRAIT_TEMPLATE_IDS, getCreatureTraitTemplate } from '@rpg/contracts'
import type { FieldVisibility, FormItem } from '@rpg/ui/form'

import { assembleCreatureTraitTemplateFields } from './creature-trait-template-field-assembler'

function visibleForTemplateId(templateId: string): FieldVisibility {
  return {
    dependsOn: ['kind', 'templateId'],
    visibleWhen: (watched) =>
      watched['kind'] === 'template' && watched['templateId'] === templateId,
  }
}

/** Config fields for a `kind: 'template'` species trait row. */
export function creatureTraitTemplateFields(): FormItem[] {
  return CREATURE_TRAIT_TEMPLATE_IDS.flatMap((templateId) => {
    const template = getCreatureTraitTemplate(templateId)
    if (!template) return []
    return [
      {
        kind: 'group' as const,
        heading: {
          label: template.label,
          labelVisibility: 'srOnly' as const,
        },
        visibility: visibleForTemplateId(templateId),
        fields: assembleCreatureTraitTemplateFields({
          templateId,
          host: 'species',
          visibility: visibleForTemplateId(templateId),
        }),
      },
    ]
  })
}
