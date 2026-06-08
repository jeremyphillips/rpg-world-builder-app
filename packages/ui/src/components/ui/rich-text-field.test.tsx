import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import axe from 'axe-core'

import { RichTextField } from './rich-text-field'

describe('RichTextField', () => {
  it('labels the editor and renders its toolbar', () => {
    render(<RichTextField id="bio" label="Biography" />)
    expect(screen.getByRole('textbox', { name: 'Biography' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Bold' })).toBeInTheDocument()
  })

  it('renders the error message', () => {
    render(<RichTextField id="bio" label="Biography" hint="Optional." error="Required." />)
    expect(screen.getByRole('alert')).toHaveTextContent('Required.')
    expect(screen.queryByText('Optional.')).not.toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(<RichTextField id="bio" label="Biography" />)
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
