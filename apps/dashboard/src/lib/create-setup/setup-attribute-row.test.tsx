/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { SetupAttributeRow } from './setup-attribute-row'

describe('SetupAttributeRow', () => {
  it('uses compact control action min-height on the header row', () => {
    const { container } = render(
      <SetupAttributeRow eyebrow="LEVEL" value="0">
        <span>editor</span>
      </SetupAttributeRow>,
    )

    const header = container.firstElementChild?.firstElementChild
    expect(header).toHaveClass('min-h-control-action-compact')
  })

  it('renders helper copy at 14px when collapsed', () => {
    render(
      <SetupAttributeRow
        eyebrow="CLASS"
        value="Rogue"
        helper="Suggested by Lieutenant."
        changeLabel="Change class"
        onChange={vi.fn()}
      />,
    )

    const helper = screen.getByText('Suggested by Lieutenant.')
    expect(helper).toHaveClass('text-sm')
    expect(helper).toHaveClass('text-muted-foreground')
  })

  it('can show helper while the editor is open', () => {
    render(
      <SetupAttributeRow eyebrow="LEVEL" showHelperWhileEditing helper="Suggested by Lieutenant.">
        <span>editor</span>
      </SetupAttributeRow>,
    )

    expect(screen.getByText('editor')).toBeInTheDocument()
    expect(screen.getByText('Suggested by Lieutenant.')).toBeInTheDocument()
  })
})
