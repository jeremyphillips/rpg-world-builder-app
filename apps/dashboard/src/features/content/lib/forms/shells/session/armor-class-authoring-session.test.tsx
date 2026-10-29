import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import {
  ArmorClassAuthoringNotice,
  ArmorClassAuthoringProvider,
  armorClassRulesSignature,
  useArmorClassAuthoringSave,
  useArmorClassAuthoringSession,
  useArmorClassRulesStale,
} from './armor-class-authoring-session'

const ASCENDING_TEN = { mode: 'ascending' as const, base: 10 as const }
const ASCENDING_NINE = { mode: 'ascending' as const, base: 9 as const }

function SessionProbe({ sensitive, live }: { sensitive: boolean; live: typeof ASCENDING_TEN }) {
  const form = useForm({ defaultValues: { baseAc: 18 } })
  const [liveRules, setLiveRules] = useState(live)
  const liveSession = useArmorClassAuthoringSession(sensitive, liveRules)

  return (
    <ArmorClassAuthoringProvider value={liveSession}>
      <FormProvider {...form}>
        <ArmorClassAuthoringNotice />
        <SessionFlags />
        <output data-testid="snapshot">{armorClassRulesSignature(liveSession.snapshot)}</output>
        <output data-testid="generation">{liveSession.generation}</output>
        <output data-testid="kept">{liveSession.keptValues ? 'kept' : 'none'}</output>
        <button type="button" onClick={() => form.setValue('baseAc', 19, { shouldDirty: true })}>
          Mark dirty
        </button>
        <button type="button" onClick={() => setLiveRules(ASCENDING_NINE)}>
          Change rules
        </button>
      </FormProvider>
    </ArmorClassAuthoringProvider>
  )
}

function SessionFlags() {
  const stale = useArmorClassRulesStale()
  const { saveWithoutDirty } = useArmorClassAuthoringSave()
  return (
    <>
      <output data-testid="stale">{String(stale)}</output>
      <output data-testid="force-save">{String(saveWithoutDirty)}</output>
    </>
  )
}

describe('armor class authoring session', () => {
  it('re-hydrates a pristine form when live rules change', async () => {
    const user = userEvent.setup()
    render(<SessionProbe sensitive live={ASCENDING_TEN} />)

    expect(screen.getByTestId('snapshot')).toHaveTextContent('ascending:10')
    await user.click(screen.getByRole('button', { name: 'Change rules' }))

    expect(screen.getByTestId('snapshot')).toHaveTextContent('ascending:9')
    expect(screen.getByTestId('generation')).toHaveTextContent('1')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByTestId('stale')).toHaveTextContent('false')
  })

  it('blocks a dirty form until discard or keep', async () => {
    const user = userEvent.setup()
    render(<SessionProbe sensitive live={ASCENDING_TEN} />)

    await user.click(screen.getByRole('button', { name: 'Mark dirty' }))
    await user.click(screen.getByRole('button', { name: 'Change rules' }))

    expect(screen.getByTestId('snapshot')).toHaveTextContent('ascending:10')
    expect(screen.getByTestId('stale')).toHaveTextContent('true')
    expect(screen.getByRole('alert')).toHaveTextContent('Armor Class rules changed')

    await user.click(screen.getByRole('button', { name: 'Keep my values under new rules' }))

    expect(screen.getByTestId('snapshot')).toHaveTextContent('ascending:9')
    expect(screen.getByTestId('kept')).toHaveTextContent('kept')
    expect(screen.getByTestId('force-save')).toHaveTextContent('true')
    expect(screen.getByTestId('stale')).toHaveTextContent('false')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('discards dirty values and reloads under the live rules', async () => {
    const user = userEvent.setup()
    render(<SessionProbe sensitive live={ASCENDING_TEN} />)

    await user.click(screen.getByRole('button', { name: 'Mark dirty' }))
    await user.click(screen.getByRole('button', { name: 'Change rules' }))
    await user.click(screen.getByRole('button', { name: 'Discard changes and reload' }))

    expect(screen.getByTestId('snapshot')).toHaveTextContent('ascending:9')
    expect(screen.getByTestId('kept')).toHaveTextContent('none')
    expect(screen.getByTestId('force-save')).toHaveTextContent('false')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('follows live rules immediately when the form is not rules-sensitive', () => {
    render(<SessionProbe sensitive={false} live={ASCENDING_NINE} />)
    expect(screen.getByTestId('snapshot')).toHaveTextContent('ascending:9')
    expect(screen.getByTestId('kept')).toHaveTextContent('none')
  })
})
