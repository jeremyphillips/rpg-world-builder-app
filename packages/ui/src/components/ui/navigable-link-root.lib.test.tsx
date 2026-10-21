import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { renderNavigableLinkRoot } from './navigable-link-root.lib'

describe('renderNavigableLinkRoot', () => {
  it('merges surface className and preserves href', () => {
    render(
      renderNavigableLinkRoot(
        <a href="/dest">go</a>,
        'surface-class',
        <span>interior</span>,
        {},
        null,
      ),
    )
    const link = screen.getByRole('link', { name: 'interior' })
    expect(link).toHaveAttribute('href', '/dest')
    expect(link).toHaveClass('surface-class')
    expect(screen.getByText('interior')).toBeInTheDocument()
  })

  it('composes forwarded ref with link ref', () => {
    const outerRef = createRef<HTMLAnchorElement>()
    render(
      renderNavigableLinkRoot(
        <a href="/dest" ref={createRef()} />,
        'surface-class',
        null,
        {},
        outerRef,
      ),
    )
    expect(outerRef.current).toBeInstanceOf(HTMLAnchorElement)
  })
})
