/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { CreateCompositionSummary } from './create-composition-summary'

describe('CreateCompositionSummary', () => {
  it('renders nothing when rows are empty', () => {
    const { container } = render(<CreateCompositionSummary rows={[]} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('renders a single completed-decision row', () => {
    render(
      <CreateCompositionSummary
        rows={[{ id: 'relationship', label: 'Relationship', value: 'Owner' }]}
      />,
    )

    expect(screen.getByText('Relationship:')).toBeInTheDocument()
    expect(screen.getByText('Owner')).toBeInTheDocument()
  })

  it('renders multiple rows with dividers', () => {
    render(
      <CreateCompositionSummary
        rows={[
          { id: 'relationship', label: 'Relationship', value: 'Owner' },
          { id: 'organization', label: 'Organization', value: 'Harbor Guild' },
        ]}
      />,
    )

    expect(screen.getByText('Relationship:')).toBeInTheDocument()
    expect(screen.getByText('Organization:')).toBeInTheDocument()
    expect(screen.getByText('Harbor Guild')).toBeInTheDocument()
  })

  it('wires Change action and clickable value when onChange is provided', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <CreateCompositionSummary
        rows={[
          {
            id: 'relationship',
            label: 'Relationship',
            value: 'Owner',
            onChange,
            valueActionAriaLabel: 'Change relationship',
          },
        ]}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Change relationship' }))
    expect(onChange).toHaveBeenCalledOnce()

    onChange.mockClear()
    await user.click(screen.getByRole('button', { name: 'Owner, Change relationship' }))
    expect(onChange).toHaveBeenCalledOnce()
  })

  it('uses defaultChangeLabel for Change action text', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <CreateCompositionSummary
        defaultChangeLabel="Edit"
        rows={[{ id: 'relationship', label: 'Relationship', value: 'Owner', onChange }]}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Change relationship' }))
    expect(onChange).toHaveBeenCalledOnce()
    expect(screen.getByText('Edit')).toBeInTheDocument()
  })
})
