import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { z } from 'zod'

import {
  fieldStackRhythmVariants,
  fieldToggleDependentIndentClasses,
} from '../../components/ui/field.variants'
import { Form } from '../shells/form.client'
import type { FormItem } from '../field-config'

const schema = z.object({
  featureEnabled: z.boolean(),
  featureValue: z.number().optional(),
  featureNote: z.string().optional(),
})

type Values = z.infer<typeof schema>

const dependentField = (
  options: {
    surface?: 'subtle'
    status?: 'destructive'
    scope?: 'wrapper' | 'arrayItems'
    rhythm?: 'compact' | 'comfortable'
  } = {},
): FormItem => ({
  kind: 'dependent',
  ...(options.rhythm ? { rhythm: options.rhythm } : {}),
  controller: {
    type: 'switch',
    name: 'featureEnabled',
    label: 'Enable feature',
    hint: 'Turn on to configure the dependent setting.',
    defaultValue: false,
  },
  dependents: {
    ...(options.surface ? { surface: options.surface } : {}),
    ...(options.status ? { status: options.status } : {}),
    ...(options.scope ? { scope: options.scope } : {}),
    fields: [
      {
        type: 'number',
        name: 'featureValue',
        label: 'Feature value',
        labelPosition: 'settings',
        defaultValue: 13,
        visibility: {
          dependsOn: ['featureEnabled'],
          visibleWhen: (values) => values.featureEnabled === true,
        },
      },
      ...(options.rhythm === 'comfortable'
        ? [
            {
              type: 'text' as const,
              name: 'featureNote',
              label: 'Feature note',
              visibility: {
                dependsOn: ['featureEnabled'],
                visibleWhen: (values: Record<string, unknown>) => values.featureEnabled === true,
              },
            },
          ]
        : []),
    ],
  },
})

function renderDependentForm(
  fields: FormItem[] = [dependentField({ surface: 'subtle' })],
  defaultValues: Partial<Values> = { featureEnabled: false },
) {
  return render(
    <Form<Values>
      schema={schema}
      fields={fields}
      defaultValues={defaultValues}
      onSubmit={vi.fn()}
    />,
  )
}

function queryDependentsRegion(container: HTMLElement) {
  return container.querySelector('[data-field-dependent-fields]')
}

function queryChromeShell(container: HTMLElement) {
  const region = queryDependentsRegion(container)
  return region?.querySelector(':scope > .p-3') ?? null
}

describe('dependent field', () => {
  it('keeps the toggle outside the dependents chrome region', async () => {
    const user = userEvent.setup()
    const { container } = renderDependentForm()

    const dependent = container.querySelector('[data-field-dependent]')
    expect(dependent).toBeInTheDocument()

    const switchControl = screen.getByRole('switch', { name: 'Enable feature' })
    expect(queryChromeShell(container)).toBeNull()

    await user.click(switchControl)

    await waitFor(() => {
      const region = queryDependentsRegion(container)
      const shell = queryChromeShell(container) as HTMLElement | null
      expect(region).toHaveClass(fieldToggleDependentIndentClasses)
      expect(shell).toBeInTheDocument()
      expect(region).toContainElement(shell)
      expect(shell).not.toContainElement(switchControl)
      expect(shell).toContainElement(screen.getByLabelText('Feature value'))
    })
  })

  it('applies subtle chrome tone classes to the dependents region', async () => {
    const user = userEvent.setup()
    const { container } = renderDependentForm()

    await user.click(screen.getByRole('switch', { name: 'Enable feature' }))

    await waitFor(() => {
      const shell = queryChromeShell(container)
      expect(shell).toHaveClass('bg-surface-subtle')
      expect(queryDependentsRegion(container)).toHaveClass(fieldToggleDependentIndentClasses)
    })
  })

  it('hides the dependents region while the gate switch is off', () => {
    const { container } = renderDependentForm()

    expect(screen.queryByLabelText('Feature value')).not.toBeInTheDocument()
    expect(queryDependentsRegion(container)).toBeNull()
  })

  it('groups the toggle and dependents with role="group" and aria-labelledby', () => {
    const { container } = renderDependentForm()

    const dependent = container.querySelector('[data-field-dependent][role="group"]')
    expect(dependent).toBeInTheDocument()
    expect(dependent).toHaveAttribute('aria-labelledby', expect.stringContaining('featureEnabled'))
  })

  it('renders a plain indented stack when dependents surface is omitted', async () => {
    const user = userEvent.setup()
    const { container } = renderDependentForm([dependentField()])

    await user.click(screen.getByRole('switch', { name: 'Enable feature' }))

    await waitFor(() => {
      const region = queryDependentsRegion(container)
      expect(region).toHaveClass(fieldToggleDependentIndentClasses)
      expect(queryChromeShell(container)).toBeNull()
      expect(region?.querySelector('.gap-2')).toBeInTheDocument()
      expect(region).toContainElement(screen.getByLabelText('Feature value'))
    })
  })

  it('applies comfortable rhythm inside dependents chrome', async () => {
    const user = userEvent.setup()
    const { container } = renderDependentForm([
      dependentField({ surface: 'subtle', rhythm: 'comfortable' }),
    ])

    await user.click(screen.getByRole('switch', { name: 'Enable feature' }))

    await waitFor(() => {
      const shell = queryChromeShell(container)
      expect(shell).toHaveClass(fieldStackRhythmVariants({ rhythm: 'comfortable' }))
      expect(screen.getByLabelText('Feature note')).toBeInTheDocument()
    })
  })

  it('applies compact rhythm on the outer dependent wrapper by default', async () => {
    const user = userEvent.setup()
    const { container } = renderDependentForm()

    await user.click(screen.getByRole('switch', { name: 'Enable feature' }))

    await waitFor(() => {
      const dependent = container.querySelector('[data-field-dependent]')
      expect(dependent).toHaveClass(fieldStackRhythmVariants({ rhythm: 'compact' }))
    })
  })

  it('renders an optional id on the group wrapper', () => {
    const { container } = renderDependentForm([
      {
        kind: 'group',
        id: 'feature-section',
        className: 'scroll-mt-20',
        fields: [
          {
            type: 'text',
            name: 'featureNote',
            label: 'Feature note',
          },
        ],
      },
    ])

    expect(container.querySelector('#feature-section')).toHaveClass('scroll-mt-20')
  })

  it('has no axe violations when dependents are visible', async () => {
    const user = userEvent.setup()
    const { container } = renderDependentForm(undefined, { featureEnabled: true, featureValue: 13 })

    await waitFor(() => expect(screen.getByLabelText('Feature value')).toBeInTheDocument())
    await user.tab()

    await expectNoAxeViolations(container)
  })

  it('applies arrayItems scope tone on array shells without wrapper chrome', async () => {
    const user = userEvent.setup()
    const arraySchema = z.object({
      featureEnabled: z.boolean(),
      items: z.array(z.object({ label: z.string() })),
    })

    const fields: FormItem[] = [
      {
        kind: 'dependent',
        controller: {
          type: 'switch',
          name: 'featureEnabled',
          label: 'Enable feature',
          defaultValue: false,
        },
        dependents: {
          surface: 'subtle',
          scope: 'arrayItems',
          fields: [
            {
              kind: 'array',
              name: 'items',
              legend: '',
              addAction: { label: 'Add item' },
              fields: [{ type: 'text', name: 'label', label: 'Label' }],
            },
          ],
        },
      },
    ]

    const { container } = render(
      <Form<z.infer<typeof arraySchema>>
        schema={arraySchema}
        fields={fields}
        defaultValues={{ featureEnabled: true, items: [] }}
        onSubmit={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add item' }))

    await waitFor(() => {
      const region = queryDependentsRegion(container)
      expect(region).toBeInTheDocument()
      expect(queryChromeShell(container)).toBeNull()

      const itemShell = screen.getByRole('group', { name: /Item #1/ })
      expect(itemShell).toHaveClass('bg-surface-subtle')
      expect(itemShell).toHaveClass('border-border')
    })
  })

  it('gates dependents on explicit dependents.visibility with a select controller', () => {
    const selectSchema = z.object({
      mode: z.string(),
      classIds: z.array(z.string()).optional(),
    })

    const fields: FormItem[] = [
      {
        kind: 'dependent',
        controller: {
          type: 'select',
          name: 'mode',
          label: 'Class restrictions',
          labelPosition: 'settings',
          options: [
            { label: 'All classes', value: 'all' },
            { label: 'Only listed', value: 'only' },
          ],
          defaultValue: 'all',
        },
        dependents: {
          visibility: {
            dependsOn: ['mode'],
            visibleWhen: (values) => values.mode !== 'all',
          },
          surface: 'subtle',
          fields: [
            {
              type: 'combobox',
              name: 'classIds',
              label: 'Classes',
              multiple: true,
              options: [
                { label: 'Fighter', value: 'fighter' },
                { label: 'Wizard', value: 'wizard' },
              ],
            },
          ],
        },
      },
    ]

    const hidden = render(
      <Form<z.infer<typeof selectSchema>>
        schema={selectSchema}
        fields={fields}
        defaultValues={{ mode: 'all', classIds: [] }}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.queryByRole('combobox', { name: 'Classes' })).not.toBeInTheDocument()
    expect(queryDependentsRegion(hidden.container)).toBeNull()

    hidden.unmount()

    const visible = render(
      <Form<z.infer<typeof selectSchema>>
        schema={selectSchema}
        fields={fields}
        defaultValues={{ mode: 'only', classIds: [] }}
        onSubmit={vi.fn()}
      />,
    )

    expect(queryChromeShell(visible.container)).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Classes' })).toBeInTheDocument()

    const dependent = visible.container.querySelector('[data-field-dependent][role="group"]')
    expect(dependent).toHaveAttribute('aria-labelledby', expect.stringContaining('mode'))
  })

  it('applies dependent separator after the full dependent grouping', () => {
    const selectSchema = z.object({
      mode: z.string(),
      classIds: z.array(z.string()).optional(),
    })

    const fields: FormItem[] = [
      {
        kind: 'dependent',
        separator: 'subtle',
        controller: {
          type: 'select',
          name: 'mode',
          label: 'Class restrictions',
          labelPosition: 'settings',
          options: [
            { label: 'All classes', value: 'all' },
            { label: 'Only listed', value: 'only' },
          ],
          defaultValue: 'only',
        },
        dependents: {
          visibility: {
            dependsOn: ['mode'],
            visibleWhen: (values) => values.mode !== 'all',
          },
          surface: 'subtle',
          fields: [
            {
              type: 'combobox',
              name: 'classIds',
              label: 'Classes',
              multiple: true,
              options: [{ label: 'Fighter', value: 'fighter' }],
            },
          ],
        },
      },
    ]

    const { container } = render(
      <Form<z.infer<typeof selectSchema>>
        schema={selectSchema}
        fields={fields}
        defaultValues={{ mode: 'only', classIds: [] }}
        onSubmit={vi.fn()}
      />,
    )

    const separator = container.querySelector('[data-field-separator]')
    expect(separator).toBeInTheDocument()
    expect(separator).toHaveClass('border-b', 'border-border-subtle', 'pb-7')
    expect(separator).toContainElement(screen.getByLabelText('Class restrictions'))
    expect(separator).toContainElement(queryDependentsRegion(container) as HTMLElement)
    expect(container.querySelectorAll('[data-field-separator]')).toHaveLength(1)
  })

  it('keeps dependent separator when dependents are gated off', () => {
    const selectSchema = z.object({
      mode: z.string(),
      classIds: z.array(z.string()).optional(),
    })

    const fields: FormItem[] = [
      {
        kind: 'dependent',
        separator: 'subtle',
        controller: {
          type: 'select',
          name: 'mode',
          label: 'Class restrictions',
          labelPosition: 'settings',
          options: [
            { label: 'All classes', value: 'all' },
            { label: 'Only listed', value: 'only' },
          ],
          defaultValue: 'all',
        },
        dependents: {
          visibility: {
            dependsOn: ['mode'],
            visibleWhen: (values) => values.mode !== 'all',
          },
          fields: [
            {
              type: 'combobox',
              name: 'classIds',
              label: 'Classes',
              multiple: true,
              options: [{ label: 'Fighter', value: 'fighter' }],
            },
          ],
        },
      },
    ]

    const { container } = render(
      <Form<z.infer<typeof selectSchema>>
        schema={selectSchema}
        fields={fields}
        defaultValues={{ mode: 'all', classIds: [] }}
        onSubmit={vi.fn()}
      />,
    )

    const separator = container.querySelector('[data-field-separator]')
    expect(separator).toBeInTheDocument()
    expect(separator).toContainElement(screen.getByLabelText('Class restrictions'))
    expect(queryDependentsRegion(container)).toBeNull()
  })
})
