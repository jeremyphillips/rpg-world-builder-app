import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, useFormContext, type UseFormReturn } from 'react-hook-form'

import {
  fieldAnatomyStackVariants,
  fieldStackRhythmVariants,
} from '../../components/ui/field.variants'
import { FormItems } from './form-items.client'
import { FormRhythmStack, FormSectionContext } from '../context/form-section.context'
import { DEFAULT_FORM_DENSITY, resolveFormDensity } from '../form-density'
import type { FormItem } from '../field-config'

const field = {
  kind: 'group',
  name: 'savingThrow',
  heading: { label: 'Saving throw' },
  separator: 'subtle',
  optionalDisclosure: {
    intent: 'add',
    addLabel: 'Add saving throw',
    removeLabel: 'Remove saving throw',
  },
  fields: [
    {
      type: 'textarea',
      name: 'savingThrow.failure',
      label: 'Failure',
    },
  ],
} as const satisfies FormItem

function StateProbe() {
  const { formState, watch } = useFormContext()
  const savingThrow = watch('savingThrow')
  return (
    <output data-testid="state">
      {JSON.stringify({
        dirty: formState.isDirty,
        savingThrow: savingThrow ?? null,
      })}
    </output>
  )
}

function Harness() {
  const form = useForm({ defaultValues: {}, shouldUnregister: true })
  return (
    <FormProvider {...form}>
      <StateProbe />
      <FormItems items={[field]} idPrefix="test" />
    </FormProvider>
  )
}

function state() {
  return JSON.parse(screen.getByTestId('state').textContent ?? '{}') as {
    dirty: boolean
    savingThrow: unknown
  }
}

describe('group optionalDisclosure', () => {
  it('opens without writing a value and clears the object on remove', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    expect(state()).toEqual({ dirty: false, savingThrow: null })
    await user.click(screen.getByRole('button', { name: 'Add saving throw' }))
    expect(screen.getByRole('group', { name: /Saving throw/ })).toBeInTheDocument()
    expect(document.querySelector('[data-field-separator]')).toBeTruthy()
    expect(screen.getByRole('textbox', { name: 'Failure' })).toBeInTheDocument()
    expect(state()).toEqual({ dirty: false, savingThrow: null })

    await user.type(screen.getByRole('textbox', { name: 'Failure' }), 'Half damage')
    await waitFor(() => {
      expect(state().dirty).toBe(true)
    })

    await user.click(screen.getByRole('button', { name: 'Remove saving throw' }))
    await waitFor(() => {
      expect(state()).toEqual({ dirty: true, savingThrow: null })
    })
  })

  it('opens when watchPaths have content and clears them on remove', async () => {
    const user = userEvent.setup()
    const watched = {
      kind: 'group',
      name: 'wrapper',
      heading: { label: 'Wrapper' },
      separator: 'subtle',
      optionalDisclosure: {
        intent: 'add',
        addLabel: 'Add tags',
        removeLabel: 'Remove',
        watchPaths: ['tags', 'roles'],
        clearPaths: ['tags', 'roles'],
      },
      fields: [
        { type: 'text', name: 'tags', label: 'Tags' },
        { type: 'text', name: 'roles', label: 'Roles' },
      ],
    } as const satisfies FormItem
    function WatchHarness({ defaultValues }: { defaultValues?: Record<string, unknown> }) {
      const form = useForm({ defaultValues, shouldUnregister: true })
      return (
        <FormProvider {...form}>
          <FormItems items={[watched]} idPrefix="watch" />
        </FormProvider>
      )
    }
    render(<WatchHarness defaultValues={{ tags: ['demon'] }} />)
    expect(screen.getByText('Tags')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Remove' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add tags' })).toBeInTheDocument()
    })
  })

  it('applies headingScale field on open optional disclosure groups', async () => {
    const user = userEvent.setup()
    const movementGroup = {
      kind: 'group',
      name: 'movementOverride',
      heading: { label: 'Movement' },
      headingScale: 'field',
      optionalDisclosure: {
        intent: 'add',
        addLabel: 'Override movement',
        removeLabel: 'Remove',
        labeled: true,
      },
      fields: [{ type: 'text', name: 'walk', label: 'Walk' }],
    } as const satisfies FormItem
    function MovementHarness() {
      const form = useForm({ defaultValues: {}, shouldUnregister: true })
      return (
        <FormProvider {...form}>
          <FormItems items={[movementGroup]} idPrefix="movement" />
        </FormProvider>
      )
    }
    render(<MovementHarness />)
    const addButton = screen.getByRole('button', { name: 'Override movement' })
    expect(addButton).toHaveClass('ui-button__text--xs')
    await user.click(addButton)
    expect(screen.getByRole('group', { name: /Movement/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove' })).toHaveClass('ui-button__text--xs')
    const movementLabel = screen
      .getByText('Movement')
      .closest('span.text-style-field-label-sm, span.text-style-field-label-md')
    expect(movementLabel).toHaveClass('text-style-field-label-md')
    expect(movementLabel?.className).not.toMatch(/text-style-field-legend/)
  })

  it('keeps open and closed optional groups free of fieldset trailing margin in rhythm stacks', async () => {
    const user = userEvent.setup()
    const rhythmField = {
      kind: 'group',
      name: 'movementOverride',
      heading: { label: 'Movement' },
      optionalDisclosure: { intent: 'add', addLabel: 'Override movement', removeLabel: 'Remove' },
      fields: [
        { type: 'text', name: 'walk', label: 'Walk' },
        { type: 'text', name: 'hover', label: 'Hover' },
      ],
    } as const satisfies FormItem

    function RhythmHarness() {
      const form = useForm({ defaultValues: {}, shouldUnregister: true })
      return (
        <FormProvider {...form}>
          <FormSectionContext.Provider
            value={{
              depth: 1,
              namedGroupDepth: 1,
              density: DEFAULT_FORM_DENSITY,
              inGroup: true,
            }}
          >
            <FormRhythmStack>
              <FormItems
                items={[rhythmField, { type: 'text', name: 'notes', label: 'Notes' }]}
                idPrefix="rhythm"
              />
            </FormRhythmStack>
          </FormSectionContext.Provider>
        </FormProvider>
      )
    }

    render(<RhythmHarness />)
    expect(screen.getByRole('button', { name: 'Override movement' })).not.toHaveClass('mb-8')
    await user.click(screen.getByRole('button', { name: 'Override movement' }))
    const movementGroup = screen.getByRole('group', { name: /Movement/ })
    expect(movementGroup).not.toHaveClass('mb-8')
    await user.click(screen.getByRole('button', { name: 'Remove' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Override movement' })).toBeInTheDocument()
    })
    expect(screen.queryByRole('group', { name: /Movement/ })).not.toBeInTheDocument()
  })

  it('renders source preview inside the fieldset without serializing it', async () => {
    const user = userEvent.setup()
    const previewGroup = {
      kind: 'group',
      name: 'movementOverride',
      heading: { label: 'Movement' },
      headingScale: 'field',
      optionalDisclosure: {
        intent: 'override',
        labeled: true,
        sourcePreview: {
          dependsOn: ['baseWalk'],
          resolve: (values: Record<string, unknown>) => {
            const walk = values.baseWalk
            if (typeof walk !== 'number') return undefined
            return { label: 'Base movement', text: `Walk ${walk} ft.` }
          },
        },
      },
      fields: [{ type: 'text', name: 'walk', label: 'Walk' }],
    } as const satisfies FormItem

    function PreviewHarness() {
      const form = useForm({
        defaultValues: { baseWalk: 30 },
        shouldUnregister: true,
      })
      return (
        <FormProvider {...form}>
          <StateProbe />
          <FormItems items={[previewGroup]} idPrefix="preview" />
        </FormProvider>
      )
    }

    render(<PreviewHarness />)
    await user.click(screen.getByRole('button', { name: 'Override Movement' }))
    const group = screen.getByRole('group', { name: /Movement/ })
    expect(group).toHaveTextContent('Base movement')
    expect(group).toHaveTextContent('Walk 30 ft.')
    expect(state()).toEqual({ dirty: false, savingThrow: null })

    expect(group.querySelector(':scope > div.mt-1\\.5, :scope > div.mt-1')).toBeTruthy()
    const previewLine = document.getElementById('preview-movementOverride-source-preview')
    expect(previewLine).toBeInTheDocument()
    const anatomyStack = previewLine?.parentElement
    expect(anatomyStack).toHaveClass(
      ...fieldAnatomyStackVariants({ size: resolveFormDensity().size }).split(/\s+/),
    )

    const editorStack = anatomyStack?.querySelector(':scope > div.min-w-0')
    expect(editorStack).toHaveClass(
      ...fieldStackRhythmVariants({ rhythm: resolveFormDensity().rhythm }).split(/\s+/),
    )
    expect(editorStack).toContainElement(screen.getByRole('textbox', { name: 'Walk' }))
  })

  it('opens when nested watchPaths resolve dotted root paths', () => {
    const nested = {
      kind: 'group',
      name: 'lair.experience',
      heading: { label: 'In-lair XP' },
      optionalDisclosure: {
        intent: 'add',
        addLabel: 'Add in-lair XP',
        removeLabel: 'Remove in-lair XP',
        expandWhenPopulated: true,
        watchPaths: ['lair.experience'],
      },
      fields: [{ type: 'text', name: 'mode', label: 'Mode' }],
    } as const satisfies FormItem

    function NestedHarness() {
      const form = useForm({
        defaultValues: {
          lair: { enabled: true, experience: { mode: 'suggested' } },
        },
        shouldUnregister: true,
      })
      return (
        <FormProvider {...form}>
          <FormItems items={[nested]} idPrefix="nested" />
        </FormProvider>
      )
    }

    render(<NestedHarness />)
    expect(screen.getByRole('group', { name: /In-lair XP/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add in-lair XP' })).not.toBeInTheDocument()
  })

  it('opens when watchPaths resolve array-indexed paths', () => {
    const indexed = {
      kind: 'group',
      name: 'extras',
      heading: { label: 'Extras' },
      optionalDisclosure: {
        intent: 'add',
        addLabel: 'Add extras',
        removeLabel: 'Remove extras',
        watchPaths: ['items.0.note'],
      },
      fields: [{ type: 'text', name: 'detail', label: 'Detail' }],
    } as const satisfies FormItem

    function IndexedHarness() {
      const form = useForm({
        defaultValues: { items: [{ note: 'present' }] },
        shouldUnregister: true,
      })
      return (
        <FormProvider {...form}>
          <FormItems items={[indexed]} idPrefix="indexed" />
        </FormProvider>
      )
    }

    render(<IndexedHarness />)
    expect(screen.getByRole('group', { name: /Extras/ })).toBeInTheDocument()
  })

  it('does not open when nested watchPaths point at empty nested values', () => {
    const nested = {
      kind: 'group',
      name: 'lair.experience',
      heading: { label: 'In-lair XP' },
      optionalDisclosure: {
        intent: 'add',
        addLabel: 'Add in-lair XP',
        removeLabel: 'Remove in-lair XP',
        expandWhenPopulated: true,
        watchPaths: ['lair.experience'],
      },
      fields: [{ type: 'text', name: 'mode', label: 'Mode' }],
    } as const satisfies FormItem

    function EmptyHarness() {
      const form = useForm({
        defaultValues: { lair: { enabled: true } },
        shouldUnregister: true,
      })
      return (
        <FormProvider {...form}>
          <FormItems items={[nested]} idPrefix="empty" />
        </FormProvider>
      )
    }

    render(<EmptyHarness />)
    expect(screen.getByRole('button', { name: 'Add in-lair XP' })).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: /In-lair XP/ })).not.toBeInTheDocument()
  })

  it('resolves row-relative watchPaths against namePrefix', () => {
    const rowGroup = {
      kind: 'group',
      name: 'sizesOverride',
      heading: { label: 'Sizes' },
      optionalDisclosure: {
        intent: 'override',
        addLabel: 'Override sizes',
        removeLabel: 'Use base sizes',
        watchPaths: ['overrides.sizes'],
      },
      fields: [{ type: 'text', name: 'overrides.sizes', label: 'Size override' }],
    } as const satisfies FormItem

    const rows = {
      kind: 'array',
      name: 'definedForms',
      fields: [rowGroup],
    } as const satisfies FormItem

    function RowHarness() {
      const form = useForm({
        defaultValues: {
          definedForms: [{ overrides: { sizes: 'large' } }],
        },
        shouldUnregister: true,
      })
      return (
        <FormProvider {...form}>
          <FormItems items={[rows]} idPrefix="row" />
        </FormProvider>
      )
    }

    render(<RowHarness />)
    expect(screen.getByRole('group', { name: /Sizes/ })).toBeInTheDocument()
  })

  it('reactively opens when a nested watchPath gains content', async () => {
    const user = userEvent.setup()
    const nested = {
      kind: 'group',
      name: 'lair.experience',
      heading: { label: 'In-lair XP' },
      optionalDisclosure: {
        intent: 'add',
        addLabel: 'Add in-lair XP',
        removeLabel: 'Remove in-lair XP',
        expandWhenPopulated: true,
        watchPaths: ['lair.experience'],
      },
      fields: [{ type: 'text', name: 'mode', label: 'Mode' }],
    } as const satisfies FormItem

    type ReactiveFormValues = { lair: { enabled: boolean; experience?: { mode: string } } }

    function ReactiveHarness({ form }: { form: UseFormReturn<ReactiveFormValues> }) {
      const { setValue } = form
      return (
        <FormProvider {...form}>
          <button type="button" onClick={() => setValue('lair.experience', { mode: 'suggested' })}>
            Seed XP
          </button>
          <FormItems items={[nested]} idPrefix="reactive" />
        </FormProvider>
      )
    }

    function Shell() {
      const form = useForm<ReactiveFormValues>({
        defaultValues: { lair: { enabled: true } },
        shouldUnregister: true,
      })
      return <ReactiveHarness form={form} />
    }

    render(<Shell />)
    expect(screen.getByRole('button', { name: 'Add in-lair XP' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Seed XP' }))
    await waitFor(() => {
      expect(screen.getByRole('group', { name: /In-lair XP/ })).toBeInTheDocument()
    })
  })

  it('writes seedWhen when the group opens', async () => {
    const user = userEvent.setup()
    const seeded = {
      ...field,
      optionalDisclosure: {
        intent: 'add',
        addLabel: 'Add saving throw',
        seedWhen: () => ({ withinFeet: 10 }),
      },
    } as const satisfies FormItem
    function SeedHarness() {
      const form = useForm({ defaultValues: {}, shouldUnregister: true })
      return (
        <FormProvider {...form}>
          <StateProbe />
          <FormItems items={[seeded]} idPrefix="seed" />
        </FormProvider>
      )
    }
    render(<SeedHarness />)
    await user.click(screen.getByRole('button', { name: 'Add saving throw' }))
    await waitFor(() => {
      expect(state().savingThrow).toEqual({ withinFeet: 10 })
    })
  })
})
