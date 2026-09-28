import { createElement } from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useFormContext, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { Form } from '@rpg/ui/form'

import { OrganizationAuthoringProvider } from './organization-authoring-context'
import { OrganizationStartingPointLegendAccessory } from './organization-starting-point-legend-accessory'
import { OrganizationStartingPointSetupManuallyAction } from './organization-starting-point-setup-manually-action'
import { OrganizationStartingPointField } from './organization-starting-point-field'
import { ORGANIZATION_STARTING_POINT_LEGEND } from '../../lib/presets/organization-form-copy.lib'
import { buildOrganizationFormValueSyncs } from '../../../lib/forms/organization-form-projection'
import { ORGANIZATION_STARTING_POINT_HINT } from '../../lib/presets/organization-form-copy.lib'
import { organizationStartingPointIsCustomized } from '../../lib/presets/organization-starting-point.lib'

const schema = z.object({
  name: z.string().optional(),
  startingPointId: z.string().optional(),
  organizationDomain: z.string().optional(),
  organizationForm: z.string().optional(),
  functions: z.array(z.string()).default([]),
  practices: z.array(z.string()).default([]),
  members: z
    .object({
      classAffinityIds: z.array(z.string()).default([]),
      titles: z.array(z.unknown()).default([]),
    })
    .default({ classAffinityIds: [], titles: [] }),
})

type HarnessValues = z.infer<typeof schema>

let readHarnessValues: (() => Record<string, unknown>) | undefined

function CustomizedProbe() {
  const values = useWatch() as Record<string, unknown>
  return (
    <div data-testid="customized-probe">
      {String(organizationStartingPointIsCustomized(values, { discoverableClasses: [] }))}
    </div>
  )
}

async function waitForThievesGuildMaterialized(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('combobox', { name: /Starting point/i }))
  await user.click(screen.getByRole('option', { name: /Thieves' guild/i }))
  await waitFor(() => {
    expect(readHarnessValues?.()).toMatchObject({
      startingPointId: 'thieves_guild',
      organizationDomain: 'criminal',
      practices: ['theft'],
    })
  })
}

function Harness() {
  const form = useFormContext<HarnessValues>()
  readHarnessValues = () => form.getValues()

  return (
    <>
      <CustomizedProbe />
      <button
        type="button"
        onClick={() => form.setValue('organizationDomain', 'government', { shouldDirty: true })}
      >
        Customize domain
      </button>
      <button
        type="button"
        onClick={() => form.setValue('organizationDomain', 'criminal', { shouldDirty: true })}
      >
        Restore thieves guild domain
      </button>
    </>
  )
}

function renderStartingPointForm() {
  render(
    <OrganizationAuthoringProvider presentation="quick">
      <Form
        schema={schema}
        fields={[
          { type: 'text', name: 'name', label: 'Name' },
          {
            kind: 'group',
            heading: {
              label: ORGANIZATION_STARTING_POINT_LEGEND,
              accessory: createElement(OrganizationStartingPointLegendAccessory, {
                discoverableClasses: [],
              }),
              action: createElement(OrganizationStartingPointSetupManuallyAction),
            },
            fields: [
              {
                kind: 'slot',
                name: 'startingPointId',
                render: () => <OrganizationStartingPointField discoverableClasses={[]} />,
              },
            ],
          },
        ]}
        defaultValues={{
          name: 'Test',
          functions: [],
          practices: [],
          members: { classAffinityIds: [], titles: [] },
        }}
        valueSyncs={buildOrganizationFormValueSyncs()}
        onSubmit={() => undefined}
        header={() => <Harness />}
      />
    </OrganizationAuthoringProvider>,
  )
}

describe('OrganizationStartingPointField', () => {
  it('shows an empty starting point select with hint copy', () => {
    renderStartingPointForm()

    expect(screen.getByRole('combobox', { name: /Starting point/i })).toHaveTextContent(
      /Choose a familiar organization type/i,
    )
    expect(screen.getByText(ORGANIZATION_STARTING_POINT_HINT)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Clear Starting point' })).not.toBeInTheDocument()
  })

  it('keeps the selected preset in the same select with a clear affordance', async () => {
    const user = userEvent.setup()
    renderStartingPointForm()

    await waitForThievesGuildMaterialized(user)

    expect(screen.getByRole('combobox', { name: /Starting point/i })).toHaveTextContent(
      /Thieves' guild/i,
    )
    expect(screen.getByRole('button', { name: 'Clear Starting point' })).toBeInTheDocument()
    expect(screen.queryByText('Customized')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Change' })).not.toBeInTheDocument()
  })

  it('switches presets immediately when seeded values still match the recipe', async () => {
    const user = userEvent.setup()
    renderStartingPointForm()

    await waitForThievesGuildMaterialized(user)

    expect(screen.getByRole('combobox', { name: /Starting point/i })).toHaveTextContent(
      /Thieves' guild/i,
    )

    await user.click(screen.getByRole('combobox', { name: /Starting point/i }))
    await user.click(screen.getByRole('option', { name: /Army/i }))

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /Starting point/i })).toHaveTextContent(/Army/i)
    })
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('shows a customized badge and confirms before replacing divergent seeded values', async () => {
    const user = userEvent.setup()
    renderStartingPointForm()

    await waitForThievesGuildMaterialized(user)

    await user.click(screen.getByRole('button', { name: 'Customize domain' }))
    expect(screen.getByText('Customized')).toBeInTheDocument()

    await user.click(screen.getByRole('combobox', { name: /Starting point/i }))
    await user.click(screen.getByRole('option', { name: /Army/i }))

    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveTextContent(/Change starting point/i)
    expect(dialog).toHaveTextContent(/replace your change to Domain/i)
    expect(dialog).toHaveTextContent(/Membership titles will also use Army defaults/i)
    expect(dialog).not.toHaveTextContent(/Other organization details/i)
    await user.click(screen.getByRole('button', { name: /Apply Army/i }))

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
      expect(screen.getByRole('combobox', { name: /Starting point/i })).toHaveTextContent(/Army/i)
    })
  })

  it('drops the customized badge when preset-owned values match the recipe again', async () => {
    const user = userEvent.setup()
    renderStartingPointForm()

    await waitForThievesGuildMaterialized(user)
    await user.click(screen.getByRole('button', { name: 'Customize domain' }))
    expect(screen.getByText('Customized')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Restore thieves guild domain' }))
    await waitFor(() => {
      expect(screen.getByTestId('customized-probe')).toHaveTextContent('false')
      expect(screen.queryByText('Customized')).not.toBeInTheDocument()
    })
  })

  it('clears the starting point association without confirmation and keeps the combobox editable', async () => {
    const user = userEvent.setup()
    renderStartingPointForm()

    await waitForThievesGuildMaterialized(user)

    expect(screen.getByRole('button', { name: 'Clear Starting point' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Clear Starting point' }))

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /Starting point/i })).toHaveFocus()
      expect(screen.getByRole('combobox', { name: /Starting point/i })).toHaveTextContent(
        /Choose a familiar organization type/i,
      )
    })
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('returns focus to the starting point control when a change dialog is cancelled', async () => {
    const user = userEvent.setup()
    renderStartingPointForm()

    await waitForThievesGuildMaterialized(user)
    await user.click(screen.getByRole('button', { name: 'Customize domain' }))

    await user.click(screen.getByRole('combobox', { name: /Starting point/i }))
    await user.click(screen.getByRole('option', { name: /Army/i }))

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
      expect(screen.getByRole('combobox', { name: /Starting point/i })).toHaveFocus()
    })
  })
})
