import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it, vi } from 'vitest'

import { Field } from './field.client'
import { FieldRowAnatomyProvider } from './field-row-anatomy.context'
import type { SelectFilterFieldDef } from '../../filters/filter-schema.types'
import { FloatingLabelField } from './floating-label-field.client'
import { Input } from './input.client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select.client'

const sourceDir = path.dirname(fileURLToPath(import.meta.url))

function SchoolSelect({ value = 'evocation' }: { value?: string }) {
  return (
    <Select value={value}>
      <FloatingLabelField label="School" size="sm" populated={value.length > 0}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
      </FloatingLabelField>
      <SelectContent>
        <SelectItem value="evocation">Evocation</SelectItem>
        <SelectItem value="__all__">All schools</SelectItem>
      </SelectContent>
    </Select>
  )
}

describe('FloatingLabelField', () => {
  it('names an input from the visible label', () => {
    render(
      <FloatingLabelField label="School" size="sm" populated={false}>
        <Input value="" onChange={() => undefined} />
      </FloatingLabelField>,
    )

    const input = screen.getByRole('textbox', { name: 'School' })
    expect(input).not.toHaveAttribute('aria-label')
    expect(input.closest('[data-populated]')).toHaveAttribute('data-populated', 'false')
    expect(input.closest('[data-populated]')?.className).toContain('placeholder:opacity-0')
  })

  it('names a select trigger from the visible label', () => {
    render(<SchoolSelect />)
    const trigger = screen.getByRole('combobox', { name: 'School' })
    expect(trigger).not.toHaveAttribute('aria-label')
    expect(trigger.closest('[data-populated]')).toHaveAttribute('data-populated', 'true')
  })

  it('names a combobox button from the visible label', () => {
    render(
      <FloatingLabelField label="School" size="md" populated>
        <button type="button" role="combobox" aria-expanded={false}>
          Evocation
        </button>
      </FloatingLabelField>,
    )

    expect(screen.getByRole('combobox', { name: 'School' })).toHaveTextContent('Evocation')
  })

  it('renders the hint after the control and describes it', () => {
    render(
      <FloatingLabelField label="School" size="sm" populated={false} hint="Shown below">
        <Input value="" onChange={() => undefined} />
      </FloatingLabelField>,
    )

    const input = screen.getByRole('textbox', { name: 'School' })
    const hint = screen.getByText('Shown below')
    expect(input.compareDocumentPosition(hint) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(input.getAttribute('aria-describedby')).toContain(hint.id)
  })

  it('does not join an ancestor anatomy row', () => {
    const { container } = render(
      <FieldRowAnatomyProvider>
        <FloatingLabelField label="School" size="sm" populated={false}>
          <Input value="" onChange={() => undefined} />
        </FloatingLabelField>
      </FieldRowAnatomyProvider>,
    )

    expect(container.querySelector('[data-field-row-participant]')).toBeNull()
    expect(container.querySelector('.row-span-3')).toBeNull()
  })

  it('throws when a stacked Field.Label is rendered inside', () => {
    function Labeled() {
      return (
        <>
          <Field.Label>Inner</Field.Label>
          <input />
        </>
      )
    }

    expect(() =>
      render(
        <FloatingLabelField label="School" size="sm" populated={false}>
          <Labeled />
        </FloatingLabelField>,
      ),
    ).toThrow(/Field\.Label cannot be rendered inside FloatingLabelField/)
  })

  it('throws when a digit or grouped select trigger is inside', () => {
    expect(() =>
      render(
        <Select value="1">
          <FloatingLabelField label="Count" size="sm" populated>
            <SelectTrigger digits={2}>
              <SelectValue />
            </SelectTrigger>
          </FloatingLabelField>
        </Select>,
      ),
    ).toThrow(/digits/)

    expect(() =>
      render(
        <Select value="evocation">
          <FloatingLabelField label="School" size="sm" populated>
            <SelectTrigger grouped>
              <SelectValue />
            </SelectTrigger>
          </FloatingLabelField>
        </Select>,
      ),
    ).toThrow(/grouped/)
  })

  it('warns when the control supplies its own aria-label or placeholder', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    render(
      <FloatingLabelField label="School" size="sm" populated={false}>
        <input aria-label="Sort order" placeholder="Filter School…" />
      </FloatingLabelField>,
    )

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('aria-label'))
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('placeholder'))
    warn.mockRestore()
  })

  it('rejects aria overrides on a floating select at compile time', () => {
    // @ts-expect-error floating selects cannot set ariaLabel
    const field: SelectFilterFieldDef<{ name: string }, { school?: string }, 'school'> = {
      type: 'select',
      id: 'school',
      label: 'School',
      options: [],
      matches: () => true,
      layout: 'floating',
      ariaLabel: 'School',
    }
    void field
  })

  it('does not import filters', () => {
    for (const file of [
      'floating-label-field.client.tsx',
      'floating-label-field.variants.ts',
      'floating-label-field.lib.ts',
    ]) {
      const source = readFileSync(path.join(sourceDir, file), 'utf8')
      expect(source).not.toContain('filters/')
    }
  })

  it('rejects multiple children at compile time', () => {
    const invalid = (
      // @ts-expect-error children must be a single element
      <FloatingLabelField label="School" size="sm" populated={false}>
        <input />
        <input />
      </FloatingLabelField>
    )
    void invalid
  })

  itAxe('has no axe violations on an input', async () => {
    const { container } = render(
      <FloatingLabelField label="School" size="sm" populated={false} hint="Shown below">
        <Input value="" onChange={() => undefined} />
      </FloatingLabelField>,
    )
    await expectNoAxeViolations(container)
  })

  itAxe('has no axe violations on a select', async () => {
    const { container } = render(<SchoolSelect />)
    await expectNoAxeViolations(container)
  })
})
