import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import {
  createEmptyFormValidationProducerSession,
  FormUiProvider,
  FormValidationProducerProvider,
  replaceFormValidationProducerSlot,
} from '@rpg/ui/form'

import { MonsterStatisticsPanel } from './statistics-panel'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../../lib/monster-form-values'

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

  it('reads ability score invalid state from the interactive producer session', () => {
    const defaults = resolveMonsterCreateDefaultValues()
    defaults.abilityScores.str = 12
    let session = createEmptyFormValidationProducerSession()
    session = replaceFormValidationProducerSlot(session, 'interactive', 1, [
      {
        path: 'abilityScores.str',
        message: 'Strength score is out of range.',
        severity: 'field',
        claim: { kind: 'field', target: 'abilityScores.str' },
      },
    ])

    function ProducerHost() {
      const form = useForm<MonsterFormValues>({ defaultValues: defaults })
      return (
        <FormUiProvider
          fields={[{ type: 'number', name: 'abilityScores.str', label: 'Strength score' }]}
          hasAttemptedSubmit
          validationPresentation="always"
        >
          <FormProvider {...form}>
            <FormValidationProducerProvider session={session} stamp={1}>
              <MonsterStatisticsPanel
                ctx={{
                  equipmentCatalogStatus: 'ready',
                  equipmentCatalogById: new Map(),
                  skillCatalogStatus: 'ready',
                }}
              />
            </FormValidationProducerProvider>
          </FormProvider>
        </FormUiProvider>
      )
    }

    render(<ProducerHost />)

    expect(screen.getByRole('button', { name: 'Strength score' })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
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
