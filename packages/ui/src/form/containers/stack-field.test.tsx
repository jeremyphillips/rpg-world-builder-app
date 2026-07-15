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

const dependentStack = (
  options: {
    dependentsChrome?: 'subtle' | 'error'
    dependentsChromeScope?: 'wrapper' | 'arrayItems'
    rhythm?: 'compact' | 'comfortable'
  } = {},
): FormItem => ({
  kind: 'stack',
  layout: 'dependent',
  ...(options.dependentsChrome ? { dependentsChrome: options.dependentsChrome } : {}),
  ...(options.dependentsChromeScope
    ? { dependentsChromeScope: options.dependentsChromeScope }
    : {}),
  ...(options.rhythm ? { rhythm: options.rhythm } : {}),
  fields: [
    {
      type: 'switch',
      name: 'featureEnabled',
      label: 'Enable feature',
      hint: 'Turn on to configure the dependent setting.',
      defaultValue: false,
    },
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
})

function renderStackForm(
  fields: FormItem[] = [dependentStack({ dependentsChrome: 'subtle' })],
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
  return container.querySelector('[data-field-stack-dependents]')
}

function queryChromeShell(container: HTMLElement) {
  const region = queryDependentsRegion(container)
  return region?.querySelector(':scope > .p-3') ?? null
}

describe('dependent stack', () => {
  it('keeps the toggle outside the dependents chrome region', async () => {
    const user = userEvent.setup()
    const { container } = renderStackForm()

    const stack = container.querySelector('[data-field-stack]')
    expect(stack).toBeInTheDocument()

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
    const { container } = renderStackForm()

    await user.click(screen.getByRole('switch', { name: 'Enable feature' }))

    await waitFor(() => {
      const shell = queryChromeShell(container)
      expect(shell).toHaveClass('bg-muted/10')
      expect(queryDependentsRegion(container)).toHaveClass(fieldToggleDependentIndentClasses)
    })
  })

  it('hides the dependents region while the gate switch is off', () => {
    const { container } = renderStackForm()

    expect(screen.queryByLabelText('Feature value')).not.toBeInTheDocument()
    expect(queryDependentsRegion(container)).toBeNull()
  })

  it('groups the toggle and dependents with role="group" and aria-labelledby', () => {
    const { container } = renderStackForm()

    const stack = container.querySelector('[data-field-stack][role="group"]')
    expect(stack).toBeInTheDocument()
    expect(stack).toHaveAttribute('aria-labelledby', expect.stringContaining('featureEnabled'))
  })

  it('renders a plain indented stack when dependentsChrome is omitted', async () => {
    const user = userEvent.setup()
    const { container } = renderStackForm([dependentStack()])

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
    const { container } = renderStackForm([
      dependentStack({ dependentsChrome: 'subtle', rhythm: 'comfortable' }),
    ])

    await user.click(screen.getByRole('switch', { name: 'Enable feature' }))

    await waitFor(() => {
      const shell = queryChromeShell(container)
      expect(shell).toHaveClass(fieldStackRhythmVariants({ rhythm: 'comfortable' }))
      expect(screen.getByLabelText('Feature note')).toBeInTheDocument()
    })
  })

  it('applies compact rhythm on the outer stack by default', async () => {
    const user = userEvent.setup()
    const { container } = renderStackForm()

    await user.click(screen.getByRole('switch', { name: 'Enable feature' }))

    await waitFor(() => {
      const stack = container.querySelector('[data-field-stack]')
      expect(stack).toHaveClass(fieldStackRhythmVariants({ rhythm: 'compact' }))
    })
  })

  it('renders an optional id on the stack wrapper', () => {
    const { container } = renderStackForm([
      {
        kind: 'stack',
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
    const { container } = renderStackForm(undefined, { featureEnabled: true, featureValue: 13 })

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
        kind: 'stack',
        layout: 'dependent',
        dependentsChrome: 'subtle',
        dependentsChromeScope: 'arrayItems',
        fields: [
          {
            type: 'switch',
            name: 'featureEnabled',
            label: 'Enable feature',
            defaultValue: false,
          },
          {
            kind: 'array',
            name: 'items',
            legend: '',
            addLabel: 'Add item',
            fields: [{ type: 'text', name: 'label', label: 'Label' }],
          },
        ],
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
      expect(itemShell).toHaveClass('bg-muted/10')
      expect(itemShell).toHaveClass('border-border')
    })
  })

  it('gates dependents on explicit dependentsVisibility with a select controller', () => {
    const selectSchema = z.object({
      mode: z.string(),
      classIds: z.array(z.string()).optional(),
    })

    const fields: FormItem[] = [
      {
        kind: 'stack',
        layout: 'dependent',
        dependentsVisibility: {
          dependsOn: ['mode'],
          visibleWhen: (values) => values.mode !== 'all',
        },
        dependentsChrome: 'subtle',
        fields: [
          {
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

    const stack = visible.container.querySelector('[data-field-stack][role="group"]')
    expect(stack).toHaveAttribute('aria-labelledby', expect.stringContaining('mode'))
  })

  it('applies stack separator after the full dependent grouping', () => {
    const selectSchema = z.object({
      mode: z.string(),
      classIds: z.array(z.string()).optional(),
    })

    const fields: FormItem[] = [
      {
        kind: 'stack',
        layout: 'dependent',
        separator: 'subtle',
        dependentsVisibility: {
          dependsOn: ['mode'],
          visibleWhen: (values) => values.mode !== 'all',
        },
        dependentsChrome: 'subtle',
        fields: [
          {
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
          {
            type: 'combobox',
            name: 'classIds',
            label: 'Classes',
            multiple: true,
            options: [{ label: 'Fighter', value: 'fighter' }],
          },
        ],
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
    expect(separator).toHaveClass('border-b', 'border-border', 'pb-7')
    expect(separator).toContainElement(screen.getByLabelText('Class restrictions'))
    expect(separator).toContainElement(queryDependentsRegion(container) as HTMLElement)
    expect(container.querySelectorAll('[data-field-separator]')).toHaveLength(1)
  })

  it('keeps stack separator when dependents are gated off', () => {
    const selectSchema = z.object({
      mode: z.string(),
      classIds: z.array(z.string()).optional(),
    })

    const fields: FormItem[] = [
      {
        kind: 'stack',
        layout: 'dependent',
        separator: 'subtle',
        dependentsVisibility: {
          dependsOn: ['mode'],
          visibleWhen: (values) => values.mode !== 'all',
        },
        fields: [
          {
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
          {
            type: 'combobox',
            name: 'classIds',
            label: 'Classes',
            multiple: true,
            options: [{ label: 'Fighter', value: 'fighter' }],
          },
        ],
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
