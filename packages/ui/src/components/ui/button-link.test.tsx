import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ButtonLink } from './button-link'

describe('ButtonLink', () => {
  it('renders as a link with button chrome and children', () => {
    render(
      <ButtonLink link={<a href="/dest" />} variant="outline" size="sm">
        Continue
      </ButtonLink>,
    )
    const link = screen.getByRole('link', { name: 'Continue' })
    expect(link).toHaveAttribute('href', '/dest')
    expect(link).toHaveClass('ui-button')
    expect(link).toHaveClass('ui-button--outline')
    expect(link).toHaveClass('ui-button--sm')
  })

  it('merges link className and preserves navigation props', async () => {
    const onClick = vi.fn()
    render(
      <ButtonLink link={<a href="/x" className="link-extra" onClick={onClick} aria-label="Go" />}>
        Go
      </ButtonLink>,
    )
    const link = screen.getByRole('link', { name: 'Go' })
    expect(link).toHaveClass('link-extra')
    expect(link).toHaveClass('ui-button')
    await userEvent.click(link)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('composes forwarded ref with link ref', () => {
    const outerRef = createRef<HTMLAnchorElement>()
    render(
      <ButtonLink link={<a href="/dest" ref={createRef()} />} ref={outerRef}>
        Label
      </ButtonLink>,
    )
    expect(outerRef.current).toBeInstanceOf(HTMLAnchorElement)
  })
})
