import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Field } from './field.client'
import { FieldLayout } from './field-layout'
import { Input } from './input.client'

describe('FieldLayout recommendation', () => {
  const recommendation = {
    content: 'Draconic is recommended for the Dragon creature type.',
    action: { label: '+ Add', ariaLabel: 'Add Draconic', onClick: vi.fn() },
  }

  it('renders label, hint, recommendation, then control', () => {
    render(
      <Field.Root id="languages" hint="Choose languages." anatomy>
        <FieldLayout
          label={<Field.Label>Languages</Field.Label>}
          recommendation={recommendation}
          control={<Input aria-label="Languages control" />}
        />
      </Field.Root>,
    )

    const label = screen.getByText('Languages')
    const hint = screen.getByText('Choose languages.')
    const recommendationText = screen.getByText(/Draconic is recommended/)
    const control = screen.getByRole('textbox', { name: 'Languages control' })

    expect(label.compareDocumentPosition(hint) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(
      hint.compareDocumentPosition(recommendationText) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(
      recommendationText.compareDocumentPosition(control) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('omits recommendation when hint is below-control', () => {
    render(
      <Field.Root id="languages" hint="Supporting text." anatomy hintPosition="below-control">
        <FieldLayout
          hintPosition="below-control"
          label={<Field.Label>Languages</Field.Label>}
          recommendation={recommendation}
          control={<Input />}
        />
      </Field.Root>,
    )

    expect(screen.queryByText(/Draconic is recommended/)).not.toBeInTheDocument()
    expect(screen.getByText('Supporting text.')).toBeInTheDocument()
  })

  it('uses accent compact md text button for comfortable density', () => {
    render(
      <Field.Root id="languages" size="md" anatomy>
        <FieldLayout
          label={<Field.Label>Languages</Field.Label>}
          recommendation={recommendation}
          control={<Input />}
          size="md"
        />
      </Field.Root>,
    )

    const addButton = screen.getByRole('button', { name: 'Add Draconic' })
    expect(addButton).toHaveClass(
      'text-action-standalone',
      'text-primary',
      'no-underline',
      'ui-button__text--default-compact',
    )
    expect(addButton).toHaveTextContent('+ Add')
    expect(addButton.querySelector('span')).toBeNull()
  })

  it('invokes the recommendation action on click', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(
      <Field.Root id="languages" anatomy>
        <FieldLayout
          label={<Field.Label>Languages</Field.Label>}
          recommendation={{
            content: 'Pick one.',
            action: { label: '+ Add', ariaLabel: 'Add Draconic', onClick },
          }}
          control={<Input />}
        />
      </Field.Root>,
    )

    await user.click(screen.getByRole('button', { name: 'Add Draconic' }))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
