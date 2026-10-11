import {
  getContentTypeSentenceForm,
  getDamageTypeLabel,
  monsterActionDraftSchema,
  monsterReactionDraftSchema,
  type MonsterActionKind,
} from '@rpg/contracts'

import type { MonsterActionSection } from './monster-equipment-references'
import type { MonsterActionDraftRow } from './monster-action-presets'

type DraftUnion = typeof monsterActionDraftSchema

function variantKeys(schema: DraftUnion, kind: string): readonly string[] {
  const option = schema.options.find((entry) => {
    const discriminator = entry.shape.kind
    return 'value' in discriminator && discriminator.value === kind
  })
  if (!option) return []
  return Object.keys(option.shape)
}

/** Active-kind keys from the draft variant, including `trigger` on reactions. */
export function monsterActionActiveKeys(
  kind: string,
  section: MonsterActionSection,
): readonly string[] {
  const schema = section === 'reactions' ? monsterReactionDraftSchema : monsterActionDraftSchema
  return variantKeys(schema, kind)
}

function present(value: unknown): boolean {
  if (value == null) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value).length > 0
  return true
}

export function reconcileMonsterActionKind(
  action: MonsterActionDraftRow,
  nextKind: MonsterActionKind,
  options?: { resolvedWeaponName?: string },
): MonsterActionDraftRow {
  const next: MonsterActionDraftRow = { id: action.id, kind: nextKind }
  if (present(action.name)) next.name = action.name
  else if (action.kind === 'weapon' && nextKind !== 'weapon' && options?.resolvedWeaponName) {
    next.name = options.resolvedWeaponName
  }
  if (present(action.description)) next.description = action.description
  if (present(action.trigger)) next.trigger = action.trigger
  return next
}

const DESCRIBED_KEYS = new Set([
  'id',
  'name',
  'description',
  'trigger',
  'kind',
  'damage',
  'damageType',
  'mode',
  'reach',
  'range',
  'properties',
  'equipmentEntryId',
])

function formatDamage(damage: MonsterActionDraftRow['damage']): string | null {
  if (!damage) return null
  const dice = damage.dice
  if (dice?.count && dice.faces) {
    const base = `${dice.count}d${dice.faces}`
    return damage.flat != null ? `Damage ${base}+${damage.flat}` : `Damage ${base}`
  }
  if (damage.flat != null) return `Damage ${damage.flat}`
  return 'Damage'
}

function rangeLoss(range: MonsterActionDraftRow['range']): string | null {
  if (!range || typeof range.normal !== 'number') return null
  const long = range.long
  return long != null ? `range ${range.normal}/${long} ft` : `range ${range.normal} ft`
}

function pushLoss(parts: string[], text: string | null | undefined) {
  if (text) parts.push(text)
}

function formatMechanicalLoss(action: MonsterActionDraftRow): string | null {
  const parts: string[] = []
  pushLoss(parts, formatDamage(action.damage))
  pushLoss(parts, present(action.damageType) ? getDamageTypeLabel(action.damageType!) : null)
  pushLoss(parts, typeof action.reach === 'number' ? `reach ${action.reach} ft` : null)
  pushLoss(parts, rangeLoss(action.range))
  pushLoss(parts, present(action.mode) ? action.mode : null)
  pushLoss(parts, present(action.properties) ? 'properties' : null)
  return parts.length === 0 ? null : parts.join(', ')
}

export function describeActionKindSwitchLoss(
  action: MonsterActionDraftRow,
  nextKind: MonsterActionKind,
  options?: { equipmentName?: string },
): string[] {
  if (action.kind === nextKind) return []
  const losses: string[] = []
  if (action.kind === 'weapon' && present(action.equipmentEntryId)) {
    const name = options?.equipmentName?.trim() || 'linked'
    losses.push(
      `The link to the ${name} ${getContentTypeSentenceForm('equipment', 1)} will be removed.`,
    )
  }
  if (action.kind === 'natural-weapon') {
    const mechanical = formatMechanicalLoss(action)
    if (mechanical) losses.push(mechanical)
  }
  const nextKeys = new Set(monsterActionActiveKeys(nextKind, 'reactions'))
  for (const [key, value] of Object.entries(action)) {
    if (DESCRIBED_KEYS.has(key) || nextKeys.has(key) || !present(value)) continue
    losses.push(key)
  }
  return losses
}

export function actionMoveDropsTrigger(
  action: MonsterActionDraftRow,
  from: MonsterActionSection,
  to: MonsterActionSection,
): boolean {
  return from === 'reactions' && to !== 'reactions' && present(action.trigger)
}

export function actionAfterSectionMove(
  action: MonsterActionDraftRow,
  to: MonsterActionSection,
): MonsterActionDraftRow {
  if (to === 'reactions') return action
  const { trigger: _trigger, ...rest } = action
  return rest
}
