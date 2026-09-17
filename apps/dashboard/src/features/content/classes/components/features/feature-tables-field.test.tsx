import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { rageProgressionTableFixture } from '../../../components/tables/progression-table-fixtures'
import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { makeContentFormCtx } from '../../../lib/fixtures/content-form-ctx'
import { MasterDetailRowPrefixProvider } from '../../../lib/master-detail/master-detail-row-prefix.context'
import { FeatureTablesField } from './feature-tables-field'

beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false
  }
  if (!HTMLElement.prototype.releasePointerCapture) {
    HTMLElement.prototype.releasePointerCapture = () => undefined
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => undefined
  }
})

type FeatureFormValues = {
  features: Array<{
    name: string
    level: number
    grants: never[]
    tables: (typeof rageProgressionTableFixture)[]
    available: boolean
  }>
}

function Harness({
  initialTables = [] as (typeof rageProgressionTableFixture)[],
  onTablesChange,
  formCtx = makeContentFormCtx(),
}: {
  initialTables?: (typeof rageProgressionTableFixture)[]
  onTablesChange?: (tables: unknown) => void
  formCtx?: ContentFormCtx
}) {
  const form = useForm<FeatureFormValues>({
    defaultValues: {
      features: [
        {
          name: 'Rage',
          level: 1,
          grants: [],
          tables: initialTables,
          available: true,
        },
      ],
    },
  })

  const tables = useWatch({ control: form.control, name: 'features.0.tables' })
  if (onTablesChange) onTablesChange(tables)

  return (
    <FormProvider {...form}>
      <MasterDetailRowPrefixProvider value="features.0">
        <FeatureTablesField formCtx={formCtx} />
      </MasterDetailRowPrefixProvider>
    </FormProvider>
  )
}

describe('FeatureTablesField', () => {
  it('lists existing tables with breakpoint metadata', () => {
    render(<Harness initialTables={[rageProgressionTableFixture]} />)

    expect(screen.getByText('Rage progression')).toBeInTheDocument()
    expect(screen.getByText('2 columns · 4 breakpoints')).toBeInTheDocument()
    expect(screen.getByText('Level progression')).toBeInTheDocument()
  })

  it('appends a saved table without mutating the prior draft on cancel', async () => {
    const user = userEvent.setup()
    const onTablesChange = vi.fn()
    render(<Harness onTablesChange={onTablesChange} />)

    await user.click(screen.getByRole('button', { name: 'Add table' }))
    await user.type(screen.getByLabelText(/^table name/i), 'Second Wind')
    await user.click(screen.getByRole('button', { name: 'Add column' }))
    await user.type(screen.getByLabelText('Column name 1'), 'Uses')
    await user.click(screen.getByRole('button', { name: 'Add row' }))
    await user.type(screen.getByLabelText('Uses, level 1'), '2')
    await user.click(screen.getByRole('button', { name: 'Add table' }))

    expect(onTablesChange.mock.calls.at(-1)?.[0]).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: 'Add table' }))
    await user.type(screen.getByLabelText(/^table name/i), 'Discarded')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onTablesChange.mock.calls.at(-1)?.[0]).toHaveLength(1)
  })

  it('deletes a table from the overflow menu', async () => {
    const user = userEvent.setup()
    const onTablesChange = vi.fn()
    render(
      <Harness initialTables={[rageProgressionTableFixture]} onTablesChange={onTablesChange} />,
    )

    await user.click(screen.getByRole('button', { name: /Actions for Rage progression/i }))
    await user.click(screen.getByRole('menuitem', { name: 'Delete table' }))

    expect(onTablesChange.mock.calls.at(-1)?.[0]).toEqual([])
  })

  it('replaces a table after edit save', async () => {
    const user = userEvent.setup()
    const onTablesChange = vi.fn()
    render(
      <Harness initialTables={[rageProgressionTableFixture]} onTablesChange={onTablesChange} />,
    )

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    await user.clear(screen.getByLabelText(/^table name/i))
    await user.type(screen.getByLabelText(/^table name/i), 'Updated rage progression')
    await user.click(screen.getByRole('button', { name: 'Save table' }))

    const saved = onTablesChange.mock.calls.at(-1)?.[0] as { name: string }[]
    expect(saved[0]?.name).toBe('Updated rage progression')
  })

  it('shows kind selection when adding a new table regardless of parent publish intent', async () => {
    const user = userEvent.setup()
    render(<Harness formCtx={makeContentFormCtx({ validationIntent: 'publish' })} />)

    await user.click(screen.getByRole('button', { name: 'Add table' }))

    expect(screen.getByRole('radiogroup', { name: 'Table type' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /General table/i })).toBeInTheDocument()
  })

  it('shows read-only table type metadata when editing an existing table on a draft parent', async () => {
    const user = userEvent.setup()
    render(<Harness initialTables={[rageProgressionTableFixture]} />)

    await user.click(screen.getByRole('button', { name: 'Edit' }))

    const dialog = within(screen.getByRole('dialog'))
    expect(dialog.queryByRole('radiogroup', { name: 'Table type' })).not.toBeInTheDocument()
    expect(dialog.getByText('Table type')).toBeInTheDocument()
    expect(
      dialog.getByText('Level progression', { selector: '[aria-labelledby]' }),
    ).toBeInTheDocument()
  })

  it('confirms modal delete and removes the table', async () => {
    const user = userEvent.setup()
    const onTablesChange = vi.fn()
    render(
      <Harness initialTables={[rageProgressionTableFixture]} onTablesChange={onTablesChange} />,
    )

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    await user.click(screen.getByRole('button', { name: 'Delete table' }))

    const confirm = await screen.findByRole('alertdialog', { name: 'Delete table?' })
    await user.click(within(confirm).getByRole('button', { name: 'Delete table' }))

    expect(onTablesChange.mock.calls.at(-1)?.[0]).toEqual([])
  })
})
