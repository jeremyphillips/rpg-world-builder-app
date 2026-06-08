import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'

import { TextareaField } from './textarea-field'

describe('TextareaField', () => {
  it('associates the label and accepts input', async () => {
    const user = userEvent.setup()
    render(<TextareaField id="bio" label="Biography" />)
    const textarea = screen.getByLabelText('Biography')
    await user.type(textarea, 'A bard.')
    expect(textarea).toHaveValue('A bard.')
  })

  it('renders the error and marks the textarea invalid', () => {
    render(<TextareaField id="bio" label="Biography" hint="Optional." error="Required." />)
    expect(screen.getByRole('alert')).toHaveTextContent('Required.')
    expect(screen.queryByText('Optional.')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Biography')).toHaveAttribute('aria-invalid', 'true')
  })

  it('forwards the ref to the underlying textarea', () => {
    const ref = createRef<HTMLTextAreaElement>()
    render(<TextareaField id="bio" label="Biography" ref={ref} />)
    expect(ref.current).toBe(screen.getByLabelText('Biography'))
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(<TextareaField id="bio" label="Biography" />)
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
