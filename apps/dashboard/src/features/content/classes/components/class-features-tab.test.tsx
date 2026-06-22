import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'

import type { ContentFormCtx } from '../../lib/content-form-registry'
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

type Feature = { id?: string; name: string; level: number; description: string; grants: never[] }

function TabShell({
  features = [] as Feature[],
  entitySource,
}: {
  features?: Feature[]
  entitySource?: ContentFormCtx['entitySource']
}) {
  const form = useForm({ defaultValues: { features } })
  return (
    <FormProvider {...form}>
      <ClassFeaturesTab formCtx={{ entitySource }} />
    </FormProvider>
  )
}

const rage: Feature = { id: 'f1', name: 'Rage', level: 1, description: '', grants: [] }
const unarmored: Feature = {
  id: 'f2',
  name: 'Unarmored Defense',
  level: 1,
  description: '',
  grants: [],
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

  it('renders a level eyebrow for each row', () => {
    render(<TabShell features={[rage]} />)
    expect(screen.getByText('Level 1')).toBeInTheDocument()
  })

  it('selects another feature when its row is clicked', async () => {
    const user = userEvent.setup()
    render(<TabShell features={[rage, unarmored]} />)

    await user.click(screen.getByRole('button', { name: /^(?!Remove).*Unarmored Defense/ }))
    expect(screen.getByTestId('feature-detail')).toHaveTextContent('features.1')
  })

  it('confirms deletion through the dialog and removes the row', async () => {
    const user = userEvent.setup()
    render(<TabShell features={[rage]} entitySource="homebrew" />)

    await user.click(screen.getByRole('button', { name: /Remove Rage/i }))
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Delete feature?')

    await user.click(screen.getByRole('button', { name: /^Delete$/ }))

    await waitFor(() => {
      expect(screen.getByText(/No features yet/i)).toBeInTheDocument()
    })
  })

  it('locks system features on a system class (no remove control, System badge)', () => {
    render(<TabShell features={[rage]} entitySource="system" />)

    expect(screen.getByText('System')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Remove Rage/i })).not.toBeInTheDocument()
  })

  it('allows deleting newly added rows even on a system class', async () => {
    const user = userEvent.setup()
    render(<TabShell features={[rage]} entitySource="system" />)

    await user.click(screen.getByRole('button', { name: /Add feature/i }))

    expect(screen.getByRole('button', { name: /Remove Feature 2/i })).toBeInTheDocument()
  })
})
