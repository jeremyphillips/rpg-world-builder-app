import { actionPresetDefaultName, getActionPreset } from '../../content/action/action-presets'
import { isWeaponEquipment, type Equipment } from '../../content/equipment'
import type { EquipmentInstance } from '../../content/equipment/instance/instance'
import type { MagicPropertyDefinitionProvider } from '../../content/equipment/instance/magic-property'
import { resolveEquipmentInstanceSummary } from '../../content/equipment/instance/resolve-equipment-instance-summary'
import {
  monsterActionAuthoring,
  type MonsterActionNameAuthority,
} from '../../content/monster/monster-action-authoring'
import type { CreatureEquipmentCatalog } from '../creature/equipment'

export const MONSTER_ACTION_UNRESOLVED_REFERENCE = 'Unresolved reference'

export type MonsterActionIdentitySourceState = 'resolved' | 'pending' | 'missing' | 'none'

export type ResolvedMonsterActionIdentity = {
  authority: MonsterActionNameAuthority
  sourceState: MonsterActionIdentitySourceState
  defaultName?: string
  /** Explicit stored name on a derived action. Absent for authored primary names. */
  customName?: string
  displayName: string
}

export type MonsterActionIdentitySubject = {
  kind: string
  name?: string
  preset?: string
  equipmentEntryId?: string
}

export type MonsterActionEquipmentCatalogStatus = 'pending' | 'ready' | 'error'

export type ResolveMonsterActionIdentityInput = {
  action: MonsterActionIdentitySubject
  equipment?: readonly EquipmentInstance[]
  equipmentCatalog?: CreatureEquipmentCatalog
  magicPropertyProvider?: MagicPropertyDefinitionProvider
  equipmentCatalogStatus?: MonsterActionEquipmentCatalogStatus
}

function explicitName(name: string | undefined): string | undefined {
  const trimmed = name?.trim()
  return trimmed ? trimmed : undefined
}

function identity(args: {
  authority: MonsterActionNameAuthority
  sourceState: MonsterActionIdentitySourceState
  defaultName?: string
  customName?: string
}): ResolvedMonsterActionIdentity {
  const displayName =
    args.customName ??
    (args.sourceState === 'resolved' ? args.defaultName : undefined) ??
    (args.sourceState === 'missing' ? MONSTER_ACTION_UNRESOLVED_REFERENCE : '')
  return {
    authority: args.authority,
    sourceState: args.sourceState,
    ...(args.defaultName ? { defaultName: args.defaultName } : {}),
    ...(args.customName ? { customName: args.customName } : {}),
    displayName,
  }
}

function weaponDefaultName(
  entry: EquipmentInstance,
  item: Extract<Equipment, { kind: 'weapon' }>,
  provider: MagicPropertyDefinitionProvider,
): string | undefined {
  const displayName = resolveEquipmentInstanceSummary(entry, item, provider).displayName
  if (!displayName || displayName === entry.equipmentId) return undefined
  return displayName
}

function resolveWeaponIdentity(
  action: MonsterActionIdentitySubject,
  input: ResolveMonsterActionIdentityInput,
  customName: string | undefined,
): ResolvedMonsterActionIdentity {
  const authority = 'derived' as const
  const entry = (input.equipment ?? []).find((row) => row.entryId === action.equipmentEntryId)
  if (!action.equipmentEntryId || !entry) {
    return identity({ authority, sourceState: 'missing', customName })
  }
  if (input.equipmentCatalogStatus === 'pending') {
    return identity({ authority, sourceState: 'pending', customName })
  }
  const item = input.equipmentCatalog?.get(entry.equipmentId)
  if (!item || !isWeaponEquipment(item)) {
    return identity({ authority, sourceState: 'missing', customName })
  }
  const defaultName = weaponDefaultName(
    entry,
    item,
    input.magicPropertyProvider ?? (() => undefined),
  )
  if (!defaultName) return identity({ authority, sourceState: 'missing', customName })
  return identity({ authority, sourceState: 'resolved', defaultName, customName })
}

function resolveVocabularyIdentity(
  action: MonsterActionIdentitySubject,
  customName: string | undefined,
): ResolvedMonsterActionIdentity {
  const authority = 'derived' as const
  const preset = action.preset ? getActionPreset(action.preset) : undefined
  const defaultName = preset ? actionPresetDefaultName(preset) : undefined
  if (!preset || !defaultName) {
    return identity({ authority, sourceState: 'missing', customName })
  }
  return identity({ authority, sourceState: 'resolved', defaultName, customName })
}

/** Effective action name. Derived defaults stay unresolved until this call; they are not stored. */
export function resolveMonsterActionIdentity(
  input: ResolveMonsterActionIdentityInput,
): ResolvedMonsterActionIdentity {
  const authoring = monsterActionAuthoring(input.action)
  const stored = explicitName(input.action.name)
  if (authoring.name === 'authored') {
    return { authority: 'authored', sourceState: 'none', displayName: stored ?? '' }
  }
  if (authoring.source === 'equipment') {
    return resolveWeaponIdentity(input.action, input, stored)
  }
  return resolveVocabularyIdentity(input.action, stored)
}
