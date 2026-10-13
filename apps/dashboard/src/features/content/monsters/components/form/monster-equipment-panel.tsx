import { useMemo, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { createMagicPropertyDefinitionProvider } from '@rpg/catalog/magic-properties'
import {
  findCanonicalPlainEntry,
  getContentTypeTerm,
  getEquipmentKindCollectionLabel,
  normalizeEquipmentInstance,
  type EquipmentPickerItem,
  type SystemRulesetId,
} from '@rpg/contracts'
import {
  ActionButton,
  ActionIcon,
  Button,
  ConfirmDialog,
  InsetPanel,
  SemanticText,
  iconGhostControlVariants,
} from '@rpg/ui'

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
import { formatMonsterEquipmentRowMetadata } from '../../lib/monster-equipment-entry-display.lib'
import {
  groupMonsterEquipmentByKind,
  incrementMonsterPlainStack,
  setMonsterPlainStackQuantity,
} from '../../lib/monster-equipment-loadout.lib'
import {
  equipmentEntryBaseName,
  equipmentEntryReferenceLabel,
} from '../../lib/monster-equipment-labels'
import {
  findActionsReferencingEntry,
  removeEquipmentEntryWithDependents,
} from '../../lib/monster-equipment-references'
import {
  MONSTER_EQUIPMENT_CATALOG_ERROR,
  MONSTER_LOADING_EQUIPMENT,
  MONSTER_RETRY_LABEL,
  formatRemoveEquipmentConfirmBody,
  formatRemoveEquipmentConfirmLabel,
  formatRemoveEquipmentConfirmTitle,
} from '../../lib/monster-form-labels'
import type { MonsterEquipmentFormEntry, MonsterFormValues } from '../../lib/monster-form-values'

type PendingRemove = {
  entryId: string
  references: ReturnType<typeof findActionsReferencingEntry>
}

// fallow-ignore-next-line complexity
export function MonsterEquipmentPanel({
  ctx,
  onRetry,
}: {
  ctx: ContentFormCtx
  onRetry?: () => void
}) {
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

  const referenceOptions = ctx.options?.equipment?.forReference() ?? []
  const pickerItems = useMemo(
    () =>
      enrichEquipmentPickerItemsWithSearchDocument(
        buildLoadoutEquipmentPickerItems(referenceOptions),
      ),
    [referenceOptions],
  )

  if (!values) return null

  const equipment = values.equipment ?? []
  const totalQuantity = equipment.reduce((sum, entry) => sum + (entry.quantity ?? 1), 0)
  const groups = groupMonsterEquipmentByKind(equipment, catalog, (item) =>
    getEquipmentKindCollectionLabel(item.kind),
  )

  const editorEntry = editorEntryId
    ? equipment.find((entry) => entry.entryId === editorEntryId)
    : undefined
  const editorItem = editorEntry ? catalog.get(editorEntry.equipmentId) : undefined

  const updateEquipment = (next: MonsterEquipmentFormEntry[]) => {
    form.setValue('equipment', next, { shouldDirty: true })
  }

  const removeEntry = (entryId: string) => {
    const references = findActionsReferencingEntry(values as MonsterFormValues, entryId)
    if (references.length > 0) {
      setPendingRemove({ entryId, references })
      return
    }
    updateEquipment(equipment.filter((entry) => entry.entryId !== entryId))
  }

  return (
    <div data-form-focus="equipment" tabIndex={-1} className="flex flex-col gap-4">
      {gateReason ? (
        <SemanticText tone={status === 'error' ? 'destructive' : 'warning'}>
          {gateReason}
          {status === 'error' && onRetry ? (
            <Button type="button" variant="outline" onClick={onRetry}>
              {MONSTER_RETRY_LABEL}
            </Button>
          ) : null}
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
            Add equipment
          </ActionButton>
        }
      />

      <EquipmentCategoryGroupedList<MonsterEquipmentFormEntry>
        groups={groups.map((group) => ({ groupLabel: group.groupLabel, items: group.entries }))}
        getItemKey={(entry) => entry.entryId}
        emptyState={
          <InsetPanel size="sm" align="center" className="rounded-lg">
            <InsetPanel.PassiveMessage>No equipment yet.</InsetPanel.PassiveMessage>
            <InsetPanel.PassiveMessage>
              Add weapons, armor, or gear to include them on the stat block.
            </InsetPanel.PassiveMessage>
          </InsetPanel>
        }
        renderRow={(entry) => {
          const item = catalog.get(entry.equipmentId)
          const label = equipmentEntryReferenceLabel(entry, equipment, catalog)
          const metadata = formatMonsterEquipmentRowMetadata({
            entry,
            item,
            provider: magicProvider,
          })
          return (
            <ContentFormEntitySelectionRow
              entity={{
                heading: label,
                description: equipmentEntryBaseName(entry, catalog),
                ...(metadata
                  ? {
                      statusComposition: 'metadata' as const,
                      status: [
                        { kind: 'text' as const, label: metadata, variant: 'muted' as const },
                      ],
                    }
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
                    <button
                      type="button"
                      className={iconGhostControlVariants({ hover: 'text', layout: 'flex' })}
                      aria-label={`Edit ${label}`}
                      onClick={() => {
                        setPickerOpen(false)
                        setEditorEntryId(entry.entryId)
                      }}
                    >
                      <ActionIcon action="edit" />
                    </button>
                  </div>
                ),
              }}
            />
          )
        }}
      />

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
              ? 'Attacks using this item keep using the unchanged copy. Update them in Actions.'
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
        headline={
          pendingRemove
            ? formatRemoveEquipmentConfirmTitle(
                equipmentEntryReferenceLabel(
                  equipment.find((entry) => entry.entryId === pendingRemove.entryId) ??
                    equipment[0]!,
                  equipment,
                  catalog,
                ),
              )
            : ''
        }
        description={
          pendingRemove
            ? formatRemoveEquipmentConfirmBody(
                pendingRemove.references
                  .map((reference) => reference.name ?? reference.id)
                  .join(', '),
              )
            : ''
        }
        confirmLabel={
          pendingRemove ? formatRemoveEquipmentConfirmLabel(pendingRemove.references.length) : ''
        }
        onConfirm={() => {
          if (!pendingRemove) return
          form.reset(removeEquipmentEntryWithDependents(form.getValues(), pendingRemove.entryId), {
            keepDefaultValues: true,
          })
          setPendingRemove(null)
        }}
        onCancel={() => setPendingRemove(null)}
      />
    </div>
  )
}
