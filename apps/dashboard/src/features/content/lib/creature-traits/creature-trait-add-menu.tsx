/* eslint-disable react-refresh/only-export-components -- add-menu config helpers ship with the menu component */
import { defaultCreatureTraitTemplateConfig } from '@rpg/contracts'

export function creatureTraitTemplateRow(templateId: string, id: string): Record<string, unknown> {
  const config = defaultCreatureTraitTemplateConfig(templateId)
  return {
    id,
    kind: 'template',
    templateId,
    ...(config ? { config } : {}),
  }
}

export const CREATURE_TRAIT_CUSTOM_ITEM_ID = 'custom'
