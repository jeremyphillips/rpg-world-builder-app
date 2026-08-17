import {
  classHasSpellcasting,
  isArmorEquipment,
  isMagicItemBaseEquipment,
  isWeaponEquipment,
  type CharacterClass,
  type ContentSource,
  type ContentTypeKey,
  type ContentPurposeSelectors,
  type Equipment,
  type Feat,
  type SkillProficiency,
  type Spell,
} from '@rpg/contracts'
import type { FieldOption } from '@rpg/ui/form'

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
  return toSortedContentFieldOptions(
    selectors?.forReference().filter(isWeaponEquipment),
    'equipment',
  )
}

export function referenceArmorFieldOptions(
  selectors: ContentPurposeSelectors<Equipment> | undefined,
): FieldOption[] {
  return toSortedContentFieldOptions(
    selectors?.forReference().filter(isArmorEquipment),
    'equipment',
  )
}

export function referenceToolFieldOptions(
  selectors: ContentPurposeSelectors<Equipment> | undefined,
): FieldOption[] {
  return toSortedContentFieldOptions(
    selectors?.forReference().filter((item) => item.kind === 'tool'),
    'equipment',
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
