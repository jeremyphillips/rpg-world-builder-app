import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'

import { ClassFeaturesTab } from './class-features-tab.client'

vi.mock('@rpg/ui/form', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    FormItems: ({ namePrefix }: { namePrefix?: string }) => (
      <div data-testid="feature-detail">{namePrefix}</div>
    ),
  }
})

function TabShell({ features = [] as Array<Record<string, unknown>> }) {
  const form = useForm({ defaultValues: { features } })
  return (
    <FormProvider {...form}>
      <ClassFeaturesTab formCtx={{}} />
    </FormProvider>
  )
}

describe('ClassFeaturesTab', () => {
  it('shows the empty state when there are no features', () => {
    render(<TabShell />)
    expect(screen.getByText(/No features yet/i)).toBeInTheDocument()
    expect(screen.getByText(/Select a feature to edit/i)).toBeInTheDocument()
  })

  it('adds a feature and selects it in the detail panel', async () => {
    const user = userEvent.setup()
    render(<TabShell />)

    await user.click(screen.getByRole('button', { name: /Add feature/i }))

    expect(screen.getByRole('button', { name: 'Feature 1' })).toBeInTheDocument()
    expect(screen.getByTestId('feature-detail')).toHaveTextContent('features.0')
  })

  it('seeds the list from existing features and selects the first', () => {
    render(
      <TabShell
        features={[
          { level: 1, name: 'Rage', description: '', grants: [] },
          { level: 1, name: 'Unarmored Defense', description: '', grants: [] },
        ]}
      />,
    )

    expect(screen.getByRole('button', { name: 'Rage' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Unarmored Defense' })).toBeInTheDocument()
    expect(screen.getByTestId('feature-detail')).toHaveTextContent('features.0')
  })

  it('selects another feature when its row is clicked', async () => {
    const user = userEvent.setup()
    render(
      <TabShell
        features={[
          { level: 1, name: 'Rage', description: '', grants: [] },
          { level: 1, name: 'Unarmored Defense', description: '', grants: [] },
        ]}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Unarmored Defense' }))
    expect(screen.getByTestId('feature-detail')).toHaveTextContent('features.1')
  })

  it('removes a feature and returns to the empty state', async () => {
    const user = userEvent.setup()
    render(<TabShell features={[{ level: 1, name: 'Rage', description: '', grants: [] }]} />)

    await user.click(screen.getByRole('button', { name: /Remove Rage/i }))

    await waitFor(() => {
      expect(screen.getByText(/No features yet/i)).toBeInTheDocument()
    })
  })
})
