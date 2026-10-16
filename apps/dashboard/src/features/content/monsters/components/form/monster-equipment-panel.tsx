import { useCallback, useMemo, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { createMagicPropertyDefinitionProvider } from '@rpg/catalog/magic-properties'
import {
  findCanonicalPlainEntry,
  creatureWeaponProficienciesSchema,
  getContentTypeTerm,
  normalizeEquipmentInstance,
  resolveEquipmentInstanceSummary,
  type EquipmentPickerItem,
  type SystemRulesetId,
} from '@rpg/contracts'
import {
  ActionButton,
  ActionIcon,
  ConfirmDialog,
  FieldRecommendationGroupView,
  InsetPanel,
  SemanticText,
  iconGhostControlVariants,
} from '@rpg/ui'

import { formatAddContentTypeLabel } from '../../../lib/content-type-labels'
import {
  buildLoadoutEquipmentPickerItems,
  EquipmentCategoryGroupedList,
  EquipmentInventorySectionHeader,
  EquipmentInstanceEditorDrawer,
} from '@/features/content'
import {
  EquipmentPickerDrawer,
  EquipmentQuantityStepper,
  buildEquipmentLoadoutRowViewModel,
  enrichEquipmentPickerItemsWithSearchDocument,
} from '@/features/character'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { ContentFormEntitySelectionRow } from '../../../lib/forms/selection/content-form-entity-selection-row'
import { resolveStrictCatalogWriteGateReason } from '../../../lib/forms/shells/layout/content-form-catalog-write-gate.lib'
import { useReportContentFormWriteGate } from '../../../lib/forms/shells/layout/content-form-write-gate'
import { monsterEquipmentCatalog } from '../../lib/monster-form-derivation'
import {
  groupMonsterEquipmentByKind,
  incrementMonsterPlainStack,
  incrementMonsterPlainStacks,
  setMonsterPlainStackQuantity,
} from '../../lib/equipment/monster-equipment-loadout.lib'
import { equipmentEntryBaseName } from '../../lib/equipment/monster-equipment-labels'
import { findActionsReferencingEntry } from '../../lib/actions/monster-action-equipment-references'
import { commitEquipmentEntryRemoval } from '../../lib/equipment/commit-equipment-entry-removal.lib'
import { weaponProficiencyGrantSetFromMode } from '@/lib/forms/grant-sets/weapon-proficiency-grant-mode.lib'

import {
  coerceCreatureWeaponProficienciesForForm,
  MONSTER_DEFAULT_WEAPON_PROFICIENCY_MODE,
} from '../../lib/creature-details/monster-weapon-proficiencies-form.lib'
import { resolveMonsterEquipmentRowStatus } from '../../lib/equipment/resolve-monster-equipment-row-status.lib'
import { resolveMonsterLoadoutEquipmentIsProficient } from '../../lib/equipment/resolve-monster-weapon-is-proficient.lib'
import { resolveEquipmentRemovalDecision } from '../../lib/equipment/resolve-equipment-removal-decision.lib'
import {
  MONSTER_EQUIPMENT_CATALOG_ERROR,
  MONSTER_EQUIPMENT_EMPTY_MESSAGE,
  MONSTER_EQUIPMENT_REMOVAL_FALLBACK_NAME,
  MONSTER_LOADING_EQUIPMENT,
  formatEquipmentCustomizationRemovalSummary,
  formatEquipmentRemovalConfirmCopy,
} from '../../lib/monster-form-labels'
import { buildMonsterEquipmentRecommendationGroup } from '../../lib/equipment/monster-equipment-field-recommendation.lib'
import { MonsterEquipmentEquippedToggle } from './monster-equipment-equipped-toggle'
import type { MonsterEquipmentFormEntry, MonsterFormValues } from '../../lib/monster-form-values'

type PendingRemove = {
  entryId: string
}

// fallow-ignore-next-line complexity
export function MonsterEquipmentPanel({ ctx }: { ctx: ContentFormCtx }) {
  const form = useFormContext<MonsterFormValues>()
  const values = useWatch<MonsterFormValues>() as MonsterFormValues | undefined
  const [pickerOpen, setPickerOpen] = useState(false)
  const [editorEntryId, setEditorEntryId] = useState<string | null>(null)
  const [pendingRemove, setPendingRemove] = useState<PendingRemove | null>(null)

  const catalog = monsterEquipmentCatalog(ctx)
  const status = ctx.equipmentCatalogStatus ?? 'ready'
  const gateReason = resolveStrictCatalogWriteGateReason(status, {
    loading: MONSTER_LOADING_EQUIPMENT,
    error: MONSTER_EQUIPMENT_CATALOG_ERROR,
  })
  useReportContentFormWriteGate('strict', gateReason)

  const rulesetId = (ctx.rulesetId ?? 'srd-cc-5.2.1') as SystemRulesetId
  const magicProvider = useMemo(() => createMagicPropertyDefinitionProvider(rulesetId), [rulesetId])

  const weaponGrants = useMemo(() => {
    const raw = coerceCreatureWeaponProficienciesForForm(values?.proficiencies?.weapons)
    return creatureWeaponProficienciesSchema.parse(
      weaponProficiencyGrantSetFromMode(
        values?.weaponProficiencyMode ?? MONSTER_DEFAULT_WEAPON_PROFICIENCY_MODE,
        raw,
      ),
    )
  }, [values?.proficiencies?.weapons, values?.weaponProficiencyMode])

  const referenceOptions = ctx.options?.equipment?.forReference() ?? []
  const pickerItems = useMemo(
    () =>
      enrichEquipmentPickerItemsWithSearchDocument(
        buildLoadoutEquipmentPickerItems(referenceOptions, {
          resolveIsProficient: (equipment) =>
            resolveMonsterLoadoutEquipmentIsProficient(equipment, weaponGrants),
        }),
      ),
    [referenceOptions, weaponGrants],
  )

  const equipment = values?.equipment ?? []

  const updateEquipment = useCallback(
    (next: MonsterEquipmentFormEntry[]) => {
      form.setValue('equipment', next, { shouldDirty: true })
    },
    [form],
  )

  const addEquipmentRecommendation = useCallback(
    (equipmentId: string) => {
      updateEquipment(incrementMonsterPlainStack(equipment, equipmentId, { equipped: false }))
    },
    [equipment, updateEquipment],
  )

  const addAllEquipmentRecommendations = useCallback(
    (equipmentIds: readonly string[]) => {
      updateEquipment(incrementMonsterPlainStacks(equipment, equipmentIds, { equipped: false }))
    },
    [equipment, updateEquipment],
  )

  const equipmentRecommendations = useMemo(() => {
    if (!values || gateReason) return null
    return buildMonsterEquipmentRecommendationGroup({
      weaponProficiencyItemIds: weaponGrants.items,
      referenceEquipment: referenceOptions,
      equipmentEntries: equipment,
      rulesetId,
      onAddEquipment: addEquipmentRecommendation,
      onAddAllEquipment: addAllEquipmentRecommendations,
    })
  }, [
    addAllEquipmentRecommendations,
    addEquipmentRecommendation,
    equipment,
    gateReason,
    referenceOptions,
    rulesetId,
    values,
    weaponGrants.items,
  ])

  const pendingRemoveCopy = useMemo(() => {
    if (!pendingRemove || !values) return null
    const removing = equipment.find((entry) => entry.entryId === pendingRemove.entryId)
    const formValues = values as MonsterFormValues
    const decision = resolveEquipmentRemovalDecision(
      formValues,
      removing ?? {
        entryId: pendingRemove.entryId,
        equipmentId: '',
        quantity: 1,
      },
    )
    const displayName = removing
      ? resolveEquipmentInstanceSummary(removing, catalog.get(removing.equipmentId), magicProvider)
          .displayName
      : MONSTER_EQUIPMENT_REMOVAL_FALLBACK_NAME
    return formatEquipmentRemovalConfirmCopy({
      displayName,
      reasons: decision.reasons,
      referencedActionCount: decision.references.length,
      referencedActionSummary: decision.references
        .map((reference) => reference.name ?? reference.id)
        .join(', '),
      customizationSummary: removing
        ? formatEquipmentCustomizationRemovalSummary(removing)
        : undefined,
    })
  }, [catalog, equipment, magicProvider, pendingRemove, values])

  if (!values) return null

  const totalQuantity = equipment.reduce((sum, entry) => sum + (entry.quantity ?? 1), 0)
  const groups = groupMonsterEquipmentByKind(equipment, catalog)

  const editorEntry = editorEntryId
    ? equipment.find((entry) => entry.entryId === editorEntryId)
    : undefined
  const editorItem = editorEntry ? catalog.get(editorEntry.equipmentId) : undefined

  const removeEntry = (entryId: string) => {
    const entry = equipment.find((row) => row.entryId === entryId)
    if (!entry) return
    const decision = resolveEquipmentRemovalDecision(values as MonsterFormValues, entry)
    if (decision.requiresConfirmation) {
      setPendingRemove({ entryId })
      return
    }
    commitEquipmentEntryRemoval(form, entryId)
  }

  return (
    <div data-form-focus="equipment" tabIndex={-1} className="flex flex-col gap-4">
      {gateReason ? (
        <SemanticText tone={status === 'error' ? 'destructive' : 'warning'}>
          {gateReason}
        </SemanticText>
      ) : null}

      <EquipmentInventorySectionHeader
        title={getContentTypeTerm('equipment').label}
        count={totalQuantity}
        action={
          <ActionButton
            action="add"
            variant="outline"
            size="sm"
            disabled={Boolean(gateReason)}
            onClick={() => setPickerOpen(true)}
          >
            {formatAddContentTypeLabel('equipment')}
          </ActionButton>
        }
      />

      <div className="flex flex-col gap-2">
        {equipmentRecommendations ? (
          <FieldRecommendationGroupView group={equipmentRecommendations} />
        ) : null}

        <EquipmentCategoryGroupedList<MonsterEquipmentFormEntry>
          groups={groups.map((group) => ({ groupLabel: group.groupLabel, items: group.entries }))}
          getItemKey={(entry) => entry.entryId}
          emptyState={
            <InsetPanel size="sm" align="center" className="rounded-lg">
              <InsetPanel.PassiveMessage>
                {MONSTER_EQUIPMENT_EMPTY_MESSAGE}
              </InsetPanel.PassiveMessage>
            </InsetPanel>
          }
          renderRow={(entry) => {
            const item = catalog.get(entry.equipmentId)
            const catalogMissing = !item
            const summary = resolveEquipmentInstanceSummary(entry, item, magicProvider)
            const label = summary.displayName
            const isProficient = item
              ? resolveMonsterLoadoutEquipmentIsProficient(item, weaponGrants)
              : true
            const inventoryStatus = resolveMonsterEquipmentRowStatus({
              summary,
              catalogItem: item,
              catalogMissing,
              isProficient,
            })
            const rowStatus = inventoryStatus.status
            const equipped = Boolean(summary.equipped)
            return (
              <ContentFormEntitySelectionRow
                headingInline={
                  <MonsterEquipmentEquippedToggle
                    displayName={label}
                    checked={equipped}
                    onCheckedChange={(nextEquipped) =>
                      updateEquipment(
                        equipment.map((row) =>
                          row.entryId === entry.entryId ? { ...row, equipped: nextEquipped } : row,
                        ),
                      )
                    }
                  />
                }
                entity={{
                  heading: label,
                  ...(rowStatus.length > 0
                    ? { status: rowStatus, statusComposition: 'metadata' }
                    : {}),
                }}
                trailing={{
                  kind: 'utility',
                  content: (
                    <div className="flex items-center gap-1">
                      <EquipmentQuantityStepper
                        size="sm"
                        digits={2}
                        value={entry.quantity ?? 1}
                        min={1}
                        max={999}
                        ariaLabel={`Quantity of ${label}`}
                        remove={{
                          ariaLabel: `Remove ${label}`,
                          onRemove: () => removeEntry(entry.entryId),
                        }}
                        onChange={(quantity) =>
                          updateEquipment(
                            equipment.map((row) =>
                              row.entryId === entry.entryId ? { ...row, quantity } : row,
                            ),
                          )
                        }
                      />
                      {catalogMissing ? null : (
                        <button
                          type="button"
                          className={iconGhostControlVariants({ hover: 'text', layout: 'flex' })}
                          aria-label={`Customize ${label}`}
                          onClick={() => {
                            setPickerOpen(false)
                            setEditorEntryId(entry.entryId)
                          }}
                        >
                          <ActionIcon action="edit" />
                        </button>
                      )}
                    </div>
                  ),
                }}
              />
            )
          }}
        />
      </div>

      <EquipmentPickerDrawer
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        items={pickerItems}
        workflowMode="loadout"
        workflowModes={['loadout']}
        showCharacterPreview={false}
        resolveRowActionViewModel={({ equipment: row }) =>
          buildEquipmentLoadoutRowViewModel(row.id, equipment)
        }
        onCommitAdd={(item: EquipmentPickerItem) => {
          updateEquipment(incrementMonsterPlainStack(equipment, item.equipment.id))
          return true
        }}
        onSetRowQuantity={(item, total) => {
          const plain = findCanonicalPlainEntry(equipment, item.equipment.id) as
            | MonsterEquipmentFormEntry
            | undefined
          if (total === 0 && plain?.entryId) {
            removeEntry(plain.entryId)
            return
          }
          updateEquipment(setMonsterPlainStackQuantity(equipment, item.equipment.id, total))
        }}
      />

      {editorEntry && editorItem ? (
        <EquipmentInstanceEditorDrawer
          open={editorEntryId !== null}
          onOpenChange={(open) => {
            if (!open) setEditorEntryId(null)
          }}
          sourceEntry={normalizeEquipmentInstance(editorEntry) as MonsterEquipmentFormEntry}
          entries={equipment.map(
            (row) => normalizeEquipmentInstance(row) as MonsterEquipmentFormEntry,
          )}
          catalogItem={editorItem}
          rulesetId={rulesetId}
          definitions={magicProvider}
          subjectNoun="creature"
          referencedByLabel={
            findActionsReferencingEntry(values as MonsterFormValues, editorEntry.entryId).length > 0
              ? `This creature's attacks will continue using the original ${equipmentEntryBaseName(editorEntry, catalog)}. To use the customized copy, update the equipment selection in Actions.`
              : undefined
          }
          onCommit={(nextEntries) => {
            updateEquipment(nextEntries)
            setEditorEntryId(null)
          }}
        />
      ) : null}

      <ConfirmDialog
        open={pendingRemove !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRemove(null)
        }}
        headline={pendingRemoveCopy?.headline ?? ''}
        description={pendingRemoveCopy?.description ?? ''}
        confirmLabel={pendingRemoveCopy?.confirmLabel ?? ''}
        onConfirm={() => {
          if (!pendingRemove) return
          commitEquipmentEntryRemoval(form, pendingRemove.entryId)
          setPendingRemove(null)
        }}
        onCancel={() => setPendingRemove(null)}
      />
    </div>
  )
}
