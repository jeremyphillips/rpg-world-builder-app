import { useCallback, useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import {
  formatCreatureTrait,
  formatMonsterStatBlockSubject,
  getCreatureTraitVocabularyEntry,
} from '@rpg/contracts'
import { ActionIcon, ButtonDropdown, RulesPreview } from '@rpg/ui'
import type { FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { FormEmbeddedMasterDetailEditor } from '../../../components/master-detail/form-embedded-master-detail-editor'
import { useMasterDetailArray } from '../../../lib/master-detail/use-master-detail-array'
import { createMonsterRowId } from '../../lib/actions/monster-action-presets'
import {
  MONSTER_TRAIT_ACQUISITION_GROUPS,
  monsterTraitAcquisitionItems,
  parseMonsterTraitAcquisitionId,
} from '../../lib/actions/monster-trait-acquisition'
import { collectMonsterFormAdvisories } from '../../lib/monster-form-advisories'
import { monsterFormAdvisorySlot } from '../../lib/monster-form-advisory-presentation'
import {
  MONSTER_ADD_LABEL,
  MONSTER_TRAIT_PREVIEW_LABEL,
  MONSTER_TRAITS_HEADING,
} from '../../lib/monster-form-labels'
import {
  MONSTER_TRAIT_ITEM_NOUN,
  monsterTraitItemFields,
} from '../../lib/monster-trait-form-fields'
import {
  monsterTraitPresetDefaults,
  monsterTraitPresetFields,
  waterBreathingDurationEnabled,
} from '../../lib/monster-trait-preset-fields'
import type { MonsterFormValues } from '../../lib/monster-form-values'
import { WaterBreathingToggle } from './water-breathing-toggle'

function isPresetRow(row: unknown): row is { preset: string } & Record<string, unknown> {
  return (
    typeof row === 'object' && row !== null && 'preset' in row && typeof row.preset === 'string'
  )
}

function traitListTitle(row: unknown, index: number, monsterName: string): string {
  if (isPresetRow(row)) {
    const formatted = formatCreatureTrait({
      subject: formatMonsterStatBlockSubject(monsterName),
      trait: row,
    })
    return (
      formatted?.name ?? getCreatureTraitVocabularyEntry(row.preset)?.label ?? `Trait ${index + 1}`
    )
  }
  const name = (row as { name?: string } | undefined)?.name?.trim()
  return name || `Trait ${index + 1}`
}

export function MonsterTraitsEditor({ ctx }: { ctx: ContentFormCtx }) {
  const customFields = useMemo(() => monsterTraitItemFields(), [])
  const makeItemDefaults = useCallback(
    () => ({ id: createMonsterRowId(), name: '', description: '' }),
    [],
  )
  const editor = useMasterDetailArray('traits', makeItemDefaults)
  const values = useWatch<MonsterFormValues>() as MonsterFormValues | undefined
  const traits = values?.traits
  const monsterName = values?.name
  const items = useMemo(() => monsterTraitAcquisitionItems({ traits: traits ?? [] }), [traits])
  const advisories = useMemo(
    () => (values ? collectMonsterFormAdvisories(values, new Map()) : []),
    [values],
  )

  const resolveItemFields = useCallback(
    (row: unknown): FormItem[] => {
      const rowPath = editor.selectedIndex === null ? '' : `traits.${editor.selectedIndex}`
      const advisorySlot = monsterFormAdvisorySlot(advisories, rowPath)
      if (!isPresetRow(row)) return [advisorySlot, ...customFields]
      const subject = formatMonsterStatBlockSubject(monsterName ?? '')
      const formatted = isPresetRow(row) ? formatCreatureTrait({ subject, trait: row }) : undefined
      const preview: FormItem[] = formatted
        ? [
            {
              kind: 'slot',
              name: 'traitPreview',
              render: () => (
                <RulesPreview
                  label={MONSTER_TRAIT_PREVIEW_LABEL}
                  content={{ kind: 'prose', text: formatted.sentence }}
                />
              ),
            },
          ]
        : []
      if (!isPresetRow(row)) return [advisorySlot, ...customFields]
      const parameterFields =
        row.preset === 'water-breathing'
          ? [
              {
                kind: 'slot' as const,
                name: 'outsideWaterBreathToggle',
                render: () => <WaterBreathingToggle namePrefix={rowPath} />,
              },
              ...(waterBreathingDurationEnabled(row)
                ? monsterTraitPresetFields(row.preset, ctx)
                : []),
            ]
          : monsterTraitPresetFields(row.preset, ctx)
      return [...preview, advisorySlot, ...parameterFields]
    },
    [advisories, ctx, customFields, editor.selectedIndex, monsterName],
  )

  return (
    <FormEmbeddedMasterDetailEditor
      editor={editor}
      formCtx={ctx}
      fieldName="traits"
      itemFields={customFields}
      resolveItemFields={resolveItemFields}
      itemNoun={MONSTER_TRAIT_ITEM_NOUN}
      listTitle={MONSTER_TRAITS_HEADING}
      ariaLabel={MONSTER_TRAITS_HEADING}
      addLabel={MONSTER_ADD_LABEL}
      addControl={
        <ButtonDropdown
          label={MONSTER_ADD_LABEL}
          searchPlaceholder="Search traits…"
          leadingIcon={<ActionIcon action="add" size="sm" />}
          width="fit"
          size="sm"
          variant="outline"
          groups={[...MONSTER_TRAIT_ACQUISITION_GROUPS]}
          items={items}
          onSelectItem={(id) => {
            const choice = parseMonsterTraitAcquisitionId(id)
            if (!choice) return
            if (choice.type === 'focus') {
              const index = (traits ?? []).findIndex((trait) => trait.id === choice.traitId)
              if (index >= 0) editor.select(index)
              return
            }
            if (choice.type === 'custom') {
              editor.appendRow({ id: createMonsterRowId(), name: '', description: '' })
              return
            }
            editor.appendRow({
              id: createMonsterRowId(),
              preset: choice.presetId,
              ...monsterTraitPresetDefaults(choice.presetId),
            })
          }}
        />
      }
      idPrefix="monster-trait"
      makeItemDefaults={makeItemDefaults}
      mapListItem={({ row, index }) => ({
        title: traitListTitle(row, index, monsterName ?? ''),
      })}
    />
  )
}
