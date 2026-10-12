import { useMemo, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { getSenseLabel, SENSE_SET_ID, type SenseId } from '@rpg/contracts'
import { Chip, ChipGroup, ComboboxField } from '@rpg/ui'

import { buildLabelDescriptionActiveVocabulary } from '@/features/vocabulary/lib/build-vocabulary-maps'
import { useVocabularySet } from '@/features/vocabulary/hooks/use-vocabulary-set'

import { ContentFormEntitySelectionRow } from '../../../lib/forms/selection/content-form-entity-selection-row'
import { ContentSenseRangePresetSelect } from '../../../lib/forms/fields/content-sense-range-preset-select'
import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import {
  MONSTER_ADD_LANGUAGE_LABEL,
  MONSTER_ADD_SENSE_LABEL,
  MONSTER_SPECIAL_SENSE_SUPPORTING_LABEL,
  MONSTER_SPEAKS_LABEL,
  MONSTER_UNDERSTANDS_ONLY_LABEL,
} from '../../lib/monster-form-labels'
import type { MonsterFormValues } from '../../lib/monster-form-values'
import { MonsterCreatureDetailsRemoveRowButton } from './monster-creature-details-slot-parts'

export { MonsterCreatureDetailsSkillsSlot } from './monster-creature-details-skills-slot'

export function MonsterCreatureDetailsSensesSlot({ ctx }: { ctx: ContentFormCtx }) {
  const form = useFormContext<MonsterFormValues>()
  const values = useWatch<MonsterFormValues>() as MonsterFormValues | undefined
  const senseRows = values?.senses ?? []
  const selected = useMemo(() => new Set(senseRows.map((row) => row.type)), [senseRows])
  const senseSetQuery = useVocabularySet(ctx.campaignId, SENSE_SET_ID)
  const senseDescriptions = useMemo(
    () =>
      senseSetQuery.data
        ? buildLabelDescriptionActiveVocabulary(senseSetQuery.data).descriptionById
        : {},
    [senseSetQuery.data],
  )
  const senseOptions = useMemo(
    () =>
      [...(ctx.senseVocabulary?.activeIds ?? [])]
        .filter((id) => !selected.has(id))
        .map((id) => ({
          value: id,
          label: ctx.senseVocabulary?.labelById[id] ?? id,
          description: senseDescriptions[id],
        })),
    [ctx.senseVocabulary, selected, senseDescriptions],
  )
  const [addSenseKey, setAddSenseKey] = useState(0)
  if (!values) return null

  return (
    <div className="flex flex-col gap-2">
      {senseOptions.length > 0 ? (
        <ComboboxField
          key={addSenseKey}
          id="monster-add-sense"
          label={MONSTER_ADD_SENSE_LABEL}
          labelVisibility="srOnly"
          options={senseOptions}
          multiple={false}
          enableSearch
          placeholder={MONSTER_ADD_SENSE_LABEL}
          value=""
          onChange={(next) => {
            if (typeof next !== 'string' || !next) return
            form.setValue('senses', [{ type: next }, ...(values.senses ?? [])], {
              shouldDirty: true,
            })
            setAddSenseKey((key) => key + 1)
          }}
        />
      ) : null}
      {(values.senses ?? []).map((row, index) => {
        const label = getSenseLabel(row.type as SenseId)
        return (
          <ContentFormEntitySelectionRow
            key={row.type}
            entity={{
              heading: label,
              description: MONSTER_SPECIAL_SENSE_SUPPORTING_LABEL,
            }}
            trailing={{
              kind: 'utility',
              content: (
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <ContentSenseRangePresetSelect
                    id={`monster-sense-range-${row.type}`}
                    label={`${label} range`}
                    value={row.range}
                    onValueChange={(next) =>
                      form.setValue(`senses.${index}.range`, next, { shouldDirty: true })
                    }
                  />
                  <MonsterCreatureDetailsRemoveRowButton
                    label={label}
                    onRemove={() =>
                      form.setValue(
                        'senses',
                        (values.senses ?? []).filter((entry) => entry.type !== row.type),
                        { shouldDirty: true },
                      )
                    }
                  />
                </div>
              ),
            }}
          />
        )
      })}
    </div>
  )
}

export function MonsterCreatureDetailsLanguagesSlot({ ctx }: { ctx: ContentFormCtx }) {
  const form = useFormContext<MonsterFormValues>()
  const values = useWatch<MonsterFormValues>() as MonsterFormValues | undefined
  const languageEntries = values?.languages?.entries ?? []
  const selected = useMemo(
    () => new Set(languageEntries.map((entry) => entry.language)),
    [languageEntries],
  )
  const languageOptions = useMemo(
    () =>
      [...(ctx.languageVocabulary?.activeIds ?? [])]
        .filter((id) => !selected.has(id))
        .map((id) => ({
          value: id,
          label: ctx.languageVocabulary?.labelById[id] ?? id,
        })),
    [ctx.languageVocabulary, selected],
  )
  const [addLanguageKey, setAddLanguageKey] = useState(0)

  if (!values?.languages) return null

  return (
    <div className="flex flex-col gap-2">
      {languageOptions.length > 0 ? (
        <ComboboxField
          key={addLanguageKey}
          id="monster-add-language"
          label={MONSTER_ADD_LANGUAGE_LABEL}
          labelVisibility="srOnly"
          options={languageOptions}
          multiple={false}
          enableSearch
          placeholder={MONSTER_ADD_LANGUAGE_LABEL}
          value=""
          onChange={(next) => {
            if (typeof next !== 'string' || !next) return
            form.setValue('languages.entries', [{ language: next }, ...values.languages.entries], {
              shouldDirty: true,
            })
            setAddLanguageKey((key) => key + 1)
          }}
        />
      ) : null}
      {values.languages.entries.map((entry, index) => {
        const label = ctx.languageVocabulary?.labelById[entry.language] ?? entry.language
        const speaks = entry.speaks !== false
        return (
          <ContentFormEntitySelectionRow
            key={entry.language}
            entity={{ heading: label }}
            trailing={{
              kind: 'utility',
              content: (
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <ChipGroup
                    semanticRole="radiogroup"
                    aria-label={`${label}, ${speaks ? MONSTER_SPEAKS_LABEL : MONSTER_UNDERSTANDS_ONLY_LABEL}`}
                  >
                    <Chip
                      id={`monster-language-${entry.language}-speaks`}
                      mode="selectable"
                      selectionRole="radio"
                      selected={speaks}
                      onSelectedChange={(nextSpeaks) => {
                        if (!nextSpeaks) return
                        form.setValue(`languages.entries.${index}.speaks`, undefined, {
                          shouldDirty: true,
                        })
                      }}
                    >
                      {MONSTER_SPEAKS_LABEL}
                    </Chip>
                    <Chip
                      id={`monster-language-${entry.language}-understands`}
                      mode="selectable"
                      selectionRole="radio"
                      selected={!speaks}
                      onSelectedChange={(nextUnderstands) => {
                        if (!nextUnderstands) return
                        form.setValue(`languages.entries.${index}.speaks`, false, {
                          shouldDirty: true,
                        })
                      }}
                    >
                      {MONSTER_UNDERSTANDS_ONLY_LABEL}
                    </Chip>
                  </ChipGroup>
                  <MonsterCreatureDetailsRemoveRowButton
                    label={label}
                    onRemove={() =>
                      form.setValue(
                        'languages.entries',
                        values.languages.entries.filter((row) => row.language !== entry.language),
                        { shouldDirty: true },
                      )
                    }
                  />
                </div>
              ),
            }}
          />
        )
      })}
    </div>
  )
}
