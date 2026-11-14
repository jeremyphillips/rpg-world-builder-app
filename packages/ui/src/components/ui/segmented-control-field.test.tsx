import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SegmentedControlField } from './segmented-control-field.client'

describe('SegmentedControlField fullWidth', () => {
  it('stretches the control shell and segment track to the field column', () => {
    const { container } = render(
      <SegmentedControlField
        id="mode"
        label="Targeting mode"
        options={[
          { value: 'targets', label: 'Selected targets' },
          { value: 'self', label: 'Area from self' },
        ]}
        fullWidth
        value="targets"
      />,
    )

    const track = screen.getByRole('group')
    expect(track).toHaveClass('w-full', 'flex')
    expect(track.parentElement).toHaveClass('w-full', 'min-w-0')
  })

  it('renders full segment labels without clipping to the column', () => {
    render(
      <SegmentedControlField
        id="mode"
        label="Targeting mode"
        options={[
          { value: 'targets', label: 'Selected targets' },
          { value: 'self', label: 'Area from self' },
        ]}
        fullWidth
        value="targets"
      />,
    )

    expect(screen.getByRole('button', { name: 'Selected targets' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Area from self' })).toBeInTheDocument()
  })
})
