import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { Form } from '@rpg/ui/form'
import type { OrganizationMembershipTitleDefinition } from '@rpg/contracts'

import { organizationMembershipTitleIdSchema } from '@rpg/contracts'

import {
  buildOrganizationMembershipTitlesArrayField,
  ORGANIZATION_MEMBERSHIP_TITLE_FIELD_ARRAY_KEY,
} from '../../lib/membership-titles/organization-membership-titles-form.lib'
import { OrganizationMembershipTitlesRegistration } from '../authoring/organization-membership-titles-registration'

const schema = z.object({
  members: z.object({
    classAffinityIds: z.array(z.string()).default([]),
    titles: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        priority: z.union([z.number(), z.string()]),
      }),
    ),
  }),
})

const initialTitles: OrganizationMembershipTitleDefinition[] = [
  { id: 'omt_chair', label: 'Chair', priority: 50 },
  { id: 'omt_clerk', label: 'Clerk', priority: 10 },
]

const changedTitles: OrganizationMembershipTitleDefinition[] = [
  { id: 'omt_initiate', label: 'Initiate', priority: 10 },
]

function FormHarness() {
  const form = useFormContext<z.infer<typeof schema>>()
  const { replace } = useFieldArray({
    control: form.control,
    name: 'members.titles',
    keyName: ORGANIZATION_MEMBERSHIP_TITLE_FIELD_ARRAY_KEY,
  })
  return (
    <div>
      <button
        type="button"
        onClick={() => {
          replace(changedTitles)
          form.setValue('members.titles', changedTitles, { shouldDirty: true })
        }}
      >
        Change titles
      </button>
      <button
        type="button"
        onClick={() => {
          const resetMembers = { classAffinityIds: [], titles: initialTitles }
          form.reset({ members: resetMembers })
          replace(initialTitles)
        }}
      >
        Reset titles
      </button>
    </div>
  )
}

function renderTitlesField(options: { onSubmit?: (values: z.infer<typeof schema>) => void } = {}) {
  const submitted: z.infer<typeof schema>[] = []
  render(
    <Form
      schema={schema}
      fields={[
        {
          kind: 'slot',
          name: '_organizationMembershipTitlesRegistration',
          render: () => <OrganizationMembershipTitlesRegistration />,
        },
        buildOrganizationMembershipTitlesArrayField(),
        {
          kind: 'slot',
          name: '_harness',
          render: () => <FormHarness />,
        },
        {
          kind: 'slot',
          name: '_submit',
          render: () => (
            <button type="submit" form="membership-titles-form">
              Save titles
            </button>
          ),
        },
      ]}
      id="membership-titles-form"
      defaultValues={{ members: { titles: initialTitles } }}
      onSubmit={(values) => {
        submitted.push(values)
        options.onSubmit?.(values)
      }}
    />,
  )
  return submitted
}

function titlesFieldset(): HTMLElement {
  const fieldset = document.getElementById('organization-membership-titles')
  if (!fieldset) {
    throw new Error('Expected membership titles fieldset')
  }
  return fieldset
}

describe('Organization membership titles array field', () => {
  it('renders current form members.titles', () => {
    renderTitlesField()
    const fieldset = titlesFieldset()
    expect(within(fieldset).getByDisplayValue('Chair')).toBeInTheDocument()
    expect(within(fieldset).getByDisplayValue('Clerk')).toBeInTheDocument()
  })

  it('renders titles when a sibling registers members without titles', () => {
    render(
      <Form
        schema={schema}
        fields={[
          {
            kind: 'slot',
            name: '_organizationMembershipTitlesRegistration',
            render: () => <OrganizationMembershipTitlesRegistration />,
          },
          {
            type: 'chips',
            name: 'members.classAffinityIds',
            label: 'Class affinities',
            options: [{ value: 'class-fighter', label: 'Fighter' }],
            multiple: true,
          },
          buildOrganizationMembershipTitlesArrayField(),
        ]}
        defaultValues={{ members: { classAffinityIds: [], titles: initialTitles } }}
        onSubmit={() => undefined}
      />,
    )

    const fieldset = titlesFieldset()
    expect(within(fieldset).getByDisplayValue('Chair')).toBeInTheDocument()
    expect(within(fieldset).getByDisplayValue('Clerk')).toBeInTheDocument()
  })

  it('renders under an embedded namespace prefix', () => {
    const embeddedSchema = z.object({ operatorOrganization: schema })
    render(
      <Form
        schema={embeddedSchema}
        fields={[buildOrganizationMembershipTitlesArrayField('operatorOrganization')]}
        defaultValues={{ operatorOrganization: { members: { titles: initialTitles } } }}
        onSubmit={() => undefined}
      />,
    )

    const fieldset = titlesFieldset()
    expect(within(fieldset).getByDisplayValue('Chair')).toBeInTheDocument()
  })

  it('exposes editable membership title controls inside the titles group', () => {
    renderTitlesField()
    const fieldset = titlesFieldset()
    expect(within(fieldset).getAllByRole('textbox').length).toBeGreaterThan(0)
    expect(within(fieldset).getByRole('button', { name: 'Add title' })).toBeInTheDocument()
    expect(within(fieldset).getAllByRole('button', { name: /Remove/ }).length).toBeGreaterThan(0)
  })

  it('updates when form state changes and reset restores the catalog', async () => {
    const user = userEvent.setup()
    renderTitlesField()

    await user.click(screen.getByRole('button', { name: 'Change titles' }))
    await waitFor(() => {
      expect(screen.getByDisplayValue('Initiate')).toBeInTheDocument()
    })
    expect(screen.queryByDisplayValue('Chair')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reset titles' }))
    await waitFor(() => {
      expect(screen.getByDisplayValue('Chair')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Clerk')).toBeInTheDocument()
    })
    expect(screen.queryByDisplayValue('Initiate')).not.toBeInTheDocument()
  })

  it('does not expose domain id in the fieldset UI', () => {
    renderTitlesField()
    const fieldset = titlesFieldset()
    expect(within(fieldset).queryByRole('textbox', { name: /title id/i })).not.toBeInTheDocument()
    expect(within(fieldset).queryByText(/omt_/)).not.toBeInTheDocument()
  })

  it('preserves existing row ids on label edit submit', async () => {
    const user = userEvent.setup()
    const submitted = renderTitlesField()

    const chairInput = screen.getByDisplayValue('Chair')
    await user.clear(chairInput)
    await user.type(chairInput, 'Chairperson')
    await user.click(screen.getByRole('button', { name: 'Save titles' }))

    await waitFor(() => {
      expect(submitted.length).toBeGreaterThan(0)
    })
    const titles = submitted.at(-1)?.members.titles ?? []
    expect(titles.map((row) => row.id)).toEqual(['omt_chair', 'omt_clerk'])
    expect(titles[0]?.label).toBe('Chairperson')
    for (const row of titles) {
      expect(organizationMembershipTitleIdSchema.safeParse(row.id).success).toBe(true)
    }
  })

  it('appends one new valid id on add title submit without changing prior ids', async () => {
    const user = userEvent.setup()
    const submitted = renderTitlesField()

    await user.click(within(titlesFieldset()).getByRole('button', { name: 'Add title' }))

    const labelInputs = within(titlesFieldset()).getAllByRole('textbox', { name: 'Label' })
    const newLabelInput = labelInputs.at(-1)
    expect(newLabelInput).toHaveValue('')
    await user.type(newLabelInput!, 'Scribe')

    await user.click(screen.getByRole('button', { name: 'Save titles' }))

    await waitFor(() => {
      expect(submitted.length).toBeGreaterThan(0)
    })
    const titles = submitted.at(-1)?.members.titles ?? []
    expect(titles).toHaveLength(3)
    expect(titles.map((row) => row.id)).toEqual(expect.arrayContaining(['omt_chair', 'omt_clerk']))
    const newRow = titles.find((row) => row.label === 'Scribe')
    expect(newRow).toBeDefined()
    expect(newRow?.id).not.toBe('omt_chair')
    expect(newRow?.id).not.toBe('omt_clerk')
    expect(organizationMembershipTitleIdSchema.safeParse(newRow?.id).success).toBe(true)
    expect(within(titlesFieldset()).queryByText(/omt_/)).not.toBeInTheDocument()
  })

  it('preserves survivor ids after removing a row and submitting', async () => {
    const user = userEvent.setup()
    const submitted = renderTitlesField()
    const fieldset = titlesFieldset()
    const removeButtons = within(fieldset).getAllByRole('button', { name: /Remove/ })
    await user.click(removeButtons[0]!)
    await user.click(screen.getByRole('button', { name: 'Save titles' }))

    await waitFor(() => {
      expect(submitted.length).toBeGreaterThan(0)
    })
    const titles = submitted.at(-1)?.members.titles ?? []
    expect(titles).toHaveLength(1)
    expect(titles[0]?.id).toBe('omt_clerk')
    expect(organizationMembershipTitleIdSchema.safeParse(titles[0]?.id).success).toBe(true)
  })
})
