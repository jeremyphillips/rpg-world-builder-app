import type { ApiValidationIssue } from '../../../shared/api-validation'
import type { ContentValidationIntent } from '../lib/content-validation-intent'
import type { Equipment, EquipmentModifier } from '../equipment'
import { isArmorEquipment, isWeaponEquipment } from '../equipment'

export const MONSTER_CATALOG_ISSUE_CODE = {
  unknownEquipment: 'unknown_equipment',
  weaponActionNotWeapon: 'weapon_action_not_weapon',
  armorClassModifierNotArmor: 'armor_class_modifier_not_armor',
  multipleEquippedBodyArmor: 'multiple_equipped_body_armor',
  equipmentAcMissingBodyArmor: 'equipment_ac_missing_body_armor',
} as const

export type MonsterCatalogIssueCode =
  (typeof MONSTER_CATALOG_ISSUE_CODE)[keyof typeof MONSTER_CATALOG_ISSUE_CODE]

type CatalogEquipmentEntry = {
  entryId?: string
  equipmentId?: string
  equipped?: boolean
  customName?: string
  modifiers?: readonly EquipmentModifier[]
}

type CatalogAction = {
  kind?: string
  equipmentEntryId?: string
}

export type MonsterCatalogIssueBody = {
  armorClass?: { kind?: string }
  equipment?: readonly CatalogEquipmentEntry[]
  actions?: readonly CatalogAction[]
  bonusActions?: readonly CatalogAction[]
  reactions?: readonly CatalogAction[]
}

export type MonsterCatalogs = {
  equipmentById: ReadonlyMap<string, Equipment>
}

const ACTION_SECTIONS = ['actions', 'bonusActions', 'reactions'] as const

function issue(path: string, message: string, code: MonsterCatalogIssueCode): ApiValidationIssue {
  return { path, message, code }
}

function isBodyArmor(item: Equipment): boolean {
  return isArmorEquipment(item) && item.category !== 'shields'
}

function collectEquipmentRowIssues(
  entry: CatalogEquipmentEntry,
  index: number,
  catalogs: MonsterCatalogs,
  issues: ApiValidationIssue[],
  equippedBodyArmor: { index: number; label: string }[],
): void {
  if (!entry.equipmentId) return
  const item = catalogs.equipmentById.get(entry.equipmentId)
  if (!item) {
    issues.push(
      issue(
        `equipment.${index}.equipmentId`,
        'Unknown equipment.',
        MONSTER_CATALOG_ISSUE_CODE.unknownEquipment,
      ),
    )
    return
  }
  if (
    entry.modifiers?.some((modifier) => modifier.kind === 'armor_class') &&
    !isArmorEquipment(item)
  ) {
    issues.push(
      issue(
        `equipment.${index}.modifiers`,
        'Armor Class adjustments are only allowed on armor or shields.',
        MONSTER_CATALOG_ISSUE_CODE.armorClassModifierNotArmor,
      ),
    )
  }
  if (entry.equipped && isBodyArmor(item)) {
    equippedBodyArmor.push({ index, label: itemLabel(entry, item) })
  }
}

function collectBodyArmorConflicts(
  equippedBodyArmor: { index: number; label: string }[],
  issues: ApiValidationIssue[],
): void {
  if (equippedBodyArmor.length < 2) return
  const names = equippedBodyArmor.map((row) => row.label)
  for (const row of equippedBodyArmor.slice(1)) {
    const others = names.filter((name) => name !== row.label)
    const listed = others.length > 0 ? others.join(' or ') : names[0]
    issues.push(
      issue(
        `equipment.${row.index}.equipped`,
        `Only one body armor can be equipped. Unequip ${listed} or ${row.label}.`,
        MONSTER_CATALOG_ISSUE_CODE.multipleEquippedBodyArmor,
      ),
    )
  }
}

function collectWeaponActionIssues(
  body: MonsterCatalogIssueBody,
  equipment: readonly CatalogEquipmentEntry[],
  catalogs: MonsterCatalogs,
  issues: ApiValidationIssue[],
): void {
  for (const section of ACTION_SECTIONS) {
    for (const [index, action] of (body[section] ?? []).entries()) {
      pushWeaponActionIssue(section, index, action, equipment, catalogs, issues)
    }
  }
}

function pushWeaponActionIssue(
  section: (typeof ACTION_SECTIONS)[number],
  index: number,
  action: NonNullable<MonsterCatalogIssueBody['actions']>[number],
  equipment: readonly CatalogEquipmentEntry[],
  catalogs: MonsterCatalogs,
  issues: ApiValidationIssue[],
): void {
  if (action.kind !== 'weapon' || !action.equipmentEntryId) return
  const entry = equipment.find((row) => row.entryId === action.equipmentEntryId)
  if (!entry?.equipmentId) return
  const item = catalogs.equipmentById.get(entry.equipmentId)
  if (!item || isWeaponEquipment(item)) return
  issues.push(
    issue(
      `${section}.${index}.equipmentEntryId`,
      'Weapon action must reference a weapon.',
      MONSTER_CATALOG_ISSUE_CODE.weaponActionNotWeapon,
    ),
  )
}

function itemLabel(entry: CatalogEquipmentEntry, item: Equipment | undefined): string {
  return entry.customName ?? item?.name ?? entry.equipmentId ?? 'item'
}

/**
 * Catalog-aware monster rules. Accepts draft-shaped bodies and never throws
 * on incomplete input. Callers share this collector instead of reimplementing rules.
 */
export function collectMonsterCatalogIssues(
  body: MonsterCatalogIssueBody,
  catalogs: MonsterCatalogs,
  intent: ContentValidationIntent,
): ApiValidationIssue[] {
  const issues: ApiValidationIssue[] = []
  const equipment = body.equipment ?? []
  const equippedBodyArmor: { index: number; label: string }[] = []

  equipment.forEach((entry, index) => {
    collectEquipmentRowIssues(entry, index, catalogs, issues, equippedBodyArmor)
  })
  collectBodyArmorConflicts(equippedBodyArmor, issues)
  collectWeaponActionIssues(body, equipment, catalogs, issues)

  if (
    intent === 'publish' &&
    body.armorClass?.kind === 'equipment' &&
    equippedBodyArmor.length !== 1
  ) {
    issues.push(
      issue(
        'armorClass.kind',
        'Choose and equip body armor to calculate Armor Class.',
        MONSTER_CATALOG_ISSUE_CODE.equipmentAcMissingBodyArmor,
      ),
    )
  }

  return issues
}
