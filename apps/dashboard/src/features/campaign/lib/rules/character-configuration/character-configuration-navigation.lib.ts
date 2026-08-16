import { collectFormNavigationAnchors, type FormItem } from '@rpg/ui/form'

import {
  buildRulesConfigLayoutFields,
  CHARACTER_CONFIGURATION_SECTIONS,
  type CharacterConfigurationSectionId,
} from './character-configuration-form-fields'

export type RulesConfigNavLeaf = {
  id: string
  label: string
}

export type RulesConfigNavSection = {
  id: string
  label: string
  leaves?: readonly RulesConfigNavLeaf[]
}

export type CharacterConfigurationNavigationOptions = {
  creatureTypeOptions?: Parameters<typeof buildRulesConfigLayoutFields>[0]
  languageOptions?: Parameters<typeof buildRulesConfigLayoutFields>[1]
  languageCategoryOptions?: Parameters<typeof buildRulesConfigLayoutFields>[2]
  armorOptions?: Parameters<typeof buildRulesConfigLayoutFields>[3]
  weaponOptions?: Parameters<typeof buildRulesConfigLayoutFields>[4]
}

function findSectionFields(
  fields: FormItem[],
  sectionId: CharacterConfigurationSectionId,
): FormItem[] {
  const sectionGroup = fields.find(
    (field) => 'kind' in field && field.kind === 'group' && field.id === sectionId,
  )
  if (!sectionGroup || !('fields' in sectionGroup) || !Array.isArray(sectionGroup.fields)) {
    return []
  }
  return sectionGroup.fields as FormItem[]
}

/**
 * Derives hierarchical rules-config navigation from the field registry and layout.
 * Leaf visibility filtering is deferred — initial leaves are always listed even when
 * a block later gains runtime `visibility`; filter at derivation time only if that
 * boundary changes.
 */
export function buildCharacterConfigurationNavigation(
  options: CharacterConfigurationNavigationOptions = {},
): RulesConfigNavSection[] {
  const fields = buildRulesConfigLayoutFields(
    options.creatureTypeOptions ?? [],
    options.languageOptions ?? [],
    options.languageCategoryOptions ?? [],
    options.armorOptions ?? [],
    options.weaponOptions ?? [],
  )

  return CHARACTER_CONFIGURATION_SECTIONS.map((section) => {
    const sectionFields = findSectionFields(fields, section.id)
    const leaves = collectFormNavigationAnchors(sectionFields, { sectionId: section.id }).map(
      (anchor) => ({
        id: anchor.id,
        label: anchor.label,
      }),
    )

    return {
      ...section,
      ...(leaves.length > 0 ? { leaves } : {}),
    }
  })
}
