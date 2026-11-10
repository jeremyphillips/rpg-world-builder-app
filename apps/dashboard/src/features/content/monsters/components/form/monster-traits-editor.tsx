import { useCallback, useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import {
  DEFAULT_SYSTEM_RULESET_ID,
  formatCreatureTrait,
  formatMonsterStatBlockSubject,
  getCreatureTraitTemplate,
  listCreatureTraitTemplatesForRuleset,
} from '@rpg/contracts'
import { ActionIcon, ButtonDropdown, RulesPreview } from '@rpg/ui'
import type { FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { creatureTraitTemplateRow } from '../../../lib/creature-traits/creature-trait-add-menu'
import { FormEmbeddedMasterDetailEditor } from '../../../components/master-detail/form-embedded-master-detail-editor'
import { useMasterDetailArray } from '../../../lib/master-detail/use-master-detail-array'
import { createMonsterRowId } from '../../lib/monster-row-id'
import {
  MONSTER_TRAIT_ACQUISITION_GROUPS,
  monsterTraitAcquisitionItems,
  parseMonsterTraitAcquisitionId,
} from '../../lib/actions/monster-trait-acquisition'
import { formatMonsterTemplateSentence } from '../../lib/format-monster-template-sentence'
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
  monsterTraitTemplateFields,
} from '../../lib/monster-trait-form-fields'
import {
  monsterTraitListTitle,
  resolveMonsterTraitHeaderIdentity,
} from '../../lib/monster-trait-editor-title'
import {
  monsterTraitPresetDefaults,
  monsterTraitPresetFields,
  waterBreathingDurationEnabled,
} from '../../lib/monster-trait-preset-fields'
import type { MonsterFormValues } from '../../lib/monster-form-values'
import { WaterBreathingToggle } from './water-breathing-toggle'

const TEMPLATE_GROUP_ID = 'templates'

function isPresetRow(row: unknown): row is { preset: string } & Record<string, unknown> {
  return (
    typeof row === 'object' &&
    row !== null &&
    'preset' in row &&
    typeof row.preset === 'string' &&
    !('templateId' in row)
  )
}

function isTemplateRow(row: unknown): row is {
  templateId: string
  config?: unknown
  nameOverride?: string
  descriptionOverride?: string
} {
  return (
    typeof row === 'object' &&
    row !== null &&
    'templateId' in row &&
    typeof row.templateId === 'string'
  )
}

function templatePreviewSentence(
  row: { templateId: string; config?: unknown },
  monsterName: string,
): string {
  return (
    formatMonsterTemplateSentence({
      templateId: row.templateId,
      config: row.config,
      monsterName,
    }) ?? ''
  )
}

export function MonsterTraitsEditor({ ctx }: { ctx: ContentFormCtx }) {
  const customFields = useMemo(() => monsterTraitItemFields(), [])
  const templateFields = useMemo(() => monsterTraitTemplateFields(), [])
  const makeItemDefaults = useCallback(
    () => ({ id: createMonsterRowId(), kind: 'custom' as const, name: '', description: '' }),
    [],
  )
  const editor = useMasterDetailArray('traits', makeItemDefaults)
  const values = useWatch<MonsterFormValues>() as MonsterFormValues | undefined
  const traits = values?.traits
  const monsterName = values?.name
  const templateIds = useMemo(
    () => listCreatureTraitTemplatesForRuleset(ctx.rulesetId ?? DEFAULT_SYSTEM_RULESET_ID),
    [ctx.rulesetId],
  )
  const templateIdSet = useMemo(() => new Set<string>(templateIds), [templateIds])
  const items = useMemo(() => {
    const presetItems = monsterTraitAcquisitionItems({ traits: traits ?? [] }).filter((item) => {
      if (!item.id.startsWith('preset:')) return true
      return !templateIdSet.has(item.id.slice('preset:'.length))
    })
    return [
      ...templateIds.map((templateId) => ({
        id: `template:${templateId}`,
        label: getCreatureTraitTemplate(templateId)?.label ?? templateId,
        groupId: TEMPLATE_GROUP_ID,
      })),
      ...presetItems,
    ]
  }, [templateIdSet, templateIds, traits])
  const advisories = useMemo(
    () => (values ? collectMonsterFormAdvisories(values, new Map()) : []),
    [values],
  )

  const resolveItemFields = useCallback(
    (row: unknown): FormItem[] => {
      const rowPath = editor.selectedIndex === null ? '' : `traits.${editor.selectedIndex}`
      const advisorySlot = monsterFormAdvisorySlot(advisories, rowPath)
      if (isTemplateRow(row)) {
        const sentence = templatePreviewSentence(row, monsterName ?? '')
        const preview: FormItem[] = sentence
          ? [
              {
                kind: 'slot',
                name: 'traitPreview',
                render: () => (
                  <RulesPreview
                    label={MONSTER_TRAIT_PREVIEW_LABEL}
                    content={{ kind: 'prose', text: sentence }}
                  />
                ),
              },
            ]
          : []
        return [...preview, advisorySlot, ...templateFields]
      }
      if (!isPresetRow(row)) return [advisorySlot, ...customFields]
      const subject = formatMonsterStatBlockSubject(monsterName ?? '')
      const formatted = formatCreatureTrait({ subject, trait: row })
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
    [advisories, ctx, customFields, editor.selectedIndex, monsterName, templateFields],
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
          groups={[
            { id: TEMPLATE_GROUP_ID, label: 'Templates' },
            ...MONSTER_TRAIT_ACQUISITION_GROUPS,
          ]}
          items={items}
          onSelectItem={(id) => {
            if (id.startsWith('template:')) {
              editor.appendRow(
                creatureTraitTemplateRow(id.slice('template:'.length), createMonsterRowId()),
              )
              return
            }
            const choice = parseMonsterTraitAcquisitionId(id)
            if (!choice) return
            if (choice.type === 'focus') {
              const index = (traits ?? []).findIndex((trait) => trait.id === choice.traitId)
              if (index >= 0) editor.select(index)
              return
            }
            if (choice.type === 'custom') {
              editor.appendRow(makeItemDefaults())
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
      access={{ kind: 'availability', fieldName: 'available' }}
      mapListItem={({ row, index }) => ({
        title: monsterTraitListTitle(row, traits ?? [], monsterName ?? '', index),
      })}
      resolveHeaderIdentity={({ row, index, fieldId, identity }) =>
        resolveMonsterTraitHeaderIdentity({
          row,
          rows: traits ?? [],
          monsterName: monsterName ?? '',
          index,
          fieldId,
          lastAddedFieldId: editor.lastAddedFieldId,
          identity,
        })
      }
    />
  )
}
