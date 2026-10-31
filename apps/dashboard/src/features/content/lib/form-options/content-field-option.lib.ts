import {
  classHasSpellcasting,
  isArmorEquipment,
  isWeaponEquipment,
  TOOL_CATEGORY_ENTRIES,
  type CharacterClass,
  type CatalogLayer,
  type ContentTypeKey,
  type ContentPurposeSelectors,
  type Equipment,
  type Feat,
  type SkillProficiency,
  type Spell,
  type ToolEquipment,
} from '@rpg/contracts'
import type { FieldOption } from '@rpg/ui/form'

import { resolveEquipmentComboboxFilterValues } from '@/lib/equipment/resolve-equipment-grant-filter-dimensions.lib'

import { shouldPresentCatalogLayer } from '../content-type-presentation'

const HOMEBREW_OPTION_DESCRIPTION = 'Homebrew'

interface ContentOptionEntity {
  slug: string
  name: string
  catalogLayer: CatalogLayer
}

/** Maps a catalog entity to a combobox option (slug value, name label). */
export function toContentFieldOption(
  entity: ContentOptionEntity,
  contentType: ContentTypeKey,
): FieldOption {
  return {
    value: entity.slug,
    label: entity.name,
    ...(shouldPresentCatalogLayer(contentType) && entity.catalogLayer === 'homebrew'
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

export function referenceWeaponComboboxFieldOptions(
  selectors: ContentPurposeSelectors<Equipment> | undefined,
): FieldOption[] {
  return sortFieldOptions(
    selectors
      ?.forReference()
      .filter(isWeaponEquipment)
      .map((item) => ({
        ...toContentFieldOption(item, 'equipment'),
        filterValues: resolveEquipmentComboboxFilterValues(item),
      })) ?? [],
  )
}

export function referenceArmorComboboxFieldOptions(
  selectors: ContentPurposeSelectors<Equipment> | undefined,
): FieldOption[] {
  return sortFieldOptions(
    selectors
      ?.forReference()
      .filter(isArmorEquipment)
      .map((item) => ({
        ...toContentFieldOption(item, 'equipment'),
        filterValues: resolveEquipmentComboboxFilterValues(item),
      })) ?? [],
  )
}

export function referenceToolComboboxFieldOptions(
  selectors: ContentPurposeSelectors<Equipment> | undefined,
): FieldOption[] {
  return sortFieldOptions(
    selectors
      ?.forReference()
      .filter((item): item is ToolEquipment => item.kind === 'tool')
      .map((item) => ({
        ...toContentFieldOption(item, 'equipment'),
        filterValues: resolveEquipmentComboboxFilterValues(item),
        classification: TOOL_CATEGORY_ENTRIES[item.toolCategory].label,
      })) ?? [],
  )
}

export function referenceSkillFieldOptions(
  selectors: ContentPurposeSelectors<SkillProficiency> | undefined,
): FieldOption[] {
  return toSortedContentFieldOptions(selectors?.forReference(), 'skill-proficiencies')
}

function toSpellReferenceFieldOption(spell: Spell): FieldOption {
  return {
    value: spell.id,
    label: spell.name,
    ...(shouldPresentCatalogLayer('spells') && spell.catalogLayer === 'homebrew'
      ? { description: HOMEBREW_OPTION_DESCRIPTION }
      : {}),
  }
}

export function referenceSpellFieldOptions(
  selectors: ContentPurposeSelectors<Spell> | undefined,
): FieldOption[] {
  return sortFieldOptions(selectors?.forReference().map(toSpellReferenceFieldOption) ?? [])
}

export function toSpellReferenceFieldOptions(spells: readonly Spell[]): FieldOption[] {
  return sortFieldOptions(spells.map(toSpellReferenceFieldOption))
}

export function referenceFeatFieldOptions(
  selectors: ContentPurposeSelectors<Feat> | undefined,
): FieldOption[] {
  return toSortedContentFieldOptions(selectors?.forReference(), 'feats')
}
