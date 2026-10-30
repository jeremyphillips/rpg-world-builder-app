import type { ContentValidationIntent } from '../lib/content-validation-intent'
import type { ContentValidationIssue } from '../lib/content-validation-issue'
import { isContentCampaignEligible, isContentReferenceable } from '../lib/content-resolution-policy'
import type { Equipment, EquipmentInstance } from '../equipment'
import { isArmorEquipment, isWeaponEquipment } from '../equipment'
import {
  monsterArmorOwnershipViolations,
  MONSTER_ARMOR_OWNERSHIP_VIOLATION_ID,
} from './monster-armor-ownership'
import type { MagicPropertyDefinitionProvider } from '../equipment/instance/magic-property'
import { normalizeEquipmentInstance } from '../equipment/instance/normalize-equipment-instance'
import { validateEquipmentMagicProperties } from '../equipment/instance/validate-equipment-magic-properties'
import type { SkillProficiency } from '../skill-proficiency'
import type { Spell } from '../spell/body'
import {
  isSpellCastingTimeCompatibleWithEconomy,
  MONSTER_SECTION_ECONOMY,
} from '../spell/casting-economy'
import { collectSpellReferenceIssues } from '../spell/spell-reference'
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
  spellCastingTimeIncompatible: 'spell_casting_time_incompatible',
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
  spellGroups?: readonly { spellIds?: readonly string[] }[]
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
  spellsById?: ReadonlyMap<string, Spell>
  spellCatalog?: MonsterCatalogLoadStatus
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

const OWNERSHIP_ISSUE_COPY = {
  [MONSTER_ARMOR_OWNERSHIP_VIOLATION_ID.duplicateBodyArmor]: {
    path: (entryIndex: number) => `equipment.${entryIndex}`,
    message: 'Only one body armor can be owned.',
    code: MONSTER_CATALOG_ISSUE_CODE.multipleOwnedBodyArmor,
  },
  [MONSTER_ARMOR_OWNERSHIP_VIOLATION_ID.duplicateShield]: {
    path: (entryIndex: number) => `equipment.${entryIndex}`,
    message: 'Only one shield can be owned.',
    code: MONSTER_CATALOG_ISSUE_CODE.multipleOwnedShield,
  },
  [MONSTER_ARMOR_OWNERSHIP_VIOLATION_ID.invalidQuantity]: {
    path: (entryIndex: number) => `equipment.${entryIndex}.quantity`,
    message: 'Armor and shields are limited to a quantity of 1.',
    code: MONSTER_CATALOG_ISSUE_CODE.armorSlotQuantity,
  },
} as const

function collectArmorOwnershipIssues(
  equipment: readonly CatalogEquipmentEntry[],
  catalogs: MonsterCatalogs,
  issues: ContentValidationIssue[],
): void {
  for (const violation of monsterArmorOwnershipViolations(equipment, catalogs.equipmentById)) {
    const copy = OWNERSHIP_ISSUE_COPY[violation.id]
    issues.push(issue(copy.path(violation.entryIndex), copy.message, copy.code))
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

function spellActionReferences(body: MonsterCatalogIssueBody): { path: string; spellId: string }[] {
  const refs: { path: string; spellId: string }[] = []
  for (const section of ACTION_SECTIONS) {
    for (const [index, action] of (body[section] ?? []).entries()) {
      if (action.kind !== 'spell') continue
      appendSpellGroupReferences(refs, section, index, action.spellGroups)
    }
  }
  return refs
}

function appendSpellGroupReferences(
  refs: { path: string; spellId: string }[],
  section: string,
  actionIndex: number,
  groups: CatalogAction['spellGroups'],
): void {
  for (const [groupIndex, group] of (groups ?? []).entries()) {
    for (const [spellIndex, spellId] of (group.spellIds ?? []).entries()) {
      refs.push({
        path: `${section}.${actionIndex}.spellGroups.${groupIndex}.spellIds.${spellIndex}`,
        spellId,
      })
    }
  }
}

function appendIncompatibleCastingTimes(
  refs: readonly { path: string; spellId: string }[],
  catalogs: MonsterCatalogs,
  issues: ContentValidationIssue[],
): void {
  for (const ref of refs) {
    const spell = catalogs.spellsById?.get(ref.spellId)
    const section = ref.path.split('.')[0] as keyof typeof MONSTER_SECTION_ECONOMY
    if (!spell) continue
    if (
      isSpellCastingTimeCompatibleWithEconomy(spell.castingTime, MONSTER_SECTION_ECONOMY[section])
    ) {
      continue
    }
    issues.push(
      issue(
        ref.path,
        'This spell casting time does not match the action section.',
        MONSTER_CATALOG_ISSUE_CODE.spellCastingTimeIncompatible,
      ),
    )
  }
}

function collectSpellActionIssues(
  body: MonsterCatalogIssueBody,
  catalogs: MonsterCatalogs,
  issues: ContentValidationIssue[],
  intent: ContentValidationIntent,
): void {
  const refs = spellActionReferences(body)
  const spellCatalog = catalogStatus(
    catalogs.spellCatalog ?? (catalogs.spellsById ? 'ready' : 'unavailable'),
  )
  issues.push(
    ...collectSpellReferenceIssues({
      refs,
      spellsById: catalogs.spellsById ?? new Map(),
      catalogStatus: spellCatalog,
      intent,
    }),
  )
  if (intent !== 'publish' || spellCatalog !== 'ready') return
  appendIncompatibleCastingTimes(refs, catalogs, issues)
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
  collectSpellActionIssues(body, catalogs, issues, intent)

  return issues
}
