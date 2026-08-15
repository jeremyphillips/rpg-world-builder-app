import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { z } from 'zod'

import {
  fieldStackRhythmVariants,
  resolveDependentInsetClasses,
} from '../../components/ui/field.variants'
import { Form } from '../shells/form.client'
import type { FormItem } from '../field-config'
import type { SurfaceConfig } from '../../components/ui/visual-vocabulary.types'

const schema = z.object({
  featureEnabled: z.boolean(),
  featureValue: z.number().optional(),
  featureNote: z.string().optional(),
})

type Values = z.infer<typeof schema>

const dependentInsetClasses = resolveDependentInsetClasses(true, 'comfortable')

const dependentField = (
  options: {
    inset?: boolean
    chrome?: 'none' | 'rail' | 'panel'
    panel?: { surface?: SurfaceConfig; tone?: 'destructive' }
    scope?: 'wrapper' | 'arrayItems'
    includeNote?: boolean
  } = {},
): FormItem => ({
  kind: 'dependent',
  controller: {
    type: 'switch',
    name: 'featureEnabled',
    label: 'Enable feature',
    hint: 'Turn on to configure the dependent setting.',
    defaultValue: false,
  },
  dependents: {
    ...(options.inset === false ? { inset: false } : {}),
    ...(options.chrome ? { chrome: options.chrome } : {}),
    ...(options.panel ? { panel: options.panel } : {}),
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
      ...(options.includeNote
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
  fields: FormItem[] = [dependentField()],
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
  if (!region) return null
  if (region.hasAttribute('data-field-dependent-rail')) return region
  return region.querySelector(':scope > .p-3')
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
      expect(region).toHaveClass(dependentInsetClasses)
      expect(queryChromeShell(container)).toBeNull()
      expect(region).toContainElement(screen.getByLabelText('Feature value'))
    })
  })

  it('applies subtle panel chrome classes when chrome is panel', async () => {
    const user = userEvent.setup()
    const { container } = renderDependentForm([
      dependentField({
        chrome: 'panel',
        panel: { surface: { emphasis: 'subtle' } },
      }),
    ])

    await user.click(screen.getByRole('switch', { name: 'Enable feature' }))

    await waitFor(() => {
      const shell = queryChromeShell(container)
      expect(shell).toHaveClass('bg-surface-subtle')
      expect(queryDependentsRegion(container)).toHaveClass(dependentInsetClasses)
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

  it('defaults to inset positioning without decorative chrome when inset and chrome are omitted', async () => {
    const user = userEvent.setup()
    const { container } = renderDependentForm([dependentField()])

    await user.click(screen.getByRole('switch', { name: 'Enable feature' }))

    await waitFor(() => {
      const region = queryDependentsRegion(container)
      expect(region).toHaveClass(dependentInsetClasses)
      expect(queryChromeShell(container)).toBeNull()
      expect(region).toContainElement(screen.getByLabelText('Feature value'))
    })
  })

  it.each([
    { inset: true as const, chrome: 'none' as const, expectIndent: true, expectRail: false },
    { inset: true as const, chrome: 'rail' as const, expectIndent: true, expectRail: true },
    { inset: false as const, chrome: 'none' as const, expectIndent: false, expectRail: false },
    { inset: false as const, chrome: 'rail' as const, expectIndent: false, expectRail: true },
  ])(
    'composes inset=$inset and chrome=$chrome independently',
    async ({ inset, chrome, expectIndent, expectRail }) => {
      const user = userEvent.setup()
      const { container } = renderDependentForm([dependentField({ inset, chrome })])

      await user.click(screen.getByRole('switch', { name: 'Enable feature' }))

      await waitFor(() => {
        const region = queryDependentsRegion(container)
        if (expectIndent) {
          expect(region).toHaveClass(dependentInsetClasses)
        } else {
          expect(region).not.toHaveClass(dependentInsetClasses)
        }

        const shell = queryChromeShell(container)
        if (expectRail) {
          expect(shell).toHaveAttribute('data-field-dependent-rail', '')
        } else {
          expect(shell).toBeNull()
        }
      })
    },
  )

  it('places rail decoration on the dependents region, not an inner rhythm wrapper', async () => {
    const user = userEvent.setup()
    const { container } = renderDependentForm([dependentField({ chrome: 'rail' })])

    await user.click(screen.getByRole('switch', { name: 'Enable feature' }))

    await waitFor(() => {
      const region = queryDependentsRegion(container)
      expect(region).toHaveAttribute('data-field-dependent-rail', '')
      expect(region).toHaveClass(dependentInsetClasses)
      expect(region).toHaveClass('before:left-2')
      expect(region?.querySelector(':scope > [data-field-dependent-rail]')).toBeNull()
    })
  })

  it('allows nested inset + rail regions without suppressing inner chrome', async () => {
    const nestedSchema = z.object({
      allow: z.boolean(),
      armorMode: z.string(),
      armorCats: z.string().optional(),
    })

    const fields: FormItem[] = [
      {
        kind: 'dependent',
        controller: {
          type: 'switch',
          name: 'allow',
          label: 'Allow',
          defaultValue: true,
        },
        dependents: {
          chrome: 'rail',
          fields: [
            {
              kind: 'dependent',
              controller: {
                type: 'radio',
                name: 'armorMode',
                label: 'Armor proficiencies',
                options: [
                  { label: 'Category', value: 'category' },
                  { label: 'None', value: 'none' },
                ],
                defaultValue: 'category',
              },
              dependents: {
                chrome: 'rail',
                visibility: {
                  dependsOn: ['armorMode'],
                  visibleWhen: (values) => values.armorMode === 'category',
                },
                fields: [
                  {
                    type: 'text' as const,
                    name: 'armorCats',
                    label: 'Categories',
                  },
                ],
              },
            },
          ],
        },
      },
    ]

    const { container } = render(
      <Form<z.infer<typeof nestedSchema>>
        schema={nestedSchema}
        fields={fields}
        defaultValues={{ allow: true, armorMode: 'category' }}
        onSubmit={vi.fn()}
      />,
    )

    const regions = container.querySelectorAll('[data-field-dependent-fields]')
    expect(regions).toHaveLength(2)
    expect(regions[0]).toHaveClass(dependentInsetClasses)
    expect(regions[1]).toHaveClass(dependentInsetClasses)
    expect(
      container.querySelectorAll('[data-field-dependent-fields][data-field-dependent-rail]'),
    ).toHaveLength(2)
    expect(screen.getByLabelText('Categories')).toBeInTheDocument()
  })

  it('inherits comfortable density on the outer dependent wrapper by default', async () => {
    const user = userEvent.setup()
    const { container } = renderDependentForm()

    await user.click(screen.getByRole('switch', { name: 'Enable feature' }))

    await waitFor(() => {
      const dependent = container.querySelector('[data-field-dependent]')
      expect(dependent).toHaveClass(fieldStackRhythmVariants({ rhythm: 'comfortable' }))
    })
  })

  it('applies comfortable rhythm inside dependents chrome', async () => {
    const user = userEvent.setup()
    const { container } = renderDependentForm([
      dependentField({
        chrome: 'panel',
        panel: { surface: { emphasis: 'subtle' } },
        includeNote: true,
      }),
    ])

    await user.click(screen.getByRole('switch', { name: 'Enable feature' }))

    await waitFor(() => {
      const shell = queryChromeShell(container)
      expect(shell).toHaveClass(fieldStackRhythmVariants({ rhythm: 'comfortable' }))
      expect(screen.getByLabelText('Feature note')).toBeInTheDocument()
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

  itAxe('has no axe violations when dependents are visible', async () => {
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
          chrome: 'panel',
          panel: { surface: { emphasis: 'subtle' } },
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
          chrome: 'panel',
          panel: { surface: { emphasis: 'subtle' } },
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
          chrome: 'panel',
          panel: { surface: { emphasis: 'subtle' } },
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
