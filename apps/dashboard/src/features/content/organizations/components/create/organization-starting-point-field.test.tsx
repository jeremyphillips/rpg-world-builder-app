import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Form } from '@rpg/ui/form'

import { OrganizationStartingPointField } from './organization-starting-point-field'
import { buildOrganizationFormValueSyncs } from '../../../lib/forms/organization-form-projection'

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

function Harness() {
  const form = useForm<HarnessValues>({
    defaultValues: { functions: [], practices: [], members: { classAffinityIds: [], titles: [] } },
  })

  return (
    <FormProvider {...form}>
      <OrganizationStartingPointField discoverableClasses={[]} />
      <button
        type="button"
        onClick={() => form.setValue('organizationDomain', 'government', { shouldDirty: true })}
      >
        Customize domain
      </button>
    </FormProvider>
  )
}

describe('OrganizationStartingPointField', () => {
  it('shows a compact summary after applying a starting point', async () => {
    const user = userEvent.setup()
    render(
      <Form
        schema={schema}
        fields={[{ type: 'text', name: 'name', label: 'Name' }]}
        defaultValues={{ name: 'Test' }}
        valueSyncs={buildOrganizationFormValueSyncs()}
        onSubmit={() => undefined}
        header={() => <Harness />}
      />,
    )

    await user.click(screen.getByRole('combobox', { name: /Starting point/i }))
    await user.click(screen.getByRole('option', { name: /Thieves' guild/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Change' })).toBeInTheDocument()
    })
    expect(screen.getByText(/Thieves' guild/i)).toBeInTheDocument()
  })

  it('confirms before replacing a customized starting point', async () => {
    const user = userEvent.setup()
    render(
      <Form
        schema={schema}
        fields={[{ type: 'text', name: 'name', label: 'Name' }]}
        defaultValues={{ name: 'Test' }}
        valueSyncs={buildOrganizationFormValueSyncs()}
        onSubmit={() => undefined}
        header={() => <Harness />}
      />,
    )

    await user.click(screen.getByRole('combobox', { name: /Starting point/i }))
    await user.click(screen.getByRole('option', { name: /Thieves' guild/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Customize domain' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Customize domain' }))
    await user.click(screen.getByRole('button', { name: 'Change' }))
    await user.click(screen.getByRole('combobox', { name: /Starting point/i }))
    await user.click(screen.getByRole('option', { name: /Army/i }))

    expect(screen.getByRole('alertdialog')).toHaveTextContent(/Change starting point/i)
    await user.click(screen.getByRole('button', { name: /Apply Army/i }))

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })
  })
})
