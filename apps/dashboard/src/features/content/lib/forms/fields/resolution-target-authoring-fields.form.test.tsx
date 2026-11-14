import {
  addCustomRefinementIssue,
  type ResolutionTargetKind,
  refineRequirementRowsForTargetKind,
} from '@rpg/contracts'
import { Form, makeResolver, type FormItem } from '@rpg/ui/form'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { resolutionTargetAuthoringFields } from './resolution-target-authoring-fields'

const schema = z.object({
  resolution: z.object({
    target: z.object({
      count: z.union([z.number(), z.string()]).optional(),
      countKind: z.string().optional(),
      kind: z.string().optional(),
      proximity: z
        .object({
          kind: z.string().optional(),
          distance: z
            .object({ value: z.number().optional(), unit: z.string().optional() })
            .optional(),
        })
        .optional(),
      requirements: z.array(z.record(z.string(), z.unknown())).optional(),
    }),
  }),
})

const targetCompatibilitySchema = z
  .object({
    resolution: z.object({
      selectionMode: z.literal('targets'),
      target: schema.shape.resolution.shape.target,
    }),
  })
  .superRefine((values, ctx) => {
    const target = values.resolution.target
    const rows = target?.requirements
    if (!target?.kind || !Array.isArray(rows) || rows.length === 0) return

    refineRequirementRowsForTargetKind(
      target.kind as ResolutionTargetKind,
      rows,
      (index, message) => {
        addCustomRefinementIssue(ctx, message, ['resolution', 'target', 'requirements', index])
      },
    )
  })

const requirementIntegrationFields: FormItem[] = [
  { type: 'text', name: 'resolution.target.kind', label: 'Target kind' },
  {
    kind: 'array',
    name: 'resolution.target.requirements',
    label: 'Requirements',
    item: {
      variant: 'compact',
      collapsible: false,
      header: {
        fallback: (index) => `Requirement ${index + 1}`,
        primary: () => 'It can see you',
        srOnly: true,
      },
    },
    fields: [
      { type: 'text', name: 'kind', label: 'Kind' },
      { type: 'text', name: 'who', label: 'Who' },
    ],
    addAction: { label: 'Add a requirement' },
    min: 1,
  },
]

describe('resolution target authoring form', () => {
  it('adds an incomplete size row and previews the sentence', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <Form
        schema={schema}
        fields={resolutionTargetAuthoringFields({
          prefix: 'resolution.target',
          creatureTypeOptions: [{ value: 'humanoid', label: 'Humanoid' }],
        })}
        defaultValues={{
          resolution: {
            target: {
              count: 1,
              kind: 'creature',
              proximity: { kind: 'distance', distance: { value: 5, unit: 'ft' } },
            },
          },
        }}
        onSubmit={onSubmit}
        footer={<button type="submit">Save</button>}
      />,
    )

    expect(screen.getByText('Optional restrictions on who can be targeted.')).toBeInTheDocument()
    expect(screen.getByText('One creature within 5 feet', { exact: false })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Add a requirement' }))
    await user.click(screen.getByRole('menuitem', { name: /Creature size/i }))

    expect(screen.getByText('Eligible sizes')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Size' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Size limit' })).toHaveTextContent('or smaller')

    await user.click(screen.getByRole('button', { name: 'Save' }))
    const requirements = onSubmit.mock.calls[0]?.[0]?.resolution.target.requirements
    expect(requirements).toEqual([{ kind: 'size', comparison: 'or-smaller', bound: '' }])
  })

  it('omits the bundled reach or range select when includeProximityKindSelect is false', () => {
    render(
      <Form
        schema={schema}
        fields={resolutionTargetAuthoringFields({
          prefix: 'resolution.target',
          includeProximityKindSelect: false,
        })}
        defaultValues={{
          resolution: {
            target: {
              count: 1,
              kind: 'creature',
              proximity: { kind: 'reach', distance: { value: 5, unit: 'ft' } },
            },
          },
        }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    expect(screen.queryByLabelText('Reach or range')).not.toBeInTheDocument()
    expect(screen.getByText('One creature within 5 feet', { exact: false })).toBeInTheDocument()
  })

  it('omits the empty requirements well and hides disclosure for willing rows', () => {
    render(
      <Form
        schema={schema}
        fields={resolutionTargetAuthoringFields({
          prefix: 'resolution.target',
          creatureTypeOptions: [{ value: 'humanoid', label: 'Humanoid' }],
        })}
        defaultValues={{
          resolution: {
            target: {
              count: 1,
              kind: 'creature',
              proximity: { kind: 'distance', distance: { value: 5, unit: 'ft' } },
              requirements: [{ kind: 'willing' }],
            },
          },
        }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    expect(screen.queryByText(/No requirement added/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Expand requirement/i })).not.toBeInTheDocument()
  })
})

describe('requirement target compatibility display', () => {
  it('resolver attaches incompatibility issues to the requirement row prefix', async () => {
    const resolver = makeResolver(targetCompatibilitySchema, requirementIntegrationFields)
    const result = await resolver(
      {
        resolution: {
          selectionMode: 'targets',
          target: {
            kind: 'object',
            requirements: [{ kind: 'sight', who: 'target' }],
          },
        },
      },
      undefined,
      { fields: {}, shouldUseNativeValidation: false },
    )

    expect(result.errors.resolution?.target?.requirements?.[0]).toBeDefined()
  })

  it('schema marks target sight on object targets incompatible', () => {
    const result = targetCompatibilitySchema.safeParse({
      resolution: {
        selectionMode: 'targets',
        target: {
          kind: 'object',
          requirements: [{ kind: 'sight', who: 'target' }],
        },
      },
    })

    expect(result.success).toBe(false)
  })

  it('schema keeps actor sight on object targets compatible', () => {
    const result = targetCompatibilitySchema.safeParse({
      resolution: {
        selectionMode: 'targets',
        target: {
          kind: 'object',
          requirements: [{ kind: 'sight', who: 'actor' }],
        },
      },
    })

    expect(result.success).toBe(true)
  })
})

describe('production requirement authoring validation display', () => {
  const productionFields = resolutionTargetAuthoringFields({
    prefix: 'resolution.target',
    creatureTypeOptions: [{ value: 'humanoid', label: 'Humanoid' }],
  })
  const productionRequirementField = productionFields.find(
    (field) => field.kind === 'array' && field.name === 'resolution.target.requirements',
  )
  if (!productionRequirementField || productionRequirementField.kind !== 'array') {
    throw new Error('Expected production requirement array field')
  }

  function productionTargetValues(target: {
    kind: string
    requirements: Record<string, unknown>[]
  }) {
    return {
      resolution: {
        selectionMode: 'targets' as const,
        target: {
          count: '1',
          countKind: 'exact',
          proximity: { kind: 'distance', distance: { value: 5, unit: 'ft' } },
          ...target,
        },
      },
    }
  }

  it('resolver rejects object target sight with production display fields', async () => {
    const resolver = makeResolver(targetCompatibilitySchema, productionDisplayFields)
    const result = await resolver(
      {
        resolution: {
          selectionMode: 'targets',
          target: {
            kind: 'object',
            requirements: [{ kind: 'sight', who: 'target' }],
          },
        },
      },
      undefined,
      { fields: {}, shouldUseNativeValidation: false },
    )

    expect(result.errors.resolution?.target?.requirements?.[0]).toBeDefined()
  })

  it('resolver flags incompatible sight rows on production fields', async () => {
    const resolver = makeResolver(targetCompatibilitySchema, productionFields)
    const result = await resolver(
      productionTargetValues({
        kind: 'object',
        requirements: [{ kind: 'sight', who: 'target' }],
      }),
      undefined,
      { fields: {}, shouldUseNativeValidation: false },
    )

    expect(result.errors.resolution?.target?.requirements?.[0]).toBeDefined()
  })

  const requirementOnlySchema = targetCompatibilitySchema
  const productionRequirementFieldForTest =
    productionRequirementField.kind === 'array'
      ? {
          ...productionRequirementField,
          fields: [
            ...productionRequirementField.fields,
            {
              type: 'text' as const,
              name: 'kind',
              label: 'Kind',
              labelVisibility: 'srOnly' as const,
            },
            {
              type: 'text' as const,
              name: 'who',
              label: 'Who',
              labelVisibility: 'srOnly' as const,
            },
          ],
        }
      : productionRequirementField
  const productionDisplayFields = [
    {
      type: 'text' as const,
      name: 'resolution.selectionMode',
      label: 'Selection mode',
      defaultValue: 'targets',
    },
    {
      type: 'text' as const,
      name: 'resolution.target.kind',
      label: 'Target kind',
      defaultValue: 'object',
    },
    productionRequirementFieldForTest,
  ]

  it('surfaces target sight incompatibility on the production requirement row after save', async () => {
    const user = userEvent.setup()
    const rowDisplaySchema = z
      .object({
        resolution: z.object({
          selectionMode: z.literal('targets'),
          target: z.object({
            kind: z.string().optional(),
            requirements: z.array(z.record(z.string(), z.unknown())).optional(),
          }),
        }),
      })
      .superRefine((values, ctx) => {
        const target = values.resolution.target
        const row = target?.requirements?.[0]
        if (target?.kind !== 'object' || row?.kind !== 'sight') return
        addCustomRefinementIssue(ctx, 'Sight requirements are only valid for creature targets.', [
          'resolution',
          'target',
          'requirements',
          0,
        ])
      })
    const onSubmit = vi.fn()
    render(
      <Form
        schema={rowDisplaySchema}
        fields={productionDisplayFields}
        defaultValues={{
          resolution: {
            selectionMode: 'targets',
            target: {
              kind: 'object',
              requirements: [{ kind: 'sight', who: 'target' }],
            },
          },
        }}
        onSubmit={onSubmit}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).not.toHaveBeenCalled()

    const rowAlert = await screen.findByRole('alert')
    expect(
      screen.getByRole('button', { name: /Review 1 issue in 1 row in Requirements/i }),
    ).toBeInTheDocument()
    expect(rowAlert).toHaveAttribute('data-array-item-issue-placement', 'rowAlert')
    expect(rowAlert).toHaveTextContent('Sight requirements are only valid for creature targets.')
    expect(screen.getByText('It can see you', { exact: false })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Expand requirement/i })).not.toBeInTheDocument()

    const rowShell = document
      .querySelector('[data-array-item-prefix="resolution.target.requirements.0"]')
      ?.closest('[class*="border-destructive"]')
    expect(rowShell).toBeTruthy()
  })

  it('clears requirement row validation when target kind is creature', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <Form
        schema={requirementOnlySchema}
        fields={productionDisplayFields}
        defaultValues={{
          resolution: {
            selectionMode: 'targets',
            target: {
              kind: 'creature',
              requirements: [{ kind: 'sight', who: 'target' }],
            },
          },
        }}
        onSubmit={onSubmit}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).toHaveBeenCalled()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Review .*issue/i })).not.toBeInTheDocument()
  })

  it('does not flag actor sight on object targets', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <Form
        schema={requirementOnlySchema}
        fields={productionDisplayFields}
        defaultValues={{
          resolution: {
            selectionMode: 'targets',
            target: {
              kind: 'object',
              requirements: [{ kind: 'sight', who: 'actor' }],
            },
          },
        }}
        onSubmit={onSubmit}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit).toHaveBeenCalled()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
