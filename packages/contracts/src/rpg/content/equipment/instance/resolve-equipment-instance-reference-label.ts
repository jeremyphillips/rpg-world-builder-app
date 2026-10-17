import { joinInlineMetadata } from '../../../primitives/inline-metadata'
import type { Equipment } from '../../equipment'
import { formatEquipmentEntryDisplayToken } from './equipment-entry-display-token'
import type { EquipmentInstance } from './instance'
import type { MagicPropertyDefinitionProvider } from './magic-property'
import {
  resolveEquipmentInstanceSummary,
  type EquipmentInstanceSummary,
} from './resolve-equipment-instance-summary'

function disambiguationSegments(
  summary: EquipmentInstanceSummary,
  siblings: readonly EquipmentInstanceSummary[],
): string[] {
  const peers = siblings.filter((row) => row.displayName === summary.displayName)
  if (peers.length < 2) return []

  const segments: string[] = []
  const equippedDiffers = peers.some((peer) => peer.equipped !== summary.equipped)
  if (equippedDiffers) {
    segments.push(summary.equipped ? 'Equipped' : 'Unequipped')
  }
  const magicalDiffers = peers.some((peer) => peer.magical !== summary.magical)
  if (magicalDiffers && summary.magical) {
    segments.push('Magical')
  }
  segments.push(...summary.metadataSegments)
  return segments
}

function baseReferenceLabel(
  summary: EquipmentInstanceSummary,
  siblings: readonly EquipmentInstanceSummary[],
): string {
  const segments = [summary.displayName, ...disambiguationSegments(summary, siblings)]
  return joinInlineMetadata(segments)
}

export function resolveEquipmentInstanceReferenceLabel(
  entry: EquipmentInstance,
  item: Equipment | undefined,
  provider: MagicPropertyDefinitionProvider,
  siblings: readonly EquipmentInstance[],
): string {
  const resolveSiblingItem = (sibling: EquipmentInstance): Equipment | undefined =>
    sibling.equipmentId === entry.equipmentId ? item : undefined

  const summaries = siblings.map((sibling) =>
    resolveEquipmentInstanceSummary(sibling, resolveSiblingItem(sibling), provider),
  )

  const entryIndex = siblings.findIndex((sibling) => sibling.entryId === entry.entryId)
  const summary =
    entryIndex >= 0
      ? summaries[entryIndex]!
      : resolveEquipmentInstanceSummary(entry, item, provider)

  const labels = summaries.map((siblingSummary) => baseReferenceLabel(siblingSummary, summaries))
  const labelIndex = entryIndex >= 0 ? entryIndex : 0
  const finalLabel = labels[labelIndex] ?? baseReferenceLabel(summary, summaries)

  const collision = labels.filter((label) => label === finalLabel).length > 1
  if (!collision) return finalLabel

  const entryId = entry.entryId ?? entry.equipmentId
  const siblingIds = siblings.map((sibling) => sibling.entryId ?? sibling.equipmentId)
  const token = formatEquipmentEntryDisplayToken(entryId, siblingIds)
  if (!token) return finalLabel
  return joinInlineMetadata([finalLabel, token])
}
