import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { z } from 'zod'

import { Form } from './shells/form.client'
import type { FormItem } from './field-config'
import { fieldAnatomyStackVariants } from '../components/ui/field.variants'

const traitFields: FormItem[] = [
  { type: 'text', name: 'name', label: 'Trait name', hint: 'Short label' },
  { type: 'textarea', name: 'description', label: 'Description' },
]

describe('array density presentation', () => {
  it('keeps comfortable presentation with compact controls when density is omitted', async () => {
    const schema = z.object({
      traits: z.array(z.object({ name: z.string(), description: z.string() })),
    })

    render(
      <Form
        schema={schema}
        fields={[
          {
            kind: 'array',
            name: 'traits',
            heading: { label: 'Traits' },
            fields: traitFields,
            addAction: { label: 'Add trait' },
            item: { collapsible: true, header: { fallback: (i) => `Trait ${i + 1}` } },
          },
        ]}
        defaultValues={{ traits: [{ name: 'A', description: '' }] }}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByText('Traits').parentElement).toHaveClass('text-style-field-label-md')
    const traitNameLabel = screen.getByText('Trait name').parentElement
    expect(traitNameLabel).toHaveClass('text-style-field-label-md')
    expect(screen.getByRole('textbox', { name: 'Trait name' })).toHaveClass('ui-field-control--sm')
    expect(screen.getByRole('button', { name: 'Add trait' })).toHaveClass('ui-button--md')

    const fieldset = screen.getByRole('group', { name: /Traits/ })
    expect(fieldset).toHaveClass(...fieldAnatomyStackVariants({ size: 'md' }).split(/\s+/))
  })
})
