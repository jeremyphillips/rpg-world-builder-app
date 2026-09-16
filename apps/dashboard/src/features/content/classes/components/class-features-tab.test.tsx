import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect } from 'react'
import { useFormContext, type UseFormReturn } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'

import { TestFormShell } from '@/test/form-shell'
import { makeContentFormCtx } from '../../lib/fixtures/content-form-ctx'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { ClassFeaturesTab } from './class-features-tab'

vi.mock('@rpg/ui/form', async (importOriginal) => {
  const { stubUiFormItems } = await import('@/test/mocks/ui-form')
  return stubUiFormItems(importOriginal)
})

type Feature = {
  id?: string
  kind?: string
  name: string
  level: number
  description: string
  grants: never[]
  available?: boolean
}

function FormApiCapture({ onReady }: { onReady: (form: UseFormReturn) => void }) {
  const form = useFormContext()

  useEffect(() => {
    onReady(form)
  }, [form, onReady])

  return null
}

function TabShell({
  features = [] as Feature[],
  entitySource,
  embeddedSeedRowIds,
  formCtx = {},
  onFormReady,
}: {
  features?: Feature[]
  entitySource?: ContentFormCtx['entitySource']
  embeddedSeedRowIds?: ContentFormCtx['embeddedSeedRowIds']
  formCtx?: ContentFormCtx
  onFormReady?: (form: UseFormReturn) => void
}) {
  return (
    <TestFormShell defaultValues={{ features }}>
      {onFormReady ? <FormApiCapture onReady={onFormReady} /> : null}
      <ClassFeaturesTab formCtx={{ entitySource, embeddedSeedRowIds, ...formCtx }} />
    </TestFormShell>
  )
}

function readListFeatureTitles(): string[] {
  const list = within(screen.getByRole('navigation', { name: 'Features' }))
  return list.getAllByRole('listitem').map((item) => {
    const button = within(item).getByRole('button')
    return button.textContent?.replace(/\s+/g, ' ').trim() ?? ''
  })
}

const rage: Feature = { id: 'f1', name: 'Rage', level: 1, description: '', grants: [] }
const unarmored: Feature = {
  id: 'f2',
  name: 'Unarmored Defense',
  level: 1,
  description: '',
  grants: [],
}

async function deleteViaOverflow(user: ReturnType<typeof userEvent.setup>, title: string) {
  await user.click(screen.getByRole('button', { name: new RegExp(`Actions for ${title}`, 'i') }))
  await user.click(screen.getByRole('menuitem', { name: /Delete feature/i }))
}

describe('ClassFeaturesTab', () => {
  it('shows the empty state when there are no features', () => {
    render(<TabShell />)
    expect(screen.getByText(/No features added\./i)).toBeInTheDocument()
    expect(screen.getByText(/Select a feature to edit/i)).toBeInTheDocument()
  })

  it('adds a feature and selects it in the detail panel', async () => {
    const user = userEvent.setup()
    render(<TabShell />)

    await user.click(screen.getByRole('button', { name: /Add feature/i }))

    expect(
      within(screen.getByRole('navigation', { name: 'Features' })).getByRole('button', {
        name: /Unnamed Feature/i,
      }),
    ).toBeInTheDocument()
    expect(screen.getAllByText('features.0').length).toBeGreaterThan(0)
  })

  it('renders structured meta for each row', () => {
    render(<TabShell features={[rage]} />)
    const list = within(screen.getByRole('navigation', { name: 'Features' }))
    expect(list.getByText('Level 1')).toBeInTheDocument()
    expect(list.getByText('Homebrew')).toBeInTheDocument()
  })

  it('selects another feature when its row is clicked', async () => {
    const user = userEvent.setup()
    render(<TabShell features={[rage, unarmored]} />)

    await user.click(
      within(screen.getByRole('navigation', { name: 'Features' })).getByRole('button', {
        name: /Unarmored Defense/i,
      }),
    )
    expect(screen.getAllByText('features.1').length).toBeGreaterThan(0)
  })

  it('confirms deletion through the dialog and removes the row', async () => {
    const user = userEvent.setup()
    render(<TabShell features={[rage]} entitySource="homebrew" />)

    await deleteViaOverflow(user, 'Rage')
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Delete feature?')

    await user.click(screen.getByRole('button', { name: /^Delete$/ }))

    await waitFor(() => {
      expect(screen.getByText(/No features added\./i)).toBeInTheDocument()
    })
  })

  it('locks system features on a system class (no overflow delete, System meta)', () => {
    render(
      <TabShell
        features={[rage]}
        entitySource="system"
        embeddedSeedRowIds={{ features: ['f1'] }}
      />,
    )

    expect(screen.getAllByText(/System/).length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: /Actions for Rage/i })).not.toBeInTheDocument()
  })

  it('allows deleting newly added rows even on a system class', async () => {
    const user = userEvent.setup()
    render(<TabShell features={[rage]} entitySource="system" />)

    await user.click(screen.getByRole('button', { name: /Add feature/i }))

    expect(screen.getByRole('button', { name: /Actions for Unnamed Feature/i })).toBeInTheDocument()
  })

  it('renders stable availability counts on the list rail', () => {
    render(<TabShell features={[rage, { ...unarmored, id: 'f2', available: false }]} />)

    expect(screen.getByText('1 available · 1 unavailable')).toBeInTheDocument()
  })

  it('renders broad availability and Change on the selected feature header', () => {
    render(<TabShell features={[rage]} />)

    expect(screen.getAllByText('Available').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Change' })).toBeInTheDocument()
  })

  it('does not reorder level peers when selecting a feature at a different level', async () => {
    const user = userEvent.setup()
    const weaponMastery: Feature = {
      id: 'f3',
      name: 'Weapon Mastery',
      level: 1,
      description: '',
      grants: [],
    }
    const dangerSense: Feature = {
      id: 'f4',
      name: 'Danger Sense',
      level: 2,
      description: '',
      grants: [],
    }
    const recklessAttack: Feature = {
      id: 'f5',
      name: 'Reckless Attack',
      level: 2,
      description: '',
      grants: [],
    }

    render(<TabShell features={[rage, unarmored, weaponMastery, dangerSense, recklessAttack]} />)

    const list = within(screen.getByRole('navigation', { name: 'Features' }))

    await user.click(list.getByRole('button', { name: /Weapon Mastery/i }))
    await user.click(list.getByRole('button', { name: /Danger Sense/i }))

    expect(readListFeatureTitles().join('|')).toMatch(/Danger Sense.*Reckless Attack/)
  })

  it('reorders the selected feature after its level is edited', async () => {
    const user = userEvent.setup()
    let formApi: UseFormReturn | undefined

    render(
      <TabShell
        features={[
          { id: 'f1', name: 'A', level: 1, description: '', grants: [] },
          { id: 'f2', name: 'B', level: 12, description: '', grants: [] },
          { id: 'f3', name: 'C', level: 1, description: '', grants: [] },
        ]}
        onFormReady={(form) => {
          formApi = form
        }}
      />,
    )

    const list = within(screen.getByRole('navigation', { name: 'Features' }))

    await user.click(list.getByRole('button', { name: /Level 12 B/i }))
    formApi!.setValue('features.1.level', 1, { shouldDirty: true })

    await waitFor(() => {
      expect(formApi!.getValues('features').map((row: Feature) => row.name)).toEqual([
        'A',
        'C',
        'B',
      ])
    })
  })

  it('shows availability alert for subclass-choice rows when subclassing is disabled', () => {
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
        formCtx={makeContentFormCtx({ campaignRules: { subclassing: { enabled: false } } })}
      />,
    )

    expect(screen.getByText(/Subclass choices are disabled/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Enable subclasses' })).toHaveAttribute(
      'href',
      '/campaigns/camp_1/homebrew/rules-config/character-configuration#subclasses',
    )
  })
})
