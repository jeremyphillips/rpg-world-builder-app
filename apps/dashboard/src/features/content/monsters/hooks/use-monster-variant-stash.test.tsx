import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import { FormUiContext, type FormUiContextValue } from '@rpg/ui/form'
import { useState } from 'react'

import { useMonsterVariantStash } from './use-monster-variant-stash'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../lib/monster-form-values'

function Probe({ recordId }: { recordId: string }) {
  const { switchArmorClass, stash } = useMonsterVariantStash(recordId)
  const form = useFormContext<MonsterFormValues>()
  return (
    <>
      <button type="button" onClick={() => switchArmorClass('fixed', 14)}>
        fixed
      </button>
      <button type="button" onClick={() => switchArmorClass('natural', 14)}>
        natural
      </button>
      <output data-testid="stash">{JSON.stringify(stash.armorClass)}</output>
      <output data-testid="dirty">{String(form.formState.isDirty)}</output>
      <output data-testid="ac">{JSON.stringify(form.watch('armorClass'))}</output>
    </>
  )
}

function Host({
  recordId,
  generation,
  onReset,
}: {
  recordId: string
  generation: number
  onReset: () => void
}) {
  const form = useForm<MonsterFormValues>({
    defaultValues: {
      ...resolveMonsterCreateDefaultValues(),
      armorClass: { kind: 'natural', bonus: 2 },
    },
  })
  const ui = {
    validationPresentation: 'progressive',
    fields: [],
    hasAttemptedSubmit: false,
    markSubmitAttempted: () => undefined,
    hasAttemptedPublish: false,
    markPublishAttempted: () => undefined,
    publishPresentationIssues: [],
    publishPresentationEnabled: false,
    validationSessionExpandKeys: new Set(),
    addValidationSessionExpandKeys: () => undefined,
    removeValidationSessionExpandKeys: () => undefined,
    resetValidationPresentation: onReset,
    sessionResetGeneration: generation,
  } as FormUiContextValue

  return (
    <FormUiContext.Provider value={ui}>
      <FormProvider {...form}>
        <Probe recordId={recordId} />
      </FormProvider>
    </FormUiContext.Provider>
  )
}

describe('useMonsterVariantStash', () => {
  it('restores a baseline-equal variant without leaving the form dirty, and clears on session reset', async () => {
    const user = userEvent.setup()
    function Wrapper() {
      const [generation, setGeneration] = useState(0)
      const [recordId, setRecordId] = useState('one')
      return (
        <>
          <Host
            recordId={recordId}
            generation={generation}
            onReset={() => setGeneration((value) => value + 1)}
          />
          <button type="button" onClick={() => setGeneration((value) => value + 1)}>
            reset
          </button>
          <button type="button" onClick={() => setRecordId('two')}>
            record
          </button>
        </>
      )
    }
    render(<Wrapper />)
    await user.click(screen.getByRole('button', { name: 'fixed' }))
    expect(screen.getByTestId('stash')).toHaveTextContent('"natural":2')
    expect(screen.getByTestId('dirty')).toHaveTextContent('true')
    await user.click(screen.getByRole('button', { name: 'natural' }))
    expect(screen.getByTestId('ac')).toHaveTextContent('"bonus":2')
    expect(screen.getByTestId('dirty')).toHaveTextContent('false')
    await user.click(screen.getByRole('button', { name: 'reset' }))
    expect(screen.getByTestId('stash')).toHaveTextContent('{}')
  })
})
