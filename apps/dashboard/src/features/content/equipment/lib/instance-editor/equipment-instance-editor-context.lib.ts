import {
  getArmorCategorySummaryLabel,
  getGearKindLabel,
  getMagicItemCategoryLabel,
  getMagicItemRarityLabel,
  getServiceCategoryLabel,
  getToolCategoryLabel,
  getVehicleCategoryLabel,
  getWeaponCategorySummaryLabel,
  getWeaponModeLabel,
  type Equipment,
} from '@rpg/contracts'

function optionalLabel<T>(
  value: T | undefined | null,
  label: (value: T) => string,
): readonly string[] {
  return value != null && value !== '' ? [label(value)] : []
}

function buildWeaponContextMetadata(
  catalogItem: Extract<Equipment, { kind: 'weapon' }>,
): readonly string[] {
  const segments: string[] = []
  if (catalogItem.category) {
    segments.push(getWeaponCategorySummaryLabel(catalogItem.category))
  }
  if (catalogItem.mode) {
    segments.push(getWeaponModeLabel(catalogItem.mode))
  }
  return segments
}

function buildMagicItemContextMetadata(
  catalogItem: Extract<Equipment, { kind: 'magic_item' }>,
): readonly string[] {
  const segments: string[] = []
  if (catalogItem.magicItemCategory) {
    segments.push(getMagicItemCategoryLabel(catalogItem.magicItemCategory))
  }
  if (catalogItem.rarity) {
    segments.push(getMagicItemRarityLabel(catalogItem.rarity))
  }
  return segments
}

type EquipmentContextMetadataBuilder = (catalogItem: Equipment) => readonly string[]

const EQUIPMENT_CONTEXT_METADATA_BY_KIND: Record<
  Equipment['kind'],
  EquipmentContextMetadataBuilder
> = {
  weapon: (catalogItem) =>
    buildWeaponContextMetadata(catalogItem as Extract<Equipment, { kind: 'weapon' }>),
  armor: (catalogItem) =>
    optionalLabel(
      (catalogItem as Extract<Equipment, { kind: 'armor' }>).category,
      getArmorCategorySummaryLabel,
    ),
  tool: (catalogItem) =>
    optionalLabel(
      (catalogItem as Extract<Equipment, { kind: 'tool' }>).toolCategory,
      getToolCategoryLabel,
    ),
  adventuring_gear: (catalogItem) =>
    optionalLabel(
      (catalogItem as Extract<Equipment, { kind: 'adventuring_gear' }>).gearKind,
      getGearKindLabel,
    ),
  vehicle: (catalogItem) =>
    optionalLabel(
      (catalogItem as Extract<Equipment, { kind: 'vehicle' }>).vehicleCategory,
      getVehicleCategoryLabel,
    ),
  service: (catalogItem) =>
    optionalLabel(
      (catalogItem as Extract<Equipment, { kind: 'service' }>).serviceCategory,
      getServiceCategoryLabel,
    ),
  magic_item: (catalogItem) =>
    buildMagicItemContextMetadata(catalogItem as Extract<Equipment, { kind: 'magic_item' }>),
  mount: () => [],
}

export function buildEquipmentInstanceEditorContextMetadata(
  catalogItem: Equipment,
): readonly string[] {
  return EQUIPMENT_CONTEXT_METADATA_BY_KIND[catalogItem.kind](catalogItem)
}
