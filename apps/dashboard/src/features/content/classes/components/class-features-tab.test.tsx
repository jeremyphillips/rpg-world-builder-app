import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { defaultCampaignRules } from '../../lib/form-options/content-campaign-rules'
import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
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

type Feature = {
  id?: string
  kind?: string
  name: string
  level: number
  description: string
  grants: never[]
}

function TabShell({
  features = [] as Feature[],
  entitySource,
  embeddedSeedRowIds,
  formCtx = {},
}: {
  features?: Feature[]
  entitySource?: ContentFormCtx['entitySource']
  embeddedSeedRowIds?: ContentFormCtx['embeddedSeedRowIds']
  formCtx?: ContentFormCtx
}) {
  const form = useForm({ defaultValues: { features } })
  return (
    <MemoryRouter>
      <FormProvider {...form}>
        <ClassFeaturesTab formCtx={{ entitySource, embeddedSeedRowIds, ...formCtx }} />
      </FormProvider>
    </MemoryRouter>
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

    expect(screen.getByRole('button', { name: /^(?!Remove|Drag).*Feature 1/ })).toBeInTheDocument()
    expect(screen.getByTestId('feature-detail')).toHaveTextContent('features.0')
  })

  it('renders a level eyebrow for each row', () => {
    render(<TabShell features={[rage]} />)
    expect(screen.getByText('Level 1')).toBeInTheDocument()
  })

  it('selects another feature when its row is clicked', async () => {
    const user = userEvent.setup()
    render(<TabShell features={[rage, unarmored]} />)

    await user.click(screen.getByRole('button', { name: /^(?!Remove|Drag).*Unarmored Defense/ }))
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
    render(
      <TabShell
        features={[rage]}
        entitySource="system"
        embeddedSeedRowIds={{ features: ['f1'] }}
      />,
    )

    expect(screen.getByText('System')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Remove Rage/i })).not.toBeInTheDocument()
  })

  it('allows deleting newly added rows even on a system class', async () => {
    const user = userEvent.setup()
    render(<TabShell features={[rage]} entitySource="system" />)

    await user.click(screen.getByRole('button', { name: /Add feature/i }))

    expect(screen.getByRole('button', { name: /Remove Feature 2/i })).toBeInTheDocument()
  })

  it('shows inactive badge and availability alert for subclass-choice rows when subclassing is disabled', () => {
    const subclassChoice: Feature = {
      kind: 'subclass-choice',
      id: 'fighter-subclass',
      name: 'Fighter Subclass',
      level: 3,
      description: '',
      grants: [],
    }

    render(
      <TabShell
        features={[subclassChoice]}
        formCtx={{
          campaignId: 'camp_1',
          campaignRules: {
            ...defaultCampaignRules(),
            subclassing: { enabled: false },
          },
        }}
      />,
    )

    expect(screen.getAllByText('Inactive').length).toBeGreaterThan(0)
    expect(screen.getByText(/Subclass choices are disabled/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Enable subclasses' })).toHaveAttribute(
      'href',
      '/campaigns/camp_1/homebrew/rules-config/character-configuration#subclasses',
    )
  })
})
