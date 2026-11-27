/**
 * @vitest-environment jsdom
 * Phase 0 desired-behavior fixtures — mounted shells.
 */
import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'
import { z } from 'zod'

import { Form } from '../shells/form.client'
import { TabbedForm } from '../shells/tabbed-form.client'
import type { TabbedFormTab } from '../shells/tabbed-form-panels.lib'
import type { FormItem } from '../field-config'
import { FormItems } from '../containers/form-items.client'
import { resolveTabValidationState } from '../errors/resolve-tab-validation-state'
import { prepareFormIssues } from '../errors/resolve-invalid-submit-navigation'
import { FormActionsBar } from '../chrome/form-actions-bar'
import {
  collectCurrentFormValidationProducerIssues,
  createEmptyFormValidationProducerSession,
  projectFormValidationProducerIssues,
  replaceFormValidationProducerSlot,
} from '../lifecycle/form-validation-producer-session.lib'

describe('form validation ownership presentation', () => {
  it('keeps parent object issues on the named group instead of the first child', () => {
    const fields: FormItem[] = [
      {
        kind: 'group',
        name: 'movementAlternative',
        heading: { label: 'Alternative movement' },
        fields: [
          {
            type: 'text',
            name: 'movementAlternative.modes',
            label: 'Available modes',
            required: true,
          },
        ],
      },
    ]
    const issues = prepareFormIssues(
      { movementAlternative: { message: 'Choose a mode', type: 'custom' } },
      fields,
    )
    expect(issues[0]?.claim?.target).toBe('movementAlternative')
    expect(issues[0]?.claim?.target).not.toBe('movementAlternative.modes')
  })

  it('does not assign orphan issues to the first tab', () => {
    const tabs = [
      { id: 'a', label: 'A', fields: [{ type: 'text', name: 'a', label: 'A' } as FormItem] },
      { id: 'b', label: 'B', fields: [{ type: 'text', name: 'b', label: 'B' } as FormItem] },
    ]
    const issues = prepareFormIssues([{ path: ['orphan'], message: 'Orphan' }], tabs[0].fields)
    const states = resolveTabValidationState(issues, tabs, [...tabs[0].fields, ...tabs[1].fields])
    expect(states.every((state) => state.count === 0)).toBe(true)
  })

  it('shows accessible invalid text and aria on a mounted control after submit', async () => {
    const user = userEvent.setup()
    const schema = z.object({ name: z.string().min(1, 'Name is required') })
    const fields: FormItem[] = [{ type: 'text', name: 'name', label: 'Name', required: true }]

    render(
      <Form
        schema={schema}
        fields={fields}
        defaultValues={{ name: '' }}
        validationPresentation="always"
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Name is required')).toBeInTheDocument()
    const input = await screen.findByRole('textbox', { name: 'Name' })
    expect(input).toHaveAttribute('aria-invalid', 'true')
    const describedBy = input.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    if (describedBy) {
      describedBy.split(/\s+/).forEach((id) => {
        expect(document.getElementById(id)).toBeTruthy()
      })
    }
  })

  it('keeps parent and child issues in producer projection', () => {
    let session = createEmptyFormValidationProducerSession()
    session = replaceFormValidationProducerSlot(session, 'interactive', 1, [
      {
        path: 'movementAlternative',
        message: 'Alternative incomplete.',
        severity: 'field',
        claim: { kind: 'field', target: 'movementAlternative' },
      },
      {
        path: 'movementAlternative.modes',
        message: 'Select two modes.',
        severity: 'field',
        claim: { kind: 'field', target: 'movementAlternative.modes' },
      },
    ])
    expect(session.slots.interactive?.issues).toHaveLength(2)
  })

  it('clears only the publish-readiness slot on empty success', () => {
    let session = createEmptyFormValidationProducerSession()
    session = replaceFormValidationProducerSlot(session, 'publish-action', 1, [
      { path: 'name', message: 'Required', severity: 'field' },
    ])
    session = replaceFormValidationProducerSlot(session, 'publish-readiness', 2, [
      { path: 'name', message: 'Advisory', severity: 'field' },
    ])
    session = replaceFormValidationProducerSlot(session, 'publish-readiness', 3, [])
    expect(session.slots['publish-readiness']?.issues).toEqual([])
    expect(session.slots['publish-action']?.issues).toHaveLength(1)
  })

  it('keeps pathless form issues off tab badges', () => {
    const tabs = [
      {
        id: 'identity',
        label: 'Identity',
        fields: [{ type: 'text', name: 'name', label: 'Name' }],
      },
      { id: 'notes', label: 'Notes', fields: [{ type: 'text', name: 'notes', label: 'Notes' }] },
    ]
    const issues = prepareFormIssues(
      [{ path: [], message: 'Review this form and try again.' }],
      tabs[0].fields,
    )
    expect(issues[0]?.claim?.kind).toBe('form')
    const states = resolveTabValidationState(
      issues,
      tabs,
      tabs.flatMap((tab) => tab.fields),
    )
    expect(states.every((state) => state.count === 0)).toBe(true)
  })

  it('associates header-only tab errors with label, tab badge, and aria when wired', async () => {
    const user = userEvent.setup()
    const schema = z.object({
      name: z.string().min(1),
      meta: z.object({ title: z.string().min(1, 'Title is required.') }),
    })
    type Values = z.infer<typeof schema>
    const tabs: TabbedFormTab[] = [
      {
        id: 'identity',
        label: 'Identity',
        fields: [{ type: 'text', name: 'name', label: 'Name', required: true }],
      },
      {
        id: 'meta',
        label: 'Meta',
        fields: [],
        errorPaths: ['meta.title'],
        resolverFields: [{ type: 'text', name: 'meta.title', label: 'Title', required: true }],
        header: (
          <FormItems
            items={[{ type: 'text', name: 'title', label: 'Title', required: true }]}
            idPrefix="meta"
            namePrefix="meta"
          />
        ),
      },
    ]

    render(
      <TabbedForm<Values>
        id="connected-header"
        schema={schema}
        tabs={tabs}
        defaultValues={{ name: 'Valid', meta: { title: '' } }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Meta' }))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Meta.*1/i })).toBeInTheDocument()
    })
    expect(await screen.findByText('Title is required.')).toBeInTheDocument()
    const title = screen.getByRole('textbox', { name: 'Title' })
    expect(title).toHaveAttribute('aria-invalid', 'true')
    const describedBy = title.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    if (describedBy) {
      describedBy.split(/\s+/).forEach((id) => {
        expect(document.getElementById(id)).toBeTruthy()
      })
    }
  })

  it('does not badge a disconnected header-only tab without errorPaths', async () => {
    const user = userEvent.setup()
    const schema = z.object({
      name: z.string().min(1),
      meta: z.object({ title: z.string().min(1, 'Title is required.') }),
    })
    type Values = z.infer<typeof schema>
    const tabs: TabbedFormTab[] = [
      {
        id: 'identity',
        label: 'Identity',
        fields: [{ type: 'text', name: 'name', label: 'Name', required: true }],
      },
      {
        id: 'meta',
        label: 'Meta',
        fields: [],
        header: (
          <FormItems
            items={[{ type: 'text', name: 'title', label: 'Title', required: true }]}
            idPrefix="meta"
            namePrefix="meta"
          />
        ),
      },
    ]

    render(
      <TabbedForm<Values>
        id="disconnected-header"
        schema={schema}
        tabs={tabs}
        defaultValues={{ name: 'Valid', meta: { title: '' } }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Meta' }))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Identity' })).not.toHaveTextContent(/\d/)
      expect(screen.getByRole('button', { name: 'Meta' })).not.toHaveTextContent(/\d/)
    })
  })

  it('shows operation copy in the footer without raw Zod transport', () => {
    render(
      <FormActionsBar formError="Could not save this form. Review your entries and try again." />,
    )
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Could not save this form')
    expect(alert.textContent).not.toMatch(/invalid_type/i)
    expect(alert.textContent).not.toMatch(/^\s*\[/)
  })

  it('drops stale producer slots after snapshot stamp advances (delayed index guard)', () => {
    const fields: FormItem[] = [
      {
        kind: 'array',
        name: 'grants',
        fields: [{ type: 'text', name: 'label', label: 'Label', required: true }],
      },
    ]
    let session = createEmptyFormValidationProducerSession()
    session = replaceFormValidationProducerSlot(session, 'api', 1, [
      {
        path: 'grants.0.label',
        message: 'Required',
        severity: 'field',
        claim: { kind: 'field', target: 'grants.0.label' },
      },
    ])
    session = replaceFormValidationProducerSlot(session, 'interactive', 2, [
      {
        path: 'grants.0.label',
        message: 'Required on current snapshot',
        severity: 'field',
        claim: { kind: 'field', target: 'grants.0.label' },
      },
    ])

    expect(collectCurrentFormValidationProducerIssues(session, 2)).toHaveLength(1)
    expect(collectCurrentFormValidationProducerIssues(session, 2)[0]?.message).toBe(
      'Required on current snapshot',
    )
    expect(
      projectFormValidationProducerIssues(session, 2, fields, { grants: [{ label: '' }] }),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: 'grants.0.label',
          claim: { kind: 'field', target: 'grants.0.label' },
        }),
      ]),
    )
    expect(collectCurrentFormValidationProducerIssues(session, 1)).toHaveLength(1)
    expect(collectCurrentFormValidationProducerIssues(session, 2)).not.toEqual(
      collectCurrentFormValidationProducerIssues(session, 1),
    )
  })

  it('projects draft-action issues after publish-readiness clears on the same stamp', () => {
    let session = createEmptyFormValidationProducerSession()
    session = replaceFormValidationProducerSlot(session, 'draft-action', 2, [
      {
        path: 'name',
        message: 'Name required for draft',
        severity: 'field',
        claim: { kind: 'field', target: 'name' },
      },
    ])
    session = replaceFormValidationProducerSlot(session, 'publish-readiness', 2, [
      { path: 'level', message: 'Advisory only', severity: 'field' },
    ])
    session = replaceFormValidationProducerSlot(session, 'publish-readiness', 2, [])

    const fields: FormItem[] = [
      { type: 'text', name: 'name', label: 'Name' },
      { type: 'number', name: 'level', label: 'Level' },
    ]

    expect(session.slots['publish-readiness']?.issues).toEqual([])
    expect(session.slots['draft-action']?.issues).toHaveLength(1)
    const projected = projectFormValidationProducerIssues(session, 2, fields, {
      name: '',
      level: 1,
    })
    expect(projected.some((issue) => issue.path === 'name')).toBe(true)
    expect(projected.some((issue) => issue.path === 'level')).toBe(false)
  })
})
