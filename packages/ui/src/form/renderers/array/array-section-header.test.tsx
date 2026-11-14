import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { ArraySectionHeader } from './array-section-header.client'

describe('ArraySectionHeader', () => {
  it('renders visible legend with default field-scale header typography', () => {
    const { container } = render(
      <ArraySectionHeader
        labelMode="visible"
        showSectionHeader
        sectionLabel="Grants"
        hint="Add mechanical effects."
        legendFieldSize="md"
        legendRhythm="comfortable"
        addActionLayout="stacked"
        arrayIssueCount={0}
        invalidRowCount={0}
        onFocusFirstArrayIssue={() => undefined}
      />,
    )

    expect(container.querySelector('legend')).toBeTruthy()
    expect(screen.getByText('Grants').closest('.text-style-field-label-md')).toBeTruthy()
    expect(screen.getByText('Add mechanical effects.')).toHaveClass('text-style-field-hint')
  })
})
