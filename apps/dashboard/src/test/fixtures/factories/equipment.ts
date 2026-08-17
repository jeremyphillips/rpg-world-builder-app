import type { Equipment, EquipmentKind } from '@rpg/contracts'

import { syntheticContentId, syntheticContentMeta } from './shared-content-meta'

export type EquipmentOverrides = Partial<Equipment> & { kind?: EquipmentKind }

const sharedEquipmentBody = {
  ...syntheticContentMeta,
  description: '<p>Synthetic test equipment.</p>',
  cost: { amount: 1, currency: 'gp' as const },
}

function weaponBase(): Equipment {
  return {
    ...sharedEquipmentBody,
    id: syntheticContentId('test-weapon'),
    slug: 'test-weapon',
    name: 'Test Weapon',
    kind: 'weapon',
    category: 'simple',
    mode: 'melee',
    damage: { dice: { count: 1, faces: 6 } },
    damageType: 'slashing',
    properties: [],
    mastery: 'sap',
    weight: { value: 2, unit: 'lb' },
  } satisfies Equipment
}

function armorBase(): Equipment {
  return {
    ...sharedEquipmentBody,
    id: syntheticContentId('test-armor'),
    slug: 'test-armor',
    name: 'Test Armor',
    kind: 'armor',
    category: 'light',
    baseAc: 11,
    addDexModifier: true,
    stealthDisadvantage: false,
    weight: { value: 10, unit: 'lb' },
  } satisfies Equipment
}

function adventuringGearBase(): Equipment {
  return {
    ...sharedEquipmentBody,
    id: syntheticContentId('test-gear'),
    slug: 'test-gear',
    name: 'Test Gear',
    kind: 'adventuring_gear',
    gearKind: 'general',
    weight: { value: 1, unit: 'lb' },
  } satisfies Equipment
}

function toolBase(): Equipment {
  return {
    ...sharedEquipmentBody,
    id: syntheticContentId('test-tool'),
    slug: 'test-tool',
    name: 'Test Tool',
    kind: 'tool',
    toolCategory: 'artisan',
    ability: 'dex',
    utilizes: [{ description: 'Perform a synthetic test tool check', dc: 10 }],
    weight: { value: 3, unit: 'lb' },
  } satisfies Equipment
}

function mountBase(): Equipment {
  return {
    ...sharedEquipmentBody,
    id: syntheticContentId('test-mount'),
    slug: 'test-mount',
    name: 'Test Mount',
    kind: 'mount',
    carryingCapacity: { value: 480, unit: 'lb' },
    speed: { value: 60, unit: 'ft' },
  } satisfies Equipment
}

function vehicleBase(): Equipment {
  return {
    ...sharedEquipmentBody,
    id: syntheticContentId('test-vehicle'),
    slug: 'test-vehicle',
    name: 'Test Vehicle',
    kind: 'vehicle',
    vehicleCategory: 'water',
    speed: { value: 3, unit: 'mph' },
  } satisfies Equipment
}

function serviceBase(): Equipment {
  return {
    ...sharedEquipmentBody,
    id: syntheticContentId('test-service'),
    slug: 'test-service',
    name: 'Test Service',
    kind: 'service',
    serviceCategory: 'hireling',
  } satisfies Equipment
}

function magicItemBase(): Equipment {
  return {
    ...sharedEquipmentBody,
    id: syntheticContentId('test-magic-item'),
    slug: 'test-magic-item',
    name: 'Test Magic Item',
    kind: 'magic_item',
    rarity: 'common',
    weight: { value: 0.5, unit: 'lb' },
  } satisfies Equipment
}

function defaultBaseForKind(kind: EquipmentKind): Equipment {
  switch (kind) {
    case 'weapon':
      return weaponBase()
    case 'armor':
      return armorBase()
    case 'adventuring_gear':
      return adventuringGearBase()
    case 'tool':
      return toolBase()
    case 'mount':
      return mountBase()
    case 'vehicle':
      return vehicleBase()
    case 'service':
      return serviceBase()
    case 'magic_item':
      return magicItemBase()
    default:
      return weaponBase()
  }
}

export function makeEquipment(overrides: EquipmentOverrides = {}): Equipment {
  const kind = overrides.kind ?? 'weapon'
  const base = defaultBaseForKind(kind)
  const slug = overrides.slug ?? base.slug

  return {
    ...base,
    ...overrides,
    kind,
    id: overrides.id ?? syntheticContentId(slug),
    slug,
    name: overrides.name ?? base.name,
  } as Equipment
}
