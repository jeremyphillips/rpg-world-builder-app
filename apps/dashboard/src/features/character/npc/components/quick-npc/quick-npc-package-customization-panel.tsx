import type { Ref } from 'react'

import {
  Button,
  NumberStepper,
  SelectionOptionCardEmbeddedPanel,
  SelectionOptionCardEmbeddedPanelHeader,
  SelectionOptionCardEmbeddedPanelList,
  SelectionOptionCardEmbeddedPanelRow,
  SelectionOptionCardEmbeddedPanelRowStatus,
  Text,
} from '@rpg/ui'

import { EntitySummaryStatus } from '@/features/content'

import {
  QUICK_NPC_ALL_REMOVED_WITHOUT_WEALTH_NOTE,
  QUICK_NPC_CANCEL_LABEL,
  QUICK_NPC_CUSTOMIZE_DESCRIPTION,
  QUICK_NPC_EDITING_LOCK_MESSAGE,
  QUICK_NPC_REMOVE_LABEL,
  QUICK_NPC_REMOVED_LABEL,
  QUICK_NPC_RESTORE_ALL_LABEL,
  QUICK_NPC_RESTORE_LABEL,
  QUICK_NPC_SAVE_CUSTOMIZATION_LABEL,
  quickNpcAllRemovedWithWealthNote,
  quickNpcCustomizeHeading,
  quickNpcPackageDraftIsAllDefaults,
  quickNpcPackageDraftIsDirty,
  quickNpcQuantityAriaLabel,
  quickNpcRemoveAriaLabel,
  quickNpcRestoreAriaLabel,
  quickNpcWealthNote,
  type QuickNpcPackageCustomizationRow,
} from '../../lib/quick-npc/quick-npc-package-customization.lib'
export type QuickNpcPackageCustomizationPanelProps = {
  packageLabel: string
  rows: readonly QuickNpcPackageCustomizationRow[]
  wealthLabel?: string
  draftQuantities: Record<string, number>
  submittedQuantities: Record<string, number>
  showLockMessage: boolean
  saveButtonRef?: Ref<HTMLButtonElement>
  onChangeQuantity: (entryId: string, packageQuantity: number, quantity: number) => void
  onRemove: (entryId: string, packageQuantity: number) => void
  onRestore: (entryId: string) => void
  onRestoreAll: () => void
  onCancel: () => void
  onSave: () => void
}

export function QuickNpcPackageCustomizationPanel({
  packageLabel,
  rows,
  wealthLabel,
  draftQuantities,
  submittedQuantities,
  showLockMessage,
  saveButtonRef,
  onChangeQuantity,
  onRemove,
  onRestore,
  onRestoreAll,
  onCancel,
  onSave,
}: QuickNpcPackageCustomizationPanelProps) {
  const dirty = quickNpcPackageDraftIsDirty(draftQuantities, submittedQuantities)
  const allDefaults = quickNpcPackageDraftIsAllDefaults(draftQuantities)
  const everyItemRemoved = rows.length > 0 && rows.every((row) => row.retainedQuantity === 0)

  return (
    <SelectionOptionCardEmbeddedPanel>
      <SelectionOptionCardEmbeddedPanelHeader
        title={quickNpcCustomizeHeading(packageLabel)}
        description={QUICK_NPC_CUSTOMIZE_DESCRIPTION}
      />
      <SelectionOptionCardEmbeddedPanelList>
        {rows.map((row) => {
          const removed = row.retainedQuantity === 0
          return (
            <SelectionOptionCardEmbeddedPanelRow key={row.entryId} label={row.label}>
              {row.status && row.status.length > 0 ? (
                <SelectionOptionCardEmbeddedPanelRowStatus>
                  <EntitySummaryStatus
                    items={row.status}
                    density="compact"
                    composition="metadata"
                  />
                </SelectionOptionCardEmbeddedPanelRowStatus>
              ) : null}
              {removed ? (
                <SelectionOptionCardEmbeddedPanelRowStatus>
                  {QUICK_NPC_REMOVED_LABEL}
                </SelectionOptionCardEmbeddedPanelRowStatus>
              ) : row.kind === 'stack' ? (
                <NumberStepper
                  size="xs"
                  min={1}
                  max={row.packageQuantity}
                  value={row.retainedQuantity}
                  aria-label={quickNpcQuantityAriaLabel(row.label, packageLabel)}
                  minAction={{
                    mode: 'remove',
                    removeAriaLabel: quickNpcRemoveAriaLabel(row.label, packageLabel),
                    onRemove: () => onRemove(row.entryId, row.packageQuantity),
                  }}
                  onChange={(quantity) =>
                    onChangeQuantity(row.entryId, row.packageQuantity, quantity)
                  }
                />
              ) : removed ? null : (
                <Button
                  type="button"
                  variant="text"
                  size="xs"
                  density="compact"
                  aria-label={quickNpcRemoveAriaLabel(row.label, packageLabel)}
                  onClick={() => onRemove(row.entryId, row.packageQuantity)}
                >
                  {QUICK_NPC_REMOVE_LABEL}
                </Button>
              )}
              {removed ? (
                <Button
                  type="button"
                  variant="text"
                  size="xs"
                  density="compact"
                  aria-label={quickNpcRestoreAriaLabel(row.label)}
                  onClick={() => onRestore(row.entryId)}
                >
                  {QUICK_NPC_RESTORE_LABEL}
                </Button>
              ) : null}
            </SelectionOptionCardEmbeddedPanelRow>
          )
        })}
      </SelectionOptionCardEmbeddedPanelList>
      {wealthLabel && !everyItemRemoved ? (
        <Text variant="caption">{quickNpcWealthNote(wealthLabel)}</Text>
      ) : null}
      {everyItemRemoved ? (
        <Text variant="caption">
          {wealthLabel
            ? quickNpcAllRemovedWithWealthNote(wealthLabel)
            : QUICK_NPC_ALL_REMOVED_WITHOUT_WEALTH_NOTE}
        </Text>
      ) : null}
      {showLockMessage ? <Text variant="caption">{QUICK_NPC_EDITING_LOCK_MESSAGE}</Text> : null}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          type="button"
          variant="text"
          size="xs"
          density="compact"
          disabled={allDefaults}
          onClick={onRestoreAll}
        >
          {QUICK_NPC_RESTORE_ALL_LABEL}
        </Button>
        <div className="flex items-center gap-2">
          <Button type="button" variant="text" size="xs" density="compact" onClick={onCancel}>
            {QUICK_NPC_CANCEL_LABEL}
          </Button>
          <Button
            ref={saveButtonRef}
            type="button"
            size="xs"
            density="compact"
            disabled={!dirty}
            onClick={onSave}
          >
            {QUICK_NPC_SAVE_CUSTOMIZATION_LABEL}
          </Button>
        </div>
      </div>
    </SelectionOptionCardEmbeddedPanel>
  )
}
