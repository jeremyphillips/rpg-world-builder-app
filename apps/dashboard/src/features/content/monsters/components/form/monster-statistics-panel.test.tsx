import { useEffect } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { MonsterStatisticsPanel } from './monster-statistics-panel'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../lib/monster-form-values'
import { monsterChooseBodyArmorMessage } from '../../lib/monster-form-labels'

function Host({ values }: { values: MonsterFormValues }) {
  const form = useForm<MonsterFormValues>({ defaultValues: values })
  return (
    <FormProvider {...form}>
      <MonsterStatisticsPanel
        ctx={{
          equipmentCatalogStatus: 'ready',
          equipmentCatalogById: new Map(),
          skillCatalogStatus: 'ready',
        }}
      />
    </FormProvider>
  )
}

describe('MonsterStatisticsPanel', () => {
  it('shows the missing-armor state for equipment Armor Class and the CR 0 hint', async () => {
    const user = userEvent.setup()
    const values = resolveMonsterCreateDefaultValues()
    values.armorClass = { kind: 'equipment' }
    render(<Host values={values} />)
    expect(screen.getByText(monsterChooseBodyArmorMessage())).toBeTruthy()
    await user.selectOptions(screen.getByLabelText('Challenge rating'), '0')
    expect(screen.getByLabelText('Awards 0 XP')).toBeTruthy()
    expect(screen.getByText(/XP 10/)).toBeTruthy()
  })

  it('shows a statistics validation message on the field that failed', async () => {
    function HostWithError() {
      const values = resolveMonsterCreateDefaultValues()
      values.armorClass = { kind: 'natural', bonus: 2 }
      const form = useForm<MonsterFormValues>({ defaultValues: values })
      useEffect(() => {
        form.setError('armorClass.bonus', {
          type: 'server',
          message: 'Enter a bonus of at least 1.',
        })
      }, [form])
      return (
        <FormProvider {...form}>
          <MonsterStatisticsPanel
            ctx={{
              equipmentCatalogStatus: 'ready',
              equipmentCatalogById: new Map(),
              skillCatalogStatus: 'ready',
            }}
          />
        </FormProvider>
      )
    }

    render(<HostWithError />)
    expect(await screen.findByText('Armor Class: Enter a bonus of at least 1.')).toBeTruthy()
    expect(screen.getByLabelText('Natural armor bonus')).toHaveAttribute('aria-invalid', 'true')
  })
})
