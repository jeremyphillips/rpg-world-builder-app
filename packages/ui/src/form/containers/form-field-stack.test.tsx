import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'

import type { FormItem } from '../field-config'
import { FormFieldStack } from './form-field-stack.client'

const fields: FormItem[] = [
  { type: 'text', name: 'first', label: 'First' },
  { type: 'text', name: 'second', label: 'Second' },
]

function Harness() {
  const form = useForm({ defaultValues: { first: '', second: '' } })
  return (
    <FormProvider {...form}>
      <FormFieldStack fields={fields} idPrefix="test" rhythm="comfortable" />
    </FormProvider>
  )
}

describe('FormFieldStack', () => {
  it('renders fields with comfortable rhythm gap between siblings', () => {
    render(<Harness />)

    expect(screen.getByLabelText('First')).toBeInTheDocument()
    expect(screen.getByLabelText('Second')).toBeInTheDocument()

    const rhythmStack = screen.getByLabelText('First').closest('.gap-6')
    expect(rhythmStack).toBeInTheDocument()
    expect(rhythmStack).toContainElement(screen.getByLabelText('Second'))
  })

  it('renders optional children below the field stack', () => {
    function WithChildren() {
      const form = useForm({ defaultValues: { first: '', second: '' } })
      return (
        <FormProvider {...form}>
          <FormFieldStack fields={fields} idPrefix="test">
            <p>Preview copy</p>
          </FormFieldStack>
        </FormProvider>
      )
    }

    render(<WithChildren />)
    expect(screen.getByText('Preview copy')).toBeInTheDocument()
  })
})
