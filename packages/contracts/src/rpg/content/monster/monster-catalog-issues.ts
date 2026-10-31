import type { ContentValidationIntent } from '../lib/content-validation-intent'
import type { ContentValidationIssue } from '../lib/content-validation-issue'
import {
  CATALOG_REFERENCE_ISSUE_CODE,
  collectCatalogReferenceIssues,
  monsterEquipmentEdge,
  monsterSkillProficienciesEdge,
} from '../lib/catalog-reference-issues'
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
import { MONSTER_ACTION_SECTIONS } from './action-sections'
export const MONSTER_CATALOG_ISSUE_CODE = {
  unknownEquipment: CATALOG_REFERENCE_ISSUE_CODE.equipment.unknown,
  weaponActionNotWeapon: 'weapon_action_not_weapon',
  armorClassModifierNotArmor: 'armor_class_modifier_not_armor',
  multipleOwnedBodyArmor: 'multiple_owned_body_armor',
  multipleOwnedShield: 'multiple_owned_shield',
  armorSlotQuantity: 'armor_slot_quantity',
  equipmentCatalogUnavailable: CATALOG_REFERENCE_ISSUE_CODE.equipment.catalogUnavailable,
  unknownSkill: CATALOG_REFERENCE_ISSUE_CODE.skill.unknown,
  skillNotReferenceable: CATALOG_REFERENCE_ISSUE_CODE.skill.notReferenceable,
  skillNotCampaignEligible: CATALOG_REFERENCE_ISSUE_CODE.skill.notCampaignEligible,
  skillCatalogUnavailable: CATALOG_REFERENCE_ISSUE_CODE.skill.catalogUnavailable,
  spellCastingTimeIncompatible: 'spell_casting_time_incompatible',
  spellCastLevelTooLow: 'spell_cast_level_too_low',
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
  spells?: readonly { spellId?: string; castAtLevel?: number }[]
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
  const referenceIssues = collectCatalogReferenceIssues({
    policy: monsterEquipmentEdge.policy,
    intent,
    catalogStatus: 'ready',
    refs: [{ path: `equipment.${index}.equipmentId`, key: entry.equipmentId }],
    resolve: (key) => catalogs.equipmentById.get(key),
    unavailablePlacement: monsterEquipmentEdge.unavailablePlacement,
    messages: monsterEquipmentEdge.messages,
  })
  if (referenceIssues.length > 0) {
    issues.push(...referenceIssues)
    return
  }
  const item = catalogs.equipmentById.get(entry.equipmentId)
  if (!item) return
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
  for (const section of MONSTER_ACTION_SECTIONS) {
    for (const [index, action] of (body[section] ?? []).entries()) {
      pushWeaponActionIssue(section, index, action, equipment, catalogs, issues)
    }
  }
}

function pushWeaponActionIssue(
  section: (typeof MONSTER_ACTION_SECTIONS)[number],
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
  intent: ContentValidationIntent,
): void {
  const refs = (body.proficiencies?.skills ?? []).flatMap((row, index) =>
    row.skill ? [{ path: `proficiencies.skills.${index}.skill`, key: row.skill }] : [],
  )
  issues.push(
    ...collectCatalogReferenceIssues({
      policy: monsterSkillProficienciesEdge.policy,
      intent,
      catalogStatus: catalogStatus(catalogs.skillCatalog),
      refs,
      resolve: (key) => catalogs.skillBySlug.get(key),
      unavailablePlacement: monsterSkillProficienciesEdge.unavailablePlacement,
      messages: monsterSkillProficienciesEdge.messages,
    }),
  )
}

function spellActionReferences(
  body: MonsterCatalogIssueBody,
): { path: string; spellId: string; castAtLevel?: number }[] {
  const refs: { path: string; spellId: string; castAtLevel?: number }[] = []
  for (const section of MONSTER_ACTION_SECTIONS) {
    for (const [index, action] of (body[section] ?? []).entries()) {
      if (action.kind !== 'spell') continue
      appendSpellReferences(refs, section, index, action.spells)
    }
  }
  return refs
}

function appendSpellReferences(
  refs: { path: string; spellId: string; castAtLevel?: number }[],
  section: string,
  actionIndex: number,
  spells: CatalogAction['spells'],
): void {
  for (const [spellIndex, spell] of (spells ?? []).entries()) {
    if (!spell.spellId) continue
    refs.push({
      path: `${section}.${actionIndex}.spells.${spellIndex}.spellId`,
      spellId: spell.spellId,
      ...(spell.castAtLevel !== undefined ? { castAtLevel: spell.castAtLevel } : {}),
    })
  }
}

function appendIncompatibleCastingTimes(
  refs: readonly { path: string; spellId: string; castAtLevel?: number }[],
  catalogs: MonsterCatalogs,
  issues: ContentValidationIssue[],
): void {
  for (const ref of refs) {
    const spell = catalogs.spellsById?.get(ref.spellId)
    const section = ref.path.split('.')[0] as keyof typeof MONSTER_SECTION_ECONOMY
    if (!spell) continue
    if (
      !isSpellCastingTimeCompatibleWithEconomy(spell.castingTime, MONSTER_SECTION_ECONOMY[section])
    ) {
      issues.push(
        issue(
          ref.path,
          'This spell casting time does not match the action section.',
          MONSTER_CATALOG_ISSUE_CODE.spellCastingTimeIncompatible,
        ),
      )
    }
    if (ref.castAtLevel !== undefined && ref.castAtLevel < spell.level) {
      issues.push(
        issue(
          ref.path.replace(/\.spellId$/, '.castAtLevel'),
          'Cast level cannot be below the spell level.',
          MONSTER_CATALOG_ISSUE_CODE.spellCastLevelTooLow,
        ),
      )
    }
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
      ...collectCatalogReferenceIssues({
        policy: monsterEquipmentEdge.policy,
        intent,
        catalogStatus: 'unavailable',
        refs: [],
        resolve: (key) => catalogs.equipmentById.get(key),
        unavailablePlacement: monsterEquipmentEdge.unavailablePlacement,
        messages: monsterEquipmentEdge.messages,
      }),
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
    collectSkillIssues(body, catalogs, issues, intent)
  }
  collectSpellActionIssues(body, catalogs, issues, intent)

  return issues
}
