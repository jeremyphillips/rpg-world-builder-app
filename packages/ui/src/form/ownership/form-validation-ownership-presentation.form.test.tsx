/**
 * @vitest-environment jsdom
 * Phase 0 desired-behavior fixtures — mounted shells.
 */
import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'
import { z } from 'zod'

import { Form } from '../shells/form.client'
import type { FormItem } from '../field-config'
import { resolveTabValidationState } from '../errors/resolve-tab-validation-state'
import { prepareFormIssues } from '../errors/resolve-invalid-submit-navigation'
import {
  createEmptyFormValidationProducerSession,
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
})
