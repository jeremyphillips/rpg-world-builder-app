import {
  ACTION_PRESET_IDS,
  getActionPreset,
  getActionVocabularyEntry,
  getActionVocabularySearchTerms,
  getDamageTypeLabel,
  listSpecialMenuActionPresetIds,
  MONSTER_SPELLCASTING_ACTION_NAME,
  PRIMARY_SPELLCASTING_PROFILE,
  type ActionPresetId,
} from '@rpg/contracts'
import { conventionalSpellcastingSources } from './monster-action-casting-summary'
import type { MonsterActionSection } from './monster-action-equipment-references'

import {
  MONSTER_ACQUISITION_ATTACK_DESCRIPTION,
  MONSTER_ACQUISITION_MULTIATTACK_DESCRIPTION,
  MONSTER_ACQUISITION_SPELL_DESCRIPTION,
  MONSTER_CAST_SPELL_LABEL,
  MONSTER_PRIMARY_SPELLCASTING_NOTE,
  MONSTER_ACQUISITION_SPECIAL_DESCRIPTION,
  monsterAddWeaponShortcut,
} from '../monster-form-labels'
import { createMonsterRowId } from '../monster-row-id'
import type { MonsterActionDraftRow } from './monster-action-presets'

export const MONSTER_ACTION_ACQUISITION_GROUPS = [
  { id: 'equipped', label: 'Equipped weapons' },
  { id: 'natural', label: 'Natural attacks' },
  { id: 'special', label: 'Special actions' },
  { id: 'other', label: 'General' },
] as const

export type MonsterActionAcquisitionGroupId =
  (typeof MONSTER_ACTION_ACQUISITION_GROUPS)[number]['id']

export type MonsterActionAcquisitionItem = {
  id: string
  label: string
  groupId: MonsterActionAcquisitionGroupId
  metadata?: string
  search?: { includeSupporting?: boolean }
  searchTerms?: readonly string[]
  disabled?: boolean
  note?: string
}

export type MonsterActionAcquisitionChoice =
  | { type: 'weapon-entry'; entryId: string }
  | { type: 'focus-existing'; actionId: string }
  | { type: 'add-weapon' }
  | { type: 'natural'; presetId: ActionPresetId }
  | { type: 'other-natural' }
  | { type: 'preset'; presetId: ActionPresetId }
  | { type: 'create'; kind: 'attack' | 'spell' | 'special' | 'save' }
  | { type: 'legendary'; category: 'reference' | 'spellcasting' | 'cast-spell' }

const SPECIAL_MENU_ORDER = ['multiattack', 'constrict', 'breath-weapon'] as const

const OTHER_ITEMS: readonly MonsterActionAcquisitionItem[] = [
  {
    id: 'create:attack',
    label: 'Attack roll',
    groupId: 'other',
    metadata: MONSTER_ACQUISITION_ATTACK_DESCRIPTION,
  },
  {
    id: 'create:spell',
    label: 'Spellcasting',
    groupId: 'other',
    metadata: MONSTER_ACQUISITION_SPELL_DESCRIPTION,
  },
  {
    id: 'create:spell-standalone',
    label: MONSTER_CAST_SPELL_LABEL,
    groupId: 'other',
    metadata: MONSTER_ACQUISITION_SPELL_DESCRIPTION,
  },
  {
    id: 'create:special',
    label: 'Custom ability',
    groupId: 'other',
    metadata: MONSTER_ACQUISITION_SPECIAL_DESCRIPTION,
  },
]

function specialMenuRank(presetId: ActionPresetId): number {
  const index = SPECIAL_MENU_ORDER.indexOf(presetId as (typeof SPECIAL_MENU_ORDER)[number])
  return index === -1 ? SPECIAL_MENU_ORDER.length : index
}

function isAttackRollPreset(id: ActionPresetId): boolean {
  return getActionPreset(id)?.mechanics === 'attack-roll'
}

const EXACT_ACQUISITION_CHOICES: Record<string, MonsterActionAcquisitionChoice> = {
  'add-weapon': { type: 'add-weapon' },
  'create:attack': { type: 'create', kind: 'attack' },
  'create:spell': { type: 'create', kind: 'spell' },
  'create:spell-standalone': { type: 'create', kind: 'spell' },
  'create:special': { type: 'create', kind: 'special' },
  'natural:other': { type: 'other-natural' },
}

function legendaryAcquisitionChoice(value: string): MonsterActionAcquisitionChoice | undefined {
  if (value === 'reference' || value === 'spellcasting' || value === 'cast-spell') {
    return { type: 'legendary', category: value }
  }
  return undefined
}

function presetAcquisitionChoice(value: string): MonsterActionAcquisitionChoice | undefined {
  const preset = getActionPreset(value)
  if (!preset || preset.mechanics === 'attack-roll') return undefined
  return { type: 'preset', presetId: value as ActionPresetId }
}

function parsePrefixedAcquisitionId(id: string): MonsterActionAcquisitionChoice | undefined {
  const separator = id.indexOf(':')
  if (separator < 0) return undefined
  const prefix = id.slice(0, separator)
  const value = id.slice(separator + 1)
  if (!value) return undefined
  if (prefix === 'weapon-entry') return { type: 'weapon-entry', entryId: value }
  if (prefix === 'focus-action') return { type: 'focus-existing', actionId: value }
  if (prefix === 'natural' && isAttackRollPreset(value as ActionPresetId)) {
    return { type: 'natural', presetId: value as ActionPresetId }
  }
  if (prefix === 'legendary') return legendaryAcquisitionChoice(value)
  if (prefix === 'preset') return presetAcquisitionChoice(value)
  return undefined
}

export function parseMonsterActionAcquisitionId(
  id: string,
): MonsterActionAcquisitionChoice | undefined {
  return EXACT_ACQUISITION_CHOICES[id] ?? parsePrefixedAcquisitionId(id)
}

export const MONSTER_ACTION_ALREADY_ADDED_NOTE = 'Already added'

export function monsterActionAcquisitionItems(input: {
  weapons: readonly { entryId: string; label: string; equipped: boolean }[]
  allowAddWeapon: boolean
  /** Weapon actions in section order. The first match is the row Already added opens. */
  weaponActions?: readonly { id: string; equipmentEntryId?: string }[]
  section?: MonsterActionSection
  /** True when the monster already has its Actions Spellcasting profile. */
  primarySpellcasting?: boolean
}): MonsterActionAcquisitionItem[] {
  const equipped = input.weapons.map((weapon) => {
    const existing = input.weaponActions?.find(
      (action) => action.equipmentEntryId === weapon.entryId,
    )
    if (existing) {
      return {
        id: `focus-action:${existing.id}`,
        label: weapon.label,
        groupId: 'equipped' as const,
        note: MONSTER_ACTION_ALREADY_ADDED_NOTE,
      }
    }
    return {
      id: `weapon-entry:${weapon.entryId}`,
      label: weapon.label,
      groupId: 'equipped' as const,
      disabled: !weapon.equipped,
      note: weapon.equipped ? undefined : 'Not equipped',
    }
  })
  const natural = ACTION_PRESET_IDS.filter(isAttackRollPreset).map((presetId) => {
    const preset = getActionPreset(presetId)
    const vocabulary = preset ? getActionVocabularyEntry(preset.vocabularyId) : undefined
    const damageType = preset?.mechanics === 'attack-roll' ? preset.defaults.damageType : undefined
    return {
      id: `natural:${presetId}`,
      label: vocabulary?.label ?? presetId,
      groupId: 'natural' as const,
      metadata: damageType ? getDamageTypeLabel(damageType) : undefined,
      search: { includeSupporting: false as const },
      searchTerms: preset ? getActionVocabularySearchTerms(preset.vocabularyId) : [],
    }
  })
  const special = listSpecialMenuActionPresetIds()
    .filter((presetId) => {
      if (presetId === 'multiattack')
        return input.section === undefined || input.section === 'actions'
      return true
    })
    .map((presetId, index) => ({ presetId, index }))
    .sort(
      (left, right) =>
        specialMenuRank(left.presetId) - specialMenuRank(right.presetId) ||
        left.index - right.index,
    )
    .map(({ presetId }) => {
      const preset = getActionPreset(presetId)
      const vocabulary = preset ? getActionVocabularyEntry(preset.vocabularyId) : undefined
      return {
        id: `preset:${presetId}`,
        label: vocabulary?.label ?? presetId,
        groupId: 'special' as const,
        search: { includeSupporting: false as const },
        searchTerms: preset ? getActionVocabularySearchTerms(preset.vocabularyId) : [],
        ...(presetId === 'multiattack'
          ? { metadata: MONSTER_ACQUISITION_MULTIATTACK_DESCRIPTION }
          : {}),
      }
    })
  return [
    ...equipped,
    {
      id: 'add-weapon',
      label: monsterAddWeaponShortcut(),
      groupId: 'equipped',
      disabled: !input.allowAddWeapon,
      note: input.allowAddWeapon ? undefined : 'Equipment catalog is not ready',
    },
    ...natural,
    {
      id: 'natural:other',
      label: 'Other natural attack',
      groupId: 'natural',
    },
    ...special,
    ...generalAcquisitionItems(input.section, input.primarySpellcasting === true),
  ]
}

function generalAcquisitionItems(
  section: MonsterActionSection | undefined,
  primarySpellcasting: boolean,
): MonsterActionAcquisitionItem[] {
  const standalone = OTHER_ITEMS.filter((item) => item.id === 'create:spell-standalone')
  const rest = OTHER_ITEMS.filter(
    (item) => item.id !== 'create:spell' && item.id !== 'create:spell-standalone',
  )
  const spellcasting = OTHER_ITEMS.find((item) => item.id === 'create:spell')
  if (section === 'bonusActions' || section === 'reactions') return [...rest, ...standalone]
  return [
    ...rest,
    ...(spellcasting
      ? [
          {
            ...spellcasting,
            ...(primarySpellcasting
              ? { disabled: true, note: MONSTER_PRIMARY_SPELLCASTING_NOTE }
              : {}),
          },
        ]
      : []),
  ]
}

/** Starting damage for a new Attack or Other natural attack. Not applied to loaded rows. */
function authoredStartingDamage(): { dice: { count: 1; faces: 6 } } {
  return { dice: { count: 1, faces: 6 } }
}

function draftFromPreset(presetId: ActionPresetId): MonsterActionDraftRow {
  const preset = getActionPreset(presetId)
  const id = createMonsterRowId()
  if (!preset) return { id, kind: 'special' }
  if (preset.mechanics === 'attack-roll') {
    return {
      id,
      kind: 'natural-weapon',
      preset: presetId,
      form: preset.defaults.naturalForm,
      damageType: preset.defaults.damageType,
      mode: preset.defaults.mode,
      reach: preset.defaults.reach,
      damage: { ...preset.defaults.damage },
    }
  }
  if (preset.mechanics === 'saving-throw') {
    return {
      id,
      kind: 'save',
      preset: presetId,
      dcSource: preset.defaults.dcSource,
      resolution: preset.defaults.resolution,
      ...(preset.defaults.limitedUse ? { limitedUse: preset.defaults.limitedUse } : {}),
    }
  }
  return {
    id,
    kind: 'multiattack',
    preset: presetId,
    steps: [],
  }
}

export function createMonsterActionFromAcquisition(
  choice: Exclude<MonsterActionAcquisitionChoice, { type: 'add-weapon' } | { type: 'legendary' }>,
): MonsterActionDraftRow {
  const id = createMonsterRowId()
  if (choice.type === 'weapon-entry') {
    return { id, kind: 'weapon', equipmentEntryId: choice.entryId } as MonsterActionDraftRow
  }
  if (choice.type === 'natural' || choice.type === 'preset') return draftFromPreset(choice.presetId)
  if (choice.type === 'other-natural') {
    return {
      id,
      kind: 'natural-weapon',
      mode: 'melee',
      damage: authoredStartingDamage(),
    } as MonsterActionDraftRow
  }
  if (choice.type === 'focus-existing') {
    throw new Error('focus-existing is not a create choice')
  }
  if (choice.type === 'create') {
    if (choice.kind === 'spell') return { id, kind: 'spell', spells: [] } as MonsterActionDraftRow
    if (choice.kind === 'special') return { id, kind: 'special' } as MonsterActionDraftRow
    if (choice.kind === 'save') return { id, kind: 'save' } as MonsterActionDraftRow
    return { id, kind: 'attack', damage: authoredStartingDamage() } as MonsterActionDraftRow
  }
  return { id, kind: 'special' } as MonsterActionDraftRow
}

/** Spell row for the add menu. Names Spellcasting only on Actions, and shares only that source. */
export function createSpellActionDraft(
  section: MonsterActionSection,
  sections: {
    actions?: readonly unknown[]
    bonusActions?: readonly unknown[]
    reactions?: readonly unknown[]
    legendaryActions?: readonly unknown[]
  },
): MonsterActionDraftRow {
  const id = createMonsterRowId()
  if (section === 'actions') {
    return {
      id,
      kind: 'spell',
      profile: PRIMARY_SPELLCASTING_PROFILE,
      name: MONSTER_SPELLCASTING_ACTION_NAME,
      spells: [],
    } as MonsterActionDraftRow
  }
  const conventional = conventionalSpellcastingSources(sections)
  const castingAbility =
    conventional.length === 1
      ? { kind: 'shared' as const, entryId: conventional[0]!.id }
      : undefined
  return {
    id,
    kind: 'spell',
    spells: [],
    ...(castingAbility ? { castingAbility } : {}),
  } as MonsterActionDraftRow
}

/** Equipped catalog row and the weapon action that points at it. One commit, no orphan. */
export function createEquippedWeaponAcquisition(equipmentId: string): {
  entry: { entryId: string; equipmentId: string; quantity: 1; equipped: true }
  action: MonsterActionDraftRow
} {
  const entryId = createMonsterRowId()
  return {
    entry: { entryId, equipmentId, quantity: 1, equipped: true },
    action: { id: createMonsterRowId(), kind: 'weapon', equipmentEntryId: entryId },
  }
}
