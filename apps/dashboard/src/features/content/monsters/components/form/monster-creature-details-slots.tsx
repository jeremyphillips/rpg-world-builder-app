import { useEffect, useMemo, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import {
  getSenseLabel,
  nounFromTerm,
  SENSE_SET_ID,
  SENSE_TERM,
  TELEPATHY_MILE_FEET,
  type SenseId,
} from '@rpg/contracts'
import { BooleanField, ComboboxField, JoinedPairFieldForm } from '@rpg/ui'

import { buildLabelDescriptionActiveVocabulary } from '@/features/vocabulary/lib/build-vocabulary-maps'
import { useVocabularySet } from '@/features/vocabulary/hooks/use-vocabulary-set'

import { useEntityCardUtilityControlSizes } from '../../../lib/entity/surfaces/cards/content/entity-card-utility-field-size.lib'
import { ContentFormEntitySelectionRow } from '../../../lib/forms/selection/content-form-entity-selection-row'
import {
  feetFromTelepathyRange,
  SENSE_RANGE_PLACEHOLDER,
  SENSE_RANGE_UNIT,
  SENSE_RANGE_UNIT_LABEL,
  senseRangeAmountOptions,
  senseRangeUnitOptions,
  telepathyRangeAmountOptions,
  telepathyRangeFromFeet,
  telepathyRangeUnitOptions,
} from '../../../lib/forms/fields/content-sense-range-form-fields'
import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import {
  MONSTER_ADD_SENSE_LABEL,
  MONSTER_SPECIAL_SENSE_SUPPORTING_LABEL,
  MONSTER_TELEPATHY_HINT,
  MONSTER_UNDERSTANDS_ONLY_LABEL,
} from '../../lib/monster-form-labels'
import type { MonsterFormValues } from '../../lib/monster-form-values'
import { MonsterCreatureDetailsLanguagesAddField } from './monster-creature-details-languages-add-field'
import { MonsterCreatureDetailsRemoveRowButton } from './monster-creature-details-slot-parts'

export { MonsterCreatureDetailsSkillsSlot } from './monster-creature-details-skills-slot'

const CLEARED_RANGE = -1

function clearableAmountOptions(options: readonly { value: number; label: string }[]) {
  return [{ value: CLEARED_RANGE, label: SENSE_RANGE_PLACEHOLDER }, ...options]
}

function readRangeAmount(next: string | number | undefined): number | undefined {
  if (typeof next !== 'number' || next === CLEARED_RANGE) return undefined
  return next
}

function MonsterSenseRangeRowTrailing({
  row,
  index,
  label,
  values,
}: {
  row: MonsterFormValues['senses'][number]
  index: number
  label: string
  values: MonsterFormValues
}) {
  const form = useFormContext<MonsterFormValues>()
  const { fieldSize } = useEntityCardUtilityControlSizes()

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <JoinedPairFieldForm
        id={`monster-sense-range-${row.type}`}
        label={`${label} range`}
        labelVisibility="srOnly"
        width="auto"
        size={fieldSize}
        chrome={{ variant: 'none' }}
        start={{
          kind: 'select',
          id: `monster-sense-range-${row.type}-amount`,
          value: row.range,
          options: clearableAmountOptions(senseRangeAmountOptions),
          digits: 3,
          placeholder: SENSE_RANGE_PLACEHOLDER,
          ariaLabel: `${label} range value`,
          onChange: (next) => {
            form.setValue(`senses.${index}.range`, readRangeAmount(next), {
              shouldDirty: true,
            })
          },
        }}
        end={{
          kind: 'select',
          id: `monster-sense-range-${row.type}-unit`,
          value: SENSE_RANGE_UNIT,
          options: senseRangeUnitOptions,
          sizingLabels: [SENSE_RANGE_UNIT_LABEL],
          ariaLabel: `${label} range unit`,
          onChange: () => undefined,
        }}
        startOccupant={{
          kind: 'select',
          name: 'amount',
          options: clearableAmountOptions(senseRangeAmountOptions),
          digits: 3,
          placeholder: SENSE_RANGE_PLACEHOLDER,
          ariaLabel: `${label} range value`,
        }}
        endOccupant={{
          kind: 'select',
          name: 'unit',
          options: senseRangeUnitOptions,
          defaultValue: SENSE_RANGE_UNIT,
          sizingLabels: [SENSE_RANGE_UNIT_LABEL],
          ariaLabel: `${label} range unit`,
        }}
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
  )
}

function MonsterLanguageFluencyRowTrailing({
  entry,
  index,
  label,
  speaks,
  values,
}: {
  entry: MonsterFormValues['proficiencies']['languages'][number]
  index: number
  label: string
  speaks: boolean
  values: MonsterFormValues
}) {
  const form = useFormContext<MonsterFormValues>()

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <BooleanField
        id={`monster-language-${entry.language}-understands-only`}
        label={MONSTER_UNDERSTANDS_ONLY_LABEL}
        checked={!speaks}
        onCheckedChange={(understandsOnly) => {
          form.setValue(
            `proficiencies.languages.${index}.speaks`,
            understandsOnly ? false : undefined,
            { shouldDirty: true },
          )
        }}
      />
      <MonsterCreatureDetailsRemoveRowButton
        label={label}
        onRemove={() =>
          form.setValue(
            'proficiencies.languages',
            (values.proficiencies.languages ?? []).filter((row) => row.language !== entry.language),
            { shouldDirty: true },
          )
        }
      />
    </div>
  )
}

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
          enableSearch={false}
          noun={nounFromTerm(SENSE_TERM)}
          closedPlaceholderIntent="add"
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
                <MonsterSenseRangeRowTrailing
                  row={row}
                  index={index}
                  label={label}
                  values={values}
                />
              ),
            }}
          />
        )
      })}
    </div>
  )
}

export function MonsterTelepathyRangeField() {
  const form = useFormContext<MonsterFormValues>()
  const [stored, setStored] = useState<number | undefined>(() => {
    const value = form.getValues('communication.telepathy')
    return typeof value === 'number' ? value : undefined
  })

  useEffect(() => {
    const subscription = form.watch((values, info) => {
      if (
        info.name != null &&
        info.name !== 'communication.telepathy' &&
        !info.name.startsWith('communication.')
      ) {
        return
      }
      const next = values.communication?.telepathy
      setStored(typeof next === 'number' ? next : undefined)
    })
    return () => subscription.unsubscribe()
  }, [form])

  const { amount, unit } = telepathyRangeFromFeet(stored)
  const amountOptions = clearableAmountOptions(telepathyRangeAmountOptions(unit))

  return (
    <JoinedPairFieldForm
      id="monster-telepathy-range"
      label="Range"
      hint={MONSTER_TELEPATHY_HINT}
      hintPosition="below-control"
      width="auto"
      chrome={{ variant: 'none' }}
      start={{
        kind: 'select',
        id: 'monster-telepathy-range-amount',
        value: amount,
        options: amountOptions,
        digits: 3,
        placeholder: SENSE_RANGE_PLACEHOLDER,
        ariaLabel: 'Range value',
        onChange: (next) => {
          if (typeof next !== 'number') return
          const feet = feetFromTelepathyRange(readRangeAmount(next), unit)
          setStored(feet)
          form.setValue('communication.telepathy', feet, { shouldDirty: true })
        },
      }}
      end={{
        kind: 'select',
        id: 'monster-telepathy-range-unit',
        value: unit,
        options: telepathyRangeUnitOptions,
        sizingLabels: [SENSE_RANGE_UNIT_LABEL, 'mile'],
        ariaLabel: 'Range unit',
        onChange: (next) => {
          if (next === 'mile') {
            setStored(TELEPATHY_MILE_FEET)
            form.setValue('communication.telepathy', TELEPATHY_MILE_FEET, { shouldDirty: true })
            return
          }
          if (next === 'ft' && stored === TELEPATHY_MILE_FEET) {
            setStored(undefined)
            form.setValue('communication.telepathy', undefined, { shouldDirty: true })
          }
        },
      }}
      startOccupant={{
        kind: 'select',
        name: 'amount',
        options: amountOptions,
        digits: 3,
        placeholder: SENSE_RANGE_PLACEHOLDER,
        ariaLabel: 'Range value',
      }}
      endOccupant={{
        kind: 'select',
        name: 'unit',
        options: telepathyRangeUnitOptions,
        defaultValue: 'ft',
        sizingLabels: [SENSE_RANGE_UNIT_LABEL, 'mile'],
        ariaLabel: 'Range unit',
      }}
    />
  )
}

export function MonsterCreatureDetailsLanguagesSlot({ ctx }: { ctx: ContentFormCtx }) {
  const values = useWatch<MonsterFormValues>() as MonsterFormValues | undefined

  if (!values?.proficiencies) return null

  return (
    <div className="flex flex-col gap-2">
      <MonsterCreatureDetailsLanguagesAddField ctx={ctx} />
      {(values.proficiencies.languages ?? []).map((entry, index) => {
        const label = ctx.languageVocabulary?.labelById[entry.language] ?? entry.language
        const speaks = entry.speaks !== false
        return (
          <ContentFormEntitySelectionRow
            key={entry.language}
            entity={{ heading: label }}
            trailing={{
              kind: 'utility',
              content: (
                <MonsterLanguageFluencyRowTrailing
                  entry={entry}
                  index={index}
                  label={label}
                  speaks={speaks}
                  values={values}
                />
              ),
            }}
          />
        )
      })}
    </div>
  )
}
