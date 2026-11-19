import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { ArraySectionHeader } from './array-section-header.client'

describe('ArraySectionHeader', () => {
  it('renders visible legend with default field-scale header typography', () => {
    const { container } = render(
      <fieldset>
        <ArraySectionHeader
          labelMode="visible"
          showSectionHeader
          sectionLabel="Grants"
          hint="Add mechanical effects."
          hintId="grants-hint"
          legendFieldSize="md"
          legendRhythm="comfortable"
          addActionLayout="stacked"
          arrayIssueCount={0}
          invalidRowCount={0}
          onFocusFirstArrayIssue={() => undefined}
        />
      </fieldset>,
    )

    const legend = container.querySelector('legend')
    const hint = screen.getByText('Add mechanical effects.')
    expect(legend).toBeTruthy()
    expect(screen.getByRole('group', { name: 'Grants' })).toBeInTheDocument()
    expect(screen.getByText('Grants').closest('.text-style-field-label-md')).toBeTruthy()
    expect(hint).toHaveClass('text-style-field-hint')
    expect(hint).toHaveAttribute('id', 'grants-hint')
    expect(legend).not.toContainElement(hint)
  })

  it('keeps an sr-only legend as the only copy of the section name', () => {
    const { container } = render(
      <fieldset>
        <ArraySectionHeader
          labelMode="srOnly"
          showSectionHeader
          sectionLabel="Grants"
          hint="Add mechanical effects."
          hintId="grants-hint"
          legendFieldSize="md"
          legendRhythm="comfortable"
          addActionLayout="stacked"
          arrayIssueCount={0}
          invalidRowCount={0}
          onFocusFirstArrayIssue={() => undefined}
        />
      </fieldset>,
    )

    const legends = container.querySelectorAll('legend')
    expect(legends).toHaveLength(1)
    expect(legends[0]).toHaveClass('sr-only')
    expect(legends[0]).toHaveTextContent('Grants')
    expect(screen.getAllByText('Grants')).toHaveLength(1)
    expect(screen.getByRole('group', { name: 'Grants' })).toBeInTheDocument()
    expect(legends[0]).not.toContainElement(screen.getByText('Add mechanical effects.'))
  })

  it('gives an anonymous section hint the description id', () => {
    render(
      <ArraySectionHeader
        labelMode="anonymous"
        showSectionHeader
        sectionLabel="Grants"
        hint="Add mechanical effects."
        hintId="grants-hint"
        legendFieldSize="md"
        legendRhythm="comfortable"
        addActionLayout="stacked"
        arrayIssueCount={0}
        invalidRowCount={0}
        onFocusFirstArrayIssue={() => undefined}
      />,
    )

    expect(screen.getByText('Add mechanical effects.')).toHaveAttribute('id', 'grants-hint')
    expect(document.querySelector('legend')).toBeNull()
  })
})
