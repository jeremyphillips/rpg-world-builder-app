import type { ContentValidationIntent } from '../lib/content-validation-intent'
import type { ContentValidationIssue } from '../lib/content-validation-issue'
import { isContentCampaignEligible, isContentReferenceable } from '../lib/content-resolution-policy'
import type { Equipment, EquipmentInstance } from '../equipment'
import { isArmorEquipment, isWeaponEquipment, resolveCreatureArmorSlot } from '../equipment'
import type { MagicPropertyDefinitionProvider } from '../equipment/instance/magic-property'
import { normalizeEquipmentInstance } from '../equipment/instance/normalize-equipment-instance'
import { validateEquipmentMagicProperties } from '../equipment/instance/validate-equipment-magic-properties'
import type { SkillProficiency } from '../skill-proficiency'
export const MONSTER_CATALOG_ISSUE_CODE = {
  unknownEquipment: 'unknown_equipment',
  weaponActionNotWeapon: 'weapon_action_not_weapon',
  armorClassModifierNotArmor: 'armor_class_modifier_not_armor',
  multipleOwnedBodyArmor: 'multiple_owned_body_armor',
  multipleOwnedShield: 'multiple_owned_shield',
  armorSlotQuantity: 'armor_slot_quantity',
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

function issue(
  path: string,
  message: string,
  code: MonsterCatalogIssueCode,
): ContentValidationIssue {
  return { path, message, code }
}

function catalogStatus(status: MonsterCatalogLoadStatus | undefined): MonsterCatalogLoadStatus {
  return status ?? 'ready'
}

function collectEquipmentRowIssues(
  entry: CatalogEquipmentEntry,
  index: number,
  catalogs: MonsterCatalogs,
  issues: ContentValidationIssue[],
  intent: ContentValidationIntent,
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
  const hasAcEffect = (normalized.adjustments ?? []).some(
    (effect) => effect.target === 'armor_class',
  )
  if (hasAcEffect && !isArmorEquipment(item)) {
    issues.push(
      issue(
        `equipment.${index}.adjustments`,
        'Armor Class adjustments are only allowed on armor or shields.',
        MONSTER_CATALOG_ISSUE_CODE.armorClassModifierNotArmor,
      ),
    )
  }
  if (intent === 'publish') {
    const provider = catalogs.magicPropertyProvider ?? (() => undefined)
    issues.push(
      ...validateEquipmentMagicProperties({
        entry: normalized,
        item,
        provider,
        pathPrefix: `equipment.${index}`,
      }),
    )
  }
}

function collectArmorOwnershipIssues(
  equipment: readonly CatalogEquipmentEntry[],
  catalogs: MonsterCatalogs,
  issues: ContentValidationIssue[],
): void {
  const bodyArmor: number[] = []
  const shields: number[] = []
  equipment.forEach((entry, index) => {
    if (!entry.equipmentId) return
    const item = catalogs.equipmentById.get(entry.equipmentId)
    if (!item) return
    const slot = resolveCreatureArmorSlot(item)
    if (!slot) return
    if ((entry.quantity ?? 1) !== 1) {
      issues.push(
        issue(
          `equipment.${index}.quantity`,
          'Armor and shields are limited to a quantity of 1.',
          MONSTER_CATALOG_ISSUE_CODE.armorSlotQuantity,
        ),
      )
    }
    if (slot === 'body-armor') bodyArmor.push(index)
    else shields.push(index)
  })
  pushExtraSlotIssues(
    bodyArmor,
    'Only one body armor can be owned.',
    MONSTER_CATALOG_ISSUE_CODE.multipleOwnedBodyArmor,
    issues,
  )
  pushExtraSlotIssues(
    shields,
    'Only one shield can be owned.',
    MONSTER_CATALOG_ISSUE_CODE.multipleOwnedShield,
    issues,
  )
}

function pushExtraSlotIssues(
  indexes: readonly number[],
  message: string,
  code: MonsterCatalogIssueCode,
  issues: ContentValidationIssue[],
): void {
  for (const index of indexes.slice(1)) {
    issues.push(issue(`equipment.${index}`, message, code))
  }
}

function collectWeaponActionIssues(
  body: MonsterCatalogIssueBody,
  equipment: readonly CatalogEquipmentEntry[],
  catalogs: MonsterCatalogs,
  issues: ContentValidationIssue[],
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
  issues: ContentValidationIssue[],
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
  issues: ContentValidationIssue[],
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

/**
 * Catalog-aware monster rules. Accepts draft-shaped bodies and never throws
 * on incomplete input. Callers share this collector instead of reimplementing rules.
 */
export function collectMonsterCatalogIssues(
  body: MonsterCatalogIssueBody,
  catalogs: MonsterCatalogs,
  intent: ContentValidationIntent,
): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = []
  const equipment = body.equipment ?? []
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
      collectEquipmentRowIssues(entry, index, catalogs, issues, intent)
    })
    collectArmorOwnershipIssues(equipment, catalogs, issues)
    collectWeaponActionIssues(body, equipment, catalogs, issues)
  }

  if (intent === 'publish') {
    collectSkillIssues(body, catalogs, issues)
  }

  return issues
}
