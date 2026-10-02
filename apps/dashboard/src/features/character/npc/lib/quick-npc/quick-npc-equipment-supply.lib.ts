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
import type { QuickNpcEquipmentSelection, QuickNpcSetupValues } from './quick-npc-form-fields'
import { isGrantedEquipmentContribution } from './quick-npc-starting-equipment.lib'

export type QuickNpcEquipmentAllocation = {
  requiredWeaponIds: string[]
  manualEquipmentGrantIds: string[]
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
      requiredWeaponIds: [],
      manualEquipmentGrantIds: [],
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

  return { requiredWeaponIds: [], manualEquipmentGrantIds: [], startingEquipmentGrants }
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

function collectQuickNpcEquipmentSupplyFromSelections(args: {
  equipmentId: string
  equipmentSelections: readonly QuickNpcEquipmentSelection[]
  roleId?: string
}): { quantity: number; sources: EquipmentSupplySource[] } {
  const sources: EquipmentSupplySource[] = []
  let quantity = 0
  for (const row of args.equipmentSelections) {
    if (!overlaps(args.equipmentId, row.equipmentId)) continue
    quantity += row.quantity
    sources.push(formSupplySource(row.origin, args.roleId))
  }
  return { quantity, sources }
}

function collectQuickNpcEquipmentSupplyFromContributions(args: {
  equipmentId: string
  choices: NpcStartingChoices
}): { quantity: number; sources: EquipmentSupplySource[] } {
  const sources: EquipmentSupplySource[] = []
  let quantity = 0
  for (const contribution of args.choices.contributions) {
    if (!isGrantedEquipmentContribution(contribution)) continue
    for (const selectedId of contribution.selectedIds) {
      if (!overlaps(args.equipmentId, selectedId)) continue
      quantity += contribution.quantities?.[selectedId] ?? 1
      sources.push(adaptCharacterSelectionToEquipmentSupply(contribution.source))
    }
  }
  return { quantity, sources }
}

function collectQuickNpcEquipmentSupplyFromDraft(args: {
  equipmentId: string
  classId: string
  choices: NpcStartingChoices
  catalogIndex: CharacterBuildCatalogIndex
}): { quantity: number; sources: EquipmentSupplySource[] } {
  const sources: EquipmentSupplySource[] = []
  let quantity = 0
  for (const row of listEquipmentInventoryRowsFromDraft(args.choices.draft, args.catalogIndex)) {
    if (row.removeTarget?.kind !== 'package') continue
    if (!overlaps(args.equipmentId, row.entry.equipmentId)) continue
    quantity += row.entry.quantity
    const recorded = (row.entry.sources ?? []).map(adaptCharacterSelectionToEquipmentSupply)
    if (recorded.length > 0) {
      sources.push(...recorded)
      continue
    }
    sources.push(
      adaptCharacterSelectionToEquipmentSupply({
        kind: 'classStartingEquipment',
        sourceId: args.classId,
        grantId: row.entry.equipmentId,
      } satisfies CharacterSelectionSource),
    )
  }
  return { quantity, sources }
}

export function collectQuickNpcEquipmentSupply(args: {
  equipmentId: string
  equipmentSelections: readonly QuickNpcEquipmentSelection[]
  roleId?: string
  choices: NpcStartingChoices
  catalogIndex: CharacterBuildCatalogIndex
  classId?: string
}): { quantity: number; sources: EquipmentSupplySource[] } {
  const fromSelections = collectQuickNpcEquipmentSupplyFromSelections(args)
  const fromContributions = collectQuickNpcEquipmentSupplyFromContributions(args)
  const fromDraft = args.classId
    ? collectQuickNpcEquipmentSupplyFromDraft({ ...args, classId: args.classId })
    : { quantity: 0, sources: [] as EquipmentSupplySource[] }

  return {
    quantity: fromSelections.quantity + fromContributions.quantity + fromDraft.quantity,
    sources: [...fromSelections.sources, ...fromContributions.sources, ...fromDraft.sources],
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
    sources: supply.sources,
    addition,
  })
  return resolveEquipmentOptionRowPresentation({
    identity: row.name,
    kindLabel: getEquipmentKindLabel(equipment.kind),
    metadata: compact.comparisonGroups,
    resolved,
    ...(args.sourceName ? { sourceName: args.sourceName } : {}),
    ...(args.supplyCatalog ? { supplyCatalog: args.supplyCatalog } : {}),
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
  quantity: number
}

export function listSelectedQuickNpcAdditionalEquipment(args: {
  equipmentSelections: readonly QuickNpcEquipmentSelection[]
  additionalOptions: readonly QuickNpcAdditionalEquipmentOption[]
}): QuickNpcSelectedAdditionalEquipmentRow[] {
  const totals = new Map<string, number>()
  for (const selection of args.equipmentSelections) {
    totals.set(selection.equipmentId, (totals.get(selection.equipmentId) ?? 0) + selection.quantity)
  }
  return [...totals.entries()].flatMap(([equipmentId, quantity]) => {
    const entry = args.additionalOptions.find((option) => option.option.value === equipmentId)
    return entry ? [{ entry, equipmentId, quantity }] : []
  })
}

export function buildQuickNpcAdditionalEquipmentPresentationMap(args: {
  entries: readonly QuickNpcAdditionalEquipmentOption[]
  equipmentSelections: readonly QuickNpcEquipmentSelection[]
  choices: NpcStartingChoices
  catalogIndex: CharacterBuildCatalogIndex
  setup: Pick<QuickNpcSetupValues, 'classId' | 'npcTemplateId'>
  sourceName?: RecommendationSourceName
}): Map<string, EquipmentOptionRowPresentation> {
  return new Map(
    args.entries.map((entry) => [
      entry.option.value,
      presentQuickNpcEquipmentOption({
        entry,
        equipmentSelections: args.equipmentSelections,
        choices: args.choices,
        catalogIndex: args.catalogIndex,
        supplyCatalog: args.catalogIndex,
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
