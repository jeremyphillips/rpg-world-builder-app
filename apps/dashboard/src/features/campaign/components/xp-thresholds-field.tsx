import { useMemo, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { resolveXpThresholdsSummary, type SystemRulesetId } from '@rpg/contracts'
import { InlineMetadata, SemanticText, Text } from '@rpg/ui'

import { FeatureTableRow } from '@/lib/content-table-surface'
import { TableBuilderModal, type TableBuilderFormValues } from '@/lib/table-builder'

import {
  buildEffectiveMaxLevel,
  buildXpThresholdsDraft,
  buildXpThresholdsHostConfig,
  mapXpThresholdsDraftToOverrides,
  resolveSystemXpEntries,
  type XpThresholdOverrideFormEntry,
} from '../lib/rules/character-configuration/xp-thresholds-field.lib'

const DEFAULT_RULESET_ID = 'srd-cc-5.2.1' as const satisfies SystemRulesetId

type XpThresholdsFormSlice = {
  maxCharacterLevel: number
  extendedProgressionEnabled: boolean
  extendedMaxLevel?: number
  extendedTierName?: string
  xpThresholdOverrides: XpThresholdOverrideFormEntry[]
}

export function XpThresholdsField() {
  const form = useFormContext<XpThresholdsFormSlice>()
  const [modalOpen, setModalOpen] = useState(false)

  const maxCharacterLevel = useWatch({ control: form.control, name: 'maxCharacterLevel' }) ?? 20
  const extendedProgressionEnabled =
    useWatch({ control: form.control, name: 'extendedProgressionEnabled' }) ?? false
  const extendedMaxLevel = useWatch({ control: form.control, name: 'extendedMaxLevel' })
  const extendedTierName = useWatch({ control: form.control, name: 'extendedTierName' })
  const xpThresholdOverrides =
    useWatch({ control: form.control, name: 'xpThresholdOverrides' }) ?? []

  const effectiveMaxLevel = buildEffectiveMaxLevel({
    maxCharacterLevel,
    extendedProgressionEnabled,
    extendedMaxLevel,
  })
  const systemEntries = useMemo(() => resolveSystemXpEntries(DEFAULT_RULESET_ID), [])

  const summary = useMemo(
    () =>
      resolveXpThresholdsSummary({
        systemEntries,
        overrides: xpThresholdOverrides,
        effectiveMaxLevel,
      }),
    [systemEntries, xpThresholdOverrides, effectiveMaxLevel],
  )

  const hostConfig = useMemo(
    () =>
      buildXpThresholdsHostConfig({
        effectiveMaxLevel,
        systemEntries,
        dormantOverrides: xpThresholdOverrides.filter((entry) => entry.level > effectiveMaxLevel),
        extendedProgressionEnabled,
        maxCharacterLevel,
        extendedTierName: typeof extendedTierName === 'string' ? extendedTierName : undefined,
      }),
    [
      effectiveMaxLevel,
      systemEntries,
      xpThresholdOverrides,
      extendedProgressionEnabled,
      maxCharacterLevel,
      extendedTierName,
    ],
  )

  const initialDraft = useMemo(
    () =>
      buildXpThresholdsDraft({
        effectiveMaxLevel,
        systemEntries,
        overrides: xpThresholdOverrides,
        extendedProgressionEnabled,
        maxCharacterLevel,
        extendedTierName: typeof extendedTierName === 'string' ? extendedTierName : undefined,
      }),
    [
      effectiveMaxLevel,
      systemEntries,
      xpThresholdOverrides,
      extendedProgressionEnabled,
      maxCharacterLevel,
      extendedTierName,
    ],
  )

  function handleSaveDraft(draft: TableBuilderFormValues) {
    const nextOverrides = mapXpThresholdsDraftToOverrides(
      draft,
      systemEntries,
      xpThresholdOverrides,
      effectiveMaxLevel,
    )
    form.setValue('xpThresholdOverrides', nextOverrides, { shouldDirty: true })
  }

  return (
    <>
      <FeatureTableRow
        title="Experience thresholds"
        description={
          summary.status === 'derived' ? (
            <InlineMetadata role="supporting" density="compact" wrap={false}>
              <InlineMetadata.Item>
                <Text variant="muted" as="span">
                  {summary.levelCount} levels
                </Text>
              </InlineMetadata.Item>
              <InlineMetadata.Item>
                <Text as="span" variant="supporting">
                  <SemanticText tone="warning">
                    {summary.derivedCount} threshold{summary.derivedCount === 1 ? '' : 's'} derived
                  </SemanticText>
                </Text>
              </InlineMetadata.Item>
            </InlineMetadata>
          ) : (
            <Text variant="muted" as="span">
              {summary.label}
            </Text>
          )
        }
        editLabel="Edit table"
        onEdit={() => setModalOpen(true)}
      />

      <TableBuilderModal
        open={modalOpen}
        mode="edit"
        config={hostConfig}
        initialDraft={initialDraft}
        onOpenChange={setModalOpen}
        onSaveDraft={handleSaveDraft}
      />
    </>
  )
}
