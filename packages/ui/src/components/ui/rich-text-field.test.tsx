import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { RichTextField } from './rich-text-field'

describe('RichTextField', () => {
  it('labels the editor and renders its toolbar', () => {
    render(<RichTextField id="bio" label="Biography" />)
    expect(screen.getByRole('textbox', { name: 'Biography' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Bold' })).toBeInTheDocument()
  })

  it('applies field size to the label and matching prose scale', () => {
    render(<RichTextField id="bio" label="Biography" size="sm" />)
    expect(screen.getByText('Biography')).toHaveClass('text-xs')
    expect(screen.getByRole('textbox', { name: 'Biography' })).toHaveClass('prose-sm')
  })

  it('defaults the editor to prose-md', () => {
    render(<RichTextField id="bio" label="Biography" />)
    expect(screen.getByRole('textbox', { name: 'Biography' })).toHaveClass('prose-md')
  })

  it('renders the error message', () => {
    render(<RichTextField id="bio" label="Biography" hint="Optional." error="Required." />)
    expect(screen.getByRole('alert')).toHaveTextContent('Required.')
    expect(screen.queryByText('Optional.')).not.toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(<RichTextField id="bio" label="Biography" />)
    await expectNoAxeViolations(container)
  })
})
