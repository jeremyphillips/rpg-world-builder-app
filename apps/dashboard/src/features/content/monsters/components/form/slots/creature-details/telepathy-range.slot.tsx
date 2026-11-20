import { TELEPATHY_MILE_FEET } from '@rpg/contracts'
import { JoinedPairFieldForm } from '@rpg/ui'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'

import {
  feetFromTelepathyRange,
  SENSE_RANGE_PLACEHOLDER,
  SENSE_RANGE_UNIT_LABEL,
  telepathyRangeAmountOptions,
  telepathyRangeFromFeet,
  telepathyRangeUnitOptions,
} from '../../../../../lib/forms/fields/content-sense-range-form-fields'
import { MONSTER_TELEPATHY_HINT } from '../../../../lib/monster-form-labels'
import type { MonsterFormValues } from '../../../../lib/monster-form-values'

const CLEARED_RANGE = -1

function clearableAmountOptions(options: readonly { value: number; label: string }[]) {
  return [{ value: CLEARED_RANGE, label: SENSE_RANGE_PLACEHOLDER }, ...options]
}

function readRangeAmount(next: string | number | undefined): number | undefined {
  if (typeof next !== 'number' || next === CLEARED_RANGE) return undefined
  return next
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
