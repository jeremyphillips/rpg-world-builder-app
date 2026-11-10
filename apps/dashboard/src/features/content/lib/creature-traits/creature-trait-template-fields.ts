import {
  CREATURE_TRAIT_TEMPLATE_IDS,
  defaultCreatureTraitTemplateConfig,
  getCreatureTraitTemplate,
} from '@rpg/contracts'
import type { FieldVisibility, FormItem } from '@rpg/ui/form'

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
    dependsOn: ['kind', 'overrideDisplay'],
    visibleWhen: (watched) => watched['kind'] === 'template' && watched['overrideDisplay'] === true,
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
        description: template.formatDescription(config),
        visibility: visibleForTemplateId(templateId),
        fields: [
          ...(templateId === 'legendary-resistance'
            ? [
                {
                  type: 'number' as const,
                  name: 'config.uses',
                  label: 'Uses',
                  min: 1,
                  required: true,
                  hint: 'Printed on the trait name as N/Day after a long rest.',
                },
              ]
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
      visibility: visibleForTemplate(),
    },
    {
      type: 'text',
      name: 'nameOverride',
      label: 'Name',
      placeholder: 'Leave blank to use the default',
      visibility: visibleForTemplateOverrides(),
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
