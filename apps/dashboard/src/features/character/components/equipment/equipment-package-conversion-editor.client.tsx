'use client'

import { useEffect, useId, useRef } from 'react'

import {
  buildStartingPackageConversionPreview,
  canConvertStartingPackageToGold,
  copperToWealth,
  formatWealth,
  type CharacterBuildCatalogIndex,
  type CharacterBuilderDraft,
  type StartingPackageConversionPreview,
} from '@rpg/contracts'
import { Button, CheckboxField, Heading, Text } from '@rpg/ui'

import {
  equipmentPackageConversionEditorActionsClasses,
  equipmentPackageConversionEditorBodyClasses,
  equipmentPackageConversionEditorClasses,
  equipmentPackageConversionEditorHeaderClasses,
  equipmentPackageConversionEditorListClasses,
  equipmentPackageConversionStatusClasses,
} from './equipment-starting-package.variants'

export type EquipmentPackageConversionEditorProps = {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  departingOptionId: string
  selectedPackageItemKeys: ReadonlySet<string>
  editorId?: string
  commitStatusMessage?: string
  onSelectedPackageItemKeysChange: (keys: ReadonlySet<string>) => void
  onCancel: () => void
  onCommit: (preview: StartingPackageConversionPreview) => void
}

function formatConversionBudgetLine(preview: StartingPackageConversionPreview): string {
  const remaining = formatWealth(copperToWealth(preview.budget.remainingCp))
  const starting = formatWealth(copperToWealth(preview.budget.startingCp))
  const spent = formatWealth(
    copperToWealth(preview.budget.existingPurchaseCostCp + preview.budget.selectedConversionCostCp),
  )

  return `${remaining} remaining · ${starting} starting · ${spent} spent`
}

export function EquipmentPackageConversionEditor({
  draft,
  catalogIndex,
  departingOptionId,
  selectedPackageItemKeys,
  editorId,
  commitStatusMessage,
  onSelectedPackageItemKeysChange,
  onCancel,
  onCommit,
}: EquipmentPackageConversionEditorProps) {
  const fallbackId = useId()
  const resolvedEditorId = editorId ?? fallbackId
  const headingRef = useRef<HTMLDivElement>(null)

  const preview = buildStartingPackageConversionPreview({
    draft,
    catalogIndex,
    departingOptionId,
    selectedPackageItemKeys,
  })

  useEffect(() => {
    headingRef.current?.focus()
    headingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [])

  if (!preview) return null

  const canCommit = canConvertStartingPackageToGold({ preview, selectedPackageItemKeys })

  const toggleItem = (packageItemKey: string, checked: boolean) => {
    const next = new Set(selectedPackageItemKeys)
    if (checked) {
      next.add(packageItemKey)
    } else {
      next.delete(packageItemKey)
    }
    onSelectedPackageItemKeysChange(next)
  }

  return (
    <section
      id={resolvedEditorId}
      className={equipmentPackageConversionEditorClasses}
      aria-labelledby={`${resolvedEditorId}-heading`}
    >
      <header className={equipmentPackageConversionEditorHeaderClasses}>
        <div ref={headingRef} tabIndex={-1} className="outline-none">
          <Heading variant="subsection" as="h4" id={`${resolvedEditorId}-heading`}>
            Customize {preview.goldOptionLabel}
          </Heading>
        </div>
        <Text as="p" variant="muted">
          Choose which package items to keep as starting-gold purchases.
        </Text>
      </header>

      <div className={equipmentPackageConversionEditorBodyClasses}>
        <Text as="p">{formatConversionBudgetLine(preview)}</Text>
        <ul className={equipmentPackageConversionEditorListClasses}>
          {preview.items.map((item) => {
            const itemId = `${resolvedEditorId}-${item.packageItemKey}`
            const disabled = item.status === 'blocked'
            const checked = selectedPackageItemKeys.has(item.packageItemKey)

            return (
              <li key={item.packageItemKey}>
                <CheckboxField
                  id={itemId}
                  checked={checked}
                  disabled={disabled}
                  label={`${item.grantQuantity} × ${item.equipmentName}`}
                  hint={
                    disabled
                      ? item.blockingIssue
                      : item.pricing.status === 'free'
                        ? 'Free'
                        : undefined
                  }
                  onCheckedChange={(nextChecked) =>
                    toggleItem(item.packageItemKey, nextChecked === true)
                  }
                />
              </li>
            )
          })}
        </ul>
      </div>

      {commitStatusMessage ? (
        <div className={equipmentPackageConversionStatusClasses} role="status">
          {commitStatusMessage}
        </div>
      ) : null}

      <div className={equipmentPackageConversionEditorActionsClasses}>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" disabled={!canCommit} onClick={() => onCommit(preview)}>
          Use starting gold
        </Button>
      </div>
    </section>
  )
}
