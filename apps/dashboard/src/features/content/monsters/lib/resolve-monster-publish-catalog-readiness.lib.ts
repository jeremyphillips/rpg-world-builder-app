import type { ContentFormCatalogStatus } from '../../lib/forms/shells/layout/content-form-catalog-write-gate.lib'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { resolveStrictCatalogWriteGateReason } from '../../lib/forms/shells/layout/content-form-catalog-write-gate.lib'
import {
  MONSTER_EQUIPMENT_CATALOG_ERROR,
  MONSTER_LOADING_EQUIPMENT,
  MONSTER_LOADING_SPELLS,
  MONSTER_SKILL_ERROR,
  MONSTER_SKILL_LOADING,
  MONSTER_SPELL_CATALOG_ERROR,
} from './monster-form-labels'
import type { MonsterFormValues } from './monster-form-values'

const MONSTER_ACTION_SECTION_KEYS = [
  'actions',
  'bonusActions',
  'reactions',
  'legendaryActions',
] as const satisfies ReadonlyArray<keyof MonsterFormValues>

function isRecordWithKind(row: unknown): row is Record<string, unknown> & { kind: string } {
  return !!row && typeof row === 'object' && 'kind' in row
}

function actionRows(
  values: MonsterFormValues,
  section: (typeof MONSTER_ACTION_SECTION_KEYS)[number],
) {
  const rows = values[section]
  return Array.isArray(rows) ? rows : []
}

function hasSpellReferences(values: MonsterFormValues): boolean {
  return MONSTER_ACTION_SECTION_KEYS.some((section) =>
    actionRows(values, section).some((row) => {
      if (!isRecordWithKind(row) || row.kind !== 'spell') return false
      const spells = Array.isArray(row.spells) ? row.spells : []
      return spells.some(
        (spell) =>
          spell && typeof spell === 'object' && 'spellId' in spell && Boolean(spell.spellId),
      )
    }),
  )
}

function needsEquipmentCatalog(values: MonsterFormValues): boolean {
  if ((values.equipment?.length ?? 0) > 0) return true
  return MONSTER_ACTION_SECTION_KEYS.some((section) =>
    actionRows(values, section).some(
      (row) => isRecordWithKind(row) && (row.kind === 'weapon' || row.kind === 'natural-weapon'),
    ),
  )
}

function needsSkillCatalog(values: MonsterFormValues): boolean {
  return (values.proficiencies?.skills?.length ?? 0) > 0
}

function gateForStatus(
  status: ContentFormCatalogStatus | undefined,
  copy: { loading: string; error: string },
): string | null {
  return resolveStrictCatalogWriteGateReason(status, copy)
}

/**
 * Client publish gate for catalogs the current body needs. Draft saves stay enabled.
 */
export function resolveMonsterPublishCatalogReadiness(
  ctx: ContentFormCtx,
  values: MonsterFormValues,
): string | null {
  if (needsEquipmentCatalog(values)) {
    const reason = gateForStatus(ctx.equipmentCatalogStatus, {
      loading: MONSTER_LOADING_EQUIPMENT,
      error: MONSTER_EQUIPMENT_CATALOG_ERROR,
    })
    if (reason) return reason
  }
  if (needsSkillCatalog(values)) {
    const reason = gateForStatus(ctx.skillCatalogStatus, {
      loading: MONSTER_SKILL_LOADING,
      error: MONSTER_SKILL_ERROR,
    })
    if (reason) return reason
  }
  if (hasSpellReferences(values)) {
    const reason = gateForStatus(ctx.spellCatalogStatus, {
      loading: MONSTER_LOADING_SPELLS,
      error: MONSTER_SPELL_CATALOG_ERROR,
    })
    if (reason) return reason
  }
  return null
}
