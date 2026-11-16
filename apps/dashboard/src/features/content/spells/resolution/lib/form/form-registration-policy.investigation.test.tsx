/**
 * Registration-policy proof. Not a product fix.
 *
 * `<Form>` passes `shouldUnregister: true`. `<TabbedForm>` (`useTabbedFormSetup`)
 * does not, so React Hook Form keeps its default `false` and clones
 * `defaultValues` into the live store before any field array mounts.
 *
 * Official `useFieldArray` rule: do not combine the hook with
 * `shouldUnregister: true`. The mount effect writes `[]` when the path is
 * missing, and that write does not copy sibling keys.
 */
import { useLayoutEffect, useState } from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TabbedForm } from '@rpg/ui/form'
import {
  FormProvider,
  useController,
  useFieldArray,
  useForm,
  useFormContext,
  useFormState,
  type UseFieldArrayReturn,
  type UseFormReturn,
} from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

const resolution = {
  resolution: {
    effects: [{ id: 'damage-1', kind: 'damage' }],
    outcomes: [
      {
        result: 'hit',
        effects: [{ kind: 'effect-reference', effectId: 'damage-1', amount: 'full' }],
      },
      { result: 'miss', effects: [] as unknown[] },
    ],
  },
}

type ResolutionValues = typeof resolution

function readOutput() {
  return JSON.parse(screen.getByTestId('values').textContent ?? '{}') as ResolutionValues
}

function NestedArrayProbe({
  shouldUnregister,
  registerStructural,
}: {
  shouldUnregister: boolean
  registerStructural?: boolean
}) {
  const form = useForm({ defaultValues: resolution, shouldUnregister })
  if (registerStructural) form.register('resolution')
  useFieldArray({ control: form.control, name: 'resolution.outcomes.0.effects' })
  useFieldArray({ control: form.control, name: 'resolution.outcomes.1.effects' })
  const { isDirty } = useFormState({ control: form.control })
  return (
    <output data-testid="values">{JSON.stringify({ isDirty, values: form.getValues() })}</output>
  )
}

describe('form registration policy', () => {
  it('keeps unregistered structure when the form uses the React Hook Form default', () => {
    render(<NestedArrayProbe shouldUnregister={false} />)
    const next = readOutput() as unknown as { isDirty: boolean; values: ResolutionValues }
    expect(next.isDirty).toBe(false)
    expect(next.values).toEqual(resolution)
  })

  it('drops unregistered siblings when shouldUnregister is true', () => {
    render(<NestedArrayProbe shouldUnregister={true} />)
    const next = readOutput() as unknown as { isDirty: boolean; values: ResolutionValues }
    expect(next.values.resolution.effects).toBeUndefined()
    expect(next.values.resolution.outcomes[0]).toEqual({ effects: [] })
    expect(next.values.resolution.outcomes[1]).toEqual({ effects: [] })
  })

  it('keeps structure when the structural object is registered in the same render', () => {
    render(<NestedArrayProbe shouldUnregister={true} registerStructural />)
    const next = readOutput() as unknown as { values: ResolutionValues }
    expect(next.values.resolution.effects).toEqual(resolution.resolution.effects)
    expect(next.values.resolution.outcomes.map((outcome) => outcome.result)).toEqual([
      'hit',
      'miss',
    ])
  })
})

function RetainResolution() {
  const form = useFormContext()
  useController({
    name: 'resolution',
    control: form.control,
    shouldUnregister: false,
  })
  return null
}

function RetainHost() {
  const form = useForm({ defaultValues: resolution, shouldUnregister: true })
  const [mounted, setMounted] = useState(true)
  return (
    <FormProvider {...form}>
      <button type="button" onClick={() => setMounted(false)}>
        unmount-structural
      </button>
      {mounted ? <RetainResolution /> : null}
      <NestedArrays />
      <output data-testid="values">{JSON.stringify(form.getValues())}</output>
    </FormProvider>
  )
}

function NestedArrays() {
  const form = useFormContext()
  useFieldArray({ control: form.control, name: 'resolution.outcomes.0.effects' })
  return null
}

describe('structural registration does not override the form policy', () => {
  it('clears the structural object when its controller unmounts', async () => {
    const user = userEvent.setup()
    render(<RetainHost />)
    expect(readOutput().resolution.effects).toEqual(resolution.resolution.effects)
    await user.click(screen.getByRole('button', { name: 'unmount-structural' }))
    await waitFor(() => {
      expect(readOutput()).toEqual({})
    })
  })
})

function ArrayOps({
  shouldUnregister,
  apiRef,
}: {
  shouldUnregister: boolean
  apiRef: {
    current: {
      form: UseFormReturn<ResolutionValues>
      fieldArray: UseFieldArrayReturn<ResolutionValues, 'resolution.outcomes.0.effects'>
    } | null
  }
}) {
  const form = useForm<ResolutionValues>({ defaultValues: resolution, shouldUnregister })
  const fieldArray = useFieldArray({
    control: form.control,
    name: 'resolution.outcomes.0.effects',
  })
  useLayoutEffect(() => {
    apiRef.current = { form, fieldArray }
  })
  return <output data-testid="values">{JSON.stringify(form.getValues())}</output>
}

describe('mutations under value retention', () => {
  it('appends, removes, and reorders without dropping unregistered siblings', () => {
    const apiRef: {
      current: {
        form: UseFormReturn<ResolutionValues>
        fieldArray: UseFieldArrayReturn<ResolutionValues, 'resolution.outcomes.0.effects'>
      } | null
    } = { current: null }
    render(<ArrayOps shouldUnregister={false} apiRef={apiRef} />)
    act(() => {
      apiRef.current?.fieldArray.append({ kind: 'note', text: 'added' })
    })
    let next = readOutput()
    expect(next.resolution.effects).toEqual(resolution.resolution.effects)
    expect(next.resolution.outcomes[0]?.effects).toHaveLength(2)
    expect(next.resolution.outcomes[1]?.result).toBe('miss')

    act(() => {
      apiRef.current?.fieldArray.move(0, 1)
    })
    next = readOutput()
    expect(next.resolution.outcomes[0]?.effects[0]).toMatchObject({ kind: 'note' })
    expect(next.resolution.effects).toEqual(resolution.resolution.effects)

    act(() => {
      apiRef.current?.fieldArray.remove(0)
    })
    next = readOutput()
    expect(next.resolution.outcomes[0]?.effects).toHaveLength(1)
    expect(next.resolution.outcomes[0]?.result).toBe('hit')
    expect(next.resolution.effects).toEqual(resolution.resolution.effects)
  })

  it('reset restores the full default tree when values are retained', () => {
    const apiRef: {
      current: {
        form: UseFormReturn<ResolutionValues>
        fieldArray: UseFieldArrayReturn<ResolutionValues, 'resolution.outcomes.0.effects'>
      } | null
    } = { current: null }
    render(<ArrayOps shouldUnregister={false} apiRef={apiRef} />)
    act(() => {
      apiRef.current?.fieldArray.append({ kind: 'note', text: 'added' })
      apiRef.current?.form.reset(resolution)
    })
    expect(readOutput()).toEqual(resolution)
  })

  it('reset under shouldUnregister drops keys that are not mounted inputs', () => {
    const apiRef: {
      current: {
        form: UseFormReturn<ResolutionValues>
        fieldArray: UseFieldArrayReturn<ResolutionValues, 'resolution.outcomes.0.effects'>
      } | null
    } = { current: null }
    render(<ArrayOps shouldUnregister={true} apiRef={apiRef} />)
    act(() => {
      apiRef.current?.form.reset(resolution)
    })
    expect(readOutput()).toEqual({})
  })
})

function DetailName({ name }: { name: string }) {
  const { field } = useController({ name })
  return (
    <input
      aria-label="row-name"
      value={typeof field.value === 'string' ? field.value : ''}
      onChange={(event) => field.onChange(event.target.value)}
    />
  )
}

function SelectionHost({ shouldUnregister }: { shouldUnregister: boolean }) {
  const form = useForm({
    defaultValues: {
      rows: [
        { name: 'Alpha', mode: 'kept' },
        { name: 'Beta', mode: 'kept' },
      ],
    },
    shouldUnregister,
  })
  useFieldArray({ control: form.control, name: 'rows' })
  const [index, setIndex] = useState(0)
  return (
    <FormProvider {...form}>
      <button type="button" onClick={() => setIndex(1)}>
        select-second
      </button>
      <DetailName key={index} name={`rows.${index}.name`} />
      <output data-testid="rows">{JSON.stringify(form.getValues())}</output>
    </FormProvider>
  )
}

describe('master-detail selection', () => {
  it('keeps the unselected row when values are retained', async () => {
    const user = userEvent.setup()
    render(<SelectionHost shouldUnregister={false} />)
    await user.clear(screen.getByRole('textbox', { name: 'row-name' }))
    await user.type(screen.getByRole('textbox', { name: 'row-name' }), 'Edited')
    await user.click(screen.getByRole('button', { name: 'select-second' }))
    await waitFor(() => {
      const rows = JSON.parse(screen.getByTestId('rows').textContent ?? '{}') as {
        rows: Array<{ name?: string; mode?: string }>
      }
      expect(rows.rows[0]).toEqual({ name: 'Edited', mode: 'kept' })
      expect(rows.rows[1]).toMatchObject({ name: 'Beta', mode: 'kept' })
    })
  })

  it('drops unmounted row keys when shouldUnregister is true', async () => {
    const user = userEvent.setup()
    render(<SelectionHost shouldUnregister={true} />)
    await user.clear(screen.getByRole('textbox', { name: 'row-name' }))
    await user.type(screen.getByRole('textbox', { name: 'row-name' }), 'Edited')
    await user.click(screen.getByRole('button', { name: 'select-second' }))
    await waitFor(() => {
      const rows = JSON.parse(screen.getByTestId('rows').textContent ?? '{}') as {
        rows: Array<{ name?: string; mode?: string } | null>
      }
      expect(rows.rows[0]?.name).not.toBe('Edited')
      expect(rows.rows[0]?.mode).toBeUndefined()
    })
  })
})

function ExtraField() {
  const { field } = useController({ name: 'extra' })
  return (
    <input
      aria-label="extra"
      value={typeof field.value === 'string' ? field.value : ''}
      onChange={(event) => field.onChange(event.target.value)}
    />
  )
}

function AmountField() {
  const { field } = useController({ name: 'amount' })
  return (
    <input
      aria-label="amount"
      value={typeof field.value === 'string' ? field.value : ''}
      onChange={(event) => field.onChange(event.target.value)}
    />
  )
}

function ConditionalHost({ shouldUnregister }: { shouldUnregister: boolean }) {
  const form = useForm<{ kind: string; extra: string | undefined; amount: string }>({
    defaultValues: { kind: 'damage', extra: 'secret', amount: 'full' },
    shouldUnregister,
  })
  const [open, setOpen] = useState(true)
  return (
    <FormProvider {...form}>
      <button type="button" onClick={() => setOpen(false)}>
        hide-extra
      </button>
      <button
        type="button"
        onClick={() => {
          form.unregister('extra')
          form.setValue('extra', undefined)
        }}
      >
        clear-extra
      </button>
      <AmountField />
      {open ? <ExtraField /> : null}
      <output data-testid="conditional">{JSON.stringify(form.getValues())}</output>
    </FormProvider>
  )
}

describe('conditional visibility and explicit removal', () => {
  it('clears a hidden field only when shouldUnregister is true', async () => {
    const user = userEvent.setup()
    render(<ConditionalHost shouldUnregister={true} />)
    await user.click(screen.getByRole('button', { name: 'hide-extra' }))
    await waitFor(() => {
      const values = JSON.parse(screen.getByTestId('conditional').textContent ?? '{}') as {
        extra?: string
        amount?: string
        kind?: string
      }
      expect(values.extra).toBeUndefined()
      expect(values.amount).toBe('full')
      expect(values.kind).toBeUndefined()
    })
  })

  it('keeps a hidden field when the form retains values', async () => {
    const user = userEvent.setup()
    render(<ConditionalHost shouldUnregister={false} />)
    await user.click(screen.getByRole('button', { name: 'hide-extra' }))
    await waitFor(() => {
      const values = JSON.parse(screen.getByTestId('conditional').textContent ?? '{}') as {
        extra?: string
        amount?: string
        kind?: string
      }
      expect(values.extra).toBe('secret')
      expect(values.amount).toBe('full')
      expect(values.kind).toBe('damage')
    })
  })

  it('explicit unregister removes a value while the form retains unmounted data', async () => {
    const user = userEvent.setup()
    render(<ConditionalHost shouldUnregister={false} />)
    await user.click(screen.getByRole('button', { name: 'clear-extra' }))
    await waitFor(() => {
      const values = JSON.parse(screen.getByTestId('conditional').textContent ?? '{}') as {
        extra?: string
        amount?: string
        kind?: string
      }
      expect(values.extra).toBeUndefined()
      expect(values.kind).toBe('damage')
      expect(values.amount).toBe('full')
    })
  })
})

const tabbedSchema = z.object({
  resolution: z.object({
    effects: z.array(z.object({ id: z.string(), kind: z.string() })),
    outcomes: z.array(
      z.object({
        result: z.string(),
        effects: z.array(
          z.object({
            kind: z.string(),
            effectId: z.string().optional(),
            amount: z.string().optional(),
          }),
        ),
      }),
    ),
  }),
})

function TabbedSnapshot() {
  const form = useFormContext()
  const values = form.watch()
  return <output data-testid="tabbed">{JSON.stringify(values)}</output>
}

describe('TabbedForm shell', () => {
  it('mounts a nested field array without dropping unregistered siblings', async () => {
    render(
      <TabbedForm
        schema={tabbedSchema}
        defaultValues={resolution}
        onSubmit={() => undefined}
        tabs={[
          {
            id: 'resolution',
            label: 'Resolution',
            fields: [
              {
                kind: 'array',
                name: 'resolution.outcomes.0.effects',
                fields: [{ type: 'text', name: 'kind', label: 'Kind' }],
              },
              {
                kind: 'slot',
                name: 'registration-probe',
                render: () => <TabbedSnapshot />,
              },
            ],
          },
        ]}
      />,
    )
    await waitFor(() => {
      const next = JSON.parse(screen.getByTestId('tabbed').textContent ?? '{}') as ResolutionValues
      expect(next.resolution.effects).toEqual(resolution.resolution.effects)
      expect(next.resolution.outcomes.map((outcome) => outcome.result)).toEqual(['hit', 'miss'])
      expect(next.resolution.outcomes[0]?.effects).toEqual(
        resolution.resolution.outcomes[0]?.effects,
      )
      expect(next.resolution.outcomes[1]?.effects).toEqual([])
    })
  })
})
