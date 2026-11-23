import {
  CREATURE_TRAIT_TEMPLATE_IDS,
  defaultCreatureTraitTemplateConfig,
  getCreatureTraitTemplate,
  isSenseCreatureTraitTemplateId,
} from '@rpg/contracts'
import type { FieldVisibility, FormItem } from '@rpg/ui/form'

import { legendaryResistanceTemplateUseFields } from './legendary-resistance-trait-fields'
import { senseTraitTemplateFields } from './sense-trait-template-fields'

function visibleForTemplate(): FieldVisibility {
  return {
    dependsOn: ['kind'],
    visibleWhen: (watched) => watched['kind'] === 'template',
  }
}

function visibleForTemplateId(templateId: string): FieldVisibility {
  return {
    dependsOn: ['kind', 'templateId'],
    visibleWhen: (watched) =>
      watched['kind'] === 'template' && watched['templateId'] === templateId,
  }
}

function visibleForTemplateOverrides(): FieldVisibility {
  return {
    dependsOn: ['kind', 'overrideDisplay', 'templateId'],
    visibleWhen: (watched) =>
      watched['kind'] === 'template' &&
      watched['overrideDisplay'] === true &&
      (typeof watched['templateId'] !== 'string' ||
        !isSenseCreatureTraitTemplateId(watched['templateId'])),
  }
}

function visibleForNonSenseTemplateOverrides(): FieldVisibility {
  return {
    dependsOn: ['kind', 'templateId'],
    visibleWhen: (watched) =>
      watched['kind'] === 'template' &&
      (typeof watched['templateId'] !== 'string' ||
        !isSenseCreatureTraitTemplateId(watched['templateId'])),
  }
}

/** Config and display-override fields for a `kind: 'template'` trait row. */
export function creatureTraitTemplateFields(): FormItem[] {
  const descriptions = CREATURE_TRAIT_TEMPLATE_IDS.flatMap((templateId) => {
    const template = getCreatureTraitTemplate(templateId)
    if (!template) return []
    const config = defaultCreatureTraitTemplateConfig(templateId) ?? {}
    return [
      {
        kind: 'group' as const,
        heading: {
          label: template.label,
          hint: template.formatDescription(config),
          labelVisibility: 'srOnly' as const,
        },
        visibility: visibleForTemplateId(templateId),
        fields: [
          ...(isSenseCreatureTraitTemplateId(templateId) ? senseTraitTemplateFields() : []),
          ...(templateId === 'legendary-resistance'
            ? legendaryResistanceTemplateUseFields({ includeInLair: false })
            : []),
        ],
      },
    ]
  })

  return [
    ...descriptions,
    {
      type: 'switch',
      name: 'overrideDisplay',
      label: 'Override generated name and description',
      visibility: visibleForNonSenseTemplateOverrides(),
    },
    {
      type: 'richtext',
      name: 'descriptionOverride',
      label: 'Description',
      hint: 'Leave blank to use the default',
      visibility: visibleForTemplateOverrides(),
    },
  ]
}
