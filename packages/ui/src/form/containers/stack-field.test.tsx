import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
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

const toggleDependentStack = (
  options: {
    dependentsChrome?: 'subtle' | 'error'
    dependentsChromeScope?: 'wrapper' | 'arrayItems'
    rhythm?: 'compact' | 'comfortable'
  } = {},
): FormItem => ({
  kind: 'stack',
  layout: 'toggleDependent',
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
  fields: FormItem[] = [toggleDependentStack({ dependentsChrome: 'subtle' })],
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

describe('toggle-dependent stack', () => {
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
      expect(shell).toHaveClass('bg-muted/30')
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
    const { container } = renderStackForm([toggleDependentStack()])

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
      toggleDependentStack({ dependentsChrome: 'subtle', rhythm: 'comfortable' }),
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

  it('has no axe violations when dependents are visible', async () => {
    const user = userEvent.setup()
    const { container } = renderStackForm(undefined, { featureEnabled: true, featureValue: 13 })

    await waitFor(() => expect(screen.getByLabelText('Feature value')).toBeInTheDocument())
    await user.tab()

    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
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
        layout: 'toggleDependent',
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

      const itemShell = screen.getByRole('group', { name: /Item 1/ })
      expect(itemShell).toHaveClass('bg-muted/30')
      expect(itemShell).toHaveClass('border-border')
    })
  })
})
