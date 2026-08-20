/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { Form } from './form.client'
import {
  FormShellFooterScope,
  FormShellFooterSlot,
  useFormShellFooterModel,
} from '../chrome/form-shell-footer.context'
import { FormShellSubmitButton } from '../chrome/form-shell-submit-button'
import { useSchemaFormSubmit } from './schema-form-shell.client'
import type { SchemaFormRequestSubmit } from '../schema-form-request-submit.types'

const schema = z.object({
  name: z.string().min(1, 'Name is required.'),
})

type Values = z.infer<typeof schema>

function InlineRequestSubmitProbe({
  onReference,
}: {
  onReference: (requestSubmit: SchemaFormRequestSubmit<Values>) => void
}) {
  const inlineSubmit = useSchemaFormSubmit<Values>()

  useEffect(() => {
    if (inlineSubmit?.requestSubmit) {
      onReference(inlineSubmit.requestSubmit)
    }
  }, [inlineSubmit, onReference])

  return null
}

function ExternalRequestSubmitProbe({
  onReference,
}: {
  onReference: (requestSubmit: SchemaFormRequestSubmit) => void
}) {
  const externalModel = useFormShellFooterModel()

  useEffect(() => {
    if (externalModel?.requestSubmit) {
      onReference(externalModel.requestSubmit)
    }
  }, [externalModel, onReference])

  return null
}

describe('FormShellFooter requestSubmit parity', () => {
  it('publishes the same requestSubmit reference to external footer consumers', async () => {
    let inlineReference: SchemaFormRequestSubmit<Values> | undefined
    let externalReference: SchemaFormRequestSubmit | undefined
    const onSubmit = vi.fn()

    render(
      <FormShellFooterScope>
        <Form<Values>
          id="parity-form"
          schema={schema}
          fields={[{ type: 'text', name: 'name', label: 'Name', required: true }]}
          onSubmit={onSubmit}
          externalFooter
          header={() => (
            <InlineRequestSubmitProbe
              onReference={(requestSubmit) => {
                inlineReference = requestSubmit
              }}
            />
          )}
          footer={<FormShellSubmitButton>Save</FormShellSubmitButton>}
        />
        <ExternalRequestSubmitProbe
          onReference={(requestSubmit) => {
            externalReference = requestSubmit
          }}
        />
        <FormShellFooterSlot />
      </FormShellFooterScope>,
    )

    expect(inlineReference).toBeDefined()
    expect(externalReference).toBeDefined()
    expect(externalReference).toBe(inlineReference)
  })

  it('routes external footer submit through the same invalid-submit pipeline as inline submit', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(
      <FormShellFooterScope>
        <Form<Values>
          schema={schema}
          fields={[{ type: 'text', name: 'name', label: 'Name', required: true }]}
          onSubmit={onSubmit}
          externalFooter
          footer={<FormShellSubmitButton>Save</FormShellSubmitButton>}
        />
        <FormShellFooterSlot />
      </FormShellFooterScope>,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByRole('textbox', { name: /Name/ })).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Name is required.')).toBeInTheDocument()
  })
})
