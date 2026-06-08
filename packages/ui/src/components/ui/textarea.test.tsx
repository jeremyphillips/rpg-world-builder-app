import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'

import { Textarea } from './textarea.client'

describe('Textarea', () => {
  it('accepts typed input', async () => {
    const user = userEvent.setup()
    render(<Textarea aria-label="Notes" />)
    const textarea = screen.getByLabelText('Notes')
    await user.type(textarea, 'hello')
    expect(textarea).toHaveValue('hello')
  })

  it('reflects the error state via aria-invalid', () => {
    render(<Textarea aria-label="Notes" aria-invalid />)
    expect(screen.getByLabelText('Notes')).toHaveAttribute('aria-invalid', 'true')
  })

  it('forwards the ref to the underlying textarea', () => {
    const ref = createRef<HTMLTextAreaElement>()
    render(<Textarea aria-label="Notes" ref={ref} />)
    expect(ref.current).toBe(screen.getByLabelText('Notes'))
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(<Textarea aria-label="Notes" />)
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
