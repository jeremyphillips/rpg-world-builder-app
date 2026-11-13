import {
  formatMonsterParryResponse,
  formatMonsterParryTrigger,
  isMonsterActionAttackKind,
  resolveMonsterActionIdentity,
} from '@rpg/contracts'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { monsterEquipmentCatalog, monsterMagicPropertyProvider } from '../monster-form-derivation'
import type { MonsterFormValues } from '../monster-form-values'
import type { MonsterActionDraftRow } from './monster-action-presets'

function escapePreviewText(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function readAcBonus(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isInteger(value) ? value : undefined
}

function followUpAttackName(
  values: MonsterFormValues,
  ctx: ContentFormCtx,
  followUpActionId: string | undefined,
): string | undefined {
  if (!followUpActionId) return undefined
  const target = (values.actions ?? []).find((row) => row.id === followUpActionId)
  if (!target || !isMonsterActionAttackKind(target.kind)) return undefined
  const identity = resolveMonsterActionIdentity({
    action: target,
    equipment: values.equipment,
    equipmentCatalog: monsterEquipmentCatalog(ctx),
    magicPropertyProvider: monsterMagicPropertyProvider(ctx),
    equipmentCatalogStatus: ctx.equipmentCatalogStatus === 'ready' ? 'ready' : 'pending',
  })
  const name = identity.displayName.trim()
  return name.length > 0 ? name : undefined
}

/** Stat-block trigger and response for a parry draft. Uses the same formatters as the published block. */
export function buildMonsterActionParryPreview(input: {
  values: MonsterFormValues
  ctx: ContentFormCtx
  action: Extract<MonsterActionDraftRow, { kind: 'parry' }>
}): { bodyHtml: string } {
  const monsterName = input.values.name?.trim() ?? ''
  const trigger = formatMonsterParryTrigger(monsterName)
  const response = formatMonsterParryResponse({
    monsterName,
    acBonus: readAcBonus(input.action.acBonus),
    followUpAttackName: followUpAttackName(input.values, input.ctx, input.action.followUpActionId),
  })
  const triggerHtml = `<p>Trigger: ${escapePreviewText(trigger)}</p>`
  if (!response) return { bodyHtml: triggerHtml }
  return {
    bodyHtml: `${triggerHtml}<p>Response: ${escapePreviewText(response)}</p>`,
  }
}
