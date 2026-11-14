import {
  CREATURE_TRAIT_GROUPS,
  CREATURE_TRAIT_VOCABULARY_IDS,
  getCreatureTraitGroupEntry,
  getCreatureTraitSearchTerms,
  getCreatureTraitVocabularyEntry,
  type CreatureTraitVocabularyId,
} from '@rpg/contracts'

import { MONSTER_ACTION_ALREADY_ADDED_NOTE } from './monster-action-acquisition'

export const MONSTER_TRAIT_CUSTOM_ID = 'custom'

export const MONSTER_TRAIT_CUSTOM_DESCRIPTION = 'Write a name and description.'

export const MONSTER_TRAIT_ACQUISITION_GROUPS = CREATURE_TRAIT_GROUPS.map((id) => ({
  id,
  label: getCreatureTraitGroupEntry(id)?.label ?? id,
}))

export type MonsterTraitAcquisitionGroupId = (typeof MONSTER_TRAIT_ACQUISITION_GROUPS)[number]['id']

export type MonsterTraitAcquisitionItem = {
  id: string
  label: string
  groupId: MonsterTraitAcquisitionGroupId
  metadata?: string
  search?: { includeSupporting?: boolean }
  searchTerms?: readonly string[]
  note?: string
}

export type MonsterTraitAcquisitionChoice =
  | { type: 'preset'; presetId: CreatureTraitVocabularyId }
  | { type: 'focus'; traitId: string }
  | { type: 'custom' }

export function parseMonsterTraitAcquisitionId(
  id: string,
): MonsterTraitAcquisitionChoice | undefined {
  if (id === MONSTER_TRAIT_CUSTOM_ID) return { type: 'custom' }
  if (id.startsWith('focus:')) {
    const traitId = id.slice('focus:'.length)
    return traitId ? { type: 'focus', traitId } : undefined
  }
  if (id.startsWith('preset:')) {
    const presetId = id.slice('preset:'.length)
    if (!getCreatureTraitVocabularyEntry(presetId)) return undefined
    return { type: 'preset', presetId: presetId as CreatureTraitVocabularyId }
  }
  return undefined
}

export function monsterTraitAcquisitionItems(input: {
  traits: readonly { id: string; preset?: string }[]
}): MonsterTraitAcquisitionItem[] {
  const existingByPreset = new Map<string, string>()
  for (const trait of input.traits) {
    if (trait.preset) existingByPreset.set(trait.preset, trait.id)
  }

  const presets = CREATURE_TRAIT_VOCABULARY_IDS.map((presetId) => {
    const entry = getCreatureTraitVocabularyEntry(presetId)
    const existingId = existingByPreset.get(presetId)
    return {
      presetId,
      label: entry?.label ?? presetId,
      groupId: entry?.group ?? 'combat',
      metadata: entry?.description,
      searchTerms: getCreatureTraitSearchTerms(presetId),
      existingId,
    }
  }).sort((left, right) => left.label.localeCompare(right.label))

  return [
    ...presets.map((preset) => ({
      id: preset.existingId ? `focus:${preset.existingId}` : `preset:${preset.presetId}`,
      label: preset.label,
      groupId: preset.groupId,
      metadata: preset.metadata,
      search: { includeSupporting: false as const },
      searchTerms: preset.searchTerms,
      note: preset.existingId ? MONSTER_ACTION_ALREADY_ADDED_NOTE : undefined,
    })),
    {
      id: MONSTER_TRAIT_CUSTOM_ID,
      label: 'Custom trait',
      groupId: 'general',
      metadata: MONSTER_TRAIT_CUSTOM_DESCRIPTION,
    },
  ]
}
