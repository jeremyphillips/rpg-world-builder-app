import type { ApiValidationIssue } from '../../../shared/api-validation'
import type { ContentValidationIntent } from '../lib/content-validation-intent'
import type { Equipment, EquipmentInstance } from '../equipment'
import { isArmorEquipment, isWeaponEquipment } from '../equipment'
import type { MagicPropertyDefinitionProvider } from '../equipment/magic-property'
import { normalizeEquipmentInstance } from '../equipment/normalize-equipment-instance'
import { validateEquipmentMagicProperties } from '../equipment/validate-equipment-magic-properties'
import type { SkillProficiency } from '../skill-proficiency'
import {
  isContentCampaignEligible,
  isContentReferenceable,
} from '../../runtime/campaign/content-resolution-policy'

export const MONSTER_CATALOG_ISSUE_CODE = {
  unknownEquipment: 'unknown_equipment',
  weaponActionNotWeapon: 'weapon_action_not_weapon',
  armorClassModifierNotArmor: 'armor_class_modifier_not_armor',
  multipleEquippedBodyArmor: 'multiple_equipped_body_armor',
  equipmentAcMissingBodyArmor: 'equipment_ac_missing_body_armor',
  equipmentCatalogUnavailable: 'equipment_catalog_unavailable',
  unknownSkill: 'unknown_skill',
  skillNotReferenceable: 'skill_not_referenceable',
  skillNotCampaignEligible: 'skill_not_campaign_eligible',
  skillCatalogUnavailable: 'skill_catalog_unavailable',
} as const

export type MonsterCatalogIssueCode =
  (typeof MONSTER_CATALOG_ISSUE_CODE)[keyof typeof MONSTER_CATALOG_ISSUE_CODE]

export type MonsterCatalogLoadStatus = 'ready' | 'unavailable'

type CatalogEquipmentEntry = EquipmentInstance & {
  entryId?: string
}

type CatalogAction = {
  kind?: string
  equipmentEntryId?: string
}

type CatalogSkillEntry = {
  skill?: string
}

export type MonsterCatalogIssueBody = {
  armorClass?: { kind?: string }
  equipment?: readonly CatalogEquipmentEntry[]
  actions?: readonly CatalogAction[]
  bonusActions?: readonly CatalogAction[]
  reactions?: readonly CatalogAction[]
  proficiencies?: {
    skills?: readonly CatalogSkillEntry[]
  }
}

export type MonsterCatalogs = {
  equipmentById: ReadonlyMap<string, Equipment>
  skillBySlug: ReadonlyMap<string, SkillProficiency>
  equipmentCatalog?: MonsterCatalogLoadStatus
  skillCatalog?: MonsterCatalogLoadStatus
  magicPropertyProvider?: MagicPropertyDefinitionProvider
}

const ACTION_SECTIONS = ['actions', 'bonusActions', 'reactions'] as const

function issue(path: string, message: string, code: MonsterCatalogIssueCode): ApiValidationIssue {
  return { path, message, code }
}

function catalogStatus(status: MonsterCatalogLoadStatus | undefined): MonsterCatalogLoadStatus {
  return status ?? 'ready'
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
  const normalized = normalizeEquipmentInstance(entry as EquipmentInstance)
  const hasAcEffect = (normalized.mechanicalEffects ?? []).some(
    (effect) => effect.target === 'armor_class',
  )
  if (hasAcEffect && !isArmorEquipment(item)) {
    issues.push(
      issue(
        `equipment.${index}.mechanicalEffects`,
        'Armor Class adjustments are only allowed on armor or shields.',
        MONSTER_CATALOG_ISSUE_CODE.armorClassModifierNotArmor,
      ),
    )
  }
  const provider = catalogs.magicPropertyProvider ?? (() => undefined)
  issues.push(
    ...validateEquipmentMagicProperties({
      entry: normalized,
      item,
      provider,
      pathPrefix: `equipment.${index}`,
    }),
  )
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

function collectSkillIssues(
  body: MonsterCatalogIssueBody,
  catalogs: MonsterCatalogs,
  issues: ApiValidationIssue[],
): void {
  if (catalogStatus(catalogs.skillCatalog) === 'unavailable') {
    issues.push(
      issue(
        'proficiencies.skills',
        'Skills could not be loaded. Try again before publishing.',
        MONSTER_CATALOG_ISSUE_CODE.skillCatalogUnavailable,
      ),
    )
    return
  }

  for (const [index, row] of (body.proficiencies?.skills ?? []).entries()) {
    if (!row.skill) continue
    const skill = catalogs.skillBySlug.get(row.skill)
    if (!skill) {
      issues.push(
        issue(
          `proficiencies.skills.${index}.skill`,
          'Unknown skill.',
          MONSTER_CATALOG_ISSUE_CODE.unknownSkill,
        ),
      )
      continue
    }
    if (!isContentReferenceable(skill)) {
      issues.push(
        issue(
          `proficiencies.skills.${index}.skill`,
          'Publish this skill before using it on a monster.',
          MONSTER_CATALOG_ISSUE_CODE.skillNotReferenceable,
        ),
      )
      continue
    }
    if (!isContentCampaignEligible(skill)) {
      issues.push(
        issue(
          `proficiencies.skills.${index}.skill`,
          'This skill is not available in this campaign.',
          MONSTER_CATALOG_ISSUE_CODE.skillNotCampaignEligible,
        ),
      )
    }
  }
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
  const equipmentReady = catalogStatus(catalogs.equipmentCatalog) === 'ready'

  if (intent === 'publish' && !equipmentReady) {
    issues.push(
      issue(
        'equipment',
        'Equipment could not be loaded. Try again before publishing.',
        MONSTER_CATALOG_ISSUE_CODE.equipmentCatalogUnavailable,
      ),
    )
  }

  if (equipmentReady) {
    equipment.forEach((entry, index) => {
      collectEquipmentRowIssues(entry, index, catalogs, issues, equippedBodyArmor)
    })
    collectBodyArmorConflicts(equippedBodyArmor, issues)
    collectWeaponActionIssues(body, equipment, catalogs, issues)
  }

  if (intent === 'publish') {
    collectSkillIssues(body, catalogs, issues)
  }

  if (
    intent === 'publish' &&
    equipmentReady &&
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
