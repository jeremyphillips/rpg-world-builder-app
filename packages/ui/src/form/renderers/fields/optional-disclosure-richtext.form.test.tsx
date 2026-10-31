import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useFormContext } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { Form } from '../../shells/form.client'
import type { FormItem } from '../../field-config'

const schema = z.object({
  description: z.string().optional(),
})

const descriptionField = {
  type: 'richtext',
  name: 'description',
  label: 'Custom description',
  hint: 'Optional text shown with this action.',
  optionalDisclosure: { addLabel: 'Add custom description', removeLabel: 'Remove' },
} as const satisfies FormItem

function ResetButton() {
  const form = useFormContext()
  return (
    <button type="button" onClick={() => form.reset()}>
      Reset description
    </button>
  )
}

function renderDescription(description: string | undefined) {
  return render(
    <Form
      schema={schema}
      fields={[descriptionField]}
      defaultValues={{ description }}
      onSubmit={() => undefined}
      footer={<ResetButton />}
    />,
  )
}

describe('FormItems richtext optionalDisclosure', () => {
  it('starts closed for empty and normalized empty HTML', () => {
    const { unmount } = renderDescription('')
    expect(screen.getByRole('button', { name: 'Add custom description' })).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'Custom description' })).not.toBeInTheDocument()
    unmount()

    renderDescription('<p></p>')
    expect(screen.getByRole('button', { name: 'Add custom description' })).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'Custom description' })).not.toBeInTheDocument()
  })

  it('starts open for populated HTML, stays open when cleared, and follows reset', async () => {
    const user = userEvent.setup()
    renderDescription('<p>Venom</p>')

    const editor = await screen.findByRole('textbox', { name: 'Custom description' })
    expect(screen.getByText('Optional text shown with this action.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add custom description' })).not.toBeInTheDocument()

    await user.clear(editor)
    expect(screen.getByRole('textbox', { name: 'Custom description' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add custom description' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reset description' }))
    expect(await screen.findByRole('textbox', { name: 'Custom description' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add custom description' })).not.toBeInTheDocument()
  })

  it('closes when the author removes the description', async () => {
    const user = userEvent.setup()
    renderDescription('<p>Venom</p>')
    await screen.findByRole('textbox', { name: 'Custom description' })

    await user.click(screen.getByRole('button', { name: 'Remove Custom description' }))
    expect(screen.getByRole('button', { name: 'Add custom description' })).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'Custom description' })).not.toBeInTheDocument()
  })
})
