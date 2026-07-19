import {
  buildEquipmentCompactSummary,
  formatSelectionSourceLabel,
  formatSpellConcentrationMarker,
  formatSpellRitualMarker,
  getSpellSchoolLabel,
  type CharacterBuildCatalogIndex,
  type CharacterEquipmentEntry,
  type CharacterSelectionSource,
  type CharacterSpellEntry,
  type Equipment,
  type Character,
  type Spell,
} from '@rpg/contracts'

import type { CatalogMetadataLine } from '@/features/content/components/catalog'
import type { EquipmentCatalogItemHeaderTone } from '@/features/content/equipment/components/equipment-catalog-item-header.client'
import type { SpellCatalogItemHeaderTone } from '@/features/content/spells/components/spell-catalog-item-header.client'
import type { SpellMarker } from '@/features/content/spells/components/spell-catalog-item-header.client'

export const EQUIPMENT_COLLECTION_BUCKETS = [
  'weapons',
  'armor',
  'tools',
  'gear',
  'magicItems',
  'vehicles',
  'mounts',
] as const

export type EquipmentCollectionBucket = (typeof EQUIPMENT_COLLECTION_BUCKETS)[number]

export type CharacterSheetItemSource = {
  label: string
}

type CharacterSheetEquipmentCardBase = {
  id: string
  displayName: string
  referenceId: string
  bucket: EquipmentCollectionBucket
  quantity: number
  equipped: boolean
  sources: readonly CharacterSheetItemSource[]
}

export type CharacterSheetEquipmentCardResolved = CharacterSheetEquipmentCardBase & {
  status: 'resolved'
  equipment: Equipment
  entry: CharacterEquipmentEntry
}

export type CharacterSheetEquipmentCardMissing = CharacterSheetEquipmentCardBase & {
  status: 'missing'
  entry: CharacterEquipmentEntry
}

export type CharacterSheetEquipmentCard =
  | CharacterSheetEquipmentCardResolved
  | CharacterSheetEquipmentCardMissing

type CharacterSheetSpellCardBase = {
  id: string
  displayName: string
  referenceId: string
  prepared: boolean
  sources: readonly CharacterSheetItemSource[]
}

export type CharacterSheetSpellCardResolved = CharacterSheetSpellCardBase & {
  status: 'resolved'
  spell: Spell
  entry: CharacterSpellEntry
}

export type CharacterSheetSpellCardMissing = CharacterSheetSpellCardBase & {
  status: 'missing'
  entry: CharacterSpellEntry
}

export type CharacterSheetSpellCard =
  | CharacterSheetSpellCardResolved
  | CharacterSheetSpellCardMissing

export type EquipmentCatalogHeaderModel = {
  name: string
  metadataLines: readonly CatalogMetadataLine[]
  tone: EquipmentCatalogItemHeaderTone
  sourceLabel?: string
  equipped: boolean
  unavailableMessage?: string
}

export type SpellCatalogHeaderModel = {
  name: string
  metadataLines: readonly CatalogMetadataLine[]
  markers: readonly SpellMarker[]
  tone: SpellCatalogItemHeaderTone
  footerLabels: readonly string[]
  unavailableMessage?: string
}

function formatContentIdLabel(id: string): string {
  const slug = id.includes(':') ? (id.split(':').pop() ?? id) : id
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

/** Canonical provenance signature for duplicate occurrence identity. */
export function buildSourceSignature(sources: CharacterSelectionSource[] | undefined): string {
  if (!sources || sources.length === 0) return 'no-source'

  return [...sources]
    .map((source) => `${source.kind}:${source.sourceId ?? ''}:${source.grantId ?? ''}`)
    .sort()
    .join('|')
}

function normalizeSheetSources(
  sources: CharacterSelectionSource[] | undefined,
  catalogIndex: CharacterBuildCatalogIndex,
): CharacterSheetItemSource[] {
  const label = formatSelectionSourceLabel(sources, catalogIndex)
  return [{ label }]
}

function resolveEquipmentDisplayName(
  entry: CharacterEquipmentEntry,
  catalogIndex: CharacterBuildCatalogIndex,
): string {
  const equipment = catalogIndex.equipment.get(entry.equipmentId)
  return entry.customName ?? equipment?.name ?? formatContentIdLabel(entry.equipmentId)
}

function resolveEquipmentOccurrenceId(
  entry: CharacterEquipmentEntry,
  bucket: EquipmentCollectionBucket,
  occurrenceIndex: number,
): string {
  if (entry.entryId) return entry.entryId

  return `${entry.equipmentId}:${bucket}:${buildSourceSignature(entry.sources)}:${occurrenceIndex}`
}

function buildEquipmentCards(
  character: Character,
  catalogIndex: CharacterBuildCatalogIndex,
): CharacterSheetEquipmentCard[] {
  const occurrenceCounts = new Map<string, number>()
  const cards: CharacterSheetEquipmentCard[] = []

  for (const bucket of EQUIPMENT_COLLECTION_BUCKETS) {
    for (const entry of character.equipment[bucket]) {
      const signature = `${entry.equipmentId}:${bucket}:${buildSourceSignature(entry.sources)}`
      const occurrenceIndex = occurrenceCounts.get(signature) ?? 0
      occurrenceCounts.set(signature, occurrenceIndex + 1)

      const equipment = catalogIndex.equipment.get(entry.equipmentId)
      const displayName = resolveEquipmentDisplayName(entry, catalogIndex)
      const sources = normalizeSheetSources(entry.sources, catalogIndex)
      const base = {
        id: resolveEquipmentOccurrenceId(entry, bucket, occurrenceIndex),
        displayName,
        referenceId: entry.equipmentId,
        bucket,
        quantity: entry.quantity,
        equipped: entry.equipped ?? false,
        sources,
      }

      cards.push(
        equipment
          ? { ...base, status: 'resolved', equipment, entry }
          : { ...base, status: 'missing', entry },
      )
    }
  }

  return cards
}

function buildSpellCards(
  character: Character,
  catalogIndex: CharacterBuildCatalogIndex,
): CharacterSheetSpellCard[] {
  return character.spells.map((entry, index) => {
    const spell = catalogIndex.spells.get(entry.spellId)
    const displayName = spell?.name ?? formatContentIdLabel(entry.spellId)
    const sources = normalizeSheetSources(entry.sources, catalogIndex)
    const base = {
      displayName,
      referenceId: entry.spellId,
      prepared: entry.selection?.prepared ?? false,
      sources,
    }

    if (spell) {
      return {
        ...base,
        id: entry.spellId,
        status: 'resolved' as const,
        spell,
        entry,
      }
    }

    return {
      ...base,
      id: `${entry.spellId}:${index}`,
      status: 'missing' as const,
      entry,
    }
  })
}

export function buildCharacterSheetEquipmentCards(
  character: Character,
  catalogIndex: CharacterBuildCatalogIndex,
): CharacterSheetEquipmentCard[] {
  return buildEquipmentCards(character, catalogIndex)
}

export function buildCharacterSheetSpellCards(
  character: Character,
  catalogIndex: CharacterBuildCatalogIndex,
): CharacterSheetSpellCard[] {
  return buildSpellCards(character, catalogIndex)
}

function mapEquipmentCompactSummaryToMetadataLines(
  equipment: Equipment,
): readonly CatalogMetadataLine[] {
  const { comparisonGroups } = buildEquipmentCompactSummary(equipment)
  if (comparisonGroups.length === 0) return []

  return [
    {
      segments: comparisonGroups.map((group) => ({
        type: 'text' as const,
        text: group,
      })),
    },
  ]
}

export function toEquipmentCatalogHeaderModel(
  card: CharacterSheetEquipmentCard,
): EquipmentCatalogHeaderModel {
  return {
    name: card.displayName,
    metadataLines:
      card.status === 'resolved' ? mapEquipmentCompactSummaryToMetadataLines(card.equipment) : [],
    tone: card.status === 'missing' ? 'unavailable' : 'default',
    sourceLabel: card.sources[0]?.label,
    equipped: card.equipped,
    unavailableMessage: card.status === 'missing' ? 'Equipment reference unavailable' : undefined,
  }
}

function collectSpellMarkers(spell: Spell): SpellMarker[] {
  const markers: SpellMarker[] = []
  const concentration = formatSpellConcentrationMarker(spell.duration)
  if (concentration) markers.push(concentration)
  const ritual = formatSpellRitualMarker(spell.castingTime)
  if (ritual) markers.push(ritual)
  return markers
}

function mapSpellCompactSummaryToMetadataLines(spell: Spell): readonly CatalogMetadataLine[] {
  const levelLabel = spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`

  return [
    {
      segments: [
        { type: 'text', text: levelLabel },
        { type: 'text', text: getSpellSchoolLabel(spell.school) },
      ],
    },
  ]
}

export function toSpellCatalogHeaderModel(card: CharacterSheetSpellCard): SpellCatalogHeaderModel {
  const footerLabels = [card.sources[0]?.label, card.prepared ? 'Prepared' : undefined].filter(
    (label): label is string => Boolean(label),
  )

  return {
    name: card.displayName,
    metadataLines:
      card.status === 'resolved' ? mapSpellCompactSummaryToMetadataLines(card.spell) : [],
    markers: card.status === 'resolved' ? collectSpellMarkers(card.spell) : [],
    tone: card.status === 'missing' ? 'unavailable' : 'default',
    footerLabels,
    unavailableMessage: card.status === 'missing' ? 'Spell reference unavailable' : undefined,
  }
}
