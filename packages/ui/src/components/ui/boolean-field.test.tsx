import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { FormSectionProvider } from '../../form/context/form-section.context'
import { FilterChromeProvider } from '../../filters/filter-chrome.context'
import { BooleanField } from './boolean-field.client'
import { CheckboxField } from './checkbox-field'
import { resolveBooleanFieldScale } from './boolean-field.lib'

const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'boolean-field.css'), 'utf8')

describe('resolveBooleanFieldScale', () => {
  it('prefers an explicit size over filter and form density', () => {
    expect(
      resolveBooleanFieldScale({
        explicitSize: 'md',
        filterDensity: 'compact',
        formSize: 'sm',
      }),
    ).toEqual({ explicit: 'md', scale: 'md' })
  })

  it('uses filter chrome ahead of form size', () => {
    expect(resolveBooleanFieldScale({ filterDensity: 'compact', formSize: 'md' })).toEqual({
      explicit: undefined,
      scale: 'sm',
    })
  })

  it('uses form size when no filter chrome is present', () => {
    expect(resolveBooleanFieldScale({ formSize: 'sm' })).toEqual({
      explicit: undefined,
      scale: 'sm',
    })
    expect(resolveBooleanFieldScale({ formSize: 'lg' })).toEqual({
      explicit: undefined,
      scale: 'md',
    })
  })
})

describe('BooleanField', () => {
  it('toggles once from the indicator, the label text, and the container padding', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(<BooleanField label="Expertise" onCheckedChange={onCheckedChange} />)

    const checkbox = screen.getByRole('checkbox', { name: 'Expertise' })
    await user.click(checkbox)
    expect(onCheckedChange).toHaveBeenCalledTimes(1)
    expect(onCheckedChange).toHaveBeenLastCalledWith(true)

    const label = checkbox.closest('label')
    if (!label) throw new Error('missing label')
    await user.click(label)
    expect(onCheckedChange).toHaveBeenCalledTimes(2)

    const text = label.querySelector('.ui-boolean-field__label')
    if (!text) throw new Error('missing label text')
    await user.click(text)
    expect(onCheckedChange).toHaveBeenCalledTimes(3)
  })

  it('mirrors checked, disabled, and invalid state on the container', () => {
    render(<BooleanField label="Expertise" checked disabled invalid tone="success" />)
    const checkbox = screen.getByRole('checkbox', { name: 'Expertise' })
    const field = checkbox.closest('label')
    expect(field).toHaveAttribute('data-checked', 'true')
    expect(field).toHaveAttribute('data-disabled', 'true')
    expect(field).toHaveAttribute('data-invalid', 'true')
    expect(field).toHaveAttribute('data-choice-tone', 'success')
    expect(checkbox).toBeDisabled()
    expect(checkbox).toHaveAttribute('aria-invalid', 'true')
  })

  it('keeps one tab stop on the checkbox', () => {
    render(<BooleanField label="Expertise" />)
    const checkbox = screen.getByRole('checkbox', { name: 'Expertise' })
    expect(checkbox.closest('label')).not.toHaveAttribute('tabindex')
    expect(checkbox.tagName).toBe('BUTTON')
  })

  it('uses form density unless an explicit size is set', () => {
    const { rerender } = render(
      <FormSectionProvider density="compact">
        <BooleanField label="Expertise" />
      </FormSectionProvider>,
    )
    expect(screen.getByRole('checkbox', { name: 'Expertise' }).closest('label')).toHaveAttribute(
      'data-field-scale',
      'sm',
    )
    expect(
      screen.getByRole('checkbox', { name: 'Expertise' }).closest('label'),
    ).not.toHaveAttribute('data-size')

    rerender(
      <FormSectionProvider density="comfortable">
        <article data-content-density="compact">
          <BooleanField label="Expertise" size="md" />
        </article>
      </FormSectionProvider>,
    )
    const explicit = screen.getByRole('checkbox', { name: 'Expertise' }).closest('label')
    expect(explicit).toHaveAttribute('data-size', 'md')
    expect(explicit?.parentElement).toHaveAttribute('data-content-density', 'compact')
  })

  it('lets filter chrome set the base scale inside a comfortable form', () => {
    render(
      <FormSectionProvider density="comfortable">
        <FilterChromeProvider density="compact">
          <BooleanField label="Hidden only" />
        </FilterChromeProvider>
      </FormSectionProvider>,
    )
    const field = screen.getByRole('checkbox', { name: 'Hidden only' }).closest('label')
    expect(field).toHaveAttribute('data-field-scale', 'sm')
    expect(field).not.toHaveAttribute('data-size')
  })

  it('keeps keyboard focus on the checkbox inside the labeled container', () => {
    render(<BooleanField label="Expertise" />)
    const checkbox = screen.getByRole('checkbox', { name: 'Expertise' })
    checkbox.focus()
    const field = checkbox.closest('label')
    expect(checkbox).toHaveFocus()
    expect(field?.matches(':has(:focus)')).toBe(true)
    expect(css).toContain('.ui-boolean-field .ui-focus-ring:focus-visible')
    expect(css).toContain('box-shadow: none')
    expect(css).toContain('.ui-boolean-field:has(:focus-visible)')
    expect(css).toContain('box-shadow: var(--ui-focus-ring-standalone)')
  })
})

describe('BooleanField density CSS', () => {
  it('forces heading fields to sm over explicit size and card density', () => {
    expect(css).toContain('[data-heading-inline] .ui-boolean-field[data-size]')
    expect(css).toContain("[data-content-density='compact'] .ui-boolean-field:not([data-size])")
    expect(css).toContain('height: var(--control-height-sm)')
  })

  it('suppresses the inner focus ring from the field scope', () => {
    expect(css).toContain('.ui-boolean-field .ui-focus-ring:focus-visible')
    expect(css).toContain('.ui-boolean-field:has(:focus-visible)')
    expect(css).toContain('.ui-boolean-field .ui-choice-control:disabled')
  })
})

describe('CheckboxField', () => {
  it('does not render BooleanField surface chrome', () => {
    const { container } = render(<CheckboxField id="terms" label="Accept terms" />)
    expect(container.querySelector('.ui-boolean-field')).toBeNull()
  })
})
