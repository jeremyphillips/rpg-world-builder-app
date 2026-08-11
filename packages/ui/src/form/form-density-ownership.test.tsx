import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'

import { fieldStackRhythmVariants } from '../components/ui/field.variants'
import { FormFieldStack } from './containers/form-field-stack.client'
import type { FormItem } from './field-config'
import { Form } from './shells/form.client'
import type { FormSectionProviderProps } from './context/form-section.context'

function walkFiles(dir: string, matcher: RegExp, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    const stat = statSync(path)
    if (stat.isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist') continue
      walkFiles(path, matcher, files)
      continue
    }
    if (matcher.test(path)) files.push(path)
  }
  return files
}

function countProductionControlSizeOverrides(root: string): number {
  const files = walkFiles(join(root, 'apps/dashboard/src'), /-form-fields.*\.ts$/)
  let count = 0
  for (const file of files) {
    if (file.endsWith('.test.ts')) continue
    const source = readFileSync(file, 'utf8')
    const matches = source.match(/controlSizeOverride\s*:/g)
    if (matches) count += matches.length
  }
  return count
}

describe('form density ownership guards', () => {
  it('allows exactly one production controlSizeOverride (campaign name)', () => {
    const repoRoot = join(__dirname, '../../../..')
    expect(countProductionControlSizeOverrides(repoRoot)).toBe(1)
  })
})

describe('shell density parity', () => {
  const schema = z.object({ name: z.string() })
  const fields: FormItem[] = [{ type: 'text', name: 'name', label: 'Name' }]

  it('FormFieldStack compact matches explicit compact density', () => {
    function Harness() {
      const form = useForm({ defaultValues: { name: '' } })
      return (
        <FormProvider {...form}>
          <FormFieldStack fields={fields} idPrefix="parity" density="compact" />
        </FormProvider>
      )
    }

    render(<Harness />)
    expect(screen.getByLabelText('Name').closest('.gap-2')).toBeInTheDocument()
  })

  it('Form defaults to comfortable density', () => {
    render(<Form schema={schema} fields={fields} onSubmit={() => undefined} />)
    expect(screen.getByLabelText('Name').closest('.gap-6')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveClass('h-9')
  })
})

describe('nested group density', () => {
  const schema = z.object({
    outer: z.string(),
    inner: z.string(),
    outerSibling: z.string(),
  })

  const fields: FormItem[] = [
    {
      kind: 'group',
      legend: 'Outer',
      fields: [
        { type: 'text', name: 'outer', label: 'Outer field' },
        {
          kind: 'group',
          legend: 'Inner',
          density: 'compact',
          fields: [{ type: 'text', name: 'inner', label: 'Inner field' }],
        },
        { type: 'text', name: 'outerSibling', label: 'Outer sibling' },
      ],
    },
  ]

  it('applies compact density inside nested group and reverts for following siblings', () => {
    render(<Form schema={schema} fields={fields} onSubmit={() => undefined} />)

    expect(screen.getByRole('textbox', { name: 'Outer field' })).toHaveClass('h-9')
    expect(screen.getByRole('textbox', { name: 'Inner field' })).toHaveClass('h-8')
    expect(screen.getByRole('textbox', { name: 'Outer sibling' })).toHaveClass('h-9')
  })
})

describe('row inheritance', () => {
  const schema = z.object({ left: z.string(), right: z.string() })
  const fields: FormItem[] = [
    {
      kind: 'group',
      legend: 'Compact group',
      density: 'compact',
      fields: [
        {
          kind: 'row',
          fields: [
            { type: 'text', name: 'left', label: 'Left' },
            { type: 'text', name: 'right', label: 'Right' },
          ],
        },
      ],
    },
  ]

  it('inherits compact density through rows without introducing a density boundary', () => {
    render(<Form schema={schema} fields={fields} onSubmit={() => undefined} />)
    expect(screen.getByRole('textbox', { name: 'Left' })).toHaveClass('h-8')
    expect(screen.getByRole('textbox', { name: 'Right' })).toHaveClass('h-8')
  })
})

describe('dependent density inheritance', () => {
  const schema = z.object({
    enabled: z.boolean(),
    note: z.string().optional(),
  })

  it('inherits parent comfortable density instead of forcing compact', () => {
    const fields: FormItem[] = [
      {
        kind: 'dependent',
        controller: {
          type: 'switch',
          name: 'enabled',
          label: 'Enable',
          defaultValue: true,
        },
        dependents: {
          fields: [{ type: 'text', name: 'note', label: 'Note' }],
        },
      },
    ]

    const { container } = render(
      <Form
        schema={schema}
        fields={fields}
        onSubmit={() => undefined}
        defaultValues={{ enabled: true }}
      />,
    )

    const dependent = container.querySelector('[data-field-dependent]')
    expect(dependent).toHaveClass(fieldStackRhythmVariants({ rhythm: 'comfortable' }))
    expect(screen.getByRole('textbox', { name: 'Note' })).toHaveClass('h-9')
  })
})

describe('controlSizeOverride escape hatch', () => {
  const schema = z.object({ title: z.string(), subtitle: z.string() })

  it('changes control size without changing sibling field rhythm', () => {
    const fields: FormItem[] = [
      {
        type: 'text',
        name: 'title',
        label: 'Title',
        controlSizeOverride: 'lg',
      },
      { type: 'text', name: 'subtitle', label: 'Subtitle' },
    ]

    render(<Form schema={schema} fields={fields} onSubmit={() => undefined} />)

    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveClass('h-11')
    expect(screen.getByRole('textbox', { name: 'Subtitle' })).toHaveClass('h-9')
    expect(screen.getByLabelText('Subtitle').closest('.gap-6')).toBeInTheDocument()
  })
})

describe('FormSectionProvider density', () => {
  it('documents density-only provider props', () => {
    const props: FormSectionProviderProps = {
      density: 'compact',
      children: null,
    }
    expect(props.density).toBe('compact')
  })
})
