import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { Avatar } from './avatar.client'

describe('Avatar', () => {
  it('renders initials when no image is available', () => {
    render(<Avatar name="Ada Lovelace" />)
    expect(screen.getByLabelText('Ada Lovelace')).toHaveTextContent('AL')
    expect(screen.getByLabelText('Ada Lovelace')).toHaveClass('ui-avatar', 'ui-avatar--md')
  })

  it('renders a sized image', () => {
    render(<Avatar name="Ada Lovelace" src="/ada.png" size="lg" />)
    const image = screen.getByRole('img', { name: 'Ada Lovelace' })
    expect(image).toHaveClass('ui-avatar__image')
    expect(image.parentElement).toHaveClass('ui-avatar--lg')
  })

  it('falls back to initials when the image errors', () => {
    render(<Avatar name="Ada Lovelace" src="/missing.png" size="sm" />)
    const image = screen.getByRole('img', { name: 'Ada Lovelace' })
    fireEvent.error(image)
    expect(screen.getByLabelText('Ada Lovelace')).toHaveTextContent('AL')
    expect(screen.getByLabelText('Ada Lovelace')).toHaveClass('ui-avatar--sm')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(<Avatar name="Ada Lovelace" />)
    await expectNoAxeViolations(container)
  })
})
