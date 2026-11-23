import type { ButtonDropdownItem } from '@rpg/ui'
import {
  CREATURE_TRAIT_GROUPS,
  CREATURE_TRAIT_VOCABULARY_IDS,
  creatureTraitTemplateOccurrenceMessage,
  getCreatureTraitGroupEntry,
  getCreatureTraitSearchTerms,
  getCreatureTraitTemplate,
  getCreatureTraitVocabularyEntry,
  type CreatureTraitVocabularyId,
} from '@rpg/contracts'

import {
  type AcquisitionOption,
  resolveAcquisitionAvailability,
  toAcquisitionDropdownItem,
} from '../../../lib/acquisition'
import { CREATURE_TRAIT_CUSTOM_DESCRIPTION } from '../../../lib/creature-traits/creature-trait-custom-description'
import { CREATURE_TRAIT_CUSTOM_ITEM_ID } from '../../../lib/creature-traits/creature-trait-add-menu'

export const MONSTER_TRAIT_CUSTOM_ID = CREATURE_TRAIT_CUSTOM_ITEM_ID

const TEMPLATE_GROUP_ID = 'templates'

export const MONSTER_TRAIT_ACQUISITION_GROUPS = [
  { id: TEMPLATE_GROUP_ID, label: 'Templates' },
  ...CREATURE_TRAIT_GROUPS.map((id) => ({
    id,
    label: getCreatureTraitGroupEntry(id)?.label ?? id,
  })),
]

export type MonsterTraitAcquisitionGroupId =
  | (typeof CREATURE_TRAIT_GROUPS)[number]
  | typeof TEMPLATE_GROUP_ID

export type MonsterTraitAcquisitionChoice =
  | { type: 'preset'; presetId: CreatureTraitVocabularyId }
  | { type: 'custom' }

export function parseMonsterTraitAcquisitionId(
  id: string,
): MonsterTraitAcquisitionChoice | undefined {
  if (id === MONSTER_TRAIT_CUSTOM_ID) return { type: 'custom' }
  if (id.startsWith('preset:')) {
    const presetId = id.slice('preset:'.length)
    if (!getCreatureTraitVocabularyEntry(presetId)) return undefined
    return { type: 'preset', presetId: presetId as CreatureTraitVocabularyId }
  }
  return undefined
}

export function monsterTraitTemplateAcquisitionOptions(
  templateIds: readonly string[],
  traits: readonly { templateId?: string }[],
): AcquisitionOption[] {
  const seenTemplates = new Set(
    traits.flatMap((trait) => (trait.templateId ? [trait.templateId] : [])),
  )

  return templateIds.flatMap((templateId) => {
    const template = getCreatureTraitTemplate(templateId)
    if (!template) return []
    const occurrenceMessage = seenTemplates.has(templateId)
      ? creatureTraitTemplateOccurrenceMessage(template.label)
      : undefined
    return [
      {
        id: `template:${templateId}`,
        label: template.label,
        groupId: TEMPLATE_GROUP_ID,
        description: { status: 'ready', text: template.description },
        availability: resolveAcquisitionAvailability({
          occurrence: occurrenceMessage ? { message: occurrenceMessage } : undefined,
        }),
      },
    ]
  })
}

export function monsterTraitPresetAcquisitionOptions(input: {
  traits: readonly { id: string; preset?: string }[]
}): AcquisitionOption[] {
  const existingByPreset = new Map<string, string>()
  for (const trait of input.traits) {
    if (trait.preset) existingByPreset.set(trait.preset, trait.id)
  }

  return CREATURE_TRAIT_VOCABULARY_IDS.map((presetId) => {
    const entry = getCreatureTraitVocabularyEntry(presetId)
    const label = entry?.label ?? presetId
    const occurrenceMessage = existingByPreset.has(presetId)
      ? creatureTraitTemplateOccurrenceMessage(label)
      : undefined
    return {
      id: `preset:${presetId}`,
      label,
      groupId: entry?.group ?? 'combat',
      description: {
        status: 'ready' as const,
        text: entry?.description ?? '',
      },
      search: { includeSupporting: false as const },
      searchTerms: getCreatureTraitSearchTerms(presetId),
      availability: resolveAcquisitionAvailability({
        occurrence: occurrenceMessage ? { message: occurrenceMessage } : undefined,
      }),
    }
  }).sort((left, right) => left.label.localeCompare(right.label))
}

export function monsterTraitAcquisitionOptions(input: {
  traits: readonly { id: string; preset?: string; templateId?: string }[]
  templateIds: readonly string[]
}): AcquisitionOption[] {
  return [
    ...monsterTraitTemplateAcquisitionOptions(input.templateIds, input.traits),
    ...monsterTraitPresetAcquisitionOptions({ traits: input.traits }),
    {
      id: MONSTER_TRAIT_CUSTOM_ID,
      label: 'Custom trait',
      groupId: 'general',
      description: { status: 'ready', text: CREATURE_TRAIT_CUSTOM_DESCRIPTION },
      availability: { status: 'available' },
    },
  ]
}

export function monsterTraitAcquisitionDropdownItems(
  input: Parameters<typeof monsterTraitAcquisitionOptions>[0],
): ButtonDropdownItem[] {
  return monsterTraitAcquisitionOptions(input).map(toAcquisitionDropdownItem)
}
