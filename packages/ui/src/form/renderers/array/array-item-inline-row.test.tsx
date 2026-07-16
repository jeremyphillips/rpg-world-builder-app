import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ArrayItemInlineRow } from './array-item-inline-row.client'

describe('ArrayItemInlineRow', () => {
  it('renders leading, content, controls, and actions columns', () => {
    render(
      <ArrayItemInlineRow
        showLeading
        leading={<span data-testid="leading">↳</span>}
        content={<span data-testid="content">Title</span>}
        controls={<span data-testid="controls">Control</span>}
        actions={<span data-testid="actions">Actions</span>}
      />,
    )

    expect(screen.getByTestId('leading')).toBeInTheDocument()
    expect(screen.getByTestId('content')).toBeInTheDocument()
    expect(screen.getByTestId('controls')).toBeInTheDocument()
    expect(screen.getByTestId('actions')).toBeInTheDocument()
  })
})
