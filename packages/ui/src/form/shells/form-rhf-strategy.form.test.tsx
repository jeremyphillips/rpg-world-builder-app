import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useFormContext } from 'react-hook-form'
import { z } from 'zod'

import { Form, TabbedForm, makeResolver, useFormUiContext, useSilentFormValidity } from '../index'
import { FORM_RHF_INTEGRATION_STRATEGY } from '../lifecycle/form-evaluation.types'
import type { FormItem } from '../field-config'
import type { TabbedFormTab } from './tabbed-form-panels.lib'

/**
 * Mounted proof for the single RHF strategy (`passive-projection`): the resolver only projects
 * the pure evaluator; handleSubmit receives the evaluator's parsed output.
 */
const fields: FormItem[] = [
  { type: 'text', name: 'name', label: 'Name' },
  { type: 'text', name: 'count', label: 'Count' },
]

function makeSchema(onParse?: () => void) {
  const base = z.object({
    name: z.string().min(1, 'Name is required'),
    count: z.coerce.number().int('Count must be a whole number'),
  })
  return onParse
    ? base.transform((value) => {
        onParse()
        return value
      })
    : base
}

function renderForm(props: {
  schema: z.ZodType<{ name: string; count: number }, unknown>
  onSubmit: (values: { name: string; count: number }) => void | Promise<void>
  mode?: 'onSubmit' | 'onBlur' | 'onChange'
}) {
  return render(
    <Form<{ name: string; count: number }>
      schema={props.schema as never}
      fields={fields}
      onSubmit={props.onSubmit}
      mode={props.mode}
      validationPresentation="always"
      footer={(form: { formState: { errors: unknown } }) => (
        <>
          <output data-testid="rhf-errors">
            {JSON.stringify(Object.keys(form.formState.errors as object))}
          </output>
          <button type="submit">Save</button>
        </>
      )}
    />,
  )
}

describe('RHF integration strategy', () => {
  it('names the surviving strategy', () => {
    expect(FORM_RHF_INTEGRATION_STRATEGY).toBe('passive-projection')
  })

  it('delivers parsed output (coerced types) to onSubmit, not the raw input', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderForm({ schema: makeSchema() as never, onSubmit })
    await user.type(screen.getByLabelText('Name'), 'Tasha')
    await user.type(screen.getByLabelText('Count'), '7')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(onSubmit.mock.calls[0]![0]).toEqual({ name: 'Tasha', count: 7 })
  })

  it('evaluates once per submit', async () => {
    const user = userEvent.setup()
    const parse = vi.fn()
    const onSubmit = vi.fn()
    renderForm({ schema: makeSchema(parse) as never, onSubmit })
    await user.type(screen.getByLabelText('Name'), 'Tasha')
    await user.type(screen.getByLabelText('Count'), '7')
    parse.mockClear()
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(parse).toHaveBeenCalledTimes(1)
  })

  it('blocks submit and shows an accessible invalid control', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderForm({ schema: makeSchema() as never, onSubmit })
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByText('Name is required')).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'true')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('keeps progressive blur validation as a passive RHF projection', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderForm({ schema: makeSchema() as never, onSubmit })
    expect(screen.getByTestId('rhf-errors')).toHaveTextContent('[]')
    await user.click(screen.getByLabelText('Name'))
    await user.tab()
    await waitFor(() => expect(screen.getByTestId('rhf-errors')).toHaveTextContent('name'))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('revalidates touched fields on change when mode is onChange', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderForm({ schema: makeSchema() as never, onSubmit, mode: 'onChange' })
    const name = screen.getByLabelText('Name')
    await user.click(name)
    await user.tab()
    await waitFor(() => expect(screen.getByTestId('rhf-errors')).toHaveTextContent('name'))
    await user.type(name, 'Tasha')
    await waitFor(() => expect(screen.getByTestId('rhf-errors')).toHaveTextContent('[]'))
  })

  it('does not require unregistered conditional fields after reset', async () => {
    const user = userEvent.setup()
    const schema = z.object({
      name: z.string().min(1, 'Name is required'),
      hasNickname: z.boolean(),
      nickname: z.string().min(1, 'Nickname is required'),
    })
    const conditionalFields: FormItem[] = [
      { type: 'text', name: 'name', label: 'Name' },
      { type: 'switch', name: 'hasNickname', label: 'Has a nickname' },
      {
        type: 'text',
        name: 'nickname',
        label: 'Nickname',
        visibility: {
          dependsOn: ['hasNickname'],
          visibleWhen: (values) => values.hasNickname === true,
        },
      },
    ]
    const onSubmit = vi.fn()
    render(
      <Form<z.infer<typeof schema>>
        schema={schema}
        fields={conditionalFields}
        defaultValues={{ name: 'A', hasNickname: true, nickname: 'Z' }}
        onSubmit={onSubmit}
        footer={(form) => (
          <>
            <button type="button" onClick={() => form.reset({ name: 'A', hasNickname: false })}>
              Reset
            </button>
            <button type="submit">Save</button>
          </>
        )}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Reset' }))
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(onSubmit.mock.calls[0]![0]).toEqual({ name: 'A', hasNickname: false })
  })

  it('marks disabled controls in the field tree without blocking progressive blur', async () => {
    const user = userEvent.setup()
    const schema = z.object({
      name: z.string().min(1),
      locked: z.string().optional(),
    })
    render(
      <Form<{ name: string; locked?: string }>
        schema={schema}
        defaultValues={{ name: 'A', locked: 'x' }}
        fields={[
          { type: 'text', name: 'name', label: 'Name' },
          { type: 'text', name: 'locked', label: 'Locked', disabled: true },
        ]}
        onSubmit={vi.fn()}
        footer={(form) => (
          <>
            <output data-testid="rhf-errors">
              {JSON.stringify(Object.keys(form.formState.errors as object))}
            </output>
          </>
        )}
      />,
    )
    expect(screen.getByLabelText('Locked')).toBeDisabled()
    await user.click(screen.getByLabelText('Locked'))
    await user.tab()
    expect(screen.getByTestId('rhf-errors')).toHaveTextContent('[]')
  })

  it('projects pathless and nested paths through the passive resolver', async () => {
    const schema = z
      .object({
        name: z.string(),
        details: z.object({ note: z.string().min(1, 'Note required') }),
      })
      .superRefine((_values, ctx) => {
        ctx.addIssue({ code: 'custom', message: 'Form incomplete', path: [] })
      })
    const resolver = makeResolver(schema, [
      { type: 'text', name: 'name', label: 'Name' },
      { type: 'text', name: 'details.note', label: 'Note' },
    ])
    const result = await resolver({ name: 'A', details: { note: '' } }, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    })
    const errors = result.errors as {
      root?: { message?: string }
      details?: { note?: { message?: string } }
    }
    expect(errors.root?.message).toContain('Form incomplete')
    expect(errors.details?.note?.message).toBe('Note required')
  })

  it('projects array row errors and keeps parent/child issues distinct', async () => {
    const user = userEvent.setup()
    const traitSchema = z.object({
      label: z.string().min(1, 'Label required'),
    })
    const schema = z.object({
      traits: z.array(traitSchema).min(1),
    })
    const onSubmit = vi.fn()
    render(
      <Form<{ traits: { label: string }[] }>
        schema={schema}
        defaultValues={{ traits: [{ label: '' }] }}
        fields={[
          {
            kind: 'array',
            name: 'traits',
            heading: { label: 'Traits' },
            fields: [{ type: 'text', name: 'label', label: 'Label', required: true }],
            addAction: { label: 'Add' },
          },
        ]}
        onSubmit={onSubmit}
        footer={<button type="submit">Save</button>}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByText('Label required')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('keeps silent validity from publishing interactive errors', async () => {
    function SilentProbe() {
      const { validateSilently } = useFormUiContext()
      const { canSubmit } = useSilentFormValidity()
      const { trigger } = useFormContext()
      return (
        <div
          data-testid="silent"
          data-has-silent={String(Boolean(validateSilently))}
          data-can-submit={String(canSubmit)}
          data-trigger-count={String(trigger.length)}
        />
      )
    }
    const onSubmit = vi.fn()
    render(
      <Form<{ name: string }>
        schema={z.object({ name: z.string().min(1) })}
        defaultValues={{ name: '' }}
        fields={[{ type: 'text', name: 'name', label: 'Name' }]}
        onSubmit={onSubmit}
        footer={() => (
          <>
            <SilentProbe />
            <button type="submit">Save</button>
          </>
        )}
      />,
    )
    expect(screen.getByTestId('silent')).toHaveAttribute('data-has-silent', 'true')
    await waitFor(() =>
      expect(screen.getByTestId('silent')).toHaveAttribute('data-can-submit', 'false'),
    )
    expect(screen.queryByText('Name is required')).not.toBeInTheDocument()
  })

  it('keeps isDirty accurate for leave-guard consumers after edit and reset', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <Form<{ name: string }>
        schema={z.object({ name: z.string() })}
        defaultValues={{ name: 'Seed' }}
        fields={[{ type: 'text', name: 'name', label: 'Name' }]}
        onSubmit={onSubmit}
        footer={(form) => (
          <>
            <output data-testid="dirty">{String(form.formState.isDirty)}</output>
            <button type="button" onClick={() => form.reset({ name: 'Seed' })}>
              Reset
            </button>
          </>
        )}
      />,
    )
    expect(screen.getByTestId('dirty')).toHaveTextContent('false')
    await user.clear(screen.getByLabelText('Name'))
    await user.type(screen.getByLabelText('Name'), 'Changed')
    await waitFor(() => expect(screen.getByTestId('dirty')).toHaveTextContent('true'))
    await user.click(screen.getByRole('button', { name: 'Reset' }))
    await waitFor(() => expect(screen.getByTestId('dirty')).toHaveTextContent('false'))
  })

  it('recovers after a rejected submit and submits again', async () => {
    const user = userEvent.setup()
    const onSubmit = vi
      .fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce(undefined)
    renderForm({ schema: makeSchema() as never, onSubmit })
    await user.type(screen.getByLabelText('Name'), 'Tasha')
    await user.type(screen.getByLabelText('Count'), '1')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2))
  })
})

describe('TabbedForm RHF integration strategy', () => {
  it('uses onChange revalidation after touch in tab panels', async () => {
    const user = userEvent.setup()
    const schema = z.object({
      bio: z.object({ name: z.string().min(1, 'Name is required') }),
    })
    const tabs: TabbedFormTab[] = [
      {
        id: 'bio',
        label: 'Bio',
        fields: [{ type: 'text', name: 'bio.name', label: 'Name', required: true }],
      },
    ]
    const onSubmit = vi.fn()
    render(
      <TabbedForm<z.infer<typeof schema>>
        schema={schema}
        tabs={tabs}
        mode="onChange"
        defaultValues={{ bio: { name: '' } }}
        onSubmit={onSubmit}
        footer={(form) => (
          <>
            <output data-testid="tab-errors">
              {JSON.stringify(Object.keys(form.formState.errors as object))}
            </output>
            <button type="submit">Save</button>
          </>
        )}
      />,
    )
    const name = screen.getByRole('textbox', { name: 'Name' })
    await user.click(name)
    await user.tab()
    await waitFor(() => expect(screen.getByTestId('tab-errors')).toHaveTextContent('bio'))
    await user.type(name, 'Tasha')
    await waitFor(() => expect(screen.getByTestId('tab-errors')).toHaveTextContent('[]'))
  })
})
