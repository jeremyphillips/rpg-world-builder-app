import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'

import type { ContentFormCtx } from '../../lib/content-form-registry'
import { SpeciesHeritageOptionsEditor } from './species-heritage-options-editor.client'

vi.mock('@rpg/ui/form', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    FormItems: ({ namePrefix }: { namePrefix?: string }) => (
      <div data-testid="option-detail">{namePrefix}</div>
    ),
  }
})

type Option = {
  id?: string
  kind: 'custom' | 'grant'
  name?: string
  description?: string
  overrideDisplay?: boolean
  grants: never[]
}

function EditorShell({
  options = [] as Option[],
  optionsFieldName = 'heritageChoices.0.options',
  entitySource,
}: {
  options?: Option[]
  optionsFieldName?: string
  entitySource?: ContentFormCtx['entitySource']
}) {
  const form = useForm({
    defaultValues: {
      heritageChoices: [{ name: 'Draconic', kind: 'lineage', options }],
    },
  })
  return (
    <FormProvider {...form}>
      <SpeciesHeritageOptionsEditor
        formCtx={{ entitySource }}
        optionsFieldName={optionsFieldName}
      />
    </FormProvider>
  )
}

const breathWeapon: Option = {
  id: 'o1',
  kind: 'custom',
  name: 'Breath Weapon',
  description: '',
  grants: [],
}
const damageResistance: Option = {
  id: 'o2',
  kind: 'custom',
  name: 'Damage Resistance',
  description: '',
  grants: [],
}

describe('SpeciesHeritageOptionsEditor', () => {
  it('shows the empty state when there are no options', () => {
    render(<EditorShell options={[]} />)
    expect(screen.getByText(/No options yet/i)).toBeInTheDocument()
    expect(screen.getByText(/Select an option to edit/i)).toBeInTheDocument()
  })

  it('selects a pre-filled option in the detail panel', () => {
    render(<EditorShell options={[breathWeapon]} />)
    expect(screen.getByTestId('option-detail')).toHaveTextContent('heritageChoices.0.options.0')
  })

  it('adds an option and selects it in the detail panel', async () => {
    const user = userEvent.setup()
    render(<EditorShell options={[breathWeapon]} />)

    await user.click(screen.getByRole('button', { name: /Add option/i }))

    expect(screen.getByRole('button', { name: /^(?!Remove|Move).*Trait 2/ })).toBeInTheDocument()
    expect(screen.getByTestId('option-detail')).toHaveTextContent('heritageChoices.0.options.1')
  })

  it('renders a kind eyebrow for each row', () => {
    render(<EditorShell options={[breathWeapon]} />)
    expect(screen.getByText('Custom')).toBeInTheDocument()
  })

  it('selects another option when its row is clicked', async () => {
    const user = userEvent.setup()
    render(<EditorShell options={[breathWeapon, damageResistance]} />)

    await user.click(screen.getByRole('button', { name: /^(?!Remove|Move).*Damage Resistance/ }))
    expect(screen.getByTestId('option-detail')).toHaveTextContent('heritageChoices.0.options.1')
  })

  it('confirms deletion through the dialog and removes the row', async () => {
    const user = userEvent.setup()
    render(<EditorShell options={[breathWeapon]} entitySource="homebrew" />)

    await user.click(screen.getByRole('button', { name: /Remove Breath Weapon/i }))
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Delete option?')

    await user.click(screen.getByRole('button', { name: /^Delete$/ }))

    await waitFor(() => {
      expect(screen.getByText(/No options yet/i)).toBeInTheDocument()
    })
  })

  it('locks system options on a system species', () => {
    render(<EditorShell options={[breathWeapon]} entitySource="system" />)

    expect(screen.getByText('System')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Remove Breath Weapon/i })).not.toBeInTheDocument()
  })

  it('allows deleting newly added options even on a system species', async () => {
    const user = userEvent.setup()
    render(<EditorShell options={[breathWeapon]} entitySource="system" />)

    await user.click(screen.getByRole('button', { name: /Add option/i }))

    expect(screen.getByRole('button', { name: /Remove Trait 2/i })).toBeInTheDocument()
  })
})
