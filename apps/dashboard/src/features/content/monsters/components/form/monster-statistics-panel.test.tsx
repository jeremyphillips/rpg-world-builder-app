import { useEffect } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
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
  it('shows the missing-armor state for equipment Armor Class', () => {
    const values = resolveMonsterCreateDefaultValues()
    values.armorClass = { kind: 'equipment' }
    render(<Host values={values} />)
    expect(screen.getByText(monsterChooseBodyArmorMessage())).toBeTruthy()
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

  it('renders six ability score cards with steppers and save toggles', () => {
    const values = resolveMonsterCreateDefaultValues()
    render(<Host values={values} />)

    expect(screen.getAllByRole('button', { name: /^Strength score$/i })).toHaveLength(1)
    expect(
      screen.getAllByRole('article', {
        name: /^(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)$/,
      }),
    ).toHaveLength(6)
    expect(screen.getAllByRole('checkbox', { name: /saving throw proficiency$/i })).toHaveLength(6)
  })

  it('commits a typed score on blur without writing untouched default tens', async () => {
    const user = userEvent.setup()
    const defaults = resolveMonsterCreateDefaultValues()
    const { str: _str, ...abilityScoresWithoutStr } = defaults.abilityScores
    const values = { ...defaults, abilityScores: abilityScoresWithoutStr }

    let latest: MonsterFormValues | undefined
    function TrackingHost() {
      const form = useForm<MonsterFormValues>({ defaultValues: values })
      latest = form.watch()
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

    render(<TrackingHost />)
    expect(latest?.abilityScores?.str).toBeUndefined()

    await user.click(screen.getByRole('button', { name: 'Strength score' }))
    const input = screen.getByRole('textbox', { name: 'Strength score' })
    await user.clear(input)
    await user.type(input, '12')
    await user.tab()

    await waitFor(() => {
      expect(latest?.abilityScores?.str).toBe(12)
    })
    expect(latest?.abilityScores?.dex).toBe(10)
  })

  it('toggles save proficiency without writing ability scores', async () => {
    const user = userEvent.setup()
    const defaults = resolveMonsterCreateDefaultValues()
    const { str: _str, ...abilityScoresWithoutStr } = defaults.abilityScores
    const values = { ...defaults, abilityScores: abilityScoresWithoutStr }

    let latest: MonsterFormValues | undefined
    function TrackingHost() {
      const form = useForm<MonsterFormValues>({ defaultValues: values })
      latest = form.watch()
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

    render(<TrackingHost />)
    await user.click(screen.getByRole('checkbox', { name: 'Strength saving throw proficiency' }))

    await waitFor(() => {
      expect(latest?.proficiencies?.savingThrows).toContain('str')
    })
    expect(latest?.abilityScores?.str).toBeUndefined()
  })

  it('steps an out-of-range stored score down by one and keeps it invalid', async () => {
    const user = userEvent.setup()
    const values = resolveMonsterCreateDefaultValues()
    values.abilityScores.str = 35

    render(<Host values={values} />)
    const scoreButton = screen.getByRole('button', { name: 'Strength score' })
    expect(scoreButton).toHaveAttribute('aria-invalid', 'true')

    await user.click(screen.getByRole('button', { name: 'Decrease Strength score' }))
    expect(scoreButton).toHaveTextContent('34')
    expect(scoreButton).toHaveAttribute('aria-invalid', 'true')
  })
})
