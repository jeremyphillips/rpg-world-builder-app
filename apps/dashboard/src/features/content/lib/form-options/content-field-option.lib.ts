import {
  classHasSpellcasting,
  isArmorEquipment,
  isMagicItemBaseEquipment,
  isWeaponEquipment,
  TOOL_CATEGORY_ENTRIES,
  type CharacterClass,
  type ContentSource,
  type ContentTypeKey,
  type ContentPurposeSelectors,
  type Equipment,
  type Feat,
  type SkillProficiency,
  type Spell,
  type ToolEquipment,
} from '@rpg/contracts'
import type { FieldOption } from '@rpg/ui/form'

import { resolveEquipmentFilterValues } from '@/lib/equipment/resolve-equipment-filter-values.lib'

import { shouldPresentContentSource } from '../content-type-presentation'

const HOMEBREW_OPTION_DESCRIPTION = 'Homebrew'

interface ContentOptionEntity {
  slug: string
  name: string
  source: ContentSource
}

/** Maps a catalog entity to a combobox option (slug value, name label). */
export function toContentFieldOption(
  entity: ContentOptionEntity,
  contentType: ContentTypeKey,
): FieldOption {
  return {
    value: entity.slug,
    label: entity.name,
    ...(shouldPresentContentSource(contentType) && entity.source === 'homebrew'
      ? { description: HOMEBREW_OPTION_DESCRIPTION }
      : {}),
  }
}

function sortFieldOptions(options: FieldOption[]): FieldOption[] {
  return [...options].sort((a, b) => a.label.localeCompare(b.label))
}

export function toSortedContentFieldOptions<T extends ContentOptionEntity>(
  entities: readonly T[] | undefined,
  contentType: ContentTypeKey,
): FieldOption[] {
  return sortFieldOptions(
    entities?.map((entity) => toContentFieldOption(entity, contentType)) ?? [],
  )
}

export function referenceClassFieldOptions(
  selectors: ContentPurposeSelectors<CharacterClass> | undefined,
): FieldOption[] {
  return toSortedContentFieldOptions(selectors?.forReference(), 'classes')
}

export function referenceSpellcastingClassFieldOptions(
  selectors: ContentPurposeSelectors<CharacterClass> | undefined,
): FieldOption[] {
  return toSortedContentFieldOptions(
    selectors?.forReference().filter(classHasSpellcasting),
    'classes',
  )
}

export function referenceEquipmentFieldOptions(
  selectors: ContentPurposeSelectors<Equipment> | undefined,
): FieldOption[] {
  return toSortedContentFieldOptions(selectors?.forReference(), 'equipment')
}

export function referenceWeaponFieldOptions(
  selectors: ContentPurposeSelectors<Equipment> | undefined,
): FieldOption[] {
  return sortFieldOptions(
    selectors
      ?.forReference()
      .filter(isWeaponEquipment)
      .map((item) => ({
        ...toContentFieldOption(item, 'equipment'),
        filterValues: resolveEquipmentFilterValues(item),
      })) ?? [],
  )
}

export function referenceArmorFieldOptions(
  selectors: ContentPurposeSelectors<Equipment> | undefined,
): FieldOption[] {
  return sortFieldOptions(
    selectors
      ?.forReference()
      .filter(isArmorEquipment)
      .map((item) => ({
        ...toContentFieldOption(item, 'equipment'),
        filterValues: resolveEquipmentFilterValues(item),
      })) ?? [],
  )
}

export function referenceToolFieldOptions(
  selectors: ContentPurposeSelectors<Equipment> | undefined,
): FieldOption[] {
  return sortFieldOptions(
    selectors
      ?.forReference()
      .filter((item): item is ToolEquipment => item.kind === 'tool')
      .map((item) => ({
        ...toContentFieldOption(item, 'equipment'),
        filterValues: resolveEquipmentFilterValues(item),
        classification: TOOL_CATEGORY_ENTRIES[item.toolCategory].label,
      })) ?? [],
  )
}

export function referenceSkillFieldOptions(
  selectors: ContentPurposeSelectors<SkillProficiency> | undefined,
): FieldOption[] {
  return toSortedContentFieldOptions(selectors?.forReference(), 'skill-proficiencies')
}

export function referenceSpellFieldOptions(
  selectors: ContentPurposeSelectors<Spell> | undefined,
): FieldOption[] {
  return toSortedContentFieldOptions(selectors?.forReference(), 'spells')
}

export function referenceFeatFieldOptions(
  selectors: ContentPurposeSelectors<Feat> | undefined,
): FieldOption[] {
  return toSortedContentFieldOptions(selectors?.forReference(), 'feats')
}

export function referenceMagicItemBaseEquipmentFieldOptions(
  selectors: ContentPurposeSelectors<Equipment> | undefined,
): FieldOption[] {
  return toSortedContentFieldOptions(
    selectors?.forReference().filter(isMagicItemBaseEquipment),
    'equipment',
  )
}
