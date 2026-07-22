import {
  buildEquipmentCompactSummary,
  CHARACTER_EQUIPMENT_INVENTORY_BUCKETS,
  formatSelectionSourceLabel,
  formatSpellConcentrationMarker,
  formatSpellRitualMarker,
  getSpellSchoolLabel,
  type CharacterBuildCatalogIndex,
  type CharacterEquipmentEntry,
  type CharacterEquipmentInventoryBucket,
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

import { formatContentReferenceLabel } from '../format-content-reference-label'
import {
  buildMissingCatalogCard,
  buildResolvedCatalogCard,
  catalogHeaderAvailability,
  type CatalogHeaderModelBase,
  type CharacterSheetCatalogCard,
  type CharacterSheetItemSource,
} from './character-sheet-catalog-card.lib'

/**
 * Character sheet catalog cards — resolved/missing view models for equipment and spells.
 *
 * Growth direction:
 * - Add new catalog-backed detail tabs by defining a `CharacterSheetCatalogCard<…>` alias
 *   with a domain-specific entity key (`equipment`, `spell`, …) and extra fields.
 * - Register unavailable copy in `CHARACTER_SHEET_CATALOG_UNAVAILABLE_MESSAGES` before wiring
 *   a `to*CatalogHeaderModel` mapper.
 * - Keep domain-specific builders, metadata mappers, and filter dimensions in per-content
 *   modules; only lift logic here when a second consumer needs the same primitive.
 *
 * Watch for:
 * - Occurrence identity: equipment rows need stable `id` values across duplicate references
 *   (see `resolveEquipmentOccurrenceId`); spells currently key on `spellId` or index fallback.
 * - Missing cards still carry the character `entry` so editors can repair broken references.
 * - Structured filters should exclude `status: 'missing'` cards (they lack catalog metadata).
 * - Header mappers own presentation-only fields; card types own sheet/builder data.
 */
export type { CharacterSheetItemSource }

type CharacterSheetEquipmentCardExtra = {
  bucket: CharacterEquipmentInventoryBucket
  quantity: number
  equipped: boolean
}

export type CharacterSheetEquipmentCard = CharacterSheetCatalogCard<
  Equipment,
  CharacterEquipmentEntry,
  CharacterSheetEquipmentCardExtra,
  'equipment'
>

export type CharacterSheetEquipmentCardResolved = Extract<
  CharacterSheetEquipmentCard,
  { status: 'resolved' }
>

export type CharacterSheetEquipmentCardMissing = Extract<
  CharacterSheetEquipmentCard,
  { status: 'missing' }
>

type CharacterSheetSpellCardExtra = {
  prepared: boolean
}

export type CharacterSheetSpellCard = CharacterSheetCatalogCard<
  Spell,
  CharacterSpellEntry,
  CharacterSheetSpellCardExtra,
  'spell'
>

export type CharacterSheetSpellCardResolved = Extract<
  CharacterSheetSpellCard,
  { status: 'resolved' }
>

export type CharacterSheetSpellCardMissing = Extract<CharacterSheetSpellCard, { status: 'missing' }>

export type EquipmentCatalogHeaderModel = CatalogHeaderModelBase<EquipmentCatalogItemHeaderTone> & {
  sourceLabel?: string
  equipped: boolean
}

export type SpellCatalogHeaderModel = CatalogHeaderModelBase<SpellCatalogItemHeaderTone> & {
  markers: readonly SpellMarker[]
  footerLabels: readonly string[]
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
  return entry.customName ?? equipment?.name ?? formatContentReferenceLabel(entry.equipmentId)
}

function resolveEquipmentOccurrenceId(
  entry: CharacterEquipmentEntry,
  bucket: CharacterEquipmentInventoryBucket,
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

  for (const bucket of CHARACTER_EQUIPMENT_INVENTORY_BUCKETS) {
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
          ? buildResolvedCatalogCard(base, entry, equipment, 'equipment')
          : buildMissingCatalogCard(base, entry),
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
    const displayName = spell?.name ?? formatContentReferenceLabel(entry.spellId)
    const sources = normalizeSheetSources(entry.sources, catalogIndex)
    const base = {
      displayName,
      referenceId: entry.spellId,
      prepared: entry.selection?.prepared ?? false,
      sources,
    }

    if (spell) {
      return buildResolvedCatalogCard({ ...base, id: entry.spellId }, entry, spell, 'spell')
    }

    return buildMissingCatalogCard({ ...base, id: `${entry.spellId}:${index}` }, entry)
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
  const availability = catalogHeaderAvailability(card.status, 'equipment')

  return {
    name: card.displayName,
    metadataLines:
      card.status === 'resolved' ? mapEquipmentCompactSummaryToMetadataLines(card.equipment) : [],
    sourceLabel: card.sources[0]?.label,
    equipped: card.equipped,
    ...availability,
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
  const availability = catalogHeaderAvailability(card.status, 'spell')

  return {
    name: card.displayName,
    metadataLines:
      card.status === 'resolved' ? mapSpellCompactSummaryToMetadataLines(card.spell) : [],
    markers: card.status === 'resolved' ? collectSpellMarkers(card.spell) : [],
    footerLabels,
    ...availability,
  }
}
