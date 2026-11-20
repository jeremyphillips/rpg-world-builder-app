import { useMemo, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { getSenseLabel, nounFromTerm, SENSE_SET_ID, SENSE_TERM, type SenseId } from '@rpg/contracts'
import { ComboboxField, JoinedPairFieldForm } from '@rpg/ui'

import { buildLabelDescriptionActiveVocabulary, useVocabularySet } from '@/features/vocabulary'

import { useEntityCardUtilityControlSizes } from '../../../../../lib/entity/surfaces/cards/content/entity-card-utility-field-size.lib'
import { EntityCard } from '@/features/content'
import {
  SENSE_RANGE_PLACEHOLDER,
  SENSE_RANGE_UNIT,
  SENSE_RANGE_UNIT_LABEL,
  senseRangeAmountOptions,
  senseRangeUnitOptions,
} from '../../../../../lib/forms/fields/content-sense-range-form-fields'
import type { ContentFormCtx } from '../../../../../lib/forms/registry/content-form-registry'
import {
  MONSTER_ADD_SENSE_LABEL,
  MONSTER_SPECIAL_SENSE_SUPPORTING_LABEL,
} from '../../../../lib/monster-form-labels'
import type { MonsterFormValues } from '../../../../lib/monster-form-values'
import { MonsterCreatureDetailsRemoveRowButton } from '../../creature-details/slot-parts'

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
          <EntityCard
            density="compact"
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
