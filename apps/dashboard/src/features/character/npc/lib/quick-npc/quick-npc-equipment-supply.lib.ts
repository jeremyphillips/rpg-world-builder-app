import {
  adaptCharacterSelectionToEquipmentSupply,
  buildEquipmentCompactSummary,
  getEquipmentKindLabel,
  optionIdentitiesOverlap,
  projectEquipmentSelection,
  resolveEquipmentAdditionPolicy,
  type CharacterBuildCatalogIndex,
  type CharacterSelectionSource,
  type EquipmentSupplySource,
  type NpcStartingChoices,
  type RecommendationSourceName,
  type ResolvedEquipmentOption,
  type SelectionSourceLabelCatalogIndex,
} from '@rpg/contracts'

import {
  equipmentOptionAccessibleLabel,
  resolveEquipmentOptionRowPresentation,
  type EquipmentOptionRowPresentation,
} from '@/features/character/lib/equipment/equipment-option-row-presentation.lib'
import { listEquipmentInventoryRowsFromDraft } from '@/features/character/lib/equipment/equipment-step.lib'
import { buildEquipmentPickerRowViewModel } from '@/features/content'

import type { QuickNpcAdditionalEquipmentOption } from './quick-npc-additional-equipment.lib'
import {
  formatQuickNpcAdditionalEquipmentContext,
  presentQuickNpcEquipmentSupplyClauses,
} from './quick-npc-equipment-presentation.lib'
import type { QuickNpcEquipmentSelection, QuickNpcSetupValues } from './quick-npc-form-fields'
import { isGrantedEquipmentContribution } from './quick-npc-starting-equipment.lib'

export type EquipmentSupplyContribution = {
  source: EquipmentSupplySource
  quantity: number
}

type QuickNpcEquipmentSupply = {
  quantity: number
  contributions: EquipmentSupplyContribution[]
}

export type QuickNpcEquipmentAllocation = {
  startingEquipmentGrants: { equipmentId: string; quantity: number }[]
}

type QuantityBucket = {
  quantity: number
  manualQuantity: number
  hasManual: boolean
}

/**
 * Aggregates duplicate origins. Classless rows persist every origin's total.
 * Classed rows persist only the manual Add equipment contribution, for every
 * equipment kind. That contribution never becomes a weapon-id constraint.
 */
export function projectQuickNpcEquipmentAllocations(args: {
  equipmentSelections: readonly QuickNpcEquipmentSelection[]
  catalogIndex: CharacterBuildCatalogIndex
  classed: boolean
}): QuickNpcEquipmentAllocation {
  const totals = new Map<string, QuantityBucket>()
  for (const row of args.equipmentSelections) {
    const current = totals.get(row.equipmentId) ?? {
      quantity: 0,
      manualQuantity: 0,
      hasManual: false,
    }
    current.quantity += row.quantity
    if (row.origin === 'manual') {
      current.manualQuantity += row.quantity
      current.hasManual = true
    }
    totals.set(row.equipmentId, current)
  }

  if (!args.classed) {
    return {
      startingEquipmentGrants: [...totals.entries()].map(([equipmentId, total]) => ({
        equipmentId,
        quantity: total.quantity,
      })),
    }
  }

  const startingEquipmentGrants: QuickNpcEquipmentAllocation['startingEquipmentGrants'] = []
  for (const [equipmentId, total] of totals) {
    if (!total.hasManual || total.manualQuantity < 1) continue
    if (!args.catalogIndex.equipment.get(equipmentId)) continue
    startingEquipmentGrants.push({ equipmentId, quantity: total.manualQuantity })
  }

  return { startingEquipmentGrants }
}

function formSupplySource(
  origin: QuickNpcEquipmentSelection['origin'],
  roleId: string | undefined,
): EquipmentSupplySource {
  if (origin === 'role-default' && roleId) return { kind: 'role-default', id: roleId }
  if (origin === 'role-default') return { kind: 'role-default', id: 'role' }
  return { kind: 'manual' }
}

function overlaps(equipmentId: string, candidateId: string): boolean {
  return optionIdentitiesOverlap(equipmentId, candidateId)
}

function equipmentSupplyContributionKey(source: EquipmentSupplySource): string {
  switch (source.kind) {
    case 'manual':
      return 'manual'
    case 'role':
    case 'role-default':
      return `${source.kind}:${source.id}`
    case 'recorded': {
      const recorded = source.source
      return `recorded:${recorded.kind}:${recorded.sourceId ?? ''}:${recorded.grantId ?? ''}`
    }
    default: {
      const _exhaustive: never = source
      return _exhaustive
    }
  }
}

function mergeEquipmentSupplyContributions(
  parts: readonly EquipmentSupplyContribution[],
): EquipmentSupplyContribution[] {
  const buckets = new Map<string, EquipmentSupplyContribution>()
  for (const part of parts) {
    if (part.quantity <= 0) continue
    const key = equipmentSupplyContributionKey(part.source)
    const current = buckets.get(key)
    buckets.set(
      key,
      current
        ? { source: current.source, quantity: current.quantity + part.quantity }
        : { source: part.source, quantity: part.quantity },
    )
  }
  return [...buckets.values()]
}

function collectQuickNpcEquipmentSupplyFromSelections(args: {
  equipmentId: string
  equipmentSelections: readonly QuickNpcEquipmentSelection[]
  roleId?: string
}): QuickNpcEquipmentSupply {
  const contributions: EquipmentSupplyContribution[] = []
  let quantity = 0
  for (const row of args.equipmentSelections) {
    if (!overlaps(args.equipmentId, row.equipmentId)) continue
    quantity += row.quantity
    contributions.push({
      source: formSupplySource(row.origin, args.roleId),
      quantity: row.quantity,
    })
  }
  return { quantity, contributions }
}

function collectQuickNpcEquipmentSupplyFromContributions(args: {
  equipmentId: string
  choices: NpcStartingChoices
}): QuickNpcEquipmentSupply {
  const contributions: EquipmentSupplyContribution[] = []
  let quantity = 0
  for (const contribution of args.choices.contributions) {
    if (!isGrantedEquipmentContribution(contribution)) continue
    for (const selectedId of contribution.selectedIds) {
      if (!overlaps(args.equipmentId, selectedId)) continue
      const quantityForId = contribution.quantities?.[selectedId] ?? 1
      quantity += quantityForId
      contributions.push({
        source: adaptCharacterSelectionToEquipmentSupply(contribution.source),
        quantity: quantityForId,
      })
    }
  }
  return { quantity, contributions }
}

function packageSupplySource(
  recorded: readonly EquipmentSupplySource[],
  classId: string,
  equipmentId: string,
): EquipmentSupplySource {
  return (
    recorded[0] ??
    adaptCharacterSelectionToEquipmentSupply({
      kind: 'classStartingEquipment',
      sourceId: classId,
      grantId: equipmentId,
    } satisfies CharacterSelectionSource)
  )
}

type EquipmentInventoryRow = ReturnType<typeof listEquipmentInventoryRowsFromDraft>[number]

function collectQuickNpcEquipmentSupplyFromDraft(args: {
  equipmentId: string
  classId: string
  packageInventoryRows: readonly EquipmentInventoryRow[]
}): QuickNpcEquipmentSupply {
  const contributions: EquipmentSupplyContribution[] = []
  let quantity = 0
  for (const row of args.packageInventoryRows) {
    if (row.removeTarget?.kind !== 'package') continue
    if (!overlaps(args.equipmentId, row.entry.equipmentId)) continue
    quantity += row.entry.quantity
    contributions.push({
      source: packageSupplySource(
        (row.entry.sources ?? []).map(adaptCharacterSelectionToEquipmentSupply),
        args.classId,
        row.entry.equipmentId,
      ),
      quantity: row.entry.quantity,
    })
  }
  return { quantity, contributions }
}

export function listQuickNpcPackageInventoryRows(args: {
  choices: NpcStartingChoices
  catalogIndex: CharacterBuildCatalogIndex
  classId?: string
}): readonly EquipmentInventoryRow[] {
  if (!args.classId) return []
  return listEquipmentInventoryRowsFromDraft(args.choices.draft, args.catalogIndex)
}

export function collectQuickNpcEquipmentSupply(args: {
  equipmentId: string
  equipmentSelections: readonly QuickNpcEquipmentSelection[]
  roleId?: string
  choices: NpcStartingChoices
  catalogIndex: CharacterBuildCatalogIndex
  classId?: string
  packageInventoryRows?: readonly EquipmentInventoryRow[]
}): QuickNpcEquipmentSupply {
  const fromSelections = collectQuickNpcEquipmentSupplyFromSelections(args)
  const fromContributions = collectQuickNpcEquipmentSupplyFromContributions(args)
  const packageInventoryRows =
    args.packageInventoryRows ??
    listQuickNpcPackageInventoryRows({
      choices: args.choices,
      catalogIndex: args.catalogIndex,
      ...(args.classId ? { classId: args.classId } : {}),
    })
  const fromDraft = args.classId
    ? collectQuickNpcEquipmentSupplyFromDraft({
        equipmentId: args.equipmentId,
        classId: args.classId,
        packageInventoryRows,
      })
    : { quantity: 0, contributions: [] }

  return {
    quantity: fromSelections.quantity + fromContributions.quantity + fromDraft.quantity,
    contributions: mergeEquipmentSupplyContributions([
      ...fromSelections.contributions,
      ...fromContributions.contributions,
      ...fromDraft.contributions,
    ]),
  }
}

export function presentQuickNpcEquipmentOption(args: {
  entry: QuickNpcAdditionalEquipmentOption
  equipmentSelections: readonly QuickNpcEquipmentSelection[]
  roleId?: string
  choices: NpcStartingChoices
  catalogIndex: CharacterBuildCatalogIndex
  classId?: string
  sourceName?: RecommendationSourceName
  supplyCatalog?: SelectionSourceLabelCatalogIndex
  packageInventoryRows?: readonly EquipmentInventoryRow[]
}): EquipmentOptionRowPresentation {
  const equipment = args.entry.pickerItem.equipment
  const compact = buildEquipmentCompactSummary(equipment, 'compact-row')
  const row = buildEquipmentPickerRowViewModel(equipment, 'compact-row')
  const supply = collectQuickNpcEquipmentSupply({
    equipmentId: equipment.id,
    equipmentSelections: args.equipmentSelections,
    ...(args.roleId ? { roleId: args.roleId } : {}),
    choices: args.choices,
    catalogIndex: args.catalogIndex,
    ...(args.classId ? { classId: args.classId } : {}),
    ...(args.packageInventoryRows ? { packageInventoryRows: args.packageInventoryRows } : {}),
  })
  const addition = resolveEquipmentAdditionPolicy({
    equipment,
    context: { kind: 'grant' },
  })
  const baseResolved: ResolvedEquipmentOption = args.entry.pickerItem.state.resolved ?? {
    requirements: [],
    recommendation: { strength: 'neutral', signals: [] },
    state: {},
  }
  const resolved = projectEquipmentSelection({
    resolved: baseResolved,
    quantity: supply.quantity,
    sources: supply.contributions.map((contribution) => contribution.source),
    addition,
  })
  const supplyCatalog = args.supplyCatalog ?? args.catalogIndex
  return resolveEquipmentOptionRowPresentation({
    identity: row.name,
    kindLabel: getEquipmentKindLabel(equipment.kind),
    metadata: compact.comparisonGroups,
    resolved,
    supplyClauses: presentQuickNpcEquipmentSupplyClauses({
      contributions: supply.contributions,
      catalog: supplyCatalog,
    }),
    ...(args.sourceName ? { sourceName: args.sourceName } : {}),
    supplyCatalog,
  })
}

export function quickNpcEquipmentOptionAccessibleLabel(
  presentation: EquipmentOptionRowPresentation,
): string {
  return equipmentOptionAccessibleLabel(presentation)
}

export type QuickNpcSelectedAdditionalEquipmentRow = {
  entry: QuickNpcAdditionalEquipmentOption
  equipmentId: string
  manualQuantity: number
  totalQuantity: number
  contextLabel?: string
}

function manualSelectionQuantity(
  equipmentSelections: readonly QuickNpcEquipmentSelection[],
  equipmentId: string,
): number {
  return equipmentSelections.reduce((total, row) => {
    if (row.equipmentId !== equipmentId || row.origin !== 'manual') return total
    return total + row.quantity
  }, 0)
}

export function listSelectedQuickNpcAdditionalEquipment(args: {
  equipmentSelections: readonly QuickNpcEquipmentSelection[]
  additionalOptions: readonly QuickNpcAdditionalEquipmentOption[]
  choices: NpcStartingChoices
  catalogIndex: CharacterBuildCatalogIndex
  roleId?: string
  classId?: string
  packageInventoryRows?: readonly EquipmentInventoryRow[]
}): QuickNpcSelectedAdditionalEquipmentRow[] {
  const packageInventoryRows =
    args.packageInventoryRows ??
    listQuickNpcPackageInventoryRows({
      choices: args.choices,
      catalogIndex: args.catalogIndex,
      ...(args.classId ? { classId: args.classId } : {}),
    })
  const equipmentIds: string[] = []
  const seen = new Set<string>()
  for (const selection of args.equipmentSelections) {
    if (seen.has(selection.equipmentId)) continue
    seen.add(selection.equipmentId)
    equipmentIds.push(selection.equipmentId)
  }

  return equipmentIds.flatMap((equipmentId) => {
    const entry = args.additionalOptions.find((option) => option.option.value === equipmentId)
    if (!entry) return []
    const supply = collectQuickNpcEquipmentSupply({
      equipmentId,
      equipmentSelections: args.equipmentSelections,
      choices: args.choices,
      catalogIndex: args.catalogIndex,
      packageInventoryRows,
      ...(args.roleId ? { roleId: args.roleId } : {}),
      ...(args.classId ? { classId: args.classId } : {}),
    })
    const manualQuantity = manualSelectionQuantity(args.equipmentSelections, equipmentId)
    const contextLabel = formatQuickNpcAdditionalEquipmentContext({
      totalQuantity: supply.quantity,
      manualQuantity,
      supplyClauses: presentQuickNpcEquipmentSupplyClauses({
        contributions: supply.contributions,
        catalog: args.catalogIndex,
      }),
    })
    return [
      {
        entry,
        equipmentId,
        manualQuantity,
        totalQuantity: supply.quantity,
        ...(contextLabel ? { contextLabel } : {}),
      },
    ]
  })
}

export function buildQuickNpcAdditionalEquipmentPresentationMap(args: {
  entries: readonly QuickNpcAdditionalEquipmentOption[]
  equipmentSelections: readonly QuickNpcEquipmentSelection[]
  choices: NpcStartingChoices
  catalogIndex: CharacterBuildCatalogIndex
  setup: Pick<QuickNpcSetupValues, 'classId' | 'npcTemplateId'>
  sourceName?: RecommendationSourceName
  packageInventoryRows?: readonly EquipmentInventoryRow[]
}): Map<string, EquipmentOptionRowPresentation> {
  const packageInventoryRows =
    args.packageInventoryRows ??
    listQuickNpcPackageInventoryRows({
      choices: args.choices,
      catalogIndex: args.catalogIndex,
      ...(args.setup.classId ? { classId: args.setup.classId } : {}),
    })
  return new Map(
    args.entries.map((entry) => [
      entry.option.value,
      presentQuickNpcEquipmentOption({
        entry,
        equipmentSelections: args.equipmentSelections,
        choices: args.choices,
        catalogIndex: args.catalogIndex,
        supplyCatalog: args.catalogIndex,
        packageInventoryRows,
        ...(args.setup.npcTemplateId ? { roleId: args.setup.npcTemplateId } : {}),
        ...(args.setup.classId ? { classId: args.setup.classId } : {}),
        ...(args.sourceName ? { sourceName: args.sourceName } : {}),
      }),
    ]),
  )
}

export function canAppendQuickNpcAdditionalEquipment(args: {
  entry: QuickNpcAdditionalEquipmentOption | undefined
  equipmentSelections: readonly QuickNpcEquipmentSelection[]
  choices: NpcStartingChoices
  catalogIndex: CharacterBuildCatalogIndex
  setup: Pick<QuickNpcSetupValues, 'classId' | 'npcTemplateId'>
}): boolean {
  if (!args.entry) return false
  return !presentQuickNpcEquipmentOption({
    entry: args.entry,
    equipmentSelections: args.equipmentSelections,
    choices: args.choices,
    catalogIndex: args.catalogIndex,
    supplyCatalog: args.catalogIndex,
    ...(args.setup.npcTemplateId ? { roleId: args.setup.npcTemplateId } : {}),
    ...(args.setup.classId ? { classId: args.setup.classId } : {}),
  }).disabled
}

export function incrementQuickNpcManualEquipmentSelection(args: {
  equipmentSelections: readonly QuickNpcEquipmentSelection[]
  equipmentId: string
}): QuickNpcEquipmentSelection[] {
  const manualIndex = args.equipmentSelections.findIndex(
    (row) => row.equipmentId === args.equipmentId && row.origin === 'manual',
  )
  const next = [...args.equipmentSelections]
  if (manualIndex >= 0) {
    const current = next[manualIndex]!
    next[manualIndex] = { ...current, quantity: current.quantity + 1 }
  } else {
    next.push({ equipmentId: args.equipmentId, quantity: 1, origin: 'manual' })
  }
  return next
}
