import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { FormSectionProvider } from '../../form/context/form-section.context'
import { FilterChromeProvider } from '../../filters/filter-chrome.context'
import { CheckboxField } from './checkbox-field'
import { CheckboxOption } from './checkbox-option.client'
import { resolveCheckboxOptionScale } from './checkbox-option.lib'

const css = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'checkbox-option.css'),
  'utf8',
)

describe('resolveCheckboxOptionScale', () => {
  it('prefers an explicit size over filter and form density', () => {
    expect(
      resolveCheckboxOptionScale({
        explicitSize: 'md',
        filterDensity: 'compact',
        formSize: 'sm',
      }),
    ).toEqual({ explicit: 'md', scale: 'md' })
  })

  it('uses filter chrome ahead of form size', () => {
    expect(resolveCheckboxOptionScale({ filterDensity: 'compact', formSize: 'md' })).toEqual({
      explicit: undefined,
      scale: 'sm',
    })
  })

  it('uses form size when no filter chrome is present', () => {
    expect(resolveCheckboxOptionScale({ formSize: 'sm' })).toEqual({
      explicit: undefined,
      scale: 'sm',
    })
    expect(resolveCheckboxOptionScale({ formSize: 'lg' })).toEqual({
      explicit: undefined,
      scale: 'md',
    })
  })
})

describe('CheckboxOption', () => {
  it('toggles once from the indicator, the label text, and the container padding', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(<CheckboxOption shell="outlined" label="Expertise" onCheckedChange={onCheckedChange} />)

    const checkbox = screen.getByRole('checkbox', { name: 'Expertise' })
    await user.click(checkbox)
    expect(onCheckedChange).toHaveBeenCalledTimes(1)
    expect(onCheckedChange).toHaveBeenLastCalledWith(true)

    const label = checkbox.closest('label')
    if (!label) throw new Error('missing label')
    await user.click(label)
    expect(onCheckedChange).toHaveBeenCalledTimes(2)

    const text = label.querySelector('.ui-checkbox-option__label')
    if (!text) throw new Error('missing label text')
    expect(text).toHaveClass('text-style-option')
    await user.click(text)
    expect(onCheckedChange).toHaveBeenCalledTimes(3)
  })

  it('plain option has no outlined shell attributes', () => {
    render(<CheckboxOption label="Plain" />)
    const shell = screen.getByRole('checkbox', { name: 'Plain' }).closest('label')
    expect(shell).not.toHaveAttribute('data-shell', 'outlined')
    expect(css).toContain("[data-shell='outlined']")
  })

  it('mirrors checked, disabled, and invalid state on the outlined container', () => {
    render(
      <CheckboxOption shell="outlined" label="Expertise" checked disabled invalid tone="success" />,
    )
    const checkbox = screen.getByRole('checkbox', { name: 'Expertise' })
    const field = checkbox.closest('label')
    expect(field).toHaveAttribute('data-checked', 'true')
    expect(field).toHaveAttribute('data-disabled', 'true')
    expect(field).toHaveAttribute('data-invalid', 'true')
    expect(field).toHaveAttribute('data-choice-tone', 'success')
    expect(checkbox).toBeDisabled()
    expect(checkbox).toHaveAttribute('aria-invalid', 'true')
  })

  it('uses form density for outlined scale unless an explicit size is set', () => {
    const { rerender } = render(
      <FormSectionProvider density="compact">
        <CheckboxOption shell="outlined" label="Expertise" />
      </FormSectionProvider>,
    )
    expect(screen.getByRole('checkbox', { name: 'Expertise' }).closest('label')).toHaveAttribute(
      'data-field-scale',
      'sm',
    )

    rerender(
      <FormSectionProvider density="comfortable">
        <article data-content-density="compact">
          <CheckboxOption shell="outlined" label="Expertise" size="md" />
        </article>
      </FormSectionProvider>,
    )
    const explicit = screen.getByRole('checkbox', { name: 'Expertise' }).closest('label')
    expect(explicit).toHaveAttribute('data-size', 'md')
  })

  it('lets filter chrome set the base outlined scale inside a comfortable form', () => {
    render(
      <FormSectionProvider density="comfortable">
        <FilterChromeProvider density="compact">
          <CheckboxOption shell="outlined" label="Hidden only" />
        </FilterChromeProvider>
      </FormSectionProvider>,
    )
    const field = screen.getByRole('checkbox', { name: 'Hidden only' }).closest('label')
    expect(field).toHaveAttribute('data-field-scale', 'sm')
  })
})

describe('CheckboxOption outlined CSS', () => {
  it('scopes fixed height to outlined shell', () => {
    expect(css).toContain("[data-shell='outlined']")
    expect(css).toContain('height: var(--control-height-sm)')
    expect(css).toContain(".ui-checkbox-option[data-shell='outlined']:has(:focus-visible)")
  })

  it('shares one background state path on outlined shells', () => {
    expect(css).toContain('--checkbox-option-bg: var(--color-background)')
    expect(css).toContain('background-color: var(--checkbox-option-checked-bg)')
  })
})

describe('CheckboxField', () => {
  it('does not render an outlined shell by default', () => {
    const { container } = render(<CheckboxField id="terms" label="Accept terms" />)
    expect(container.querySelector('[data-shell="outlined"]')).toBeNull()
  })

  it('uses option typography on the label', () => {
    render(<CheckboxField id="terms" label="Accept terms" size="sm" />)
    expect(screen.getByText('Accept terms').closest('.text-style-option')).toBeTruthy()
  })
})
