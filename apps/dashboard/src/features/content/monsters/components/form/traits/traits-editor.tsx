import { useCallback, useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import { listCreatureTraitTemplatesForRuleset } from '@rpg/contracts'
import { ButtonDropdown } from '@rpg/ui'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import { creatureTraitTemplateRow } from '../../../../lib/creature-traits/creature-trait-add-menu'
import { FormEmbeddedMasterDetailEditor } from '../../../../components/master-detail/form-embedded-master-detail-editor'
import { useMasterDetailArray } from '../../../../lib/master-detail/use-master-detail-array'
import { createMonsterRowId } from '../../../lib/monster-row-id'
import {
  MONSTER_TRAIT_ACQUISITION_GROUPS,
  monsterTraitAcquisitionDropdownItems,
  parseMonsterTraitAcquisitionId,
} from '../../../lib/traits/monster-trait-acquisition'
import { sharedCastingOptions } from '../../../lib/actions/spell/monster-action-casting-summary'
import { collectMonsterFormAdvisories } from '../../../lib/monster-form-advisories'
import { MONSTER_ADD_LABEL, MONSTER_TRAITS_HEADING } from '../../../lib/monster-form-labels'
import {
  MONSTER_TRAIT_ITEM_NOUN,
  monsterTraitDetailFields,
} from '../../../lib/traits/monster-trait-form-fields'
import { monsterTraitRowResolveFields } from '../../../lib/monster-master-detail-validation-fields'
import { resolveMonsterTraitRowTitleConfig } from '../../../lib/traits/monster-trait-row-title'
import { useMonsterTraitFacingHost } from '../../../../facing/use-monster-trait-facing-host'
import { monsterTraitPresetDefaults } from '../../../lib/traits/monster-trait-preset-fields'
import type { MonsterFormValues } from '../../../lib/monster-form-values'

export function MonsterTraitsEditor({ ctx }: { ctx: ContentFormCtx }) {
  const values = useWatch<MonsterFormValues>() as MonsterFormValues | undefined
  const traitResolver = useMemo(
    () => ({ resolveItemFields: monsterTraitRowResolveFields({ ctx, readValues: () => values }) }),
    [ctx, values],
  )
  const makeItemDefaults = useCallback(
    () => ({ id: createMonsterRowId(), kind: 'custom' as const, name: '', description: '' }),
    [],
  )
  const editor = useMasterDetailArray('traits', makeItemDefaults)
  const traits = values?.traits
  const monsterName = values?.name
  const templateIds = useMemo(
    () => (ctx.rulesetId ? listCreatureTraitTemplatesForRuleset(ctx.rulesetId, 'monster') : []),
    [ctx.rulesetId],
  )
  const templateIdSet = useMemo(() => new Set<string>(templateIds), [templateIds])
  const items = useMemo(
    () =>
      monsterTraitAcquisitionDropdownItems({
        traits: traits ?? [],
        templateIds,
      }).filter((item) => {
        if (!item.id.startsWith('preset:')) return true
        return !templateIdSet.has(item.id.slice('preset:'.length))
      }),
    [templateIdSet, templateIds, traits],
  )
  const advisories = useMemo(
    () => (values ? collectMonsterFormAdvisories(values, new Map()) : []),
    [values],
  )

  const traitRowTitle = useMemo(
    () => resolveMonsterTraitRowTitleConfig(monsterName ?? ''),
    [monsterName],
  )

  const traitDetailFieldsForRow = useCallback(
    (row: unknown, index: number) =>
      monsterTraitDetailFields({
        row,
        advisories,
        rowPath: `traits.${index}`,
        monsterName: monsterName ?? '',
        ctx,
        sharedCastingOptions: values ? sharedCastingOptions(values, '') : [],
      }),
    [advisories, ctx, monsterName, values],
  )

  const resolveTraitRowIndex = useCallback(
    (row: unknown) => {
      if (!row || !traits) return editor.selectedIndex ?? 0
      const rowIndex = traits.findIndex(
        (trait) =>
          trait === row ||
          (typeof row === 'object' &&
            row !== null &&
            'id' in row &&
            typeof trait?.id === 'string' &&
            trait.id === (row as { id: string }).id),
      )
      return rowIndex >= 0 ? rowIndex : (editor.selectedIndex ?? 0)
    },
    [editor.selectedIndex, traits],
  )

  const resolveItemFields = useCallback(
    (row: unknown) => traitDetailFieldsForRow(row, resolveTraitRowIndex(row)),
    [resolveTraitRowIndex, traitDetailFieldsForRow],
  )

  const resolveFieldSections = useCallback(
    (row: unknown) => ({
      primary: traitDetailFieldsForRow(row, resolveTraitRowIndex(row)),
    }),
    [resolveTraitRowIndex, traitDetailFieldsForRow],
  )

  const facing = useMonsterTraitFacingHost({
    fieldName: 'traits',
    selectedIndex: editor.selectedIndex,
  })

  return (
    <FormEmbeddedMasterDetailEditor
      editor={editor}
      formCtx={ctx}
      fieldName="traits"
      itemFields={traitResolver}
      resolveItemFields={resolveItemFields}
      resolveFieldSections={resolveFieldSections}
      facing={facing}
      itemNoun={MONSTER_TRAIT_ITEM_NOUN}
      listTitle={MONSTER_TRAITS_HEADING}
      ariaLabel={MONSTER_TRAITS_HEADING}
      addLabel={MONSTER_ADD_LABEL}
      addControl={
        <ButtonDropdown
          label={MONSTER_ADD_LABEL}
          searchPlaceholder="Search traits…"
          triggerPresentation="addIcon"
          groups={MONSTER_TRAIT_ACQUISITION_GROUPS}
          supportingWrap
          items={items}
          onSelectItem={(id) => {
            if (id.startsWith('template:')) {
              const templateId = id.slice('template:'.length)
              editor.appendRow(creatureTraitTemplateRow(templateId, createMonsterRowId()))
              return
            }
            const choice = parseMonsterTraitAcquisitionId(id)
            if (!choice) return
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
      rowTitle={traitRowTitle}
    />
  )
}
