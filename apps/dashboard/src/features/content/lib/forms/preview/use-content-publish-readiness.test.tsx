import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { z } from 'zod'
import type { TabbedFormTab } from '@rpg/ui/form'

import { useContentPublishReadiness } from './use-content-publish-readiness'

const schema = z.object({
  name: z.string().min(1),
})

const tabs: TabbedFormTab[] = [
  { id: 'basics', label: 'Basics', fields: [], errorPaths: ['name'] },
  { id: 'features', label: 'Features', fields: [] },
]

function ReadinessView() {
  const readiness = useContentPublishReadiness({ schema, tabs, debounceMs: 0 })

  return (
    <>
      <span data-testid="valid">{String(readiness.valid)}</span>
      <span data-testid="invalid-tabs">{[...readiness.invalidTabIds].join(',')}</span>
    </>
  )
}

function ReadinessProbe({ name }: { name: string }) {
  const form = useForm({ defaultValues: { name } })

  return (
    <FormProvider {...form}>
      <ReadinessView />
    </FormProvider>
  )
}

describe('useContentPublishReadiness', () => {
  it('treats an empty required name as invalid on the first paint', () => {
    render(<ReadinessProbe name="" />)

    expect(screen.getByTestId('valid')).toHaveTextContent('false')
    expect(screen.getByTestId('invalid-tabs')).toHaveTextContent('basics')
  })

  it('treats a named value as publish-ready', () => {
    render(<ReadinessProbe name="Fighter" />)

    expect(screen.getByTestId('valid')).toHaveTextContent('true')
    expect(screen.getByTestId('invalid-tabs')).toHaveTextContent('')
  })
})
