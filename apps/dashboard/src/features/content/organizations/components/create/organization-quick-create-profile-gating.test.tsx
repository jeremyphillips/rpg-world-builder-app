import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Form } from '@rpg/ui/form'
import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import {
  buildOrganizationFields,
  buildOrganizationFormValueSyncs,
} from '../../../lib/forms/organization-form-projection'
import { organizationCreateDefaultValues } from '../../../lib/forms/organization-form-projection'
import { makeContentFormCtx } from '../../../lib/fixtures/content-form-ctx'
import { OrganizationAuthoringProvider } from './organization-authoring-context'
import { OrganizationAuthoringPresetBridge } from './organization-authoring-preset-bridge'

const schema = z.object({
  name: z.string().optional(),
  startingPointId: z.string().optional(),
  organizationDomain: z.string().optional(),
  functions: z.array(z.string()).default([]),
  practices: z.array(z.string()).default([]),
  members: z
    .object({
      classAffinityIds: z.array(z.string()).default([]),
      speciesAffinityIds: z.array(z.string()).default([]),
    })
    .default({ classAffinityIds: [], speciesAffinityIds: [] }),
})

function renderQuickCreateForm() {
  const ctx = { ...makeContentFormCtx(), organizationFormPresentation: 'quick' as const }
  render(
    <OrganizationAuthoringProvider presentation="quick">
      <Form
        schema={schema}
        fields={buildOrganizationFields(ctx, { presentation: 'quick' })}
        defaultValues={organizationCreateDefaultValues}
        valueSyncs={buildOrganizationFormValueSyncs()}
        onSubmit={() => undefined}
        header={() => <OrganizationAuthoringPresetBridge />}
      />
    </OrganizationAuthoringProvider>,
  )
}

describe('Organization quick create profile gating', () => {
  it('hides profile until Set up manually, then keeps it visible after clearing starting point', async () => {
    const user = userEvent.setup()
    renderQuickCreateForm()

    expect(screen.queryByRole('group', { name: /Organization profile/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Set up manually' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Set up manually' }))
    const profileGroup = screen.getByRole('group', { name: /Organization profile/i })
    expect(profileGroup).toBeInTheDocument()
    expect(profileGroup.closest('.bg-field-container')).toBeInstanceOf(HTMLElement)
    const optionalDetailsToggle = screen.getByRole('button', { name: /Optional details/i })
    expect(optionalDetailsToggle).toHaveAttribute('aria-expanded', 'false')
    expect(optionalDetailsToggle.closest('.bg-field-container')).toBeInstanceOf(HTMLElement)
    expect(screen.queryByRole('textbox', { name: /description/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Set up manually' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('combobox', { name: /Starting point/i }))
    await user.click(screen.getByRole('option', { name: /Thieves' guild/i }))

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /Starting point/i })).toHaveTextContent(
        /Thieves' guild/i,
      )
    })

    await user.click(screen.getByRole('button', { name: 'Clear Starting point' }))

    await waitFor(() => {
      expect(screen.getByRole('group', { name: /Organization profile/i })).toBeInTheDocument()
    })
  })
})
